# AIUB URCP — Engineering Handoff & Current-State Blueprint
## Reliable handoff for the next AI coding-agent session

**Course:** CSC 3114 — Research Methodology & Capstone Project  
**Institution:** American International University-Bangladesh (AIUB), Department of Computer Science  
**Supervisor:** Sourav Akib Sarkar  
**Student Team:** Dewan Shahariar Hossen (24-59069-3) & Md. Tajrian Islam Patwary (24-59093-3)  
**Live Production URL:** https://aiubrcp.vercel.app/  
**Production alias:** https://urcp-two.vercel.app/  
**Repository:** https://github.com/shahariar-pro/urcp  
**Branch:** `main`  
**Generated:** September 2026

---

> ## IMPORTANT — How to use this handoff
>
> This file intentionally combines the **full architecture/reference information from `HANDOFF.md`** with the **current-state, security warnings, known gaps, and prioritized next work from `HANDOFF_v2.md`**.
>
> **Do not treat older "completed" descriptions as proof that a feature is production-ready.** The current-state section and blocking issues below take precedence when they conflict with older descriptions.
>
> **Immediate Fixes are blocking:** resolve the credential exposure, real file-storage gap, and misleading malware-scan claim before adding unrelated features.

---

# 1. Executive Summary

The **University Research Collaboration Platform (URCP)** is a centralized web portal engineered specifically for the AIUB Department of Computer Science. It replaces fragmented email threads, spreadsheets, and shared folders with an integrated, version-controlled research lifecycle system.

The deployed application is a working capstone/demo system with seeded data. It is **not yet ready to be trusted with real user files or recommended for real departmental use** until the blocking issues in Section 5 are addressed.

## 1.1 Technology Stack

- Next.js 16
- React 19
- Turbopack
- App Router
- Tailwind CSS v4
- Google Inter typography
- `next-themes` for light/dark/system themes
- Supabase PostgreSQL
- Supabase Auth
- Supabase Row-Level Security (RLS)
- Supabase server/client/admin service-role clients
- Recharts for departmental analytics
- Myers diff implementation
- Trigram fuzzy similarity for literature duplicate detection

## 1.2 Major Implemented Areas

The deployed phases currently cover:

- Authentication and registration
- Proposal creation and supervisor review workflow
- Literature repository with fuzzy duplicate detection
- Kanban milestones and tasks
- Markdown draft editor
- Document version history and diff comparison
- Inline supervisor notes/comments
- Project chat
- Meeting calendar
- Notifications
- Admin analytics
- RBAC
- Immutable audit logging
- Progress/institutional report
- Full 428-member AIUB CS faculty directory
- Responsive navigation
- Comprehensive dark mode
- Seeded showcase project

These capabilities are implemented in the demo, but individual features can still contain production-readiness gaps. See Section 5 and Section 7.

---

# 2. Key Milestones Completed

1. **Full-Stack Application Built**
   - Next.js 16
   - React 19
   - Turbopack
   - App Router
   - Tailwind CSS v4

2. **Typography & Styling Refreshed**
   - Google **Inter** configured as the global typography.
   - This resolved previous rendering issues caused by system-font fallbacks.

3. **Comprehensive Dark Mode**
   - `next-themes`
   - System/light/dark mode
   - `ThemeToggle`
   - Desktop and mobile navigation
   - Login/register
   - Workspace
   - Documents
   - Kanban
   - Analytics

4. **Mobile Responsiveness & Navigation**
   - Slide-down mobile hamburger drawer
   - Touch-scrollable pill navigation
   - `WorkspaceNav`
   - `AdminNav`

5. **Database & RLS Schema**
   - Live Supabase PostgreSQL backend
   - 13 relational tables
   - Custom enums
   - Trigger-enforced immutable audit trails
   - `audit_log`
   - `proposal_decisions`
   - Row-Level Security policies

6. **Faculty Directory & Performance**
   - 428 official AIUB CS faculty members
   - Scraped, validated, and indexed
   - Memory-cached reads
   - Lazy-paginated client rendering

7. **Admin Access**
   - Dewan Shahariar Hossen is currently the production admin.
   - Admin has access to departmental analytics, user management, and security audit logs.

