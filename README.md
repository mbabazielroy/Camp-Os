# CampFlow Admin

An AI administrative assistant for camp directors - built so you can spend less time on
email and admin work, and more time with campers.

CampFlow never sends anything on your behalf. It triages incoming emails and drafts
replies grounded in your own camp knowledge base, but every reply waits for you to review,
edit, and approve it. Even with Gmail connected, approved replies land in your Gmail
**drafts** folder - the app has no send permission at all.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS, mobile-first, PWA-ready
- Supabase for auth and Postgres (camp workspaces with row-level security)
- OpenAI API for email triage, reply drafting, and follow-up task suggestions
- Gmail REST API (optional) for inbox sync and saving replies as Gmail drafts

## Features

- **Camp workspaces**: each camp is a shared workspace. Directors invite staff by email;
  invitees join the camp automatically when they sign up.
- **Dashboard**: time-of-day greeting, a "can't wait" briefing item, open counts,
  a quick-add task bar, and today's priorities. New camps get a setup checklist.
- **Email assistant**: paste an email (or sync Gmail) and the AI categorizes it by type
  and urgency, summarizes it, drafts a reply from the knowledge base, and suggests a
  follow-up task you can accept with one tap. Edit, regenerate with instructions, then
  approve or dismiss.
- **Gmail integration** (optional): connect the camp inbox in Settings. "Sync inbox"
  imports recent primary-inbox emails and triages them; approving a reply files it into
  the Gmail drafts folder in the right thread.
- **Knowledge base**: rules, pickup times, packing lists, and policies - the only source
  of camp facts the AI may use. New camps can start from a 10-entry starter pack and
  edit the placeholders.
- **Tasks & reminders**, **campers/guardians/staff records** with search.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project, then run `supabase/schema.sql` in the Supabase SQL editor.
   This creates the camp workspace model, all tables, triggers, and RLS policies.

3. Copy `.env.example` to `.env.local` and fill in the Supabase and OpenAI values.
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are optional - without them the app works
   in manual paste mode and Settings shows how to enable Gmail.

   For Gmail: create OAuth 2.0 credentials in Google Cloud Console, enable the Gmail API,
   and add `<your-app-url>/api/gmail/callback` as an authorized redirect URI.

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) - you'll land on the login page,
   where you can create an account (which creates your camp).

## Testing on your phone

**Option A - browser (no install):** run `npm run dev:lan`, find your computer's IP
(`ipconfig` on Windows, `ifconfig` on Mac), and open `http://<that-ip>:3000` on your phone
(same Wi-Fi). Use "Add to Home Screen" for the full-screen PWA experience.

**Option B - Expo Go:** a native shell for the app lives in `mobile/`.

```bash
# terminal 1 - web app, listening on the network
npm run dev:lan

# terminal 2 - the Expo shell
cd mobile
npm install
cp .env.example .env   # then edit .env: set EXPO_PUBLIC_APP_URL to http://<your-ip>:3000
npx expo start
```

Install the **Expo Go** app on your phone, scan the QR code from the terminal, and the
app opens natively with the Mill Stream splash screen. Point `EXPO_PUBLIC_APP_URL` at your
deployed URL instead to test production. The same `mobile/` project is the starting point
for real App Store / Play Store builds later (via `eas build`).

## Project structure

- `app/login` - sign in / sign up (signup auto-creates a camp or accepts an invite)
- `app/(app)` - authenticated app shell and feature pages: `dashboard`, `tasks`,
  `email-assistant`, `knowledge-base`, `people`, `settings`
- `app/api/gmail` - OAuth connect/callback routes
- `lib/auth.ts` - `requireCamp()`: resolves the signed-in user's camp for every action
- `lib/ai/email.ts` - OpenAI triage + draft + suggested-task call (structured output)
- `lib/gmail.ts` / `lib/gmail-account.ts` - Gmail REST client and token refresh
- `lib/kb-starters.ts` - the knowledge base starter pack templates
- `supabase/schema.sql` - full database schema, triggers, and RLS policies
- `proxy.ts` - route protection (redirects signed-out users to `/login`)
