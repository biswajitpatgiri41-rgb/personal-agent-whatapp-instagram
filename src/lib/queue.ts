import { Client } from '@upstash/qstash';
import { env } from '@/lib/env';
import type { NormalizedMessage } from '@/lib/messaging/normalize';

export async function enqueueEvents(events: NormalizedMessage[]) {
  if (!events.length) return;

  if (env.QUEUE_PROVIDER === 'qstash') {
    if (!env.QSTASH_TOKEN) throw new Error('QSTASH_TOKEN is required when QUEUE_PROVIDER=qstash');
    const client = new Client({ token: env.QSTASH_TOKEN });
    await client.publishJSON({
      url: `${env.NEXT_PUBLIC_APP_URL}/api/queue/process`,
      body: { events },
      retries: 3,
    });
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Inline queue processing is disabled in production; configure QStash');
  }

  for (const event of events) await processEvent(event);
}

async function processEvent(event: NormalizedMessage) {
  const { processIncoming } = await import('@/lib/processor');
  await processIncoming(event);
}