8. **Realistic Showcase Project**
   - Seeded capstone project
   - Milestones
   - Kanban tasks
   - Literature repository
   - Fuzzy duplicate detection
   - Versioned markdown draft
   - Myers diff comparator
   - Supervisor notes
   - Project chat
   - Meeting calendar

---

# 3. Platform Accounts & Security

All user accounts authenticate through Supabase Auth and use official AIUB email domains:

- `@student.aiub.edu`
- `@aiub.edu`

## 3.1 Known Accounts

| Name | University Email | Role | User ID |
|---|---|---|---|
| Dewan Shahariar Hossen | `24-59069-3@student.aiub.edu` | `admin` | `d5941a1a-c8cf-4523-be99-64cd26b8b8e4` |
| Sourav Akib Sarkar | `sourav.akib@aiub.edu` | `faculty` | `59ed5eaf-eee5-4d66-bac1-cba617ed28a9` |
| Md. Tajrian Islam Patwary | `24-59070-3@student.aiub.edu` | `student` | `35f6b3d4-10a9-4f07-b1a2-cdff0fcf30d0` |

### Password handling

**Do not store or re-commit plaintext passwords in this handoff.**

The older handoff contained a shared seeded password. `HANDOFF_v2.md` explicitly identifies that credential as a security problem because the repository is public.

Before treating any test account as usable:

1. Rotate the affected Supabase Auth passwords.
2. Remove plaintext credentials from the repository and Git history where appropriate.
3. Store seed credentials through local environment variables instead.
4. Make `scripts/seed_demo_data.mjs` read the password from an environment variable rather than hardcoding it.
5. Never put a working password into this handoff again.

---

# 4. Seeded Showcase Project

- **Project Title:** `AIUB URCP: Decentralized University Research Collaboration & Verification Platform`
- **Project ID:** `14d51ea7-a65c-40ec-a5eb-a28aab344ed8`
- **Workspace:** `https://aiubrcp.vercel.app/projects/14d51ea7-a65c-40ec-a5eb-a28aab344ed8`
- **Supervisor:** Sourav Akib Sarkar
- **Team Members:**
  - Dewan Shahariar Hossen — Owner
  - Md. Tajrian Islam Patwary — Co-Author
- **Status:** `active`
- **Overall Progress:** 65%

## 4.1 Seeded Content

### Milestones

- Phase 1 — Architecture — Done
- Phase 2 — Editor & Diffs — In Progress
- Phase 3 — Defense — Pending

### Tasks

- 5 realistic capstone development tasks
- Distributed across Kanban columns

### Literature Hub

- 3 indexed research papers
- Categories/folders:
  - `Background Study`
  - `Methodology`
  - `Literature Review`

### Draft Documents

One seeded document:

`Chapter 1 & 2: Introduction, Problem Statement, and Literature Review`

Includes:

- 3 immutable versions
- Myers diff comparator
- Resolved/open supervisor feedback comments

### Project Chat

- 4 seeded messages between supervisor and team

### Calendar

- 1 confirmed upcoming progress meeting
- Location: AIUB CS Building D, Room 4102

### Report

Printable institutional report:

`/projects/14d51ea7-a65c-40ec-a5eb-a28aab344ed8/report`

---

# 5. BLOCKING ISSUES — Fix Before New Feature Work

These are the most important additions from `HANDOFF_v2.md`. They override the older handoff's more optimistic "completed" descriptions.

## 5.1 Credential Exposure — SECURITY BLOCKER

The older `HANDOFF.md` contained a working shared password for seeded faculty/student accounts, and the repository is public.

### Required

- [ ] Rotate the affected passwords in Supabase Auth immediately.
- [ ] Remove plaintext credentials from the current handoff.
- [ ] Remove exposed credentials from Git history if the repository is to remain public.
- [ ] Consider making the repository private if appropriate.
- [ ] Change seed scripts to read passwords from `.env.local` / environment variables.
- [ ] Never commit real passwords again.

Example approach:

```text
SUPABASE_SEED_PASSWORD=<local-only-value>
```

The exact secret must remain local and must not be placed in this file.

---

## 5.2 Real File Uploads — CORE FUNCTIONALITY BLOCKER

The current proposal attachments and literature PDFs are stored as URLs/metadata rather than reliably backed by actual Supabase Storage files.

This means the upload flow is not yet a trustworthy implementation of the SRS file requirements.

