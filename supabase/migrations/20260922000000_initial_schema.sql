-- =========================================================
-- University Research Collaboration Platform (URCP)
-- Database Schema Migration v1.0
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE project_status AS ENUM ('draft', 'pending_review', 'active', 'needs_attention', 'completed', 'archived');
CREATE TYPE member_role AS ENUM ('owner', 'co_author', 'supervisor');
CREATE TYPE proposal_status AS ENUM ('draft', 'submitted', 'approved', 'changes_requested', 'rejected');
CREATE TYPE decision_type AS ENUM ('approved', 'changes_requested', 'rejected');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'done');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'complete');
CREATE TYPE literature_status AS ENUM ('unread', 'reviewed', 'possible_duplicate');
CREATE TYPE comment_status AS ENUM ('open', 'resolved');
CREATE TYPE meeting_status AS ENUM ('pending', 'confirmed', 'declined');
CREATE TYPE notification_type AS ENUM ('proposal_decision', 'new_comment', 'meeting_update', 'task_due', 'role_change');

-- 2. PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    university_email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'student',
    department TEXT NOT NULL DEFAULT 'Department of Computer Science',
    research_interests TEXT[] DEFAULT '{}',
    short_bio TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    objectives TEXT,
    supervisor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status project_status NOT NULL DEFAULT 'active',
    progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

-- 4. PROJECT MEMBERS
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    member_role member_role NOT NULL DEFAULT 'co_author',
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 5. PROPOSALS
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    supervisor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    objectives TEXT,
    status proposal_status NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ
);

-- 6. PROPOSAL ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.proposal_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PROPOSAL DECISIONS (Immutable Audit Record)
CREATE TABLE IF NOT EXISTS public.proposal_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    decided_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    decision decision_type NOT NULL,
    feedback TEXT NOT NULL,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. MILESTONES & TASKS
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    status milestone_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date DATE,
    status task_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. LITERATURE REPOSITORY
CREATE TABLE IF NOT EXISTS public.literature_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    file_url TEXT,
    folder_tag TEXT,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status literature_status NOT NULL DEFAULT 'unread',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. DOCUMENTS & VERSIONING
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    current_version_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    saved_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    change_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    version_id UUID REFERENCES public.document_versions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    section_ref TEXT,
    body TEXT NOT NULL,
    status comment_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. COMMUNICATION: MESSAGES & MEETINGS
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    proposed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    proposed_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    status meeting_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICATIONS & AUDIT LOG
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. FACULTY DIRECTORY (For supervisor search & match)
CREATE TABLE IF NOT EXISTS public.faculty_directory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    faculty TEXT,
    department TEXT NOT NULL,
    designation TEXT,
    position TEXT,
    room_no TEXT,
    building_no TEXT,
    academic_interests TEXT[] DEFAULT '{}',
    research_interests TEXT[] DEFAULT '{}',
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- AUTOMATION & TRIGGERS
-- =========================================================

-- Trigger to handle proposal decision logic:
-- When a supervisor submits an approved decision:
-- 1. Create a project automatically
-- 2. Add student (owner) and supervisor to project_members
-- 3. Update proposal status and link project_id
CREATE OR REPLACE FUNCTION public.handle_proposal_decision()
RETURNS TRIGGER AS $$
DECLARE
    v_proposal RECORD;
    v_new_project_id UUID;
