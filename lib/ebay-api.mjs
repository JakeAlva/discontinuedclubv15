import { XMLParser } from 'fast-xml-parser';

const apiScope = 'https://api.ebay.com/oauth/api_scope';
const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  processEntities: false
});

const asList = (value) => value === undefined ? [] : Array.isArray(value) ? value : [value];
const textValue = (value) => typeof value === 'object' && value !== null ? value['#text'] : value;
const escapeXml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
})[character]);

function environmentOrigin(environment = process.env.EBAY_ENVIRONMENT) {
  return environment === 'sandbox' ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';
}

function required(value, name) {
  if (!value) throw new Error(`Missing required eBay setting: ${name}`);
  return value;
}

function errorSummary(data) {
  return asList(data?.Errors)
    .map((error) => `${error.ErrorCode || 'unknown'} ${error.ShortMessage || error.LongMessage || ''}`.trim())
    .join('; ');
}

export async function ebayAccessToken({
  clientId = process.env.EBAY_CLIENT_ID,
  clientSecret = process.env.EBAY_CLIENT_SECRET,
  refreshToken = process.env.EBAY_REFRESH_TOKEN,
  environment = process.env.EBAY_ENVIRONMENT,
  fetcher = fetch
} = {}) {
  const response = await fetcher(`${environmentOrigin(environment)}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${required(clientId, 'EBAY_CLIENT_ID')}:${required(clientSecret, 'EBAY_CLIENT_SECRET')}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: required(refreshToken, 'EBAY_REFRESH_TOKEN'),
      scope: apiScope
    }),
    signal: AbortSignal.timeout(30000)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(`eBay authorization failed (${response.status}): ${data.error_description || data.error || 'unknown error'}`);
  }
  return data.access_token;
}

export async function ebayTradingCall(call, requestXml, {
  accessToken,
  environment = process.env.EBAY_ENVIRONMENT,
  fetcher = fetch
} = {}) {
  const response = await fetcher(`${environmentOrigin(environment)}/ws/api.dll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      'X-EBAY-API-CALL-NAME': call,
      'X-EBAY-API-SITEID': '0',
      'X-EBAY-API-COMPATIBILITY-LEVEL': process.env.EBAY_API_VERSION || '1477',
      'X-EBAY-API-IAF-TOKEN': required(accessToken, 'eBay access token')
    },
    body: `<?xml version="1.0" encoding="utf-8"?><${call}Request xmlns="urn:ebay:apis:eBLBaseComponents">${requestXml}</${call}Request>`,
    signal: AbortSignal.timeout(30000),
    redirect: 'error'
  });

  if (!response.ok) throw new Error(`eBay ${call} request failed with HTTP ${response.status}`);
  const raw = await response.text();
  if (raw.length > 10_000_000) throw new Error(`eBay ${call} response exceeded 10 MB`);
  const data = parser.parse(raw)?.[`${call}Response`];
  if (!data || !['Success', 'Warning'].includes(data.Ack)) {
    throw new Error(`eBay ${call} failed: ${errorSummary(data) || 'unrecognized response'}`);
  }
  return data;
}