### Required

- [ ] Create Supabase Storage bucket(s):
  - `proposal-attachments`
  - `literature-papers`
  - or one shared `research-files` bucket with path prefixes
- [ ] Wire the proposal upload UI in `proposals/new` to real Supabase Storage `upload()`.
- [ ] Wire the literature upload UI, including `literature-client.tsx`, to real storage.
- [ ] Store the resulting storage path/metadata rather than pretending a filename is a hosted file.
- [ ] Generate signed URLs for viewing/downloading.
- [ ] Do not make research files public by default.
- [ ] Enforce access according to project membership/RLS-equivalent authorization.
- [ ] Enforce the 25 MB limit server-side.
- [ ] Enforce PDF/DOCX MIME/type validation server-side.
- [ ] Backfill seeded literature and proposal attachments with real files after storage is working.
- [ ] Verify download/view behavior using multiple roles.

### Important

Do not consider a file-upload UI "complete" merely because a filename is saved to the database. A real upload must produce a real retrievable file with correct authorization.

---

## 5.3 "Malware Scanned Clean" — SECURITY CLAIM BLOCKER

The UI/wireframes may show:

`✓ Malware Scanned Clean`

This must **not** be presented as a fact unless an actual malware-scanning pipeline exists.

### Choose one

**Option A — Implement scanning**

Possible approaches identified in the previous handoff:

- VirusTotal API
- Supabase Edge Function + ClamAV
- Another appropriately secured server-side scanning workflow

**Option B — Remove the claim temporarily**

Use honest copy such as:

`Validated: PDF/DOCX, under 25MB`

until real scanning is implemented.

---

# 6. Architecture & Technical Conventions

## 6.1 Next.js 16 Gotchas

### Async page parameters

Next.js 16 page `params` and `searchParams` are Promise-based.

Use:

```tsx
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
}
```

### Async cookies

```ts
const cookieStore = await cookies();
```

### Middleware migration

Next.js 16 deprecates the old `middleware.ts` convention in favor of `proxy.ts`.

Example:

```ts
export async function proxy(request: NextRequest) {
  // ...
}
```

### Server Actions

Files tagged:

```ts
"use server"
```

must expose async server actions.

Do not export synchronous helper utilities such as regex validation functions from server-action files. Put ordinary utilities in appropriate non-server utility modules.

---

## 6.2 Tailwind CSS v4 & Dark Mode

Tailwind v4 uses CSS-first configuration:

```css
@import "tailwindcss";
```

Class-based dark mode is enabled in `src/app/globals.css`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Theme handling uses `ThemeProvider` from `next-themes`:

`src/components/theme-provider.tsx`

The root `<html>` uses `suppressHydrationWarning`.

---

# 7. Route Map & Directory Structure

```text
src/
├── app/
│   ├── actions/                  # Server actions (auth, proposals, tasks, documents, admin)
│   ├── admin/
│   │   ├── analytics/            # Recharts departmental aggregates (SRS §5 privacy-scoped)
│   │   ├── audit/                # Immutable trigger-backed PostgreSQL audit log viewer
│   │   ├── users/                # RBAC role switching and user activation
│   │   └── admin-nav.tsx         # Pill navigation for admin modules
│   ├── api/auth/callback/        # Supabase OAuth and email verification handler
│   ├── dashboard/                # Main workspace dashboard & pending supervisor review queue
│   ├── faculty/                  # Searchable 428-member AIUB faculty directory with tag filtering
│   ├── login/ & register/        # Authentication pages enforcing AIUB domains
│   ├── notifications/            # Notification UI/event handling
│   ├── profile/                  # User credentials and research interests
│   ├── projects/[id]/
│   │   ├── calendar/             # Meeting coordination and scheduling
│   │   ├── chat/                 # Project collaboration channel
│   │   ├── documents/            # Markdown editor, version history, Myers diff comparator
│   │   ├── literature/           # Paper repository with trigram fuzzy duplicate check
│   │   ├── report/               # Printable institutional progress report
│   │   ├── tasks/                # Kanban milestones & task status tracking
│   │   ├── layout.tsx            # Project header & progress bar
│   │   ├── page.tsx              # Overview statistics & member cards
│   │   └── workspace-nav.tsx     # Mobile-responsive horizontal pill navigation
│   ├── proposals/
│   │   ├── [id]/review/          # Supervisor formal decision form
│   │   ├── new/                  # 2-step proposal creation wizard with file attachments
│   │   └── page.tsx              # User proposal list & assigned supervisor reviews
│   ├── globals.css               # Tailwind v4, dark variant, Inter typography
│   ├── layout.tsx                # Root HTML, Inter font, ThemeProvider
│   └── page.tsx                  # Public landing page
├── components/
│   ├── ui/                       # Badge, Button, Card, Input, Textarea
│   ├── navbar.tsx                # Navigation header + mobile drawer + ThemeToggle
│   ├── theme-provider.tsx        # next-themes Provider wrapper
│   └── theme-toggle.tsx          # Sun/Moon client toggle button
├── lib/
│   ├── faculty.ts                # In-memory cached faculty reader
│   ├── fuzzy.ts                  # Myers diff & trigram similarity calculator
│   ├── utils.ts                  # cn helper, date formatting utilities
│   └── supabase/                 # Server, client, and admin service-role clients
└── types/
    └── database.types.ts         # TypeScript schema definitions matching PostgreSQL
```

