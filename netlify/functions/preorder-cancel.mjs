import Stripe from 'stripe';
import { findCatalogItem } from '../../lib/store-catalog.mjs';
import { preorderInventory } from '../../lib/preorder-runtime.mjs';
import { isAllowedCheckoutOrigin } from './create-checkout.mjs';

export const config = { rateLimit: { windowSize: 60, windowLimit: 20, aggregateBy: ['ip'] } };
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

export default async (request, context) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  if (!isAllowedCheckoutOrigin(request.headers.get('origin'))) return json({ error: 'Invalid origin.' }, 403);
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return json({ error: 'JSON required.' }, 415);
  let payload;
  try {
    const raw = await request.text();
    if (raw.length > 1000) throw new Error();
    payload = JSON.parse(raw);
  } catch { return json({ error: 'Invalid preorder reference.' }, 400); }
  const item = findCatalogItem(payload?.item);
  if (!item?.preorder || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(payload?.reservation || '')) {
    return json({ error: 'Invalid preorder reference.' }, 400);
  }
  if (!process.env.STRIPE_SECRET_KEY) return json({ error: 'Checkout is temporarily unavailable.' }, 503);
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { timeout: 10000, maxNetworkRetries: 1 });
    return json(await preorderInventory(context).cancel(item, payload.reservation, stripe));
  } catch {
    return json({ error: 'We could not confirm the checkout status. Please contact jacob@discontinuedclub.com before trying again if you submitted a payment.' }, 409);
  }
};
