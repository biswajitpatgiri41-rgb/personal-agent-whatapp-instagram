# Security

Secrets are server-only environment variables. API keys and authorization headers are never returned to the browser or written to message logs. Meta signatures use HMAC SHA-256 with constant-time comparison. Incoming content is treated as untrusted prompt data; Gemini output is schema-validated and passes a deterministic safety gate before sending.

Supabase RLS and grants protect owner data. The service-role key is used only in server-side webhook processing. Rotate keys if exposed, configure Vercel secret variables, and set retention/deletion policies appropriate to your contacts.