---

# 8. Operational Commands

## 8.1 Run Development Server

```bash
npm run dev
```

## 8.2 Production Build / Verification

```bash
npm run build
```

## 8.3 Promote a User to Admin

```bash
node scripts/promote_admin.mjs
```

This is currently a manual admin-promotion process.

## 8.4 Re-seed Demo Data

```bash
node scripts/seed_demo_data.mjs
```

After credential hardening, this script should read seed credentials from environment variables rather than containing hardcoded passwords.

---

# 9. Roadmap After Blocking Fixes

## Phase 5 — Real File Handling

Do this immediately after the blocking security/file-label fixes.

### 5.1 Storage

- Supabase Storage integration
- Real proposal attachments
- Real literature PDF storage
- Signed URLs
- Access control
- Server-side size/type validation
- Demo-data backfill

### 5.2 File Security

- Real malware/type scanning
- Or remove the malware-scan claim until scanning exists

### 5.3 Preview

- PDF.js inline viewer
- Replace dead/fake "View PDF" links

### 5.4 Storage Monitoring

Supabase storage has quota limits on lower tiers.

Add a soft warning in admin analytics when storage usage approaches the available limit.

---

# 10. Phase 6 — Real Notifications

The current application has notification functionality, but the older handoff's wording should not be interpreted as proof that all push behavior is already fully realtime.

## Required

- [ ] Replace polling where applicable with genuine Supabase Realtime channel subscriptions.
- [ ] Toast immediately when a supervisor comments.
- [ ] Toast immediately when a proposal decision lands.
- [ ] Add email notifications using:
  - Resend, or
  - Supabase email facilities for a lighter first implementation.
- [ ] Notification events should include:
  - Proposal decision
  - Meeting proposed/confirmed
  - Task due soon
- [ ] Add per-user preference in `profiles`:
  - In-app only
  - In-app + email

---

# 11. Phase 7 — Institutional PDF Reports

## 11.1 Progress Report

The current progress report is browser print-to-PDF.

Replace it with an actual generated PDF using either:

- `@react-pdf/renderer`
- Headless Chromium/Puppeteer route

The generated document should match an actual AIUB report format if the department provides one.

Before finalizing the design:

- Ask supervisor Sourav Akib Sarkar whether the department has an existing report template.
- Match that template rather than inventing an institutional format.

## 11.2 Thesis/Draft PDF

Apply the same treatment to thesis/draft export:

- Generate a real PDF from the markdown document editor.
- Support formal academic formatting.
- Consider IEEE/AIUB formatting where appropriate and verified.

---

# 12. Phase 8 — Hardening & Real Launch Readiness

## 12.1 Error & Empty States

Every list view should have an intentional state:

- Tasks
- Literature
- Chat
- Notifications
- Proposals
- Other relevant collections

Avoid blank tables when there is simply no data.

Every failed server action should result in a user-visible error message/toast rather than only a console error.

## 12.2 Loading States

Pay particular attention to:

- Faculty directory with 428 rows
- Admin analytics
- Literature loading
- Proposal operations
- Dashboard/project pages

## 12.3 Automated Tests

At minimum, add integration coverage for:

