UAT Manager (Next.js)
======================

Dashboard-style UAT workspace with projects, participants, test cases, execution, approvals, history, and export backed by Supabase.

## Quickstart
1) Install deps: `npm install`
2) Env: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `IMPORTANT.md`).
3) Apply DB schema in Supabase SQL editor: `schema/supabase-schema.sql`.
4) Run dev server: `npm run dev` → http://localhost:3000 (redirects to `/dashboard`).

## Repo layout
- `src/app/(dashboard)/*` dashboard routes
- `src/components/pages/*` page components
- `src/components/uat-provider.tsx` data/state provider
- `src/lib/data-service.ts` Supabase CRUD
- `schema/` SQL schema files
- `IMPORTANT.md` documentation and operational notes

