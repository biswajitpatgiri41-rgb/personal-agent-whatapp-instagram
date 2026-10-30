# Personal AI Reply Agent

A Vercel-ready, serverless automation service for eligible WhatsApp Business Platform and Instagram Professional accounts. It uses Gemini through either the native generateContent API or an OpenAI-compatible endpoint, stores conversations in Supabase Postgres, applies a conservative safety gate, and exposes a small owner dashboard.

## Important eligibility

This project intentionally uses only Meta's official APIs. Ordinary personal WhatsApp accounts and ordinary personal Instagram accounts are not assumed to be connectable. You need a WhatsApp Business Platform asset/phone number and an eligible Instagram Creator or Business account, plus Meta app permissions and webhook approval.

## Local setup

1. Copy `.env.example` to `.env.local` and fill Supabase, Gemini, and any Meta values. Never commit the file. Set a random `AUTH_SECRET` with at least 16 characters.
2. Create a Supabase project, enable Auth email/password, and run `supabase/migrations/001_initial.sql` in the SQL editor. Create the owner user, then insert `user_settings` for that user if needed.
3. Run `npm ci`, `npm run typecheck`, `npm test`, and `npm run dev`.
4. Open `/login`.

## Deployment

Follow `docs/VERCEL_DEPLOYMENT.md`. Production requires QStash; the inline queue is local-development only. Set `NEXT_PUBLIC_APP_URL` to the public deployment URL and configure the QStash token and both signing keys.

Read `docs/VERCEL_DEPLOYMENT.md`, `docs/WHATSAPP_SETUP.md`, and `docs/INSTAGRAM_SETUP.md` before connecting accounts.

## Tests

The included tests cover signature validation, normalization, safety decisions, and provider behavior with mocks. No test sends a real Meta message.

## Known limitations

The dashboard is intentionally owner-only and starts with a compact overview. Connection cards and advanced inbox/settings screens can be extended on top of the same service modules. Meta permissions, messaging windows, templates, opt-in requirements, and account review remain external prerequisites.
