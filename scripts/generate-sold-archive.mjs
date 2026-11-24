import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { soldItems, slugify } from './sold-data.mjs';
import { catalog } from '../lib/store-catalog.mjs';
import { browsableSoldItems, replacementListings } from '../lib/browse-catalog.mjs';

const root = process.cwd();
const soldDir = path.join(root, 'sold');
const categoryInfo = {
  drinks: { label: 'Rare drinks', href: 'rare-drinks.html', copy: 'rare and discontinued drink' },
  apparel: { label: 'Sports & apparel', href: 'out-now.html?category=apparel', copy: 'sports and apparel' },
  'kids-shoes': { label: "Designer kids' shoes", href: 'out-now.html?category=kids-shoes', copy: "designer kids' shoe" },
  collectibles: { label: 'Collectibles', href: 'out-now.html?category=collectibles', copy: 'collectible' },
  care: { label: 'Personal care', href: 'out-now.html?category=care', copy: 'discontinued personal care' },
  other: { label: 'Other finds', href: 'out-now.html', copy: 'hard-to-find' }
};
categoryInfo.home = categoryInfo.other;

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const browseIds = new Set(browsableSoldItems().map((item) => item.id));
const publicItems = soldItems.map((item) => ({
  id: item.id,
  category: item.category === 'other' ? 'home' : item.category,
  name: item.name,
  price: item.price,
  priceLabel: item.priceLabel,
  brand: item.brand,
  soldOut: item.soldOut,
  image: item.imageUrl ? `${item.id}.webp` : null,
  slug: `${slugify(item.name)}-${item.id}`,
  browsable: browseIds.has(item.id),
  availableAgain: catalog.some((active) => active.id === (replacementListings[item.id] || item.id))
}));

await mkdir(soldDir, { recursive: true });
await writeFile(
  path.join(root, 'assets/sold-catalog.js'),
  `window.DC_SOLD_CATALOG = ${JSON.stringify(publicItems, null, 2)};\n`
);

function productPage(item) {
  const category = categoryInfo[item.category];
  const canonical = `https://discontinuedclub.com/sold/${item.slug}.html`;
  const imageUrl = item.image
    ? `https://discontinuedclub.com/assets/images/sold/${item.image}`
    : 'https://discontinuedclub.com/assets/images/logo-mark-clean.png';
  const displayImageUrl = item.image
    ? `https://discontinuedclub.com/assets/images/sold/branded/${item.id}.webp?v=uniform-sold-20261124`
    : imageUrl;
  const description = `${item.name} at Discontinued Club. ${item.availableAgain ? 'See the current listing for availability.' : 'Currently out of stock. Request a personal email if we find more.'}`;
  const status = item.availableAgain ? 'View current listing' : 'Out of stock';
  const media = item.image
    ? `<img src="assets/images/sold/branded/${item.id}.webp?v=uniform-sold-20261124" alt="${escapeHtml(item.name)} previously sold by Discontinued Club" width="1200" height="1200">`
    : '<div class="sold-placeholder"><img src="assets/images/logo-mark-clean.png" alt=""><span>Original image unavailable</span></div>';
  const activeItem = catalog.find((active) => active.id === (replacementListings[item.id] || item.id));
  const primaryHref = activeItem ? `products/${activeItem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${activeItem.id}.html` : `contact.html?restock=${item.id}`;
  const primaryLabel = activeItem ? 'View current listing' : 'Notify me when back in stock';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description,
    image: imageUrl,
    sku: item.id,
    brand: { '@type': 'Organization', name: item.brand || 'Discontinued Club' }
  };
  // Recorded sale prices are historical, not current offers or restock quotes.
  schema.offers = { '@type': 'Offer', availability: 'https://schema.org/OutOfStock', url: canonical };
  if (activeItem) delete schema.offers;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="../">
  <title>${escapeHtml(item.name)} | ${status} | Discontinued Club</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:site_name" content="Discontinued Club">
  <meta property="og:type" content="product">
  <meta property="og:title" content="${escapeHtml(item.name)} | ${status}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${displayImageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css?v=38">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body data-page="shop">
  <div id="site-header"></div>
  <main>
    <nav class="breadcrumb-band" aria-label="Breadcrumb"><div class="container breadcrumbs"><a href="index.html">Home</a><span>/</span><a href="out-now.html">Shop</a><span>/</span><span>${escapeHtml(item.name)}</span></div></nav>
    <section class="sold-product-section">
      <div class="container sold-product-layout">
        <div class="sold-product-media">${media}</div>
        <div class="sold-product-copy">
          <div class="sold-status${item.availableAgain ? ' available' : ''}">${status}</div>
          <div class="product-category">${category.label}</div>
          <h1>${escapeHtml(item.name)}</h1>
          <p class="sold-product-lead">${activeItem ? 'We have a current listing for this product. Follow the link below for its latest price and availability.' : 'This product is currently unavailable. Leave a restock request and Jacob can email you personally if another one becomes available. A request is not a reservation or a promise that it will return.'}</p>
          <div class="sold-facts">
            <div><strong>Availability</strong><span>${status}</span></div>
            <div><strong>Restock timing</strong><span>No confirmed date</span></div>
            <div><strong>Department</strong><span>${category.label}</span></div>
            <div><strong>Original item ID</strong><span>${item.id}</span></div>
          </div>
          <div class="hero-actions"><a class="btn btn-dark" href="${primaryHref}">${primaryLabel}</a><a class="btn btn-light" href="${category.href}">Browse ${category.label.toLowerCase()}</a></div>
        </div>
      </div>
    </section>
    <section class="section section-muted"><div class="container archive-note"><div><div class="section-kicker">Still looking?</div><h2>Keep your favorites in reach.</h2></div><p>Photos show our previously listed item. If we find another, its condition, packaging and price may differ. We will share the new listing so you can decide before buying.</p><a class="text-link" href="out-now.html">Browse the full collection &rarr;</a></div></section>
  </main>
  <div id="site-footer"></div>
  <script src="assets/catalog.js?v=38"></script>
  <script src="assets/app.js?v=38"></script>
</body>
</html>
`;
}

await Promise.all(publicItems.map((item) => writeFile(
  path.join(soldDir, `${item.slug}.html`),
  productPage(item)
)));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://discontinuedclub.com/sold-archive.html</loc><priority>0.7</priority></url>
${publicItems.map((item) => `  <url><loc>https://discontinuedclub.com/sold/${item.slug}.html</loc><priority>0.5</priority></url>`).join('\n')}
</urlset>
`;

await writeFile(path.join(root, 'sitemap-sold.xml'), sitemap);
console.log(`Generated ${publicItems.length} sold product pages.`);
