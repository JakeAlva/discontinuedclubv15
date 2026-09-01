import Stripe from 'stripe';
import { loadEnvFile } from 'node:process';
import { catalog, directPriceCents, formatMoney, maxQuantity, priceLookupKey, storeConfig } from '../lib/store-catalog.mjs';

const productSlug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}.html`;

try {
  loadEnvFile('.env');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const allowLive = args.has('--live');
const onlyArg = process.argv.slice(2).find((arg) => arg.startsWith('--only='));
const onlyId = onlyArg ? onlyArg.split('=')[1] : '';
const selected = onlyId ? catalog.filter((item) => item.id === onlyId) : catalog;
const publicSiteUrl = (process.env.PUBLIC_SITE_URL || 'https://discontinuedclub.com').replace(/\/$/, '');

if (!selected.length) throw new Error(`No catalog listing matched ${onlyId}.`);

if (!apply) {
  console.log('DRY RUN: no Stripe products or prices will be changed.');
  console.log('Review these direct prices, then use --apply with a Stripe test key.\n');
  for (const item of selected) {
    console.log(`${item.id}  ${formatMoney(directPriceCents(item)).padStart(9)}  ${item.name}`);
  }
  console.log(`\n${selected.length} products ready. Direct prices are ${storeConfig.directDiscountPercent}% below the current eBay item prices.`);
  process.exit(0);
}

const secretKey = process.env.STRIPE_SECRET_KEY || '';
const testMode = /^(sk|rk)_test_/.test(secretKey);
const liveMode = /^(sk|rk)_live_/.test(secretKey);
if (!testMode && !liveMode) {
  throw new Error('Set STRIPE_SECRET_KEY in your local environment. Do not place it in a tracked file.');
}
if (liveMode && !allowLive) {
  throw new Error('Live mode is locked. Run with a test key, or add --live only after the pricebook is approved.');
}

const stripe = new Stripe(secretKey);
const existingProducts = await stripe.products.list({ limit: 100 }).autoPagingToArray({ limit: 500 });
const productsByListingId = new Map(
  existingProducts
    .filter((product) => product.metadata?.dc_listing_id)
    .map((product) => [product.metadata.dc_listing_id, product])
);

for (const item of selected) {
  const lookupKey = priceLookupKey(item);
  const productData = {
    name: item.name,
    description: item.detail,
    active: true,
    shippable: true,
    images: [`${publicSiteUrl}/assets/images/listings/merchant/${item.id}.webp`],
    url: `${publicSiteUrl}/products/${productSlug(item)}`,
    metadata: {
      dc_listing_id: item.id,
      ebay_item_id: item.id,
      dc_stock: String(maxQuantity(item)),
      dc_weight_oz: String(item.shippingWeightOz),
      category: item.category,
      source: 'discontinuedclub.com'
    }
  };
  productData.tax_code = item.taxCode || process.env.STRIPE_DEFAULT_TAX_CODE || 'txcd_99999999';

  let product = productsByListingId.get(item.id);
  product = product
    ? await stripe.products.update(product.id, productData)
    : await stripe.products.create(productData);

  const currentPrices = await stripe.prices.list({ active: true, lookup_keys: [lookupKey], limit: 1 });
  const currentPrice = currentPrices.data[0];
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
    if (currentPrice) await stripe.prices.update(currentPrice.id, { active: false });
  }

  if (product.default_price !== price.id) await stripe.products.update(product.id, { default_price: price.id });
  console.log(`${currentPrice?.id === price.id ? 'updated' : 'synced '}  ${item.id}  ${formatMoney(amount)}  ${item.name}`);
}

console.log(`\nStripe ${liveMode ? 'LIVE' : 'TEST'} catalog sync complete for ${selected.length} products.`);