BEGIN
    -- Fetch proposal details
    SELECT * INTO v_proposal FROM public.proposals WHERE id = NEW.proposal_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proposal not found';
    END IF;

    -- Update proposal status
    IF NEW.decision = 'approved' THEN
        -- Create active project
        INSERT INTO public.projects (title, abstract, objectives, supervisor_id, status)
        VALUES (v_proposal.title, v_proposal.abstract, v_proposal.objectives, NEW.decided_by, 'active')
        RETURNING id INTO v_new_project_id;

        -- Add student as owner
        INSERT INTO public.project_members (project_id, user_id, member_role)
        VALUES (v_new_project_id, v_proposal.submitted_by, 'owner');

        -- Add supervisor as supervisor
        INSERT INTO public.project_members (project_id, user_id, member_role)
        VALUES (v_new_project_id, NEW.decided_by, 'supervisor');

        -- Update proposal
        UPDATE public.proposals
        SET status = 'approved',
            decided_at = NEW.decided_at,
            project_id = v_new_project_id
        WHERE id = NEW.proposal_id;

    ELSIF NEW.decision = 'changes_requested' THEN
        UPDATE public.proposals
        SET status = 'changes_requested',
            decided_at = NEW.decided_at
        WHERE id = NEW.proposal_id;

    ELSIF NEW.decision = 'rejected' THEN
        UPDATE public.proposals
        SET status = 'rejected',
            decided_at = NEW.decided_at
        WHERE id = NEW.proposal_id;
    END IF;

    -- Create notification for student
    INSERT INTO public.notifications (user_id, type, payload)
    VALUES (
        v_proposal.submitted_by,
        'proposal_decision',
        jsonb_build_object(
            'proposal_id', v_proposal.id,
            'title', v_proposal.title,
            'decision', NEW.decision,
            'feedback', NEW.feedback
        )
    );

    -- Log to audit_log
    INSERT INTO public.audit_log (actor_id, action, target_table, target_id, metadata)
    VALUES (
        NEW.decided_by,
        'proposal_' || NEW.decision::text,
        'proposals',
        NEW.proposal_id::text,
        jsonb_build_object('decision_id', NEW.id, 'feedback', NEW.feedback)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_proposal_decision_insert
AFTER INSERT ON public.proposal_decisions
FOR EACH ROW EXECUTE FUNCTION public.handle_proposal_decision();

-- Enforce immutability on proposal decisions and audit log
CREATE OR REPLACE FUNCTION public.prevent_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Updates and deletions are strictly disallowed on immutable audit logs.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_decision_update
BEFORE UPDATE OR DELETE ON public.proposal_decisions
FOR EACH ROW EXECUTE FUNCTION public.prevent_modification();

CREATE TRIGGER prevent_audit_update
BEFORE UPDATE OR DELETE ON public.audit_log
FOR EACH ROW EXECUTE FUNCTION public.prevent_modification();

-- Auto-sync new user to profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, university_email, role, department)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'University Member'),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
        COALESCE(NEW.raw_user_meta_data->>'department', 'Department of Computer Science')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.literature_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_directory ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is a member of a project
CREATE OR REPLACE FUNCTION public.is_project_member(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = p_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Authenticated users can read profiles; users can update their own; admin can update any
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin());

-- Projects: Project members or admins can view
CREATE POLICY "Projects viewable by members or admins"
ON public.projects FOR SELECT
TO authenticated
USING (public.is_project_member(id) OR public.is_admin());

CREATE POLICY "Project owners or admins can update projects"
ON public.projects FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = id AND user_id = auth.uid() AND member_role = 'owner'
    ) OR public.is_admin()
);

-- Project Members: Viewable by members or admins
CREATE POLICY "Project members viewable by members or admins"
ON public.project_members FOR SELECT
TO authenticated
USING (public.is_project_member(project_id) OR public.is_admin());

CREATE POLICY "Project owners and supervisors can manage members"
ON public.project_members FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = public.project_members.project_id
          AND user_id = auth.uid()
          AND member_role IN ('owner', 'supervisor')
    ) OR public.is_admin()
);

-- Proposals: Viewable by submitter, supervisor, or admin
CREATE POLICY "Proposals viewable by submitter supervisor or admin"
ON public.proposals FOR SELECT
TO authenticated
USING (submitted_by = auth.uid() OR supervisor_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students can submit proposals"
ON public.proposals FOR INSERT
TO authenticated
WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Submitters can update own draft or pending proposals"
ON public.proposals FOR UPDATE
TO authenticated
USING (submitted_by = auth.uid() AND status IN ('draft', 'changes_requested'));

-- Proposal Attachments
CREATE POLICY "Attachments viewable by proposal viewers"
ON public.proposal_attachments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.proposals p
        WHERE p.id = proposal_id
          AND (p.submitted_by = auth.uid() OR p.supervisor_id = auth.uid() OR public.is_admin())
    )
);

