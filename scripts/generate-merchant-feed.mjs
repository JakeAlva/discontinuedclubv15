import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog, directPriceCents, shippingQuote } from '../lib/store-catalog.mjs';
import { productBrand, productCondition, productType } from '../lib/product-metadata.mjs';

const root = resolve(import.meta.dirname, '..');
const publicRoot = 'https://discontinuedclub.com';

const xml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const slug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}`;
const productUrl = (item) => `${publicRoot}/products/${slug(item)}.html`;
const imageUrl = (item) => `${publicRoot}/assets/images/listings/merchant/${item.id}.webp`;
const dollars = (cents) => `${(cents / 100).toFixed(2)} USD`;

function itemMarkup(item) {
  const priceCents = directPriceCents(item);
  const shippingCents = shippingQuote(priceCents, [{ item, quantity: 1 }]).amountCents;
  const description = `${item.name}. ${item.detail}. Available directly from Discontinued Club with secure Stripe checkout.`;
  return `  <item>
    <g:id>${xml(`dc-${item.id}`)}</g:id>
    <g:title>${xml(item.name)}</g:title>
    <g:description>${xml(description)}</g:description>
    <g:link>${xml(productUrl(item))}</g:link>
    <g:image_link>${xml(imageUrl(item))}</g:image_link>
    <g:availability>in_stock</g:availability>
    <g:price>${dollars(priceCents)}</g:price>
    <g:condition>${productCondition(item)}</g:condition>
    <g:brand>${xml(productBrand(item))}</g:brand>
    <g:product_type>${xml(productType(item))}</g:product_type>
    <g:shipping_weight>${Number(item.shippingWeightOz)} oz</g:shipping_weight>
    <g:shipping>
      <g:country>US</g:country>
      <g:service>Standard</g:service>
      <g:price>${dollars(shippingCents)}</g:price>
    </g:shipping>
  </item>`;
}

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
  <title>Discontinued Club Current Products</title>
  <link>${publicRoot}</link>
  <description>Current products available for direct purchase from Discontinued Club.</description>
${catalog.map(itemMarkup).join('\n')}
</channel>
</rss>
`;

await writeFile(resolve(root, 'google-merchant-feed.xml'), feed);
console.log(`Generated Google Merchant Center feed with ${catalog.length} products.`);
