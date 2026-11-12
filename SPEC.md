# CampFlow: launch spec

The goal of this spec is a CampFlow that a camp director can sign up for, try free for
30 days, and pay for, without Elroy touching anything but the accounts and the sales
calls. It's written so a Claude Code session can work through it unattended. Every
milestone ends in checks it can run itself.

## Definition of done (applies to every milestone)

1. `npm run verify` passes: lint, typecheck, build, database RLS tests, end-to-end tests.
2. The milestone's own new tests exist and pass (listed under each milestone).
3. Demo mode still works with no keys at all (`npm run test:e2e` covers this).
4. A reviewer subagent has checked the diff against this spec and found no gaps that
   affect correctness or the stated requirements.
5. Work lands as a pull request on a `claude/*` branch. Never push to `main` directly.

## Product rules (don't break these)

- **CampFlow never sends email.** Replies only become drafts after a human approves them.
  No feature may add a send path.
- **Every row belongs to one camp.** New tables get `camp_id`, RLS policies using
  `public.user_camp_id()`, and a case in `tests/db/rls.test.sql` that proves camp A
  can't read or write camp B's rows.
- **Directors manage, staff work.** Anything about billing, invites, camp settings or
  connected accounts is director-only, enforced in RLS (`public.is_camp_director()`),
  not only in server actions.
- **Children's data.** Campers, guardians and emails are personal information about
  minors. Don't log email bodies or camper records, and don't send them anywhere except
  the configured AI provider.

## Milestone 1: billing (Stripe)

One plan, **CA$79/month per camp, 30-day free trial, no card needed to start the trial**.
Elroy can change the price in Stripe without touching the code.

- Add `camps.subscription_status` (`trialing | active | past_due | canceled`),
  `camps.trial_ends_at` (set to signup + 30 days by `handle_new_user`),
  `camps.stripe_customer_id`, `camps.stripe_subscription_id`. Members can read these;
  only the service role can write them.
- `/settings/billing` (directors only): shows status and days left in the trial, with a
  "Subscribe" button (Stripe Checkout) and "Manage billing" (Stripe Customer Portal).
- `POST /api/stripe/webhook`: verifies the Stripe signature, then updates the camp from
  `checkout.session.completed`, `customer.subscription.updated` and
  `customer.subscription.deleted`. Uses a server-only service-role Supabase client.
- When the trial has ended and status isn't `active`, the app is read-only. Data is
  never deleted, and the billing page and sign-out still work.
- With no Stripe keys configured (demo mode, CI), billing shows "Billing not configured"
  and nothing is gated.
- New env vars in `.env.example`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `STRIPE_PRICE_ID`, `SUPABASE_SERVICE_ROLE_KEY`.

**Tests:**
- Unit tests for the webhook handler using recorded Stripe event fixtures, including a
  bad signature being rejected.
- An RLS test proving a director can't set their own `subscription_status`.
- An e2e test that demo mode shows "Billing not configured".

## Milestone 2: forward-to-inbox (no Gmail review needed)

Gmail sync uses restricted scopes, which need Google verification plus a CASA security
assessment before going public. Forwarding gets directors the same result without that.

- Each camp gets a forwarding address: `<camp-slug>-<6 random chars>@<INBOUND_DOMAIN>`,
  shown on `/settings` with a copy button and setup steps for Gmail and Outlook
  auto-forwarding.
- `POST /api/inbound/email`: receives the inbound-email webhook (Postmark inbound JSON
  format; keep the parser in one file so Resend can be swapped in). It verifies the
  shared secret, finds the camp by address, and creates an `email_drafts` row with
  `source = 'forward'`. Then it runs the same triage + draft step as pasted emails.
  Unknown addresses get a 404, and nothing is stored.
- Extend the `email_drafts.source` check constraint to allow `'forward'`.
- Ignore Gmail's forwarding-confirmation emails, and surface their confirmation link on
  the settings page so the director can click it.

**Tests:**
- Unit tests for the parser using two fixture payloads (plain text, and HTML-only).
- A route test: a wrong secret gets 401, an unknown address gets 404, and a known
  address creates a draft in the right camp.
- An RLS test: the forwarding-address column is readable only by that camp.

## Milestone 3: hardening before real camps

- Move Gmail OAuth tokens out of member-readable rows. Members may see only `email` and
  `last_synced_at`. Tokens go in a table with no policies for `authenticated`, read via
  the service role on the server.
- Rate-limit AI draft generation per camp (for example 200 per day) so one camp can't
  run up the OpenAI bill.
- `/privacy` and `/terms` pages. They must name OpenAI as the AI provider, Supabase
  (`ca-central-1`) as the database, and say that CampFlow never sends email. Mark them
  "Draft, pending legal review".
- Account deletion for directors: deletes the camp and all its rows (cascade), behind a
  typed confirmation.

**Tests:**
- An RLS test proving staff can't read tokens.
- A unit test for the rate limiter.
- An e2e test that `/privacy` and `/terms` render.

## Out of scope (don't build)

Sending email, SMS, registration/payments for campers (CampMinder's job), multiple camps
per user, a native app beyond the existing Expo shell, Gmail verification paperwork.

## Human-only steps (Claude can't do these; list them in the PR when they block)

- Pay the overdue Supabase invoice (or make a new free org), then create the
  `CampFlow` project in `ca-central-1` and run `supabase/schema.sql`.
- Create the Stripe account, the product and price, and the webhook endpoint.
- Create the Postmark (or Resend) inbound domain and DNS records.
- Deploy to Vercel. Hobby is fine for the pilot; switch to Pro before charging.
- Legal review of privacy and terms; Google verification if Gmail sync goes public.

## Running this autonomously with Claude Code

Start a session in this repo (CLI with `--permission-mode auto`, or a cloud session),
then:

```text
Read SPEC.md. Implement Milestone 1 on a new claude/* branch.
/goal npm run verify passes and the Milestone 1 tests listed in SPEC.md exist and pass
When done, use a subagent to review the diff against SPEC.md, fix real gaps, then open a PR.
```

Do one milestone per session, and `/clear` between them.
