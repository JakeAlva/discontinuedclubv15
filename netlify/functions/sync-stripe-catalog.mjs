import { timingSafeEqual } from 'node:crypto';
import Stripe from 'stripe';
import { catalog, directPriceCents, maxQuantity, priceLookupKey } from '../../lib/store-catalog.mjs';

export const config = {
  rateLimit: { windowSize: 300, windowLimit: 3, aggregateBy: ['ip'] }
};

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:4173'
  }
});

async function authorized(request) {
  const expected = process.env.STRIPE_SYNC_TOKEN || '';
  let supplied = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!supplied) supplied = new URLSearchParams(await request.clone().text()).get('token') || '';
  if (!expected || expected.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

const productSlug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}.html`;

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  if (!(await authorized(request))) return json({ error: 'Unauthorized.' }, 401);

  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!/^(sk|rk)_live_/.test(secretKey)) return json({ error: 'A live Stripe key is required.' }, 503);

  try {
    const stripe = new Stripe(secretKey);
    const publicSiteUrl = (process.env.PUBLIC_SITE_URL || 'https://discontinuedclub.com').replace(/\/$/, '');
    const existingProducts = await stripe.products.list({ limit: 100 }).autoPagingToArray({ limit: 500 });
    const productsByListingId = new Map(existingProducts
      .filter((product) => product.metadata?.dc_listing_id)
      .map((product) => [product.metadata.dc_listing_id, product]));
    let created = 0;
    let updated = 0;
    let pricesCreated = 0;

    for (let index = 0; index < catalog.length; index += 6) {
      await Promise.all(catalog.slice(index, index + 6).map(async (item) => {
        const productData = {
          name: item.name,
          description: item.detail,
          active: true,
          shippable: true,
          images: [`${publicSiteUrl}/assets/images/listings/merchant/${item.id}.webp`],
          url: `${publicSiteUrl}/products/${productSlug(item)}`,
          tax_code: item.taxCode || process.env.STRIPE_DEFAULT_TAX_CODE || 'txcd_99999999',
          metadata: {
            dc_listing_id: item.id,
            ebay_item_id: item.id,
            dc_stock: String(maxQuantity(item)),
            dc_weight_oz: String(item.shippingWeightOz),
            category: item.category,
            source: 'discontinuedclub.com'
          }
        };

        let product = productsByListingId.get(item.id);
        if (product) {
          product = await stripe.products.update(product.id, productData);
          updated += 1;
        } else {
          product = await stripe.products.create(productData);
          created += 1;
        }

        const lookupKey = priceLookupKey(item);
        const currentPrice = (await stripe.prices.list({ active: true, lookup_keys: [lookupKey], limit: 1 })).data[0];
        const amount = directPriceCents(item);
        let price = currentPrice;
        if (!currentPrice || currentPrice.unit_amount !== amount || currentPrice.product !== product.id) {
          price = await stripe.prices.create({
            product: product.id,
            currency: 'usd',
            unit_amount: amount,
            lookup_key: lookupKey,
            transfer_lookup_key: Boolean(currentPrice),
            tax_behavior: 'exclusive',
            metadata: { dc_listing_id: item.id, source: 'discontinuedclub.com' }
          });
          pricesCreated += 1;
        }
        if (product.default_price !== price.id) {
          product = await stripe.products.update(product.id, { default_price: price.id });
          const redundantPrices = (await stripe.prices.list({ product: product.id, active: true, limit: 100 })).data
            .filter((candidate) => candidate.id !== price.id && candidate.metadata?.source === 'discontinuedclub.com');
          for (const redundantPrice of redundantPrices) {
            await stripe.prices.update(redundantPrice.id, { active: false });
          }
        }
      }));
    }

    const listingIds = new Set(catalog.map((item) => item.id));
    const staleProducts = existingProducts.filter((product) => product.active
      && product.metadata?.source === 'discontinuedclub.com'
      && product.metadata?.dc_listing_id
      && !listingIds.has(product.metadata.dc_listing_id));
    for (const product of staleProducts) await stripe.products.update(product.id, { active: false });

    console.log(`Stripe LIVE catalog sync: ${catalog.length} products, ${created} created, ${updated} updated, ${pricesCreated} prices created, ${staleProducts.length} archived.`);
    return json({ mode: 'live', products: catalog.length, created, updated, pricesCreated, archived: staleProducts.length });
  } catch (error) {
    console.error('Stripe live catalog sync failed', error);
    return json({ error: 'Stripe catalog sync failed.' }, 500);
  }
};
