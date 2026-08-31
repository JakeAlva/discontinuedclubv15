import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog, directPriceCents, formatMoney, maxQuantity, parsePriceCents } from '../lib/store-catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'products');
const publicRoot = 'https://discontinuedclub.com';
const categoryLabels = {
  drinks: 'Rare drinks',
  apparel: 'Sports & apparel',
  collectibles: 'Collectibles & cards',
  care: 'Personal care',
  other: 'Other finds'
};
const jerseyGalleryIds = new Set([
  '407064120905',
  '407063808795',
  '407063633707',
  '407063650804',
  '407063463950',
  '407063539708',
  '407117217273',
  '407064096234',
  '407086613910'
]);

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const slug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}`;
const productUrl = (item) => `${publicRoot}/products/${slug(item)}.html`;

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function galleryMarkup(item, images) {
  const first = images[0];
  const thumbnails = images.length > 1
    ? `<div class="current-gallery-thumbs" aria-label="Product photos">${images.map((image, index) => `<button class="current-gallery-thumb${index === 0 ? ' active' : ''}" type="button" data-product-gallery-src="${image.src}" data-product-gallery-alt="${escapeHtml(image.alt)}" aria-label="Show ${escapeHtml(image.label)}"><img src="${image.src}" alt="" width="1200" height="1200"></button>`).join('')}</div>`
    : '';
  return `<div class="current-product-gallery"><div class="current-gallery-main"><img src="${first.src}" alt="${escapeHtml(first.alt)}" width="1200" height="1200" data-product-main-image></div>${thumbnails}</div>`;
}

function pageMarkup(item, images) {
  const directPrice = directPriceCents(item);
  const ebayPrice = parsePriceCents(item.price);
  const savings = Math.max(0, ebayPrice - directPrice);
  const quantity = maxQuantity(item);
  const description = `${item.name}. ${item.detail}. Buy direct from Discontinued Club or use the matching eBay listing.`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description,
    image: [`${publicRoot}/assets/images/listings/merchant/${item.id}.webp`],
    sku: item.id,
    category: categoryLabels[item.category],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: (directPrice / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      url: productUrl(item),
      seller: { '@type': 'Organization', name: 'Discontinued Club' }
    }
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="../">
  <title>${escapeHtml(item.name)} | Discontinued Club</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${productUrl(item)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:site_name" content="Discontinued Club">
  <meta property="og:type" content="product">
  <meta property="og:title" content="${escapeHtml(item.name)} | Discontinued Club">
  <meta property="og:description" content="${escapeHtml(item.detail)}">
  <meta property="og:url" content="${productUrl(item)}">
  <meta property="og:image" content="${publicRoot}/assets/images/listings/branded/${item.id}.webp">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css?v=32">
  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
</head>
<body data-page="shop">
  <div id="site-header"></div>
  <main>
    <nav class="breadcrumb-band" aria-label="Breadcrumb"><div class="container breadcrumbs"><a href="index.html">Home</a><span>/</span><a href="out-now.html">Shop</a><span>/</span><a href="out-now.html?category=${item.category}">${categoryLabels[item.category]}</a><span>/</span><span>${escapeHtml(item.name)}</span></div></nav>
    <section class="current-product-section">
      <div class="container current-product-layout">
        ${galleryMarkup(item, images)}
        <div class="current-product-copy">
          <div class="sold-status available">${quantity > 1 ? `${quantity} available` : 'Last one'}</div>
          <div class="product-category">${categoryLabels[item.category]}</div>
          <h1>${escapeHtml(item.name)}</h1>
          <p class="current-product-lead">${escapeHtml(item.detail)}.</p>
          <div class="current-price-panel"><span><small>Direct price</small><strong>${formatMoney(directPrice)}</strong></span><span><small>eBay price</small><s>${escapeHtml(item.price)}</s></span></div>
          <div class="product-savings">Save ${formatMoney(savings)} on the item price when buying direct</div>
          <div class="current-product-actions"><button class="btn btn-dark" type="button" data-add-to-cart="${item.id}">Add to cart</button><a class="btn btn-light" href="https://www.ebay.com/itm/${item.id}" target="_blank" rel="noopener">Buy on eBay</a></div>
          <div class="current-product-notes">
            <div class="current-product-note"><strong>Condition</strong><span>${escapeHtml(item.detail)}</span></div>
            <div class="current-product-note"><strong>Available</strong><span>${quantity} ${quantity === 1 ? 'unit' : 'units'} currently listed</span></div>
            <div class="current-product-note"><strong>Item ID</strong><span>${item.id}</span></div>
          </div>
        </div>
      </div>
    </section>
    <section class="product-detail-band"><div class="container product-detail-grid"><div><strong>Secure direct checkout</strong><span>Payment details are entered on Stripe-hosted Checkout.</span></div><div><strong>Weight-based shipping</strong><span>Shipping adjusts for heavier carts and becomes free at $100.</span></div><div><strong>Fast handling</strong><span>Orders before 12 PM Central are prepared for same-day carrier drop-off whenever possible.</span></div></div></section>
  </main>
  <div id="site-footer"></div>
  <script src="assets/catalog.js?v=32"></script>
  <script src="assets/app.js?v=32"></script>
</body>
</html>
`;
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const item of catalog) {
  const images = [{
    src: `assets/images/listings/branded/${item.id}.webp`,
    alt: `${item.name} - Discontinued Club listing view`,
    label: 'listing view'
  }];
  if (jerseyGalleryIds.has(item.id)) {
    images.push({
      src: `assets/images/listings/merchant/${item.id}.webp`,
      alt: `${item.name} actual front photo`,
      label: 'actual front photo'
    });
    const backPath = resolve(root, `assets/images/listings/backs/${item.id}.webp`);
    if (await fileExists(backPath)) {
      images.push({
        src: `assets/images/listings/backs/${item.id}.webp`,
        alt: `${item.name} actual back photo`,
        label: 'actual back photo'
      });
    }
  }
  await writeFile(resolve(output, `${slug(item)}.html`), pageMarkup(item, images));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${catalog.map((item) => `  <url><loc>${productUrl(item)}</loc><priority>0.8</priority></url>`).join('\n')}
</urlset>
`;
await writeFile(resolve(root, 'sitemap-products.xml'), sitemap);

console.log(`Generated ${catalog.length} current product pages and sitemap-products.xml.`);
