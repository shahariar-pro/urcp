# University Research Collaboration Platform (URCP)
### Full Build Specification — v1.0

> **Purpose of this document:** This is a complete, self-contained build spec for an AI coding agent to implement URCP end-to-end — a real, professional, production-grade web application. It is derived from the team's submitted SRS (CSC 3114, Summer 2025-2026, Dept. of Computer Science, AIUB, supervised by Sourav Akib Sarkar) and two rounds of UI/UX wireframes covering 21+ screens. Build strictly against this spec. Where a decision isn't specified, prefer the simplest professional solution that keeps the app fast, secure, and deployable on Vercel's free tier.

---

## 1. What This App Is

Undergraduate research at AIUB (and most Bangladeshi universities) is coordinated informally — email threads, WhatsApp groups, scattered Google Drive links, verbal meeting notes. This causes four concrete problems the app must solve:

1. Proposals get buried in email and supervisors miss them.
2. Literature review work gets duplicated because nobody can see what teammates have already read.
3. Supervisor feedback is scattered across email, PDF markups, and verbal comments — students lose track of what to fix.
4. Draft files get messy ("Paper_final_v2_reallyfinal.docx") and nobody knows which version is current.
5. The department has no visibility into how many research projects are active, who's overloaded, or overall output.

URCP is a single web platform that replaces all of the above with one system of record: proposal submission & approval, a per-project collaborative workspace (literature, tasks, drafts, versions), scoped communication, and a department-level oversight dashboard.

**Scope for v1:** Department of Computer Science, AIUB only (by design — see SRS §1.2). Multi-department support is explicitly out of scope for now.

---

## 2. Users & Roles

| Role | Who | Core needs |
|---|---|---|
| **Student Researcher** | Undergrad/grad students, solo or in a group | Submit proposals, work inside project workspace, track tasks, chat, view own progress |
| **Faculty Supervisor** | Teachers supervising one or more projects | Review/approve/reject proposals, comment on drafts, track supervised projects, manage meetings |
| **Co-Author / Collaborator** | Other students or faculty added to a project who are not the lead supervisor | Same workspace access as a project member, scoped to invited projects only |
| **Department Administrator** | Staff managing the platform | Manage accounts & roles, see department-wide analytics, archive projects, generate reports |

A single account has exactly one primary role (Student / Faculty / Admin) at signup, but a Faculty account can simultaneously be a "Co-Author" on someone else's project. Access to any individual project is governed by **project membership**, not just global role — see §5 RBAC.

---

## 3. Recommended Tech Stack

Chosen to be genuinely production-capable, buildable by an AI agent in one pass, and deployable free on Vercel + a free-tier managed backend (same GitHub → Vercel flow already used for the team's other projects).

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router), TypeScript** | Full-stack in one repo: pages, API routes, server actions. Deploys natively on Vercel. |
| Styling / UI | **Tailwind CSS + shadcn/ui** | Fast to build a genuinely professional-looking UI without a design team; accessible components out of the box. |
| Database + Auth + Storage + Realtime | **Supabase (Postgres)** | One free-tier service gives you: relational DB, row-level security (RLS) for RBAC, built-in email/password auth with verification, file storage buckets for PDFs/DOCX, and realtime subscriptions (for chat/notifications) — avoids stitching together 4 separate vendors. |
| Forms & validation | **React Hook Form + Zod** | Type-safe validation shared between client and server. |
| File diff/versioning display | **`diff` (jsdiff) npm package** | Simple, reliable text-diff rendering for draft version comparison — no need for a full rich-text CRDT engine in v1. |
| Email notifications | **Supabase Auth emails (v1)** → optional **Resend** integration (v2) | Ship v1 with in-app notifications + auth emails only; add transactional email later without re-architecting. |
| Charts (admin analytics) | **Recharts** | Lightweight, works cleanly in a React/Next app. |
| Hosting | **Vercel** (frontend + API routes), **Supabase Cloud** (backend), **GitHub** (source, same as Faculty-Finder / Tymodoro) | Matches the team's existing deploy pattern. |

**Do not** introduce a separate backend framework (Express/Django/etc.) — Next.js API routes / server actions + Supabase is sufficient for the entire feature set below and keeps the whole thing in one repo, one deploy.

---

## 4. Data Model

Postgres schema (Supabase). Table names in `snake_case`. This is not exhaustive DDL — the agent should generate exact migrations from this, but every field listed here must exist somewhere in the schema.

### 4.1 Core identity & membership

