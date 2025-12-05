IMPORTANT.md
============

Overview
--------
- Dashboard UAT manager with projects, participants, test cases, execution updates, approvals, history, and HTML export.
- Auth abstraction still stubbed; replace with real SSO/magic-link if needed.

Environment
-----------
- `NEXT_PUBLIC_SUPABASE_URL` = https://blxsffgrvyarfjlqwvmi.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseHNmZmdydnlhcmZqbHF3dm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MDY4ODQsImV4cCI6MjA4MDQ4Mjg4NH0.b__MVNXGjXMElg0gS7tbLy3HW_RkuFNf3oaiCUa64Vs

Database
--------
- Schema file: `schema/supabase-schema.sql` (run in Supabase SQL editor).
- Tables: `uat_project`, `participant`, `test_case`, `approval_signoff`, `change_log`.
- Open RLS demo policies included; tighten for production.

App structure
-------------
- Layout/nav: `src/components/dashboard-shell.tsx`
- Data provider/state + summary + change logging: `src/components/uat-provider.tsx`
- Supabase CRUD mapping: `src/lib/data-service.ts`
- Pages: `src/app/(dashboard)/*` with page components in `src/components/pages/*`
- IDs: `src/lib/id.ts`

Features
--------
- Projects: create/select; stored in Supabase.
- Test Cases: grid editing, add/delete, status dropdown; change log per field.
- Participants: add/list/delete; change logged.
- Execution: read-only core fields; edit actual results/status/remarks.
- Approvals: editable table; signature path stored; change logged.
- History: per-project change log.
- Export: HTML report download (project info, participants, test cases, summary, approvals).

Notes
-----
- Signature uploads currently capture path/preview only; wire to storage if needed.
- Auth placeholders: replace `getCurrentUser/requireAuth` with real providers.
- Keep future SQL in `schema/`; keep docs in `README.md` and `IMPORTANT.md`.

Changelog
---------
2025-02-07
- Agreed to record changelog entries here for every future change request (bullet + dated summary).
- Applied UI polish (Heroicons, sticky/striped tables, badges, improved buttons/cards/modals, refined report styling).
- Moved project selection into per-page selectors (Projects list full width; selectors on Execution/Export/History).
- Added pill-style breadcrumbs and a collapsible sidebar with icon-only mode toggle.
- Cleaned changelog redundancy (deduped breadcrumb/sidebar entries).
- Removed duplicate sidebar collapse button from header; sidebar toggle remains in sidebar only.
- Added responsive pass (off-canvas mobile sidebar, header wrapping, horizontal-scroll tables, mobile-friendly modals/grids).
- Persisted sidebar collapse state via localStorage and ensured mobile menu closes on navigation.
- Sidebar nav padding normalized and overflow guard added for wide tables/main content.
- Moved project details to dedicated `/projects/[id]` page; projects list now shows key info with link to full detail; detail page includes edit, test cases, participants, approvals, export.
- Removed date-fns dependency in Projects list and switched to native date formatting to fix module resolution error.

2025-02-06
- Built Supabase-backed UAT dashboard with projects, test cases, participants, execution, approvals, history, and export flows.
- Added Supabase schema (project, participant, test_case, approval_signoff, change_log) and hooked CRUD/state provider with change logging.
- Introduced consolidated Projects page with inline modules and HTML export; added CSV-free grid editing and approval upload paths.
- Replaced header navigation flow (dashboard/projects/execution/history) and tightened global spacing.
- Added Tailwind-styled project creation modal with validation, keyboard support, auto-select, and success feedback.