CREATE POLICY "Submitters can add attachments"
ON public.proposal_attachments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.proposals p
        WHERE p.id = proposal_id AND p.submitted_by = auth.uid()
    )
);

-- Proposal Decisions: Viewable by proposal viewers, insertable only by assigned supervisor
CREATE POLICY "Decisions viewable by proposal parties"
ON public.proposal_decisions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.proposals p
        WHERE p.id = proposal_id
          AND (p.submitted_by = auth.uid() OR p.supervisor_id = auth.uid() OR public.is_admin())
    )
);

CREATE POLICY "Supervisors can insert decisions"
ON public.proposal_decisions FOR INSERT
TO authenticated
WITH CHECK (
    decided_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.proposals p
        WHERE p.id = proposal_id AND p.supervisor_id = auth.uid()
    )
);

-- Project Workspace Components (Milestones, Tasks, Literature, Documents)
-- Restricted to project members only (Admins do not access private project content)
CREATE POLICY "Milestones accessible to project members"
ON public.milestones FOR ALL
TO authenticated
USING (public.is_project_member(project_id))
WITH CHECK (public.is_project_member(project_id));

CREATE POLICY "Tasks accessible to project members"
ON public.tasks FOR ALL
TO authenticated
USING (public.is_project_member(project_id))
WITH CHECK (public.is_project_member(project_id));

CREATE POLICY "Literature accessible to project members"
ON public.literature_items FOR ALL
TO authenticated
USING (public.is_project_member(project_id))
WITH CHECK (public.is_project_member(project_id));

CREATE POLICY "Documents accessible to project members"
ON public.documents FOR ALL
TO authenticated
USING (public.is_project_member(project_id))
WITH CHECK (public.is_project_member(project_id));

CREATE POLICY "Document versions accessible to project members"
ON public.document_versions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.id = document_id AND public.is_project_member(d.project_id)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.id = document_id AND public.is_project_member(d.project_id)
    )
);

CREATE POLICY "Document comments accessible to project members"
ON public.document_comments FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.id = document_id AND public.is_project_member(d.project_id)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.id = document_id AND public.is_project_member(d.project_id)
    )
);

-- Messages: Scoped to project members for project chat, or sender/recipient for 1:1
CREATE POLICY "Messages accessible to chat participants"
ON public.messages FOR SELECT
TO authenticated
USING (
    (project_id IS NOT NULL AND public.is_project_member(project_id)) OR
    (project_id IS NULL AND (sender_id = auth.uid() OR recipient_id = auth.uid()))
);

CREATE POLICY "Messages insertable by participants"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid() AND (
        (project_id IS NOT NULL AND public.is_project_member(project_id)) OR
        (project_id IS NULL AND recipient_id IS NOT NULL)
    )
);

-- Meetings: Scoped to project members
CREATE POLICY "Meetings accessible to project members"
ON public.meetings FOR ALL
TO authenticated
USING (public.is_project_member(project_id))
WITH CHECK (public.is_project_member(project_id));

-- Notifications: Strictly private to user
CREATE POLICY "Users can view and update own notifications"
ON public.notifications FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Audit Log: Strictly Admin read-only, created by system
CREATE POLICY "Audit logs viewable by admin only"
ON public.audit_log FOR SELECT
TO authenticated
USING (public.is_admin());

-- Faculty Directory: Viewable by all authenticated users
CREATE POLICY "Faculty directory viewable by authenticated users"
ON public.faculty_directory FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Faculty directory manageable by admin"
ON public.faculty_directory FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
