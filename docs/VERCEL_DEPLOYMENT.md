# Vercel deployment

## Before deployment

1. Create a Supabase project and run `supabase/migrations/001_initial.sql` in its SQL editor.
2. Enable email/password Auth, disable public sign-ups, and create your owner user. Insert that user's UUID into `public.user_settings` using the SQL editor:

   ```sql
   insert into public.user_settings (user_id)
   values ('YOUR_SUPABASE_AUTH_USER_UUID');
   ```

3. Create an Upstash QStash project and copy its token and current and next signing keys. Production requires `QUEUE_PROVIDER=qstash`; the queue endpoint verifies QStash signatures. After the first deploy, set `NEXT_PUBLIC_APP_URL` to the final deployment URL and redeploy if the URL was not known earlier.
4. Create a private, empty GitHub repository for this project. From the project folder, add it as the remote and push using the commands below, replacing the URL with your new repository URL:

   ```powershell
   git init -b main
   git add .
   git commit -m "Prepare personal AI reply agent for deployment"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

   `.env.local` is ignored by Git. Do not add secrets to source files.

## Deploy on Vercel

1. Import the GitHub repository in Vercel. Set the Root Directory to `personal-ai-reply-agent` if you imported the outer folder; otherwise leave it as `./` when the repository contains the app files at its root.
2. Add these Production environment variables in Vercel (and Preview only if you intend to use preview deployments):

   - `NEXT_PUBLIC_APP_URL`: your final HTTPS deployment domain, e.g. `https://your-app.vercel.app`
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: from Supabase project settings
   - `GEMINI_API_KEY`: from Google AI Studio
   - `QUEUE_PROVIDER=qstash`, `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`: from Upstash
   - `AUTH_SECRET`: a new random secret of at least 16 characters
   - Meta variables only after setting up the corresponding Meta app: access token, account or phone number ID, app secret, and verify token

   Keep `SUPABASE_SERVICE_ROLE_KEY`, Gemini, QStash, and Meta values server-only. Do not prefix them with `NEXT_PUBLIC_`.
3. Deploy. Open `https://YOUR_DOMAIN/api/health` and confirm the response reports `queue: "qstash"`, `geminiConfigured: true`, and the platforms you have configured.
4. Configure each Meta webhook callback as `https://YOUR_DOMAIN/api/webhooks/whatsapp` or `https://YOUR_DOMAIN/api/webhooks/instagram`. Use the matching verify token from Vercel and subscribe to the required message fields.
5. Sign in at `/login` with your owner account. Send a real test only after reviewing Meta opt-in, messaging-window, template, and account requirements.

The app does not configure Meta approvals or create the external provider accounts for you. A deployment with no Meta credentials can still be used to validate the dashboard and health endpoint.

Vercel functions are request-scoped and have a maximum duration. Do not run a polling worker or rely on local files. WhatsApp and Instagram webhooks acknowledge after validation and enqueue work.