- **`profiles`** (extends Supabase `auth.users`) — `id`, `full_name`, `university_email`, `role` (`student` | `faculty` | `admin`), `department`, `research_interests` (text, comma-tag style — reuse the same tag pattern as the faculty dataset described in §9), `short_bio`, `avatar_url`, `is_active`, `created_at`
- **`projects`** — `id`, `title`, `abstract`, `objectives`, `supervisor_id` (FK → profiles), `status` (`draft` | `pending_review` | `active` | `needs_attention` | `completed` | `archived`), `progress_percent`, `created_at`, `archived_at`
- **`project_members`** — `project_id`, `user_id`, `member_role` (`owner` | `co_author` | `supervisor`), `invited_at`, `accepted_at` — this table, plus RLS, is what drives all per-project access control

### 4.2 Proposal workflow (Scope 1)

- **`proposals`** — `id`, `project_id`, `submitted_by`, `title`, `abstract`, `objectives`, `status` (`draft` | `submitted` | `approved` | `changes_requested` | `rejected`), `submitted_at`, `decided_at`
- **`proposal_attachments`** — `id`, `proposal_id`, `file_url`, `file_name`, `file_size`, `uploaded_at`
- **`proposal_decisions`** — `id`, `proposal_id`, `decided_by`, `decision` (`approved` | `changes_requested` | `rejected`), `feedback` (mandatory, non-null for `changes_requested`/`rejected`), `decided_at` — this is the immutable, timestamped audit record the SRS explicitly requires

### 4.3 Workspace (Scope 2)

- **`milestones`** — `id`, `project_id`, `title`, `due_date`, `status` (`pending` | `in_progress` | `done`)
- **`tasks`** — `id`, `project_id`, `milestone_id` (nullable), `title`, `assignee_id`, `due_date`, `status` (`pending` | `in_progress` | `complete`)
- **`literature_items`** — `id`, `project_id`, `title`, `authors`, `file_url`, `folder_tag`, `uploaded_by`, `status` (`unread` | `reviewed` | `possible_duplicate`), `uploaded_at`
- **`documents`** — `id`, `project_id`, `title`, `current_version_id`
- **`document_versions`** — `id`, `document_id`, `content` (text/markdown — see §7.4 on scope), `version_number`, `saved_by`, `change_summary`, `created_at` — retain **at least the last 10 versions** per document (SRS requirement)
- **`document_comments`** — `id`, `document_id`, `version_id`, `author_id`, `section_ref`, `body`, `status` (`open` | `resolved`), `created_at`

### 4.4 Communication & oversight (Scope 3)

- **`messages`** — `id`, `project_id`, `sender_id`, `body`, `created_at` — project-scoped group chat; direct 1:1 threads use the same table with a `recipient_id` and `project_id = null`
- **`meetings`** — `id`, `project_id`, `proposed_by`, `proposed_time`, `location`, `status` (`pending` | `confirmed` | `declined`)
- **`notifications`** — `id`, `user_id`, `type` (`proposal_decision` | `new_comment` | `meeting_update` | `task_due` | `role_change`), `payload` (jsonb), `read_at`, `created_at`
- **`audit_log`** — `id`, `actor_id`, `action`, `target_table`, `target_id`, `metadata` (jsonb), `created_at` — every role change, archive action, and proposal decision writes here; this is what the admin's "Security Audit Logs" screen reads from

All tables get Supabase **Row Level Security** policies keyed off `project_members` and `profiles.role`. No table should be readable/writable without an explicit RLS policy — do not disable RLS anywhere, including for the admin role (admin gets broader but still explicit policies, never `service_role` used from the client).

---

## 5. RBAC Matrix

| Action | Student (member) | Co-Author | Supervisor | Admin |
|---|:---:|:---:|:---:|:---:|
| Submit proposal | ✅ (own) | — | — | — |
| Approve/reject/request changes on proposal | — | — | ✅ (own supervised) | — |
| View own project workspace | ✅ | ✅ | ✅ | ✅ (all) |
| Upload literature / edit tasks | ✅ | ✅ | ✅ | — |
| Comment on drafts | ✅ | ✅ | ✅ | — |
| Invite collaborators | ✅ (owner) | — | ✅ | — |
| Project chat | ✅ | ✅ | ✅ | — |
| Propose/confirm meetings | ✅ | ✅ | ✅ | — |
| View department analytics | — | — | — | ✅ |
| Manage user roles | — | — | — | ✅ |
| Archive a project | ✅ (owner) | — | — | ✅ |
| View audit log | — | — | — | ✅ |

Admins get **aggregate numbers only** by default — never open another user's private chat or draft content from the admin panel (explicit SRS/wireframe requirement: *"Analytics provide department-level numbers without opening private chats or drafts"*).

---

## 6. Feature Modules (mapped to SRS Scopes + wireframe screens)

### Scope 1 — Auth & Proposal Workflow

