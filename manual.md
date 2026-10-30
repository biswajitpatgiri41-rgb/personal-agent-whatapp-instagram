# Personal AI Reply Agent — Manual Setup and Implementation Guide

This manual explains what is required to run the Personal AI Reply Agent, how the main pieces work, and how to deploy it on Vercel.

## 1. What this project does

The application receives incoming messages from official Meta webhooks for WhatsApp Business Platform and Instagram Messaging, validates the webhook signature, deduplicates the event, stores the conversation in Supabase, calls Gemini to generate a structured response, applies a safety decision, and sends only approved responses through the official Meta Graph APIs.

It is not a WhatsApp Web bot, Instagram scraper, QR-session automation tool, or browser automation workaround. Ordinary personal WhatsApp accounts and ordinary personal Instagram accounts are not assumed to be eligible.

## 2. Required accounts and services

You need the following:

1. A computer with Node.js 20 or newer and npm.
2. A Supabase project with PostgreSQL and Supabase Auth enabled.
3. A Google Gemini API key, or an OpenAI-compatible gateway that exposes the configured model.
4. A Vercel account for deployment.
5. A Meta Developer account and Meta application.
6. An eligible WhatsApp Business Platform account and business phone number if WhatsApp is required.
7. An eligible Instagram Professional account, such as Creator or Business, if Instagram is required.
8. Upstash QStash for durable production queue processing. The local inline queue can be used for development, but production should use QStash.

The application can run with only one Meta integration configured. WhatsApp and Instagram are independent.

## 3. Software dependencies

The project uses:

- Next.js 14 with the App Router.
- React and TypeScript in strict mode.
- Supabase JS and `@supabase/ssr` for authentication and database access.
- PostgreSQL through Supabase.
- Zod for runtime validation.
- `@upstash/qstash` for durable webhook processing.
- Vitest for unit tests.
- Playwright is included for future browser end-to-end tests.
- Vercel Functions for serverless execution.

Install all dependencies from the project root with:

```bash
npm install
```

Do not commit `node_modules`, `.next`, `.env`, `.env.local`, access tokens, or API keys.

## 4. Project structure

Important directories and files:

```text
src/app/                       Next.js pages and route handlers
src/app/api/webhooks/          WhatsApp and Instagram webhook endpoints
src/app/api/queue/             QStash processor endpoint
src/lib/ai/                    Gemini provider and safety engine
src/lib/messaging/             Meta message normalization and sending
src/lib/processor.ts           Conversation and reply processing pipeline
src/lib/queue.ts               Inline or QStash event enqueueing
src/lib/supabase/              Supabase server-side clients
supabase/migrations/           PostgreSQL schema, indexes, grants, and RLS
 tests/                        Unit tests
 docs/                         Architecture, security, setup, and operations guides
.env.example                   Environment variable template
vercel.json                    Vercel function and cron configuration
```

## 5. Supabase setup

1. Create a project at Supabase.
2. Open the SQL Editor.
3. Run `supabase/migrations/001_initial.sql`.
4. In Supabase Auth, enable email/password authentication.
5. Create one owner user.
6. Copy that user's UUID.
7. Insert an owner settings row:

```sql
insert into public.user_settings (user_id)
values ('YOUR_AUTH_USER_UUID');
```

The migration creates these core tables:

- `user_settings`
- `contacts`
- `conversations`
- `messages`
- `webhook_events`
- `safety_decisions`

The migration also enables Row Level Security, revokes broad client grants, and adds owner policies. The service-role key is used only by server-side webhook processing and must never be exposed to the browser.

## 6. Gemini setup

For the native Gemini API, set:

```env
GEMINI_API_KEY=your-key
GEMINI_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MODEL=gemini-2.0-flash
GEMINI_API_FORMAT=native
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_OUTPUT_TOKENS=1024
GEMINI_TIMEOUT_MS=30000
```

The native request is sent to the configured model's `generateContent` endpoint. The response is requested as JSON and validated with Zod.

For an OpenAI-compatible Gemini gateway, use:

```env
GEMINI_API_KEY=your-key
GEMINI_BASE_URL=https://your-gateway.example.com/v1
GEMINI_MODEL=your-model-name
GEMINI_API_FORMAT=openai
```

The provider includes a timeout, bounded retries for HTTP 429 and 5xx responses, exponential backoff with jitter, and output validation. It does not retry arbitrary client errors.

## 7. WhatsApp Business Platform setup

1. Create or access a Meta Business Portfolio.
2. Create a WhatsApp Business Account and business phone number.
3. Create a Meta Developer App.
4. Add WhatsApp to the app.
5. Generate an access token with the permissions required by the current Meta documentation.
6. Record the phone number ID, business account ID, app secret, and access token.
7. Set the callback URL to:

```text
https://YOUR_VERCEL_DOMAIN/api/webhooks/whatsapp
```

8. Set a verification token. This value must match `WHATSAPP_VERIFY_TOKEN`.
9. Subscribe the app to the required message and status webhook fields.
10. Test first with Meta's test number and approved test recipient.

Required variables:

```env
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_APP_SECRET=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_API_VERSION=v20.0
```

The webhook validates `X-Hub-Signature-256`, rejects invalid signatures, deduplicates message IDs, and acknowledges accepted events. Sending is performed through the official Graph API. Customer-service windows, templates, opt-in requirements, message quality rules, and Meta pricing still apply.

## 8. Instagram Messaging setup

1. Use an eligible Instagram Creator or Business account.
2. Create or configure a Meta Developer App.
3. Enable the appropriate Instagram/Messenger messaging products.
4. Request and obtain the required permissions.
5. Generate an access token for the eligible account.
6. Configure webhook subscriptions for messaging events.
7. Set the callback URL to:

```text
https://YOUR_VERCEL_DOMAIN/api/webhooks/instagram
```

8. Set a verification token matching `INSTAGRAM_VERIFY_TOKEN`.

Required variables:

```env
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_ACCOUNT_ID=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_VERIFY_TOKEN=
INSTAGRAM_API_VERSION=v20.0
```

The webhook validates the Meta signature, ignores echo messages, deduplicates message IDs, and sends replies through the official Graph API. Meta account eligibility, permissions, messaging windows, review, and human-agent rules remain external requirements.

## 9. Environment configuration

Copy the template before local development:

```bash
cp .env.example .env.local
```

At minimum, configure:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_SECRET=use-a-long-random-secret
```

Never expose `SUPABASE_SERVICE_ROLE_KEY`, Meta access tokens, Meta app secrets, QStash keys, or `GEMINI_API_KEY` in `NEXT_PUBLIC_*` variables.

## 10. Local development

Install dependencies and run validation:

```bash
npm install
npm run typecheck
npm test
npm run build
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/api/health
```

The local inline queue is useful for development:

```env
QUEUE_PROVIDER=inline
```

For production, use QStash instead:

```env
QUEUE_PROVIDER=qstash
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-current-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key
```

## 11. How message processing works

1. Meta sends an HTTPS webhook request.
2. The route handles Meta verification requests with `GET`.
3. The route reads the raw body and verifies `X-Hub-Signature-256`.
4. The event is normalized into a platform-independent message shape.
5. The event is sent to QStash or the local inline processor.
6. The processor checks `webhook_events` for the external event ID.
7. Duplicate events are ignored.
8. The contact and conversation are created or reused.
9. The inbound message is stored.
10. Recent messages for only that conversation are loaded.
11. Gemini returns a structured reply and classification.
12. The deterministic safety engine compares the incoming message and Gemini classification.
13. SAFE messages may be sent automatically.
14. SENSITIVE and HIGH_RISK messages are recorded for escalation and are not sent automatically.
15. Sent messages and safety decisions are stored.

The system is designed for at-least-once webhook delivery. It does not claim exactly-once delivery.

## 12. Deploying to Vercel

1. Push the project to a private Git repository or import the project directory into Vercel.
2. Select the project root.
3. Use the default Next.js build settings.
4. Add all required environment variables to the Vercel Production environment.
5. Set `NEXT_PUBLIC_APP_URL` to the deployed HTTPS URL.
6. Set `QUEUE_PROVIDER=qstash`.
7. Add the QStash token and both signing keys.
8. Deploy.
9. Open `https://YOUR_DOMAIN/api/health` and confirm the service responds.
10. Configure Meta webhook callback URLs using the deployed domain.
11. Test verification and a controlled inbound message.

The project contains `vercel.json` with function duration configuration and a five-minute queue cron route. Serverless functions must not depend on local filesystem persistence or a permanently running worker.

## 13. Testing webhook signatures locally

Use a test payload and calculate the signature with the Meta app secret. Do not use a real access token in test scripts.

Example signature calculation:

```bash
BODY='{"entry":[]}'
SECRET='local-test-secret'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')
curl -i -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIG" \
  --data "$BODY"
```

The included tests do not send real WhatsApp or Instagram messages.

## 14. Security requirements before production

Before going live:

- Use long random secrets in Vercel.
- Keep all credentials server-side.
- Confirm Supabase RLS policies in the target project.
- Confirm the service-role key is not bundled into client code.
- Configure QStash signature verification keys.
- Review Meta permissions and account ownership.
- Configure message retention and deletion procedures.
- Review sensitive-message escalation procedures.
- Set Gemini quotas and spending limits.
- Run `npm audit` and address production advisories.
- Test invalid webhook signatures and duplicate events.
- Start with a small allowlist of test contacts.
- Keep an emergency stop procedure available by disabling automation or revoking provider credentials.

## 15. Cost and limits

Potential costs and quotas come from:

- Vercel function execution and cron usage.
- Supabase database, authentication, and storage limits.
- Gemini API usage and quota.
- QStash request and delivery quotas.
- Meta messaging conversation charges and template rules.

Do not assume unlimited free usage. Configure token limits, reply cooldowns, contact allowlists, and provider quotas before enabling broad automation.

## 16. Troubleshooting

### The dashboard redirects to login

Confirm the Supabase Auth user exists, the browser session is valid, and the `NEXT_PUBLIC_SUPABASE_URL` and anon key belong to the same Supabase project.

### The dashboard shows no conversations

Confirm the migration was applied, the service-role key is correct, and a signed webhook event was accepted. Inspect Vercel logs and the `webhook_events` table.

### Meta verification returns 403

The verification token in Meta must exactly match the corresponding `*_VERIFY_TOKEN` variable. Confirm the callback URL is the deployed HTTPS URL.

### Meta rejects the POST request

Confirm the app secret matches the request signature and that the route receives the raw request body without modification.

### Gemini does not reply

Check the Gemini key, base URL, model name, API format, quota, and Vercel logs. Confirm that the response is valid JSON with `reply`, `classification`, and `reason`.

### Messages are accepted but not processed

For production, confirm QStash is configured and the QStash delivery succeeded. For local development, set `QUEUE_PROVIDER=inline`.

### WhatsApp sending fails

Check the phone number ID, access token permissions, API version, customer-service window, approved templates, opt-in, and Meta error response.

### Instagram sending fails

Check account eligibility, account ID, access token permissions, webhook subscription, API version, and Meta review status.

## 17. Production readiness note

The source project is buildable and tested with mocked external services. A real production connection cannot be claimed until the owner's Supabase, Gemini, Meta, QStash, and Vercel accounts have been configured and each connection test has passed.
