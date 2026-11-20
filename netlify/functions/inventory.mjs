import Stripe from 'stripe';
import { catalog, directPriceCents, maxQuantity, priceLookupKey } from '../../lib/store-catalog.mjs';
import { availableStripeQuantity } from '../../lib/stripe-inventory.mjs';
import { preorderOpen } from '../../lib/preorders.mjs';
import { preorderInventory } from '../../lib/preorder-runtime.mjs';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

export async function readInventory(stripe, items = catalog, preorders = null) {
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
  return Promise.all(directItems.map(async (item) => {
    const price = byLookup.get(priceLookupKey(item));
    const product = price?.product;
    const ready = price?.currency === 'usd' && price.unit_amount === directPriceCents(item)
      && product && typeof product === 'object' && !product.deleted;
    let quantity = !ready ? null : product.active === false ? 0
      : availableStripeQuantity(maxQuantity(item), product);
    if (item.preorder && quantity !== null && quantity > 0) {
      try { quantity = !preorderOpen(item) ? 0 : preorders ? await preorders.available(item, stripe) : null; }
      catch { quantity = null; console.error('Preorder availability could not be verified', item.id); }
    }
    // Only public listing IDs and quantities leave the server, never Stripe metadata.
    return { id: item.id, quantity };
  }));
}

export default async (request, context) => {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);
  if (!process.env.STRIPE_SECRET_KEY) return json({ error: 'Stock is temporarily unavailable.' }, 503);
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { timeout: 10000, maxNetworkRetries: 1 });
    let preorders = null;
    if (catalog.some((item) => item.preorder)) {
      try { preorders = preorderInventory(context); }
      catch { console.error('Preorder inventory runtime unavailable'); }
    }
    return json({ inventory: await readInventory(stripe, catalog, preorders), checkedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Inventory lookup failed', error.message);
    return json({ error: 'Stock is temporarily unavailable.' }, 503);
  }
};
