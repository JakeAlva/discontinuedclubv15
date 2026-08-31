import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { catalog, categories, storeConfig } = require('../assets/catalog.js');

export { catalog, categories, storeConfig };

export function parsePriceCents(value) {
  const amount = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

export function directPriceCents(item) {
  if (Number.isInteger(item.directPriceCents) && item.directPriceCents > 0) return item.directPriceCents;
  const discount = Math.max(0, Math.min(50, Number(storeConfig.directDiscountPercent) || 0));
  return Math.max(50, Math.round(parsePriceCents(item.price) * (1 - discount / 100)));
}

export function maxQuantity(item) {
  return Math.max(1, Number(item.maxQuantity || storeConfig.defaultMaxQuantity || 1));
}

export function priceLookupKey(item) {
  return `dc_${item.id}_direct`;
}

export function findCatalogItem(id) {
  return catalog.find((item) => item.id === String(id));
}

export function shipmentWeightOz(lines = []) {
  return lines.reduce((total, line) => {
    const weightOz = Math.max(1, Number(line.item?.shippingWeightOz) || 32);
    const quantity = Math.max(1, Number(line.quantity) || 1);
    return total + weightOz * quantity;
  }, 0);
}

export function shippingQuote(subtotalCents, lines = []) {
  const thresholdCents = Math.max(1, Number(storeConfig.freeShippingThresholdCents) || 10000);
  const standardShippingCents = Math.max(0, Number(storeConfig.standardShippingCents) || 749);
  const weightOz = shipmentWeightOz(lines);
  const tiers = Array.isArray(storeConfig.shippingTiers) ? storeConfig.shippingTiers : [];
  const tier = tiers.find((candidate) => weightOz <= Number(candidate.maxWeightOz)) || tiers.at(-1);
  const calculatedShippingCents = Math.max(standardShippingCents, Number(tier?.amountCents) || standardShippingCents);
  const free = subtotalCents >= thresholdCents;
  return {
    amountCents: free ? 0 : calculatedShippingCents,
    thresholdCents,
    free,
    weightOz
  };
}

export function formatMoney(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}
