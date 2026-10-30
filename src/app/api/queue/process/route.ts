import { Receiver } from '@upstash/qstash';
import { env } from '@/lib/env';
import { processIncoming } from '@/lib/processor';
export const maxDuration = 60;
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production' && env.QUEUE_PROVIDER !== 'qstash') {
    return new Response('Queue processing is not configured', { status: 503 });
  }
  if (env.QUEUE_PROVIDER === 'qstash') {
    if (!env.QSTASH_CURRENT_SIGNING_KEY || !env.QSTASH_NEXT_SIGNING_KEY) return new Response('Queue signing keys are not configured', { status: 503 });
    const signature = req.headers.get('upstash-signature');
    const raw = await req.text();
    const receiver = new Receiver({ currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY, nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY });
    try {
      if (!signature || !(await receiver.verify({
        signature,
        body: raw,
        url: `${env.NEXT_PUBLIC_APP_URL}/api/queue/process`,
      }))) return new Response('Invalid queue signature', { status: 401 });
    } catch {
      return new Response('Invalid queue signature', { status: 401 });
    }
    let body: { events?: unknown };
    try {
      body = JSON.parse(raw);
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }
    if (!Array.isArray(body.events)) return new Response('Invalid events payload', { status: 400 });
    for (const event of body.events) await processIncoming(event as Parameters<typeof processIncoming>[0]);
    return Response.json({ ok: true });
  }
  const body = await req.json();
  if (!Array.isArray(body.events)) return new Response('Invalid events payload', { status: 400 });
  for (const event of body.events) await processIncoming(event);
  return Response.json({ ok: true });
}
