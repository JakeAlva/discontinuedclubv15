import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog, directPriceCents, formatMoney, maxQuantity, parsePriceCents, shippingQuote, storeConfig } from '../lib/store-catalog.mjs';
import { productBrand, productCondition, productConditionLabel } from '../lib/product-metadata.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'products');
const publicRoot = 'https://discontinuedclub.com';
const directCheckoutEnabled = storeConfig.directCheckoutEnabled === true;
const directCheckoutDateLabel = storeConfig.directCheckoutDateLabel || 'coming soon';
const directCheckoutNotice = directCheckoutDateLabel.toLowerCase() === 'coming soon'
  ? 'Direct checkout coming soon'
  : `Direct checkout expected ${directCheckoutDateLabel}`;
const stripeBadge = '<a class="stripe-badge-link stripe-badge-product" href="https://stripe.com" target="_blank" rel="noopener noreferrer" aria-label="Payments powered by Stripe"><img class="stripe-badge" src="assets/images/powered-by-stripe.svg" alt="Powered by Stripe" width="150" height="34"></a>';
const categoryLabels = {
  drinks: 'Rare drinks',
  apparel: 'Sports & apparel',
  collectibles: 'Collectibles & cards',
  care: 'Personal care',
  home: 'Home & hobby',
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
const listingAssetVersion = (item) => item.id === '407134944288' ? '4pack-2' : '38';
const listingImagePath = (item, variant) => `assets/images/listings/${variant}/${item.id}.webp?v=${listingAssetVersion(item)}`;
const absoluteListingImage = (item, variant) => `${publicRoot}/${listingImagePath(item, variant)}`;

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

function relatedProductsMarkup(item) {
  const sameCategory = catalog.filter((candidate) => candidate.id !== item.id && candidate.category === item.category);
  const otherCategories = catalog.filter((candidate) => candidate.id !== item.id && candidate.category !== item.category);
  const related = [...sameCategory, ...otherCategories].slice(0, 4);

  return `<section class="product-related" aria-labelledby="related-products-title"><div class="container"><div class="product-related-head"><div><div class="section-kicker">More current inventory</div><h2 id="related-products-title">Keep looking.</h2></div><a class="text-link" href="out-now.html?category=${item.category}">Shop ${categoryLabels[item.category].toLowerCase()} &rarr;</a></div><div class="product-related-grid">${related.map((candidate) => `<article class="product-related-card"><a href="products/${slug(candidate)}.html"><div class="product-related-image"><img src="${listingImagePath(candidate, 'branded')}" alt="${escapeHtml(candidate.name)}" loading="lazy" width="1200" height="1200"></div><div class="product-related-copy"><span>${categoryLabels[candidate.category]}</span><h3>${escapeHtml(candidate.name)}</h3><div><strong>${formatMoney(directPriceCents(candidate))}</strong><b>View item &rarr;</b></div></div></a></article>`).join('')}</div></div></section>`;
}

function pageMarkup(item, images) {
  const directPrice = directPriceCents(item);
  const ebayPrice = parsePriceCents(item.price);
  const savings = Math.max(0, ebayPrice - directPrice);
  const quantity = maxQuantity(item);
  const freeShippingThreshold = Math.max(1, Number(storeConfig.freeShippingThresholdCents) || 10000);
  const condition = productCondition(item);
  const shipping = shippingQuote(directPrice, [{ item, quantity: 1 }]);
  const description = directCheckoutEnabled
    ? `${item.name}. ${item.detail}. Buy direct from Discontinued Club or use the matching eBay listing.`
    : `${item.name}. ${item.detail}. Available now through the matching Discontinued Club eBay listing. ${directCheckoutNotice}.`;
  const pricePanel = directCheckoutEnabled
    ? `<div class="current-price-panel"><span><small>Direct price</small><strong>${formatMoney(directPrice)}</strong></span><span><small>eBay price</small><s>${escapeHtml(item.price)}</s></span></div>
          <div class="product-savings">Save ${formatMoney(savings)} on the item price when buying direct</div>`
    : `<div class="current-price-panel"><span><small>Available on eBay</small><strong>${escapeHtml(item.price)}</strong></span><span><small>Expected direct price</small><strong>${formatMoney(directPrice)}</strong></span></div>
          <div class="product-savings">${directCheckoutNotice} &middot; save ${formatMoney(savings)}</div>`;
  const actions = directCheckoutEnabled
    ? `<button class="btn btn-acid purchase-button" type="button" data-add-to-cart="${item.id}" data-add-quantity-source="${item.id}"><span data-add-label>Add to cart</span><span class="purchase-arrow" aria-hidden="true">&rarr;</span></button><a class="btn btn-light" href="https://www.ebay.com/itm/${item.id}" target="_blank" rel="noopener">Buy on eBay</a>`
    : `<a class="btn btn-dark" href="https://www.ebay.com/itm/${item.id}" target="_blank" rel="noopener">Buy on eBay</a><a class="btn btn-light" href="out-now.html">Keep shopping</a>`;
  const quantityControl = quantity > 1
    ? `<div class="product-quantity-picker" data-product-quantity-picker data-product-id="${item.id}" data-max="${quantity}" data-price="${directPrice}" data-free-shipping-threshold="${freeShippingThreshold}"><span>Quantity</span><div class="product-quantity-control"><button type="button" data-product-quantity-decrease aria-label="Decrease quantity" disabled>&minus;</button><output data-product-quantity aria-live="polite">1</output><button type="button" data-product-quantity-increase aria-label="Increase quantity">+</button></div><small>${quantity} available</small></div>`
    : '<div class="product-quantity-single"><span>Quantity</span><strong>1</strong><small>One available</small></div>';
  const shippingNudge = directPrice >= freeShippingThreshold
    ? 'This item qualifies for free standard shipping.'
    : `${formatMoney(freeShippingThreshold - directPrice)} away from free standard shipping.`;
  const detailBand = directCheckoutEnabled
    ? `<div><strong>Secure direct checkout</strong><span>Payment details stay on a secure hosted checkout.</span>${stripeBadge}</div><div><strong>Weight-based shipping</strong><span>Shipping adjusts for heavier carts and becomes free at $100.</span></div><div><strong>Fast handling</strong><span>Orders before 12 PM Central are prepared for same-day carrier drop-off whenever possible.</span></div><div><strong>30-day return window</strong><span>Eligible items may be returned by mail under the posted return policy.</span></div>`
    : `<div><strong>Available today on eBay</strong><span>This item links to the matching Discontinued Club eBay listing.</span></div><div><strong>${directCheckoutNotice}</strong><span>Lower website pricing and a multi-item cart are planned for the direct-store launch.</span></div><div><strong>Fast handling</strong><span>Orders before 12 PM Central are prepared for same-day carrier drop-off whenever possible.</span></div>`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description,
    image: [absoluteListingImage(item, 'merchant')],
    sku: item.id,
    brand: { '@type': 'Brand', name: productBrand(item) },
    itemCondition: `https://schema.org/${condition === 'used' ? 'UsedCondition' : 'NewCondition'}`,
    category: categoryLabels[item.category],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: ((directCheckoutEnabled ? directPrice : ebayPrice) / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      url: productUrl(item),
      seller: { '@type': 'Organization', name: 'Discontinued Club' },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
        shippingRate: { '@type': 'MonetaryAmount', value: (shipping.amountCents / 100).toFixed(2), currency: 'USD' }
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnShippingFees'
      }
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
  <meta property="og:image" content="${absoluteListingImage(item, 'merchant')}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${absoluteListingImage(item, 'merchant')}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css?v=45">
  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
</head>
<body class="product-page" data-page="shop">
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
          <div class="product-purchase-panel">
            <div class="product-purchase-heading"><span>Buy direct</span><strong>Secure checkout</strong></div>
            ${pricePanel}
            <div class="product-order-note" data-product-order-note="${item.id}">${shippingNudge}</div>
            <div class="product-purchase-row">
              ${quantityControl}
              <div class="current-product-actions">${actions}</div>
            </div>
            <p class="product-action-feedback" data-product-action-feedback="${item.id}" role="status" aria-live="polite">In-stock items are reserved when checkout is completed.</p>
          </div>
          <div class="current-product-notes">
            <div class="current-product-note"><strong>Condition</strong><span>${productConditionLabel(item)}</span></div>
            <div class="current-product-note"><strong>Available</strong><span>${quantity} ${quantity === 1 ? 'unit' : 'units'} currently listed</span></div>
            <div class="current-product-note"><strong>Returns</strong><span><a href="shipping-returns.html#returns">30-day window on eligible items</a></span></div>
          </div>
          <div class="product-sku">Item ID ${item.id}</div>
        </div>
      </div>
    </section>
    <section class="product-detail-band"><div class="container product-detail-grid">${detailBand}</div></section>
    ${relatedProductsMarkup(item)}
  </main>
  <div id="site-footer"></div>
  ${directCheckoutEnabled ? `<div class="mobile-product-bar" aria-label="Quick purchase"><div><small>Direct price</small><strong>${formatMoney(directPrice)}</strong></div><button class="btn btn-acid purchase-button" type="button" data-add-to-cart="${item.id}" data-add-quantity-source="${item.id}"><span data-add-label>Add to cart</span><span class="purchase-arrow" aria-hidden="true">&rarr;</span></button></div>` : ''}
  <script src="assets/catalog.js?v=45"></script>
  <script src="assets/app.js?v=45"></script>
</body>
</html>
`;
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const item of catalog) {
  const images = [{
    src: listingImagePath(item, 'branded'),
    alt: `${item.name} - Discontinued Club listing view`,
    label: 'listing view'
  }];
  if (jerseyGalleryIds.has(item.id)) {
    images.push({
      src: listingImagePath(item, 'merchant'),
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
