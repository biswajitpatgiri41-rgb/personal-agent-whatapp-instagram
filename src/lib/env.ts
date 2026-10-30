import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_BASE_URL: z.string().url().default('https://generativelanguage.googleapis.com'),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  GEMINI_API_FORMAT: z.enum(['native', 'openai']).default('native'),
  GEMINI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  GEMINI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().max(4096).default(1024),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().positive().max(120000).default(30000),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_APP_SECRET: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_API_VERSION: z.string().default('v20.0'),
  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
  INSTAGRAM_ACCOUNT_ID: z.string().optional(),
  INSTAGRAM_APP_SECRET: z.string().optional(),
  INSTAGRAM_VERIFY_TOKEN: z.string().optional(),
  INSTAGRAM_API_VERSION: z.string().default('v20.0'),
  QUEUE_PROVIDER: z.enum(['inline', 'qstash']).default('inline'),
  QSTASH_TOKEN: z.string().optional(),
  QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
  QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
  AUTH_SECRET: z.string().min(16),
}).superRefine((values, context) => {
  if (values.QUEUE_PROVIDER === 'qstash') {
    for (const key of ['QSTASH_TOKEN', 'QSTASH_CURRENT_SIGNING_KEY', 'QSTASH_NEXT_SIGNING_KEY'] as const) {
      if (!values[key]) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `Required when QUEUE_PROVIDER=qstash` });
      }
    }
    if (values.NEXT_PUBLIC_APP_URL.includes('localhost')) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['NEXT_PUBLIC_APP_URL'], message: 'Set the public deployment URL when QUEUE_PROVIDER=qstash' });
    }
  }
});

export const env = schema.parse(process.env);
