import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fkjifpexqiqjegamvqtx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramlmcGV4cWlxamVnYW12cXR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA2ODM4MSwiZXhwIjoyMTA1NjQ0MzgxfQ.UaoOj40GH9Ea5tnoAtfvHMDBICgL5XSaMOMyZ6JAU_4';

const sb = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createOrGetUser(email, password, fullName, role, department = 'Department of Computer Science') {
  // Check if exists in profiles
  const { data: existingProfile } = await sb
    .from('profiles')
    .select('*')
    .eq('university_email', email)
    .maybeSingle();

  if (existingProfile) {
    console.log(`User already exists: ${email} (${existingProfile.id})`);
    return existingProfile;
  }

  // Create via auth admin
  const { data: authData, error: authErr } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: role
    }
  });

  if (authErr) {
    console.error(`Error creating auth user for ${email}:`, authErr);
    // Maybe already in auth.users?
    const { data: usersList } = await sb.auth.admin.listUsers();
    const found = usersList?.users?.find(u => u.email === email);
    if (found) {
      const { data: p } = await sb.from('profiles').upsert({
        id: found.id,
        full_name: fullName,
        university_email: email,
        role: role,
        department: department
      }).select().single();
      return p;
    }
    return null;
  }

  const userId = authData.user.id;
  // Ensure profile exists and has proper role
  const { data: profile, error: profErr } = await sb
    .from('profiles')
    .upsert({
      id: userId,
      full_name: fullName,
      university_email: email,
      role: role,
      department: department,
      research_interests: role === 'faculty' ? ['Distributed Systems', 'Cloud Computing', 'AI in Education'] : ['Machine Learning', 'Full Stack Systems']
    })
    .select()
    .single();

  if (profErr) {
    console.error(`Error upserting profile for ${email}:`, profErr);
  }

  console.log(`Created user: ${fullName} (${email}), ID: ${userId}, Role: ${role}`);
  return profile;
}

