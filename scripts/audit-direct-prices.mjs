import { catalog, directPriceCents, formatMoney, parsePriceCents, shippingQuote, storeConfig } from '../lib/store-catalog.mjs';

const EBAY_VARIABLE_FEE = 0.1325;
const EBAY_ORDER_FEE_CENTS = 40;
const STRIPE_CARD_AND_TAX_FEE = 0.034;
const STRIPE_ORDER_FEE_CENTS = 30;

function ebayNetBeforePostage(itemSubtotalCents) {
  const gross = itemSubtotalCents + storeConfig.standardShippingCents;
  return gross - Math.round(gross * EBAY_VARIABLE_FEE) - EBAY_ORDER_FEE_CENTS;
}

function directNetBeforePostage(itemSubtotalCents) {
  const gross = itemSubtotalCents + shippingQuote(itemSubtotalCents).amountCents;
  return gross - Math.round(gross * STRIPE_CARD_AND_TAX_FEE) - STRIPE_ORDER_FEE_CENTS;
}

function minimumDirectPrice(ebayItemSubtotalCents) {
  const target = ebayNetBeforePostage(ebayItemSubtotalCents);
  for (let candidate = 50; candidate <= ebayItemSubtotalCents; candidate += 1) {
    if (directNetBeforePostage(candidate) >= target) return candidate;
  }
  return ebayItemSubtotalCents;
}

const risks = [];
for (const item of catalog) {
  const ebayPrice = parsePriceCents(item.price);
  const directPrice = directPriceCents(item);
  const delta = directNetBeforePostage(directPrice) - ebayNetBeforePostage(ebayPrice);
  if (delta < 0) {
    risks.push({
      id: item.id,
      name: item.name,
      current: directPrice,
      minimum: minimumDirectPrice(ebayPrice),
      delta
    });
  }
}

console.log('Direct price payout audit');
console.log('Conservative assumptions: eBay 13.25% + $0.40, Stripe 2.9% + $0.30, Stripe Tax 0.5%, and $7.49 eBay shipping.');
console.log('The comparison is before postage cost; it assumes the same label cost on both channels.\n');

if (!risks.length) {
  console.log('Every single-item direct price meets or beats the estimated eBay payout.');
} else {
  console.log(`${risks.length} single-item prices need review before a live Stripe sync:\n`);
  for (const risk of risks) {
    console.log(`${risk.id}  ${formatMoney(risk.current).padStart(9)} -> at least ${formatMoney(risk.minimum).padStart(9)}  ${formatMoney(risk.delta)}  ${risk.name}`);
  }
}

let riskyPairs = 0;
let worstPair = null;
for (let left = 0; left < catalog.length; left += 1) {
  for (let right = left + 1; right < catalog.length; right += 1) {
    const ebaySubtotal = parsePriceCents(catalog[left].price) + parsePriceCents(catalog[right].price);
    const directSubtotal = directPriceCents(catalog[left]) + directPriceCents(catalog[right]);
    const delta = directNetBeforePostage(directSubtotal) - ebayNetBeforePostage(ebaySubtotal);
    if (delta >= 0) continue;
    riskyPairs += 1;
    if (!worstPair || delta < worstPair.delta) worstPair = { left: catalog[left], right: catalog[right], delta };
  }
}

console.log(`\nTwo-item carts below target payout: ${riskyPairs}`);
if (worstPair) console.log(`Worst pair: ${worstPair.left.name} + ${worstPair.right.name} (${formatMoney(worstPair.delta)})`);

if (risks.length || riskyPairs) {
  console.log('\nDo not run a live Stripe catalog sync until the direct pricebook and actual shipping charges are approved.');
  process.exitCode = 1;
}
