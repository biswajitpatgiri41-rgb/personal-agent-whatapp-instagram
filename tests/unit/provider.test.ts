import { describe, it, expect, vi } from 'vitest';
describe('provider contract', () => it('does not call Gemini without a key', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-test');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-test');
  vi.stubEnv('AUTH_SECRET', 'test-secret-32-characters-long');
  vi.stubEnv('GEMINI_API_KEY', '');
  vi.resetModules();
  const { generateReply } = await import('@/lib/ai/gemini');
  await expect(generateReply([{ role: 'user', content: 'hi' }])).rejects.toThrow('not configured');
}));
