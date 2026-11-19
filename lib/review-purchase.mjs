import { catalog } from './store-catalog.mjs';
import winter from '../data/winter-wonderland-update-2026-11-09.json' with { type: 'json' };
import november from '../data/ebay-inventory-update-2026-11-09.json' with { type: 'json' };
import november18 from '../data/ebay-inventory-update-2026-11-18.json' with { type: 'json' };
import { ReviewError } from './reviews.mjs';

export function canonicalReviewProductId(id) {
  const previous = winter.previousIds.includes(id) ? winter.id : november.relistings[id] || id;
  return november18.relistings[previous] || previous;
}

export async function verifiedReviewPurchase(stripe, paymentIntentId) {
  if (!/^pi_[A-Za-z0-9]+$/.test(paymentIntentId || '')) throw new ReviewError('Enter a valid payment reference.');
  const payment = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (!payment.livemode || payment.status !== 'succeeded' || payment.amount_received <= 0 || payment.metadata?.source !== 'discontinuedclub.com') {
    throw new ReviewError('This is not a successful live website payment.', 422);
  }
  let session;
  for await (const candidate of stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 100 })) {
    if (candidate.livemode && candidate.payment_status === 'paid' && candidate.status === 'complete' && candidate.metadata?.source === 'discontinuedclub.com') {
      session = candidate;
      break;
    }
  }
  if (!session) throw new ReviewError('A paid website checkout could not be verified.', 422);
  const products = new Map();
  for await (const line of stripe.checkout.sessions.listLineItems(session.id, { limit: 100, expand: ['data.price.product'] })) {
    const product = line.price?.product;
    const originalId = product?.metadata?.dc_listing_id || line.price?.metadata?.dc_listing_id;
    if (!/^\d{8,20}$/.test(originalId || '') || line.quantity < 1) throw new ReviewError('A purchased item could not be matched to the store.', 422);
    const id = canonicalReviewProductId(originalId);
    const item = catalog.find((entry) => entry.id === id);
    const name = item?.name || line.description;
    if (!name) throw new ReviewError('A purchased item has no product name.', 422);
    products.set(id, {
      id, name, category: item?.category || 'other',
      image: item ? `/assets/images/listings/branded/${id}.webp` : '/assets/images/logo-mark-clean.png',
      url: item ? `/products/${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${id}.html` : '/sold-archive.html'
    });
  }
  if (!products.size) throw new ReviewError('No purchased products were found.', 422);
  return { verified: true, paymentIntentId, products: [...products.values()] };
}
