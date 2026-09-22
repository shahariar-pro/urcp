# AIUB URCP (University Research Collaboration Platform)
## Engineering Handoff & Architecture Blueprint
**Course:** CSC 3114 — Research Methodology & Capstone Project  
**Institution:** American International University-Bangladesh (AIUB), Department of Computer Science  
**Supervisor:** Sourav Akib Sarkar  
**Student Team:** Dewan Shahariar Hossen (24-59069-3) & Md. Tajrian Islam Patwary (24-59093-3)  
**Live Production URL:** [https://aiubrcp.vercel.app/](https://aiubrcp.vercel.app/) (also alias `https://urcp-two.vercel.app/`)  
**Repository:** [https://github.com/shahariar-pro/urcp](https://github.com/shahariar-pro/urcp) (Branch: `main`)  
**Generated Date:** September 2026  

---

## 1. Executive Summary & Current State

The **University Research Collaboration Platform (URCP)** is a centralized web portal engineered specifically for the AIUB Department of Computer Science. It replaces fragmented email threads, spreadsheets, and shared folders with an integrated, version-controlled research lifecycle system.

### Key Milestones Completed:
1. **Full-Stack Application Built:** Next.js 16 (React 19, Turbopack, App Router, Tailwind CSS v4).
2. **Typography & Styling Refreshed:** Configured Google **Inter** font as the global typography across all routes and components, resolving previous rendering issues with system fallbacks.
3. **Comprehensive Dark Mode System:** Integrated `next-themes` with seamless system/light/dark mode toggle (`ThemeToggle`) across desktop and mobile navigation headers, login, register, workspace, documents, kanban, and analytics.
4. **Mobile Responsiveness & Navigation:** Built an interactive slide-down mobile hamburger drawer in the navbar and touch-scrollable pill navigation (`WorkspaceNav` and `AdminNav`).
5. **Database & RLS Schema:** Live Supabase PostgreSQL backend with 13 relational tables, custom enums, trigger-enforced immutable audit trails (`audit_log` and `proposal_decisions`), and strict Row-Level Security policies.
6. **Faculty Directory & Performance Optimization:** 428 official AIUB CS faculty members scraped, validated, and indexed. Implemented sub-millisecond memory-cached reads and lazy-paginated client rendering to optimize low-resource tier database calls.
7. **Production User Promoted to Admin:** User `Dewan Shahariar Hossen` (`24-59069-3@student.aiub.edu`) has been granted the `admin` role with complete access to departmental analytics, user management, and security audit logs.
8. **Realistic Showcase Project Seeded:** Seeded complete capstone project with milestones, kanban tasks, literature repository with fuzzy duplicate detection, versioned markdown draft with diff comparator, inline supervisor notes, project chat, and meeting calendar.

---

## 2. Platform Credentials & Active Test Accounts

All user accounts authenticate via Supabase Auth and enforce official AIUB email domains (`@student.aiub.edu` or `@aiub.edu`):

| Name | University Email | Role | Password | User ID |
| :--- | :--- | :--- | :--- | :--- |
| **Dewan Shahariar Hossen** | `24-59069-3@student.aiub.edu` | `admin` | *(Registered by User)* | `d5941a1a-c8cf-4523-be99-64cd26b8b8e4` |
| **Sourav Akib Sarkar** | `sourav.akib@aiub.edu` | `faculty` | `AiubPass123!#` | `59ed5eaf-eee5-4d66-bac1-cba617ed28a9` |
| **Md. Tajrian Islam Patwary** | `24-59070-3@student.aiub.edu` | `student` | `AiubPass123!#` | `35f6b3d4-10a9-4f07-b1a2-cdff0fcf30d0` |

> [!NOTE]
> To test other roles (e.g. reviewing proposals from the perspective of supervisor `sourav.akib@aiub.edu`), sign in with the faculty credentials above. Dewan's admin account has full system-wide permissions.

---

## 3. Seeded Showcase Project Details

- **Project Title:** `AIUB URCP: Decentralized University Research Collaboration & Verification Platform`
- **Project ID:** `14d51ea7-a65c-40ec-a5eb-a28aab344ed8`
- **Direct Workspace Link:** `https://aiubrcp.vercel.app/projects/14d51ea7-a65c-40ec-a5eb-a28aab344ed8`
- **Supervisor:** Sourav Akib Sarkar
- **Team Members:** Dewan Shahariar Hossen (Owner), Md. Tajrian Islam Patwary (Co-Author)
- **Status:** `active` (65% Overall Progress)
- **Included Content:**
  - **Milestones:** Phase 1 (Architecture - Done), Phase 2 (Editor & Diffs - In Progress), Phase 3 (Defense - Pending).
  - **Tasks:** 5 realistic capstone development tasks distributed across Kanban columns.
  - **Literature Hub:** 3 indexed research papers categorized into folders (`Background Study`, `Methodology`, `Literature Review`).
  - **Draft Documents:** 1 document (`Chapter 1 & 2: Introduction, Problem Statement, and Literature Review`) with **3 immutable versions**, Myers diff comparator, and resolved/open supervisor feedback comments.
  - **Project Chat:** 4 messages between supervisor and team.
  - **Calendar:** 1 confirmed upcoming progress meeting (AIUB CS Building D, Room 4102).
  - **Audit Report:** Printable institutional report available at `/projects/14d51ea7-a65c-40ec-a5eb-a28aab344ed8/report`.

---

## 4. Architecture & Key Technical Conventions

### Next.js 16 (App Router + Turbopack) Gotchas
1. **Async Page Parameters:** Next.js 16 enforces that `params` and `searchParams` on page components are `Promise` types. Always await them:
   ```tsx
   export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
   }
   ```
2. **Async Cookies:** `cookies()` from `next/headers` is asynchronous:
   ```ts
   const cookieStore = await cookies();
   ```
3. **Middleware Migration (`proxy.ts`):** Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`:
   ```ts
   export async function proxy(request: NextRequest) { ... }
   ```
4. **Server Actions vs Utility Functions:** Functions inside files tagged `"use server"` must be async actions. Helper utilities (like regex email validation) cannot be exported synchronously from server action files.

### Tailwind CSS v4 & Dark Mode
- Tailwind v4 uses CSS-first configuration via `@import "tailwindcss";`.
- Class-based dark mode is enabled in `src/app/globals.css` with:
  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  ```
- Wrapped with `ThemeProvider` from `next-themes` (in `src/components/theme-provider.tsx`) with `suppressHydrationWarning` on `<html>`.

---

## 5. Route Map & Directory Structure

```
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
│   ├── login/ & register/        # Authentication pages enforcing @aiub.edu domains
│   ├── notifications/            # Real-time event notifications
│   ├── profile/                  # User credentials and research interests
│   ├── projects/[id]/
│   │   ├── calendar/             # Meeting coordination and scheduling
│   │   ├── chat/                 # Real-time WebSockets collaboration channel
│   │   ├── documents/            # Markdown editor, 10+ version history, Myers diff comparator
│   │   ├── literature/           # Paper repository with Trigram fuzzy duplicate check
│   │   ├── report/               # Printable Institutional Progress Report
│   │   ├── tasks/                # Kanban milestones & task status tracking
│   │   ├── layout.tsx            # Project header & progress bar
│   │   ├── page.tsx              # Overview statistics & member cards
│   │   └── workspace-nav.tsx     # Mobile-responsive horizontal pill navigation
│   ├── proposals/
│   │   ├── [id]/review/          # Supervisor formal decision form (Approve, Changes, Reject)
│   │   ├── new/                  # 2-step proposal creation wizard with file attachments
│   │   └── page.tsx              # User proposal list & assigned supervisor reviews
│   ├── globals.css               # Tailwind v4 directives, custom dark variant, Inter typography
│   ├── layout.tsx                # Root HTML, Inter font, ThemeProvider
│   └── page.tsx                  # Public landing page with course credits & system features
├── components/
│   ├── ui/                       # Badge, Button, Card, Input, Textarea
│   ├── navbar.tsx                # Navigation header with mobile drawer & ThemeToggle
│   ├── theme-provider.tsx        # next-themes Provider wrapper
│   └── theme-toggle.tsx          # Sun/Moon client toggle button
├── lib/
│   ├── faculty.ts                # In-memory cached reader for faculty directory
│   ├── fuzzy.ts                  # Myers diff & trigram similarity calculator
│   ├── utils.ts                  # cn helper, date formatting utilities
│   └── supabase/                 # Server, client, and admin service-role Supabase clients
└── types/
    └── database.types.ts         # TypeScript schema definitions matching PostgreSQL
```

---

## 6. Maintenance & Operational Commands

### Running Development Server
```bash
npm run dev
```

### Production Build & Verification
```bash
npm run build
```

### Promoting Any User to Admin
To elevate a user role directly in Supabase:
```bash
node scripts/promote_admin.mjs
```

### Re-seeding Demo Data
To re-seed or verify test projects and dummy users:
```bash
node scripts/seed_demo_data.mjs
```

---

## 7. Recommended Next Steps for Future Sessions

If resuming work on this platform in a subsequent session, here are high-value areas to explore:

1. **Thesis PDF Auto-Generation:** Integrate `@react-pdf/renderer` or server-side Puppeteer to generate formal IEEE / AIUB formatted thesis draft PDFs directly from the markdown document editor.
2. **Supabase Storage Bucket Integration:** While the schema supports file attachment URLs, linking active file uploads to a Supabase Storage bucket (`thesis-attachments`) with signed download URLs will enable real PDF file hosting for literature and proposals.
3. **Plagiarism Similarity Score Gauge:** Connect external preprint APIs (arXiv, CrossRef, or Semantic Scholar) to the Literature Hub for cross-university reference checks.
4. **WebSocket Push Notifications:** Upgrade notification polling to full Supabase Realtime channel subscriptions so toast notifications pop up instantly when supervisor leaves inline comments.
