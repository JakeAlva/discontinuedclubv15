import Stripe from 'stripe';
import { catalog, directPriceCents, maxQuantity, priceLookupKey } from '../../lib/store-catalog.mjs';
import { availableStripeQuantity } from '../../lib/stripe-inventory.mjs';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

export async function readInventory(stripe, items = catalog) {
  const directItems = items.filter((item) => item.directCheckoutEnabled !== false);
  const prices = [];
  // Stripe accepts at most ten lookup keys in one request.
  for (let index = 0; index < directItems.length; index += 10) {
    const batch = await stripe.prices.list({
      active: true,
      lookup_keys: directItems.slice(index, index + 10).map(priceLookupKey),
      limit: 100,
      expand: ['data.product']
    });
    if (batch.has_more) throw new Error('Inventory price lookup was incomplete');
    prices.push(...batch.data);
  }
  const byLookup = new Map(prices.map((price) => [price.lookup_key, price]));
  return directItems.map((item) => {
    const price = byLookup.get(priceLookupKey(item));
    const product = price?.product;
    const ready = price?.currency === 'usd' && price.unit_amount === directPriceCents(item)
      && product && typeof product === 'object' && !product.deleted;
    const quantity = !ready ? null : product.active === false ? 0
      : availableStripeQuantity(maxQuantity(item), product);
    // Only public listing IDs and quantities leave the server, never Stripe metadata.
    return { id: item.id, quantity };
  });
}

export default async (request) => {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);
  if (!process.env.STRIPE_SECRET_KEY) return json({ error: 'Stock is temporarily unavailable.' }, 503);
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { timeout: 10000, maxNetworkRetries: 1 });
    return json({ inventory: await readInventory(stripe), checkedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Inventory lookup failed', error.message);
    return json({ error: 'Stock is temporarily unavailable.' }, 503);
  }
};