| Screen | Route | Key behavior |
|---|---|---|
| Sign In | `/login` | University-email-only login (enforce `@aiub.edu` domain at signup), Supabase Auth |
| Register | `/register` | Role selection (Student/Faculty/Admin), department field, sends verification email before activation |
| Reset Password | `/reset-password` | Time-limited reset link via Supabase Auth |
| Submit Proposal | `/proposals/new` | 2-step form: details → supervisor selection → file upload (PDF/DOCX, 25 MB max) → Save Draft or Submit for Review |
| Proposal Review (Supervisor) | `/proposals/[id]/review` | Read abstract/objectives/attachments; Approve / Request Changes / Reject; feedback is **mandatory** for the latter two; every decision timestamped and immutable once written; history log shown on the same screen |

**Acceptance criteria:** a submitted proposal must be visible to its assigned supervisor within the same session (realtime or on-refresh); a decision cannot be submitted without feedback text when status ≠ approved; approving a proposal auto-creates the `project` + `project_members` row for the owner + supervisor.

### Scope 2 — Collaborative Workspace

| Screen | Route | Key behavior |
|---|---|---|
| Project Workspace (overview) | `/projects/[id]` | Members list, overall progress %, open task count, unresolved comment count, recent activity feed, "Invite Collaborator" |
| Literature Repository | `/projects/[id]/literature` | Upload PDFs, tag/folder them, mark reviewed/unread, **duplicate-title detection** on upload (warn, don't block) |
| Tasks & Milestones | `/projects/[id]/tasks` | Milestone grouping, task table with assignee/due/status, kanban-style pending/in-progress/complete counts |
| Draft + Comments | `/projects/[id]/documents/[docId]` | Auto-saving text editor, inline section-anchored comments, open/resolved comment states |
| Version History | `/projects/[id]/documents/[docId]/versions` | List of last 10 versions with saved-by/date/change summary; "View / Compare" shows a diff between two versions; "Restore Selected" reverts current content to a prior version (creates a new version rather than deleting history) |

**Acceptance criteria:** every save to a document creates a new `document_versions` row (never mutate an existing version in place); literature upload flags a possible duplicate when title similarity is high against existing items in the same project (simple fuzzy string match is sufficient for v1 — no ML needed).

### Scope 3 — Communication, Compliance & Oversight

| Screen | Route | Key behavior |
|---|---|---|
| Project Chat | `/projects/[id]/chat` | Realtime group thread scoped to project members only |
| Shared Calendar / Meetings | `/projects/[id]/calendar` | Propose a meeting slot → other party confirms or suggests another time |
| Notifications | `/notifications` | Proposal decisions, new comments, meeting confirmations, task-due reminders; in-app bell + list, mark-as-read |
| Supervisor Dashboard | `/dashboard` (faculty view) | All supervised projects, pending review count, needs-attention flagging, "Download Progress Report" |
| Find a Supervisor | `/faculty` | Search/filter by department + research interest keyword; see §9 — **reuse the existing scraped AIUB faculty dataset here** |
| Department Analytics | `/admin/analytics` | Active projects, researcher/supervisor counts, status breakdown chart, supervisor workload table — aggregate only |
| Roles & Access | `/admin/users` | Add user, edit role/access, deactivate account — every change writes to `audit_log` |
| Archive Project | action on `/projects/[id]` | Confirms, sets project to read-only (`status = archived`), removes from active lists, all data retained and viewable |
| Progress Report | `/admin/reports` or `/dashboard/reports` | Select project + student + date range → generates a PDF summary (milestones, tasks, unresolved comments) |
| Security Audit Log | `/admin/audit` | Read-only, filterable list from `audit_log` |

**Explicitly out of scope for this project** (per SRS §2.3 — do not build): plagiarism-checking, cross-journal/conference submission tracking, payment handling, university ERP integration.

---

## 7. Non-Functional Requirements

1. **Responsive, desktop-first web app.** The SRS explicitly calls for compatibility with Chrome, Firefox, Safari on tablet + desktop; must also degrade gracefully to mobile widths (collapsing sidebar → bottom/hamburger nav), consistent with the team's mobile-first instinct on other projects, but desktop is the primary target here since supervisors/admins will mostly use this at a desk.
2. **File uploads:** PDF/DOCX only, 25 MB max, validated both client- and server-side (MIME + extension). A genuine malware-scanning service is out of scope for v1 — instead, enforce strict file-type/size validation and show "Scanned" as a UI label only once real scanning is wired up (don't fake the claim to end users if it isn't real; either integrate a real scanning API in a later phase or relabel the UI to "Validated").
3. **Security:** Supabase Auth (bcrypt-hashed passwords, verified university email required), RLS on every table, no client-side trust of role claims — all authorization checked server-side.
4. **Auditability:** every proposal decision, role change, and archive action is immutable and timestamped (§4.4 `audit_log` + `proposal_decisions`).
5. **Performance target:** dashboard and workspace pages should be interactive within ~2s on a typical university wifi connection; paginate any list beyond ~50 rows (literature, tasks, audit log).
6. **Privacy:** admins see aggregate analytics only; project content (chat, drafts, comments) is never exposed outside project membership, including to admins, except via the audit log's metadata (which logs *actions*, not content).

---

## 8. Phased Build Plan

Build in this order — each phase should be independently deployable and demoable.

**Phase 1 — Foundation (this is the "initial version")**
- Auth (login/register/reset), role-based routing, profile page
- Proposal submission + supervisor review/decision flow
- Basic project workspace shell (overview page, member list)
- Deploy to Vercel + Supabase, GitHub repo live

**Phase 2 — Core Workspace**
- Literature repository + duplicate detection
- Tasks & milestones
- Document editor + version history + inline comments

**Phase 3 — Communication**
- Project chat (realtime)
- Meeting proposal/confirmation + calendar view
- Notifications (in-app)

**Phase 4 — Oversight & Polish**
- Admin analytics dashboard, RBAC management screen, audit log
- Archive workflow
- Progress report generation (PDF export)
- Faculty search/discovery page (reusing scraped faculty dataset — see §9)
- Accessibility pass, empty states, loading/error states, final responsive QA

Ship Phase 1 first and get it on Vercel before starting Phase 2 — this mirrors how Faculty-Finder and Tymodoro were shipped.

---

## 9. Reuse: Faculty Data for "Find a Supervisor"

The **Faculty-Finder** project already produced a clean, structured dataset of every AIUB faculty member (`aiub_faculty.json` / `.csv`) with `name`, `email`, `faculty`, `department`, `designation`, `position`, `room_no`, `building_no`, `academic_interests`, `research_interests`, `photo_url` — pulled straight from AIUB's own employee-profile API.

For URCP's **Find a Supervisor / Faculty Discovery** screen (§6, Scope 3), don't re-collect this data by hand. Two integration options for the agent to choose between based on how live the data needs to be:

- **Option A (simplest, recommended for v1):** seed a `faculty_directory` table from the existing JSON one time (import script), and let Department Admins edit entries for their own faculty going forward through the existing Roles & Access screen. Split `research_interests`/`academic_interests` on `,` into a `text[]` column so the search/filter UI can facet by tag, matching the `#SE #DeepLearning #NLP` tag style shown in the wireframes.
- **Option B (if fresher data matters):** keep the same nightly-import approach against AIUB's public employee-profile JSON endpoint used to build Faculty-Finder, so the directory stays in sync automatically.

Either way, faculty accounts that register directly in URCP should be matched/merged with their `faculty_directory` row by university email, not duplicated.

---

## 10. Repo, Environments & Deployment

Follow the same pattern already used for Faculty-Finder and Tymodoro:

1. **Local dev:** Next.js app scaffolded with TypeScript + Tailwind + shadcn/ui, opened in VS Code.
2. **Environment variables** (`.env.local`, never committed): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only, used only in trusted server actions/API routes — never shipped to the client).
3. **GitHub:** push from VS Code terminal to a new repo (e.g. `shahariar-pro/urcp`), same flow as the other two projects.
4. **Vercel:** import the GitHub repo, add the environment variables in the Vercel dashboard, auto-deploy on push to `main`. Use preview deployments for feature branches before merging.
5. **Supabase:** separate free-tier project; run migrations via the Supabase CLI or SQL editor; enable RLS on every table before any real data goes in.

---

## 11. Reference: Project Team

| Name | Student ID |
|---|---|
| Dewan Shahariar Hossen | 24-59069-3 |
| Md. Tajrian Islam Patwary | 24-59093-3 |
| Md. Siam Tasbir | 24-59099-3 |

Supervised by **Sourav Akib Sarkar**, Dept. of Computer Science, AIUB.

---

## 12. Definition of Done (v1 / Phase 1 initial version)

- [ ] A student can register, verify email, log in, and submit a proposal with an attached file.
- [ ] The assigned supervisor sees the pending proposal, and can approve / request changes / reject with mandatory feedback; the decision is timestamped and immutable.
- [ ] Approving a proposal creates a project workspace with the student and supervisor as members.
- [ ] The workspace overview page renders for all members with correct RLS (no user can see a project they're not a member of).
- [ ] The whole flow works end-to-end on the deployed Vercel URL, backed by the live Supabase project, pushed from the GitHub repo.