- Proposal approve flow
- Proposal reject flow
- RLS behavior/policies

RLS is especially important because a bad policy could expose another team's private research/draft data.

## 12.4 RLS Audit

Perform a table-by-table audit against the RBAC matrix in:

`URCP_BUILD_SPEC.md §5`

Create a written checklist showing:

- Table
- Intended roles
- SELECT policy
- INSERT policy
- UPDATE policy
- DELETE policy
- Project/member restriction
- Result

Do not rely on a visual/manual code glance alone.

## 12.5 Accessibility

Audit:

- Keyboard navigation
- Focus states
- Screen-reader labels
- Icon-only buttons
- Chat send button
- Theme toggle
- Form controls
- Color contrast
- Light mode
- Dark mode
- Mobile navigation

## 12.6 Real User Onboarding

Create short guides:

### Student

“How to submit your first research proposal”

### Faculty

“How to review a research proposal”

Users should not need to read the SRS or engineering handoff to understand basic workflows.

## 12.7 Admin Bootstrap / Succession

Current promotion is manual:

```bash
node scripts/promote_admin.mjs
```

Document or build a secure process for transferring/promoting the next departmental admin after the current student administrator graduates or hands over the project.

---

# 13. Deferred / Optional Features

These are **not required before a real launch** unless the department specifically asks for them.

## 13.1 Plagiarism / Reference Similarity

Potential integrations:

- arXiv
- CrossRef
- Semantic Scholar

Possible use:

- Reference discovery
- Similarity indicators
- Literature cross-checking

This was originally outside the core SRS scope and should remain optional.

## 13.2 Multi-Department Support

Do not build by default.

The SRS currently treats multi-department support as out of scope. Only introduce it if the department explicitly requests it.

---

# 14. Priority Order

Use this order when starting a new coding-agent session:

1. **Rotate/remove exposed credentials**
2. **Implement real Supabase Storage file handling**
3. **Remove or implement the "Malware Scanned Clean" claim**
4. **Verify real file access, signed URLs, size/type validation, and authorization**
5. **Implement genuine realtime notifications**
6. **Add email notifications and notification preferences**
7. **Perform RLS audit + automated tests**
8. **Add error/empty/loading states**
9. **Accessibility pass**
10. **Generate institutional PDF reports**
11. **Generate thesis/draft PDFs**
12. **Admin succession/bootstrap process**
13. **Optional integrations only if requested**

---

# 15. Definition of "Production-Ready"

Do not describe URCP as fully production-ready until at least the following are verified:

- [ ] No plaintext credentials are committed.
- [ ] Exposed passwords have been rotated.
- [ ] Repository/history has been handled appropriately.
- [ ] Proposal files are real Supabase Storage objects.
- [ ] Literature PDFs are real Supabase Storage objects.
- [ ] Files are protected by correct authorization.
- [ ] Signed download/view URLs work.
- [ ] 25 MB server-side limit works.
- [ ] PDF/DOCX server-side validation works.
- [ ] Malware-scan wording is truthful.
- [ ] Seeded demo file records point to real files.
- [ ] RLS has been audited against the RBAC matrix.
- [ ] Proposal approve/reject flow has automated coverage.
- [ ] Empty/error/loading states are present.
- [ ] Accessibility issues have been checked.
- [ ] Notification behavior is verified.
- [ ] Institutional report generation is reliable enough for faculty use.
- [ ] Admin handoff/succession is documented.

---

# 16. Working Principle for Future AI Agents

When continuing this project:

1. **Inspect the repository before changing architecture.**
2. **Treat this handoff as a map, not as proof that every listed feature is perfect.**
3. **Use the blocking issues in Section 5 as the current source of truth for known gaps.**
4. **Do not recreate functionality that already exists.**
5. **Preserve existing Supabase/RLS conventions unless there is a concrete reason to change them.**
6. **Test authorization using more than one role.**
7. **Never fake security properties.**
8. **Never store credentials in source control.**
9. **When a feature involves files, verify an actual file can be uploaded, authorized, retrieved, and viewed/downloaded.**
10. **After significant changes, run:**

```bash
npm run build
```

11. **If modifying database/RLS behavior, test the affected roles and policies explicitly.**
12. **Keep this document updated when a blocking issue is resolved or when a new architectural decision materially changes the project.**

---
