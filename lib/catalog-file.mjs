const labels = {
  drinks: 'Rare drinks',
  apparel: 'Sports & apparel',
  collectibles: 'Collectibles & cards',
  care: 'Personal care',
  home: 'Home & hobby',
  other: 'Other finds'
};

function definedEntries(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));
}

function normalizedItem(item) {
  return definedEntries({
    id: String(item.id),
    category: item.category,
    name: item.name,
    detail: item.detail,
    price: item.price,
    image: item.image,
    featured: item.featured === true ? true : undefined,
    maxQuantity: Math.max(1, Number(item.maxQuantity) || 1),
    shippingWeightOz: Math.max(1, Number(item.shippingWeightOz) || 64),
    taxCode: item.taxCode,
    directPriceCents: Number.isInteger(item.directPriceCents) ? item.directPriceCents : undefined,
    condition: item.condition || undefined,
    ebayManagedImage: item.ebayManagedImage === true ? true : undefined,
    ebayManagedCopy: item.ebayManagedCopy === true ? true : undefined,
    ebaySku: item.ebaySku || undefined,
    ebayInventoryTrackingMethod: item.ebayInventoryTrackingMethod === 'SKU' ? 'SKU' : undefined
  });
}

export function catalogCategories(catalog) {
  const categories = {
    all: { label: 'All items', count: catalog.length }
  };
  for (const [key, label] of Object.entries(labels)) {
    const count = catalog.filter((item) => item.category === key).length;
    if (count > 0) categories[key] = { label, count };
  }
  return categories;
}

export function serializeCatalogModule(catalog, storeConfig) {
  const normalized = catalog.map(normalizedItem);
  const categories = catalogCategories(normalized);
  return `// Generated from the verified eBay inventory plus local merchandising overrides.\n// Run \`npm run ebay:sync\` to preview changes; scheduled automation writes this file.\nconst DC_CATALOG = ${JSON.stringify(normalized, null, 2)};\n\nconst DC_CATEGORIES = ${JSON.stringify(categories, null, 2)};\n\nconst DC_STORE_CONFIG = ${JSON.stringify(storeConfig, null, 2)};\n\nif (typeof window !== 'undefined') {\n  window.DC_CATALOG = DC_CATALOG;\n  window.DC_CATEGORIES = DC_CATEGORIES;\n  window.DC_STORE_CONFIG = DC_STORE_CONFIG;\n}\n\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = {\n    catalog: DC_CATALOG,\n    categories: DC_CATEGORIES,\n    storeConfig: DC_STORE_CONFIG\n  };\n}\n`;
}