export function normalizeEbayListing(item = {}) {
  const quantity = Number(item.Quantity);
  const quantitySold = Number(item.SellingStatus?.QuantitySold || 0);
  const quantityAvailable = Number(item.QuantityAvailable);
  const available = Number.isInteger(quantityAvailable)
    ? quantityAvailable
    : Number.isFinite(quantity)
      ? quantity - quantitySold
      : 0;
  const price = Number(textValue(item.SellingStatus?.CurrentPrice ?? item.StartPrice));
  const pictureUrls = asList(item.PictureDetails?.PictureURL || item.PictureDetails?.GalleryURL)
    .map(String)
    .filter(Boolean);

  return {
    id: String(item.ItemID || ''),
    title: String(item.Title || '').trim(),
    subtitle: String(item.SubTitle || '').trim(),
    priceCents: Number.isFinite(price) ? Math.round(price * 100) : 0,
    currency: item.SellingStatus?.CurrentPrice?.['@_currencyID'] || item.StartPrice?.['@_currencyID'] || 'USD',
    quantityAvailable: Math.max(0, Number.isFinite(available) ? Math.trunc(available) : 0),
    quantitySold: Math.max(0, Number.isFinite(quantitySold) ? Math.trunc(quantitySold) : 0),
    listingType: String(item.ListingType || ''),
    listingStatus: String(item.SellingStatus?.ListingStatus || 'Active'),
    startTime: item.ListingDetails?.StartTime || null,
    condition: item.ConditionDisplayName || null,
    categoryName: item.PrimaryCategory?.CategoryName || '',
    categoryId: item.PrimaryCategory?.CategoryID ? String(item.PrimaryCategory.CategoryID) : '',
    pictureUrls,
    galleryUrl: item.PictureDetails?.GalleryURL || pictureUrls[0] || null,
    sku: item.SKU ? String(item.SKU) : '',
    inventoryTrackingMethod: String(item.InventoryTrackingMethod || 'ItemID'),
    hasVariations: Boolean(item.Variations?.Variation),
    itemSpecifics: asList(item.ItemSpecifics?.NameValueList).map((specific) => ({
      name: String(specific.Name || ''),
      values: asList(specific.Value).map(String)
    }))
  };
}

export async function getActiveEbayListings(accessToken, options = {}) {
  const listings = [];
  let page = 1;
  let pages = 1;

  do {
    const data = await ebayTradingCall('GetMyeBaySelling', `<DetailLevel>ReturnAll</DetailLevel><ActiveList><Include>true</Include><Pagination><EntriesPerPage>100</EntriesPerPage><PageNumber>${page}</PageNumber></Pagination></ActiveList>`, {
      ...options,
      accessToken
    });
    listings.push(...asList(data.ActiveList?.ItemArray?.Item).map(normalizeEbayListing));
    pages = Math.max(1, Number(data.ActiveList?.PaginationResult?.TotalNumberOfPages || 1));
    if (pages > 1000) throw new Error('eBay returned an unexpected number of active-listing pages');
    page += 1;
  } while (page <= pages);

  return listings.filter((listing) => listing.id);
}

export async function getEbayListing(accessToken, itemId, options = {}) {
  const data = await ebayTradingCall('GetItem', `<ItemID>${escapeXml(itemId)}</ItemID><DetailLevel>ReturnAll</DetailLevel>`, {
    ...options,
    accessToken
  });
  const listing = normalizeEbayListing(data.Item);
  if (listing.id !== String(itemId)) throw new Error(`eBay returned the wrong listing for ${itemId}`);
  return listing;
}

export async function reviseEbayQuantity(accessToken, listing, quantity, options = {}) {
  const normalizedQuantity = Math.max(0, Math.trunc(Number(quantity) || 0));
  if (normalizedQuantity < 1) throw new Error('Use endEbayListing when no inventory remains');
  const sku = listing.sku ? `<SKU>${escapeXml(listing.sku)}</SKU>` : '';
  const tracking = listing.inventoryTrackingMethod === 'SKU'
    ? '<InventoryTrackingMethod>SKU</InventoryTrackingMethod>'
    : '';
  const itemId = `<ItemID>${escapeXml(listing.id)}</ItemID>`;
  return ebayTradingCall('ReviseInventoryStatus', `<InventoryStatus>${itemId}${sku}${tracking}<Quantity>${normalizedQuantity}</Quantity></InventoryStatus>`, {
    ...options,
    accessToken
  });
}

export async function endEbayListing(accessToken, listing, options = {}) {
  const itemId = required(listing?.id, 'eBay item ID');
  return ebayTradingCall('EndFixedPriceItem', `<ItemID>${escapeXml(itemId)}</ItemID><EndingReason>NotAvailable</EndingReason>`, {
    ...options,
    accessToken
  });
}

export function ebayApiScope() {
  return apiScope;
}