async function seed() {
  console.log('Seeding demo team & supervisor...');
  const supervisor = await createOrGetUser('sourav.akib@aiub.edu', 'AiubPass123!#', 'Sourav Akib Sarkar', 'faculty');
  const coAuthor = await createOrGetUser('24-59070-3@student.aiub.edu', 'AiubPass123!#', 'Md. Tajrian Islam Patwary', 'student');

  const { data: dewan } = await sb
    .from('profiles')
    .select('*')
    .eq('university_email', '24-59069-3@student.aiub.edu')
    .single();

  if (!dewan || !supervisor || !coAuthor) {
    console.error('Missing key profiles for seeding');
    return;
  }

  console.log('Key profiles available:', { dewan: dewan.id, supervisor: supervisor.id, coAuthor: coAuthor.id });

  // Check if showcase project already exists
  const projectTitle = 'AIUB URCP: Decentralized University Research Collaboration & Verification Platform';
  let { data: project } = await sb
    .from('projects')
    .select('*')
    .eq('title', projectTitle)
    .maybeSingle();

  if (!project) {
    console.log('Creating project...');
    const { data: newProj, error: pErr } = await sb
      .from('projects')
      .insert({
        title: projectTitle,
        abstract: 'A full-stack institutional platform designed for American International University-Bangladesh (AIUB) to streamline undergraduate research thesis tracking, supervisor allocation, proposal peer reviews, draft versioning with diff comparisons, and literature cataloging.',
        objectives: '1. Standardize AIUB CS capstone thesis proposal workflow.\n2. Enable real-time supervisor guidance with inline document feedback.\n3. Integrate automated duplicate literature detection.\n4. Provide departmental chair analytics and RBAC.',
        supervisor_id: supervisor.id,
        status: 'active',
        progress_percent: 65
      })
      .select()
      .single();

    if (pErr) {
      console.error('Error creating project:', pErr);
      return;
    }
    project = newProj;
    console.log('Created project:', project.id);
  } else {
    console.log('Project already exists:', project.id);
  }

  // 1. Project Members
  await sb.from('project_members').upsert([
    { project_id: project.id, user_id: dewan.id, member_role: 'owner' },
    { project_id: project.id, user_id: coAuthor.id, member_role: 'co_author' },
    { project_id: project.id, user_id: supervisor.id, member_role: 'supervisor' }
  ], { onConflict: 'project_id,user_id' });
  console.log('Project members linked.');

  // 2. Proposal
  const { data: existingProposal } = await sb.from('proposals').select('id').eq('project_id', project.id).maybeSingle();
  let proposalId = existingProposal?.id;
  if (!proposalId) {
    const { data: newProp } = await sb.from('proposals').insert({
      project_id: project.id,
      submitted_by: dewan.id,
      supervisor_id: supervisor.id,
      title: projectTitle,
      abstract: project.abstract,
      objectives: project.objectives,
      status: 'approved',
      decided_at: new Date().toISOString()
    }).select().single();
    proposalId = newProp?.id;

    if (proposalId) {
      await sb.from('proposal_decisions').insert({
        proposal_id: proposalId,
        decided_by: supervisor.id,
        decision: 'approved',
        feedback: 'Excellent proposal scope. The integration with AIUB faculty directory and real-time document diffing fulfills all CSC 3114 capstone guidelines. Approved to proceed.'
      });
    }
  }

  // 3. Milestones
  const { data: existingMilestones } = await sb.from('milestones').select('id, title').eq('project_id', project.id);
  let milestoneMap = {};
  if (existingMilestones && existingMilestones.length > 0) {
    existingMilestones.forEach(m => milestoneMap[m.title] = m.id);
  } else {
    const { data: newMilestones } = await sb.from('milestones').insert([
      { project_id: project.id, title: 'Phase 1: Architecture & RBAC System', due_date: '2026-10-01', status: 'done' },
      { project_id: project.id, title: 'Phase 2: Realtime Document Editor & Diffs', due_date: '2026-10-15', status: 'in_progress' },
      { project_id: project.id, title: 'Phase 3: Supervisor Defense & Final Report', due_date: '2026-11-10', status: 'pending' }
    ]).select();
    newMilestones?.forEach(m => milestoneMap[m.title] = m.id);
  }
  console.log('Milestones seeded.');

  // 4. Tasks
  const { count: taskCount } = await sb.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', project.id);
  if (!taskCount || taskCount === 0) {
    await sb.from('tasks').insert([
      {
        project_id: project.id,
        milestone_id: milestoneMap['Phase 1: Architecture & RBAC System'],
        title: 'Design PostgreSQL schema & Row-Level Security policies',
        assignee_id: dewan.id,
        due_date: '2026-09-25',
        status: 'complete'
      },
      {
        project_id: project.id,
        milestone_id: milestoneMap['Phase 1: Architecture & RBAC System'],
        title: 'Scrape and verify 428 AIUB CS faculty records',
        assignee_id: coAuthor.id,
        due_date: '2026-09-28',
        status: 'complete'
      },
      {
        project_id: project.id,
        milestone_id: milestoneMap['Phase 2: Realtime Document Editor & Diffs'],
        title: 'Implement inline comment anchor & Myers diff comparator',
        assignee_id: dewan.id,
        due_date: '2026-10-08',
        status: 'in_progress'
      },
      {
        project_id: project.id,
        milestone_id: milestoneMap['Phase 2: Realtime Document Editor & Diffs'],
        title: 'Trigram similarity detection for literature uploads',
        assignee_id: coAuthor.id,
        due_date: '2026-10-12',
        status: 'pending'
      },
      {
        project_id: project.id,
        milestone_id: milestoneMap['Phase 3: Supervisor Defense & Final Report'],
        title: 'Compile IEEE formatted capstone thesis PDF',
        assignee_id: dewan.id,
        due_date: '2026-11-05',
        status: 'pending'
      }
    ]);
    console.log('Tasks seeded.');
  }

  // 5. Literature Items
  const { count: litCount } = await sb.from('literature_items').select('*', { count: 'exact', head: true }).eq('project_id', project.id);
  if (!litCount || litCount === 0) {
    await sb.from('literature_items').insert([
      {
        project_id: project.id,
        title: 'Decentralized Academic Credential Verification using Merkle DAGs',
        authors: 'Sarkar, S. A., & Rahman, M. (AIUB CS Research, 2025)',
        folder_tag: 'Background Study',
        uploaded_by: supervisor.id,
        status: 'reviewed'
      },
      {
        project_id: project.id,
        title: 'Real-Time Collaborative Markdown Revision Control with CRDTs and Myers Diff',
        authors: 'Hossen, D. S., & Patwary, M. T. I. (IEEE Access Submitted, 2026)',
        folder_tag: 'Methodology',
        uploaded_by: dewan.id,
        status: 'reviewed'
      },
      {
        project_id: project.id,
        title: 'Automated Plagiarism and Redundancy Filtering in Institutional Repositories',
        authors: 'Ahmed, K. T., & Hasan, M. (AIUB Journal of Science and Engineering, 2024)',
        folder_tag: 'Literature Review',
        uploaded_by: coAuthor.id,
        status: 'unread'
      }
    ]);
    console.log('Literature items seeded.');
  }

  // 6. Documents & Versions
  const { data: existingDoc } = await sb.from('documents').select('id').eq('project_id', project.id).maybeSingle();
  let documentId = existingDoc?.id;
  if (!documentId) {
    const { data: newDoc } = await sb.from('documents').insert({
      project_id: project.id,
      title: 'Chapter 1 & 2: Introduction, Problem Statement, and Literature Review'
    }).select().single();
    documentId = newDoc?.id;

    // Version 1
    const { data: v1 } = await sb.from('document_versions').insert({
      document_id: documentId,
      version_number: 1,
      saved_by: dewan.id,
      change_summary: 'Initial draft covering AIUB thesis difficulties and manual paper submission pain points.',
      content: `# 1. Introduction

Academic research supervision at American International University-Bangladesh (AIUB) has traditionally relied on fragmented channels—spreadsheets, email threads, and printed sign-off sheets. This introduces critical overhead:

- Difficulty tracking student milestone submissions.
- Absence of version-controlled supervisor feedback.
- Manual verification of duplicate literature reviews.

## 1.1 Objective
The URCP system aims to unify thesis lifecycle management into a single authenticated portal with role-based access for students, supervisors, and department heads.`
    }).select().single();

    // Version 2
    const { data: v2 } = await sb.from('document_versions').insert({
      document_id: documentId,
      version_number: 2,
      saved_by: coAuthor.id,
      change_summary: 'Added literature review section and trigonometric duplicate analysis.',
      content: `# 1. Introduction

Academic research supervision at American International University-Bangladesh (AIUB) has traditionally relied on fragmented channels—spreadsheets, email threads, and printed sign-off sheets. This introduces critical overhead:

- Difficulty tracking student milestone submissions and committee reviews.
- Absence of version-controlled supervisor feedback and diff comparisons.
- Manual verification of duplicate literature reviews across past semesters.

## 1.1 Objective
The URCP system aims to unify thesis lifecycle management into a single authenticated portal with role-based access for students, supervisors, and department heads.

# 2. Literature Review
Prior systems such as Turnitin focus exclusively on text plagiarism rather than structural research progress tracking. Our approach utilizes PostgreSQL pg_trgm for instantaneous duplicate proposal and literature detection, ensuring unique academic contribution across all enrolled teams.`
    }).select().single();

    // Version 3
    const { data: v3 } = await sb.from('document_versions').insert({
      document_id: documentId,
      version_number: 3,
      saved_by: dewan.id,
      change_summary: 'Integrated supervisor feedback: added system architecture diagram reference and timeline.',
      content: `# 1. Introduction

Academic research supervision at American International University-Bangladesh (AIUB) has traditionally relied on fragmented channels—spreadsheets, email threads, and printed sign-off sheets. This introduces critical overhead:

- Difficulty tracking student milestone submissions and committee reviews.
- Absence of version-controlled supervisor feedback and diff comparisons.
- Manual verification of duplicate literature reviews across past semesters.

## 1.1 Objective
The URCP system aims to unify thesis lifecycle management into a single authenticated portal with role-based access for students, supervisors, and department heads.

## 1.2 System Architecture
URCP is architected with Next.js 16 (React 19) App Router, Supabase PostgreSQL with strict RLS (Row-Level Security), and real-time WebSocket channels for instant peer-supervisor communication.

# 2. Literature Review
Prior systems such as Turnitin focus exclusively on text plagiarism rather than structural research progress tracking. Our approach utilizes PostgreSQL pg_trgm for instantaneous duplicate proposal and literature detection, ensuring unique academic contribution across all enrolled teams.`
    }).select().single();

    // Update document current_version_id
    await sb.from('documents').update({ current_version_id: v3.id }).eq('id', documentId);

    // Comments
    await sb.from('document_comments').insert([
      {
        document_id: documentId,
        version_id: v2.id,
        author_id: supervisor.id,
        section_ref: 'Section 1.1 Objective',
        body: 'Please elaborate on the cryptographic and RLS access control models before final committee defense.',
        status: 'open'
      },
      {
        document_id: documentId,
        version_id: v3.id,
        author_id: dewan.id,
        section_ref: 'Section 1.2 System Architecture',
        body: 'Added Section 1.2 to detail the Next.js 16 and Supabase RLS policies as requested, Sir.',
        status: 'resolved'
      }
    ]);
    console.log('Document and 3 versions + comments seeded.');
  }

  // 7. Chat messages
  const { count: msgCount } = await sb.from('messages').select('*', { count: 'exact', head: true }).eq('project_id', project.id);
  if (!msgCount || msgCount === 0) {
    await sb.from('messages').insert([
      {
        project_id: project.id,
        sender_id: supervisor.id,
        body: 'Welcome Dewan & Tajrian. Please ensure you update the milestone board by this Thursday before our weekly check-in.'
      },
      {
        project_id: project.id,
        sender_id: dewan.id,
        body: 'Thank you Sir! We have already completed Phase 1 (PostgreSQL RLS & AIUB faculty directory sync) and uploaded Draft v3 for your review.'
      },
      {
        project_id: project.id,
        sender_id: coAuthor.id,
        body: 'I have also uploaded the literature survey on pg_trgm duplicate filtering to the Literature tab.'
      },
      {
        project_id: project.id,
        sender_id: supervisor.id,
        body: 'Great progress. Let us review the diff between Version 2 and Version 3 in our upcoming lab meeting.'
      }
    ]);
    console.log('Messages seeded.');
  }

  // 8. Meeting
  const { count: meetCount } = await sb.from('meetings').select('*', { count: 'exact', head: true }).eq('project_id', project.id);
  if (!meetCount || meetCount === 0) {
    const meetingTime = new Date();
    meetingTime.setDate(meetingTime.getDate() + 2);
    meetingTime.setHours(14, 0, 0, 0);

    await sb.from('meetings').insert([
      {
        project_id: project.id,
        proposed_by: supervisor.id,
        proposed_time: meetingTime.toISOString(),
        location: 'AIUB CS Faculty Building D, Room 4102 / Google Meet',
        status: 'confirmed'
      }
    ]);
    console.log('Meeting seeded.');
  }

  // 9. Notifications for Dewan
  await sb.from('notifications').insert([
    {
      user_id: dewan.id,
      type: 'proposal_decision',
      payload: {
        message: 'Your research proposal for "AIUB URCP" has been approved by Sourav Akib Sarkar.',
        project_id: project.id
      }
    },
    {
      user_id: dewan.id,
      type: 'new_comment',
      payload: {
        message: 'Sourav Akib Sarkar added an inline comment on Draft v2.',
        project_id: project.id
      }
    },
    {
      user_id: dewan.id,
      type: 'meeting_update',
      payload: {
        message: 'Weekly Progress Review confirmed for Room 4102 / Google Meet.',
        project_id: project.id
      }
    }
  ]);
  console.log('Notifications seeded.');

  console.log('✅ COMPLETE DEMO PROJECT SEEDING FINISHED SUCCESSFULLY!');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
});
