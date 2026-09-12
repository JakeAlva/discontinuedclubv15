import { loadEnvFile } from 'node:process';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import Stripe from 'stripe';
import { ebayAccessToken, endEbayListing, getActiveEbayListings, getEbayListing, reviseEbayQuantity } from '../lib/ebay-api.mjs';
import { listingSupportReason, reconcileSharedStock, siteItemFromListing } from '../lib/catalog-sync.mjs';
import { serializeCatalogModule } from '../lib/catalog-file.mjs';
import { createSyncedListingImageBuffers } from '../lib/listing-images.mjs';
import { catalog, directPriceCents, maxQuantity, priceLookupKey, storeConfig } from '../lib/store-catalog.mjs';
import { stripeStock } from '../lib/stripe-inventory.mjs';

try {
  loadEnvFile('.env');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const root = resolve(import.meta.dirname, '..');
const statePath = resolve(root, 'data/ebay-sync-state.json');
const catalogPath = resolve(root, 'assets/catalog.js');
const imageRoot = resolve(root, 'assets/images/listings');
const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const allowLive = args.has('--live');
const publicSiteUrl = (process.env.PUBLIC_SITE_URL || 'https://discontinuedclub.com').replace(/\/$/, '');

async function readState() {
  try {
    return JSON.parse(await readFile(statePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return { version: 1, listings: {} };
    throw new Error(`Could not read ${statePath}: ${error.message}`);
  }
}

async function writeAtomic(file, contents) {
  const temporary = `${file}.tmp`;
  await writeFile(temporary, contents);
  await rename(temporary, file);
}

function productSlug(item) {
  return `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}.html`;
}

function newestFirst(a, b) {
  return String(b.startTime || '').localeCompare(String(a.startTime || ''));
}

async function upsertStripeProduct(stripe, productsByListingId, item, sharedStock) {
  const metadata = {
    dc_listing_id: item.id,
    ebay_item_id: item.id,
    dc_stock: String(sharedStock),
    dc_ebay_stock: String(sharedStock),
    dc_weight_oz: String(item.shippingWeightOz),
    category: item.category,
    source: 'discontinuedclub.com'
  };
  if (item.ebaySku) metadata.ebay_sku = item.ebaySku;
  if (item.ebayInventoryTrackingMethod) metadata.ebay_inventory_tracking = item.ebayInventoryTrackingMethod;
  const data = {
    name: item.name,
    description: item.detail,
    active: sharedStock > 0,
    shippable: true,
    images: [`${publicSiteUrl}/assets/images/listings/merchant/${item.id}.webp`],
    url: `${publicSiteUrl}/products/${productSlug(item)}`,
    metadata,
    tax_code: item.taxCode || process.env.STRIPE_DEFAULT_TAX_CODE || 'txcd_99999999'
  };
  let product = productsByListingId.get(item.id);
  product = product
    ? await stripe.products.update(product.id, data)
    : await stripe.products.create(data);
  productsByListingId.set(item.id, product);

  const lookupKey = priceLookupKey(item);
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
}

async function writeListingImages(itemId, buffers) {
  await Promise.all([
    mkdir(imageRoot, { recursive: true }),
    mkdir(resolve(imageRoot, 'branded'), { recursive: true }),
    mkdir(resolve(imageRoot, 'merchant'), { recursive: true })
  ]);
  await Promise.all([
    writeAtomic(resolve(imageRoot, `${itemId}.webp`), buffers.source),
    writeAtomic(resolve(imageRoot, 'branded', `${itemId}.webp`), buffers.branded),
    writeAtomic(resolve(imageRoot, 'merchant', `${itemId}.webp`), buffers.merchant)
  ]);
}

if (!apply) console.log('DRY RUN: eBay, Stripe, and storefront files will not be changed.\n');

const secretKey = process.env.STRIPE_SECRET_KEY || '';
const testMode = /^(sk|rk)_test_/.test(secretKey);
const liveMode = /^(sk|rk)_live_/.test(secretKey);
if (!testMode && !liveMode) throw new Error('Set STRIPE_SECRET_KEY before syncing inventory.');
if (liveMode && apply && !allowLive) throw new Error('Live Stripe changes are locked; add --live after reviewing a dry run.');

const [accessToken, state] = await Promise.all([ebayAccessToken(), readState()]);
const activeListings = await getActiveEbayListings(accessToken);
const existingById = new Map(catalog.map((item) => [item.id, item]));
const activeById = new Map(activeListings.map((listing) => [listing.id, listing]));
const stripe = new Stripe(secretKey);
const stripeProducts = await stripe.products.list({ limit: 100 }).autoPagingToArray({ limit: 500 });
const productsByListingId = new Map(
  stripeProducts
    .filter((product) => product.metadata?.dc_listing_id)
    .map((product) => [product.metadata.dc_listing_id, product])
);

const supported = [];
const skipped = [];
for (const summary of activeListings) {
  let listing = summary;
  const previous = state.listings?.[summary.id];
  const existing = existingById.get(summary.id);
  const imageChanged = previous?.managedImage && previous.sourceImageUrl !== (summary.galleryUrl || summary.pictureUrls[0]);
  if (!existing || imageChanged || !summary.pictureUrls.length) {
    listing = await getEbayListing(accessToken, summary.id);
  }
  const reason = listingSupportReason(listing);
  const imageUrl = listing.pictureUrls[0] || listing.galleryUrl;
  if (reason || (!existing && !imageUrl)) {
    skipped.push({ listing, existing, reason: reason || 'new listing has no usable image' });
    continue;
  }
  supported.push({ listing, existing, previous, imageUrl });
}

const records = [];
const imagePlans = new Map();
for (const record of supported) {
  const product = productsByListingId.get(record.listing.id);
  const previousEbayStock = record.previous?.ebayQuantity ?? (record.existing ? maxQuantity(record.existing) : record.listing.quantityAvailable);
  const siteStock = stripeStock(product) ?? previousEbayStock;
  const sharedStock = reconcileSharedStock({
    siteStock,
    previousEbayStock,
    currentEbayStock: record.listing.quantityAvailable
  });
  const managedImage = !record.existing || record.previous?.managedImage === true;
  const sourceImageChanged = managedImage && record.previous?.sourceImageUrl !== record.imageUrl;
  if (sharedStock > 0 && sourceImageChanged) {
    imagePlans.set(record.listing.id, await createSyncedListingImageBuffers(record.imageUrl, { root }));
  }
  records.push({ ...record, product, previousEbayStock, siteStock, sharedStock, managedImage });
}

const currentCatalog = [];
const existingRecords = records.filter((record) => record.existing);
const newRecords = records.filter((record) => !record.existing).sort((a, b) => newestFirst(a.listing, b.listing));
const orderedExisting = [
  ...existingRecords,
  ...skipped.filter((record) => record.existing).map((record) => ({ ...record, held: true }))
].sort((a, b) => catalog.indexOf(a.existing) - catalog.indexOf(b.existing));
for (const record of [...newRecords, ...orderedExisting]) {
  if (record.held) {
    currentCatalog.push(record.existing);
    continue;
  }
  if (record.sharedStock < 1) continue;
  currentCatalog.push(siteItemFromListing(record.listing, {
    existingItem: record.existing,
    sharedStock: record.sharedStock,
    managedImage: record.managedImage
  }));
}

const removed = catalog.filter((item) => !activeById.has(item.id));
const changedStock = records.filter((record) => record.sharedStock !== record.listing.quantityAvailable || record.sharedStock !== record.siteStock);
const priceChanges = records.filter((record) => record.existing?.price !== `$${(record.listing.priceCents / 100).toFixed(2)}`);

console.log(`eBay active listings: ${activeListings.length}`);
console.log(`Storefront after sync: ${currentCatalog.length}`);
console.log(`New supported listings: ${newRecords.length}`);
console.log(`Ended or inactive listings removed: ${removed.length}`);
console.log(`Price changes: ${priceChanges.length}`);
console.log(`Inventory reconciliations: ${changedStock.length}`);
if (skipped.length) {
  console.log('\nListings held for review:');
  for (const { listing, reason } of skipped) console.log(`- ${listing.id} ${listing.title}: ${reason}`);
}
if (!apply) process.exit(0);

for (const record of records) {
  if (record.sharedStock !== record.listing.quantityAvailable) {
    if (record.sharedStock === 0) {
      await endEbayListing(accessToken, record.listing);
      console.log(`Ended eBay listing ${record.listing.id}: shared inventory sold out`);
    } else {
      await reviseEbayQuantity(accessToken, record.listing, record.sharedStock);
      console.log(`eBay quantity ${record.listing.id}: ${record.listing.quantityAvailable} -> ${record.sharedStock}`);
    }
  }
  if (record.sharedStock > 0) {
    const item = currentCatalog.find((candidate) => candidate.id === record.listing.id);
    await upsertStripeProduct(stripe, productsByListingId, item, record.sharedStock);
  } else if (record.product?.active) {
    await stripe.products.update(record.product.id, { active: false, metadata: { dc_stock: '0', dc_ebay_stock: '0' } });
  }
}

const currentIds = new Set(currentCatalog.map((item) => item.id));
for (const product of stripeProducts) {
  const listingId = product.metadata?.dc_listing_id;
  if (product.active && product.metadata?.source === 'discontinuedclub.com' && listingId && !currentIds.has(listingId)) {
    await stripe.products.update(product.id, { active: false, metadata: { dc_stock: '0' } });
  }
}

for (const [itemId, buffers] of imagePlans) await writeListingImages(itemId, buffers);

const nextState = {
  version: 1,
  listings: Object.fromEntries(records.map((record) => [record.listing.id, {
    title: record.listing.title,
    priceCents: record.listing.priceCents,
    ebayQuantity: record.sharedStock,
    sourceImageUrl: record.imageUrl || null,
    managedImage: record.managedImage,
    startTime: record.listing.startTime || null
  }]))
};
await mkdir(resolve(root, 'data'), { recursive: true });
await Promise.all([
  writeAtomic(catalogPath, serializeCatalogModule(currentCatalog, storeConfig)),
  writeAtomic(statePath, `${JSON.stringify(nextState, null, 2)}\n`)
]);

console.log(`\nApplied eBay/Stripe/storefront sync for ${currentCatalog.length} products.`);
