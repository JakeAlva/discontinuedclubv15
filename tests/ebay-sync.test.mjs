import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inferCategory,
  inferShippingWeightOz,
  listingSupportReason,
  reconcileSharedStock,
  siteItemFromListing
} from '../lib/catalog-sync.mjs';
import { catalogCategories, serializeCatalogModule } from '../lib/catalog-file.mjs';
import { ebayAccessToken, endEbayListing, normalizeEbayListing, reviseEbayQuantity } from '../lib/ebay-api.mjs';

const listing = (overrides = {}) => ({
  id: '123456789012',
  title: 'Red Bull Blue Edition 4-Pack 12 fl oz',
  subtitle: '',
  priceCents: 4999,
  currency: 'USD',
  quantityAvailable: 3,
  listingType: 'FixedPriceItem',
  listingStatus: 'Active',
  condition: 'New',
  categoryName: 'Energy Drinks',
  pictureUrls: ['https://i.ebayimg.com/images/g/example/s-l1600.webp'],
  galleryUrl: 'https://i.ebayimg.com/images/g/example/s-l1600.webp',
  sku: '',
  inventoryTrackingMethod: 'ItemID',
  hasVariations: false,
  ...overrides
});

test('shared inventory preserves sales from either channel', () => {
  assert.equal(reconcileSharedStock({ siteStock: 3, previousEbayStock: 3, currentEbayStock: 3 }), 3);
  assert.equal(reconcileSharedStock({ siteStock: 2, previousEbayStock: 3, currentEbayStock: 3 }), 2);
  assert.equal(reconcileSharedStock({ siteStock: 3, previousEbayStock: 3, currentEbayStock: 2 }), 2);
  assert.equal(reconcileSharedStock({ siteStock: 2, previousEbayStock: 3, currentEbayStock: 2 }), 1);
  assert.equal(reconcileSharedStock({ siteStock: 1, previousEbayStock: 2, currentEbayStock: 5 }), 4);
  assert.equal(reconcileSharedStock({ siteStock: 9, previousEbayStock: 3, currentEbayStock: 2 }), 2);
});

test('unsupported listing shapes are held instead of guessed', () => {
  assert.equal(listingSupportReason(listing()), null);
  assert.match(listingSupportReason(listing({ hasVariations: true })), /variation/i);
  assert.match(listingSupportReason(listing({ listingType: 'Chinese' })), /unsupported/i);
  assert.match(listingSupportReason(listing({ currency: 'EUR' })), /currency/i);
});

test('new-listing defaults are conservative and existing merchandising survives', () => {
  assert.equal(inferCategory(listing()), 'drinks');
  assert.equal(inferShippingWeightOz(listing()), 64);

  const existing = {
    id: '123456789012',
    category: 'drinks',
    name: 'Editorial product name',
    detail: 'Carefully written product detail',
    price: '$54.99',
    image: 'custom.webp',
    featured: true,
    maxQuantity: 5,
    shippingWeightOz: 72,
    taxCode: 'txcd_custom'
  };
  const initial = siteItemFromListing(listing(), { existingItem: existing, sharedStock: 3 });
  assert.equal(initial.name, existing.name);
  assert.equal(initial.detail, existing.detail);
  assert.equal(initial.image, existing.image);
  assert.equal(initial.shippingWeightOz, 72);
  assert.equal(initial.price, '$49.99');
  assert.equal(initial.maxQuantity, 3);

  const renamedRemotely = siteItemFromListing(listing({ title: 'Red Bull Blue Edition 6-Pack' }), {
    existingItem: existing,
    sharedStock: 2
  });
  assert.equal(renamedRemotely.name, existing.name);
});

test('eBay quantities prefer QuantityAvailable and otherwise subtract sold units', () => {
  assert.equal(normalizeEbayListing({
    ItemID: '1',
    Title: 'One',
    Quantity: '8',
    QuantityAvailable: '4',
    SellingStatus: { QuantitySold: '3', CurrentPrice: { '#text': '12.50', '@_currencyID': 'USD' } }
  }).quantityAvailable, 4);
  assert.equal(normalizeEbayListing({
    ItemID: '2',
    Title: 'Two',
    Quantity: '8',
    SellingStatus: { QuantitySold: '3', CurrentPrice: '12.50' }
  }).quantityAvailable, 5);
});

test('eBay OAuth refresh and inventory revision keep credentials in headers', async () => {
  let tokenRequest;
  const token = await ebayAccessToken({
    clientId: 'client-id',
    clientSecret: 'client-secret',
    refreshToken: 'refresh-token',
    fetcher: async (url, options) => {
      tokenRequest = { url: String(url), options };
      return new Response(JSON.stringify({ access_token: 'temporary-access-token' }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
  });
  assert.equal(token, 'temporary-access-token');
  assert.match(tokenRequest.options.headers.Authorization, /^Basic /);
  assert.doesNotMatch(String(tokenRequest.options.body), /client-secret/);

  let tradingRequest;
  await reviseEbayQuantity(token, {
    id: '123456789012',
    sku: 'DC-12',
    inventoryTrackingMethod: 'SKU'
  }, 4, {
    fetcher: async (url, options) => {
      tradingRequest = { url: String(url), options };
      return new Response('<?xml version="1.0"?><ReviseInventoryStatusResponse><Ack>Success</Ack></ReviseInventoryStatusResponse>', { status: 200 });
    }
  });
  assert.equal(tradingRequest.options.headers['X-EBAY-API-IAF-TOKEN'], token);
  assert.match(tradingRequest.options.body, /<ItemID>123456789012<\/ItemID>/);
  assert.match(tradingRequest.options.body, /<SKU>DC-12<\/SKU>/);
  assert.match(tradingRequest.options.body, /<InventoryTrackingMethod>SKU<\/InventoryTrackingMethod>/);
  assert.match(tradingRequest.options.body, /<Quantity>4<\/Quantity>/);

  await assert.rejects(() => reviseEbayQuantity(token, listing(), 0), /endEbayListing/);

  let endRequest;
  await endEbayListing(token, listing(), {
    fetcher: async (url, options) => {
      endRequest = { url, options };
      return new Response('<?xml version="1.0"?><EndFixedPriceItemResponse><Ack>Success</Ack></EndFixedPriceItemResponse>', { status: 200 });
    }
  });
  assert.match(endRequest.options.body, /<ItemID>123456789012<\/ItemID>/);
  assert.match(endRequest.options.body, /<EndingReason>NotAvailable<\/EndingReason>/);
});

test('generated catalog modules keep category counts accurate', () => {
  const products = [
    { ...siteItemFromListing(listing(), { sharedStock: 2 }), shippingWeightOz: 64 },
    { ...siteItemFromListing(listing({ id: '2', title: 'Mystery object', categoryName: '' }), { sharedStock: 1 }), shippingWeightOz: 64 }
  ];
  const categories = catalogCategories(products);
  assert.equal(categories.all.count, 2);
  assert.equal(categories.drinks.count, 1);
  assert.equal(categories.other.count, 1);
  const source = serializeCatalogModule(products, { currency: 'usd' });
  assert.match(source, /const DC_CATALOG/);
  assert.match(source, /module\.exports/);
});
