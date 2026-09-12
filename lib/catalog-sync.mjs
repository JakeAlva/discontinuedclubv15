const fixedPriceTypes = new Set(['FixedPriceItem', 'StoresFixedPrice']);

const taxCodes = {
  general: 'txcd_99999999',
  softDrink: 'txcd_41040002',
  sportsJersey: 'txcd_30070022',
  clothing: 'txcd_30011000',
  grooming: 'txcd_32050006',
  shampoo: 'txcd_32050036'
};

function integerOrNull(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

export function reconcileSharedStock({ siteStock, previousEbayStock, currentEbayStock }) {
  const ebay = integerOrNull(currentEbayStock);
  if (ebay === null) throw new Error('Current eBay stock must be a non-negative integer');

  const site = integerOrNull(siteStock);
  const previous = integerOrNull(previousEbayStock);
  if (site === null) return ebay;
  if (previous === null) return Math.min(site, ebay);

  return Math.max(0, Math.min(ebay, site + (ebay - previous)));
}

export function listingSupportReason(listing) {
  if (!listing.id || !listing.title) return 'missing item ID or title';
  if (listing.hasVariations) return 'variation listing requires a manual catalog choice';
  if (listing.currency && listing.currency !== 'USD') return `unsupported currency ${listing.currency}`;
  if (listing.listingType && !fixedPriceTypes.has(listing.listingType)) return `unsupported ${listing.listingType} listing`;
  if (!Number.isInteger(listing.priceCents) || listing.priceCents < 50) return 'missing or invalid fixed price';
  return null;
}

export function inferCategory(listing) {
  const haystack = `${listing.title} ${listing.categoryName}`.toLowerCase();
  if (/drink|beverage|soda|energy|water|juice|cola|mountain dew|red bull|monster|alani|celsius|pepsi|sprite/.test(haystack)) return 'drinks';
  if (/jersey|shirt|shoe|sneaker|apparel|clothing|hat|hoodie|jacket|sports mem/.test(haystack)) return 'apparel';
  if (/pokemon|trading card|collectible|funko|figure|toy|booster|memorabilia/.test(haystack)) return 'collectibles';
  if (/body wash|shampoo|conditioner|personal care|beauty|skin care|deodorant|soap/.test(haystack)) return 'care';
  if (/home|garden|aquarium|pet suppl|filter|furniture|tool/.test(haystack)) return 'home';
  return 'other';
}

function packCount(title) {
  const patterns = [
    /(?:lot|set)\s+of\s+(\d{1,3})/i,
    /(\d{1,3})\s*[- ]?(?:pack|pk|count|ct)\b/i
  ];
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return Math.max(1, Number(match[1]));
  }
  return 1;
}

function unitOunces(title) {
  const match = title.match(/(\d+(?:\.\d+)?)\s*(?:fl\.?\s*)?oz\b/i);
  return match ? Math.max(1, Number(match[1])) : null;
}

export function inferShippingWeightOz(listing, category = inferCategory(listing)) {
  if (category === 'drinks') {
    const contents = (unitOunces(listing.title) || 20) * packCount(listing.title);
    return Math.max(16, Math.ceil((contents * 1.08 + 12) / 8) * 8);
  }
  if (category === 'care') {
    const contents = (unitOunces(listing.title) || 20) * packCount(listing.title);
    return Math.max(24, Math.ceil((contents * 1.08 + 12) / 8) * 8);
  }
  if (category === 'apparel') return /shoe|sneaker/i.test(listing.title) ? 64 : 40;
  if (category === 'collectibles') return /card|booster/i.test(listing.title) ? 24 : 40;
  if (category === 'home') return 64;
  return 64;
}

export function inferTaxCode(item) {
  if (item.category === 'drinks' && !/liquid death/i.test(item.name)) return taxCodes.softDrink;
  if (item.category === 'apparel' && /jersey/i.test(item.name)) return taxCodes.sportsJersey;
  if (item.category === 'apparel') return taxCodes.clothing;
  if (item.category === 'care' && /shampoo/i.test(item.name)) return taxCodes.shampoo;
  if (item.category === 'care') return taxCodes.grooming;
  return taxCodes.general;
}

export function defaultListingDetail(listing, category = inferCategory(listing)) {
  if (listing.subtitle) return listing.subtitle.replace(/[.\s]+$/, '');
  const subject = {
    drinks: 'Beverage',
    apparel: 'Apparel',
    collectibles: 'Collectible',
    care: 'Personal-care item',
    home: 'Home and hobby item',
    other: 'Product'
  }[category];
  const condition = listing.condition ? `, ${String(listing.condition).toLowerCase()}` : '';
  return `${subject}${condition}; see listing photos for exact package and condition details`;
}

export function formatEbayPrice(priceCents) {
  return `$${(Math.max(0, Number(priceCents) || 0) / 100).toFixed(2)}`;
}

export function siteItemFromListing(listing, {
  existingItem,
  sharedStock,
  managedImage = false
} = {}) {
  const category = existingItem?.category || inferCategory(listing);
  const name = existingItem?.name || listing.title;
  const item = {
    id: listing.id,
    category,
    name,
    detail: existingItem?.detail || defaultListingDetail(listing, category),
    price: formatEbayPrice(listing.priceCents),
    image: existingItem?.image || `${listing.id}.webp`,
    shippingWeightOz: existingItem?.shippingWeightOz || inferShippingWeightOz(listing, category),
    taxCode: existingItem?.taxCode || inferTaxCode({ category, name }),
    maxQuantity: sharedStock,
    condition: listing.condition || existingItem?.condition || undefined,
    ebayManagedImage: existingItem?.ebayManagedImage || managedImage || undefined,
    ebayManagedCopy: existingItem?.ebayManagedCopy || !existingItem || undefined,
    ebaySku: listing.sku || undefined,
    ebayInventoryTrackingMethod: listing.inventoryTrackingMethod === 'SKU' ? 'SKU' : undefined
  };
  if (existingItem?.featured) item.featured = true;
  if (Number.isInteger(existingItem?.directPriceCents)) item.directPriceCents = existingItem.directPriceCents;
  return item;
}
