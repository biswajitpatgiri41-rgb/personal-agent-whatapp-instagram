import { describe, it, expect } from 'vitest';
import { normalizeWhatsApp, normalizeInstagram } from '@/lib/messaging/normalize';
describe('normalization', () => {
  it('normalizes WhatsApp', () => {
    const result = normalizeWhatsApp({ entry: [{ changes: [{ value: { messages: [{ id: 'm1', from: '1', text: { body: 'hi' } }] } }] }] });
    expect(result[0].senderId).toBe('1');
  });
  it('normalizes Instagram', () => {
    const result = normalizeInstagram({ entry: [{ id: 'p', messaging: [{ sender: { id: 's' }, message: { mid: 'm', text: 'hi' } }] }] });
    expect(result[0].eventId).toBe('m');
  });
});
