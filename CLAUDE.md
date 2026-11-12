# CampFlow

AI admin assistant for camp directors: triages parent emails, drafts replies from the
camp's knowledge base, and tracks tasks and people. Next.js (App Router) + TypeScript,
Supabase (auth + Postgres with RLS), OpenAI. Product plan and milestones: `SPEC.md`.

## Commands

- `npm run dev`: runs with no keys in **demo mode** (in-memory sample data, offline draft writer)
- `npm run verify`: lint + typecheck + build + DB tests + e2e. Must pass before any PR
- `npm run test:db`: throwaway Postgres + `tests/db/supabase-shim.sql` + `supabase/schema.sql`,
  then `tests/db/*.test.sql`. Needs Postgres server binaries (`initdb`)
- `npm run test:e2e`: Playwright against `next start` in demo mode (run `npm run build` first).
  `PW_CHANNEL=chrome` uses an installed Chrome

## Rules

- IMPORTANT: The app never sends email. Approved replies become drafts only.
- Every table has `camp_id` + RLS via `public.user_camp_id()`. Director-only writes use
  `public.is_camp_director()` in the policy, not just a check in the server action.
  Add a cross-camp case to `tests/db/rls.test.sql` for every new table or policy.
- `supabase/schema.sql` is the single source of truth for the database; keep it re-runnable.
- Demo mode must keep working with zero env vars: `lib/demo/*` mimics the Supabase
  client surface the app uses, so new queries may need support added there.
- The service-role key is server-only (route handlers, webhooks). Never import it into
  client components or expose it via `NEXT_PUBLIC_*`.
- Don't log email bodies or camper/guardian records.
- Work on `claude/*` branches and open PRs. Never push to `main`.
