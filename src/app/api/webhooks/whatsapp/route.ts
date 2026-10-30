import { env } from '@/lib/env';
import { verifyMetaSignature } from '@/lib/security';
import { normalizeWhatsApp } from '@/lib/messaging/normalize';
import { enqueueEvents } from '@/lib/queue';

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get('hub.mode') !== 'subscribe' ||
      url.searchParams.get('hub.verify_token') !== env.WHATSAPP_VERIFY_TOKEN ||
      !env.WHATSAPP_VERIFY_TOKEN) {
    return new Response('Forbidden', { status: 403 });
  }
  return new Response(url.searchParams.get('hub.challenge') || '', { status: 200 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyMetaSignature(raw, req.headers.get('x-hub-signature-256') || '', env.WHATSAPP_APP_SECRET)) {
    return new Response('Invalid signature', { status: 401 });
  }
  const events = normalizeWhatsApp(JSON.parse(raw));
  await enqueueEvents(events);
  return Response.json({ accepted: true, count: events.length });
}
