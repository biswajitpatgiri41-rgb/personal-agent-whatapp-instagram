# Database

Run `supabase/migrations/001_initial.sql`. The starter migration includes UUID keys, foreign keys, unique external IDs, indexes, and RLS policies. The service-role client bypasses RLS only in signed, server-side webhook processing. Extend migrations for retention jobs and richer audit tables as operational volume grows.
