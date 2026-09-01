import Stripe from 'stripe';
import { catalog, directPriceCents, findCatalogItem, maxQuantity, priceLookupKey, shippingQuote, storeConfig } from '../../lib/store-catalog.mjs';
import { availableStripeQuantity } from '../../lib/stripe-inventory.mjs';

export const config = {
  rateLimit: { windowSize: 60, windowLimit: 20, aggregateBy: ['ip'] }
};

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

function validatedCart(payload) {
  if (!payload || !Array.isArray(payload.items)) throw new Error('Your cart could not be read.');
  if (!payload.items.length) throw new Error('Your cart is empty.');
  if (payload.items.length > storeConfig.maxCartLines) throw new Error('This cart has too many different items.');

  const seen = new Set();
  return payload.items.map((line) => {
    const item = findCatalogItem(line.id);
    const quantity = Number(line.quantity);
    if (!item || seen.has(item.id)) throw new Error('One of the products is no longer available.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity(item)) throw new Error(`The available quantity changed for ${item.name}.`);
    seen.add(item.id);
    return { item, quantity };
  });
}

function checkoutOrigin(request) {
  const requestUrl = new URL(request.url);
  const requestHost = requestUrl.hostname;
  const allowedRequestHost = requestHost === 'discontinuedclub.com'
    || requestHost === 'discontinuedclub.netlify.app'
    || requestHost.endsWith('--discontinuedclub.netlify.app')
    || requestHost === 'localhost'
    || requestHost === '127.0.0.1';
  if (allowedRequestHost) return requestUrl.origin;

  const configured = process.env.PUBLIC_SITE_URL || process.env.URL;
  if (configured) return configured.replace(/\/$/, '');
  return 'https://discontinuedclub.com';
}

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  if (process.env.STRIPE_CHECKOUT_ENABLED !== 'true') {
    return json({ error: 'Direct checkout is not available yet. Please use the matching eBay listing.' }, 503);
  }
  if (!process.env.STRIPE_SECRET_KEY) return json({ error: 'Stripe checkout has not been connected yet.' }, 503);

  try {
    const rawBody = await request.text();
    if (rawBody.length > 25000) return json({ error: 'Cart request is too large.' }, 413);
    const lines = validatedCart(JSON.parse(rawBody));
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const lookupKeys = lines.map(({ item }) => priceLookupKey(item));
    const priceBatches = [];
    for (let index = 0; index < lookupKeys.length; index += 10) {
      priceBatches.push(stripe.prices.list({ active: true, lookup_keys: lookupKeys.slice(index, index + 10), limit: 10, expand: ['data.product'] }));
    }
    const stripePrices = (await Promise.all(priceBatches)).flatMap((batch) => batch.data);
    const pricesByLookup = new Map(stripePrices.map((price) => [price.lookup_key, price]));

    const lineItems = lines.map(({ item, quantity }) => {
      const price = pricesByLookup.get(priceLookupKey(item));
      if (!price || price.unit_amount !== directPriceCents(item) || price.currency !== 'usd') {
        throw new Error(`Direct checkout pricing is not ready for ${item.name}.`);
      }
      const availableQuantity = availableStripeQuantity(maxQuantity(item), price.product);
      if (availableQuantity === null) throw new Error(`Direct checkout inventory is not ready for ${item.name}.`);
      if (availableQuantity < 1) throw new Error(`${item.name} is sold out.`);
      if (quantity > availableQuantity) throw new Error(`Only ${availableQuantity} of ${item.name} is currently available.`);
      return {
        price: price.id,
        quantity,
        adjustable_quantity: { enabled: true, minimum: 1, maximum: availableQuantity }
      };
    });

    const itemSubtotalCents = lines.reduce((sum, { item, quantity }) => sum + directPriceCents(item) * quantity, 0);
    const shipping = shippingQuote(itemSubtotalCents, lines);

    const listingIds = lines.map(({ item }) => item.id).join(',');
    const origin = checkoutOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/out-now.html?checkout=cancelled`,
      customer_creation: 'always',
      billing_address_collection: 'auto',
      shipping_address_collection: { allowed_countries: ['US'] },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: shipping.amountCents, currency: 'usd' },
          display_name: shipping.free ? 'Free standard shipping' : `USPS Ground Advantage (${Math.max(1, Math.ceil(shipping.weightOz / 16))} lb estimated)`,
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 2 },
            maximum: { unit: 'business_day', value: 5 }
          }
        }
      }],
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === 'true' },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      metadata: { source: 'discontinuedclub.com', listing_ids: listingIds, shipping_tier: shipping.free ? 'free_100_plus' : 'standard_749' },
      payment_intent_data: { metadata: { source: 'discontinuedclub.com', listing_ids: listingIds, shipping_tier: shipping.free ? 'free_100_plus' : 'standard_749' } },
      custom_text: { shipping_address: { message: 'Shipping below $100 is based on estimated packaged weight. Orders of $100+ ship free. Orders placed before 12 PM Central are prepared for same-day carrier drop-off whenever possible.' } }
    });

    return json({ url: session.url });
  } catch (error) {
    console.error('Checkout error', error);
    const message = error instanceof SyntaxError ? 'Your cart could not be read.' : error.message;
    const knownCartError = /cart|product|quantity|available|pricing|inventory|sold out/i.test(message);
    return json({ error: knownCartError ? message : 'Stripe could not open checkout. Please try again.' }, knownCartError ? 400 : 500);
  }
};
