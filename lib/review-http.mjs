import { ReviewError, createReviewService, secureEqual } from './reviews.mjs';
import { checkReviewStorage } from './review-check.mjs';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' }
});

async function payload(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ReviewError('JSON is required.', 415);
  if (Number(request.headers.get('content-length')) > 24000) throw new ReviewError('Review is too long.', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new ReviewError('A request body is required.');
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 24000) { await reader.cancel(); throw new ReviewError('Review is too long.', 413); }
    chunks.push(value);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error();
    return value;
  } catch { throw new ReviewError('Invalid review request.'); }
}

export function createReviewHandlers({ getStore, getDiagnosticStore, loadPurchase, adminKey = () => process.env.REVIEWS_ADMIN_KEY, siteUrl = () => process.env.PUBLIC_SITE_URL || 'https://discontinuedclub.com', preview = false }) {
  function originCheck(request) {
    const origin = request.headers.get('origin');
    const site = new URL(siteUrl());
    const allowed = new Set([site.origin]);
    if (site.hostname === 'discontinuedclub.com') allowed.add('https://www.discontinuedclub.com');
    if (origin && !allowed.has(origin)) throw new ReviewError('This request is not allowed.', 403);
    if (request.headers.get('sec-fetch-site') === 'cross-site') throw new ReviewError('This request is not allowed.', 403);
  }

  const wrap = (method, action) => async (request) => {
    try {
      if (request.method !== method) throw new ReviewError('Method not allowed.', 405);
      originCheck(request);
      return await action(request);
    } catch (error) {
      if (error instanceof ReviewError) return json({ error: error.message }, error.status);
      console.error('Review request failed:', error?.name || 'Error');
      return json({ error: 'Reviews are temporarily unavailable. Please try again later.' }, 503);
    }
  };
  const service = () => createReviewService({ store: getStore() });

  const publicReviews = wrap('GET', async (request) => {
    const params = new URL(request.url).searchParams;
    const result = await service().published({ productId: params.get('product') || '', offset: Number(params.get('offset') || 0) });
    return json({ ...result, preview });
  });
  const invitation = wrap('POST', async (request) => json({ ...await service().invitation((await payload(request)).token), preview }));
  const submit = wrap('POST', async (request) => json(await service().submit(await payload(request)), 201));
  const admin = wrap('POST', async (request) => {
    const key = adminKey();
    if (typeof key !== 'string' || key.length < 32) throw new ReviewError('Review administration has not been configured.', 503);
    const supplied = request.headers.get('authorization')?.replace(/^Bearer /, '') || '';
    if (!secureEqual(key, supplied)) throw new ReviewError('Access denied.', 401);
    const input = await payload(request);
    if (input.action === 'check') {
      if (!getDiagnosticStore) throw new ReviewError('Storage checks are not configured.', 503);
      return json(await checkReviewStorage(getDiagnosticStore()));
    }
    const reviews = service();
    if (input.action === 'list') return json(await reviews.queue({ status: input.status, offset: input.offset }));
    if (input.action === 'moderate') return json(await reviews.moderate(input));
    if (input.action === 'invite') {
      const purchase = await loadPurchase(input.paymentIntentId);
      const result = await reviews.invite(purchase, { renew: input.renew === true });
      const url = new URL('/review.html', siteUrl());
      url.hash = `invite=${result.token}`;
      return json({ url: url.href, expiresAt: result.expiresAt, products: result.products }, 201);
    }
    throw new ReviewError('Unknown review action.');
  });
  return { publicReviews, invitation, submit, admin };
}
