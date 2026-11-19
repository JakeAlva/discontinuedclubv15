import { sanitizeClientEvent } from './funnel.mjs';
import { secureEqual } from './reviews.mjs';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
export function funnelHandler(service, { admin = false, adminKey = () => process.env.REVIEWS_ADMIN_KEY, origin = 'https://discontinuedclub.com' } = {}) {
  return async (request) => {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (![origin, 'https://www.discontinuedclub.com'].includes(request.headers.get('origin')) || request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'Origin not allowed' }, 403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'JSON required' }, 415);
    if (admin) {
      const key = adminKey();
      if (!key || key.length < 32) return json({ error: 'Administration unavailable' }, 503);
      if (!secureEqual(key, request.headers.get('authorization')?.replace(/^Bearer /, '') || '')) return json({ error: 'Access denied' }, 401);
    }
    try {
      const reader = request.body?.getReader();
      if (!reader) return json({ error: 'Body required' }, 400);
      let size = 0;
      const chunks = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 2048) { await reader.cancel(); return json({ error: 'Body too large' }, 413); }
        chunks.push(value);
      }
      let input;
      try { input = JSON.parse(Buffer.concat(chunks).toString()); } catch { return json({ error: 'Invalid JSON' }, 400); }
      if (admin) return json(await service().report(input.days));
      if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1') return json({ accepted: false });
      let event;
      try { event = sanitizeClientEvent(input); } catch { return json({ error: 'Invalid event' }, 400); }
      await service().record(event);
      return json({ accepted: true }, 202);
    } catch {
      return json({ error: admin ? 'Report unavailable. Try a shorter range or retry shortly.' : 'Analytics unavailable' }, 503);
    }
  };
}
