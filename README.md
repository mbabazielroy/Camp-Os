# CampFlow Admin

An AI administrative assistant for camp directors - built so you can spend less time on
email and admin work, and more time with campers.

CampFlow never sends anything on your behalf. It categorizes incoming emails and drafts
replies grounded in your own camp knowledge base, but every reply waits for you to review,
edit, and approve it before it goes anywhere.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS, mobile-first, PWA-ready
- Supabase for auth and Postgres (with row-level security)
- OpenAI API for email categorization and reply drafting

## MVP features

- Login (email/password via Supabase Auth)
- Dashboard with today's priorities: overdue/due-today tasks and drafts awaiting review
- Tasks & reminders (CRUD)
- Email Assistant: paste an email in, get an AI category, urgency, and draft reply out -
  edit and approve/dismiss before anything is used
- Knowledge base (CRUD): camp rules, pickup times, packing lists, policies - this is what
  the AI is allowed to use when drafting replies
- Campers, guardians, and staff basic records (CRUD)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project, then run `supabase/schema.sql` in the Supabase SQL editor.
   This creates all tables with row-level security scoped per director.

3. Copy `.env.example` to `.env.local` and fill in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   OPENAI_API_KEY=
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) - you'll land on the login page,
   where you can create an account.

## Project structure

- `app/login` - sign in / sign up
- `app/(app)` - authenticated app shell (mobile bottom nav / desktop sidebar) and all
  feature pages: `dashboard`, `tasks`, `email-assistant`, `knowledge-base`, `people`
- `lib/supabase` - browser/server/middleware Supabase clients and hand-written DB types
- `lib/ai/email.ts` - OpenAI call that categorizes an email and drafts a reply using the
  knowledge base as context
- `supabase/schema.sql` - full database schema and RLS policies
- `proxy.ts` - route protection (redirects signed-out users to `/login`)
