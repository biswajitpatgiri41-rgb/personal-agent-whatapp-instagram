# Production checklist

- [ ] Supabase migration applied and RLS verified
- [ ] Owner Auth user created and `user_settings` row inserted
- [ ] Gemini key and model tested
- [ ] Meta app permissions approved
- [ ] WhatsApp Business Platform or Instagram Professional eligibility confirmed
- [ ] Webhook URLs and verify tokens configured
- [ ] QStash configured; inline queue disabled
- [ ] Vercel environment variables added without committing secrets; `NEXT_PUBLIC_APP_URL` matches the public HTTPS domain
- [ ] `QUEUE_PROVIDER=qstash` and all three QStash credentials configured
- [ ] Health endpoint reports the expected queue and provider configuration
- [ ] Meta webhook verification succeeds with `hub.mode=subscribe` and the matching verify token
- [ ] Opt-in, messaging windows, templates, retention, and escalation policy reviewed
