import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { soldItems, slugify } from './sold-data.mjs';

const root = '/Users/jetlifejake/Downloads/discontinuedclubv15-main';
const soldDir = path.join(root, 'sold');
const categoryInfo = {
  drinks: { label: 'Rare drinks', href: 'rare-drinks.html', copy: 'rare and discontinued drink' },
  apparel: { label: 'Sports & apparel', href: 'out-now.html?category=apparel', copy: 'sports and apparel' },
  collectibles: { label: 'Collectibles', href: 'out-now.html?category=collectibles', copy: 'collectible' },
  care: { label: 'Personal care', href: 'out-now.html?category=care', copy: 'discontinued personal care' },
  other: { label: 'Other finds', href: 'out-now.html', copy: 'hard-to-find' }
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const publicItems = soldItems.map((item) => ({
  id: item.id,
  category: item.category,
  name: item.name,
  price: item.price,
  image: item.imageUrl ? `${item.id}.webp` : null,
  slug: `${slugify(item.name)}-${item.id}`,
  availableAgain: Boolean(item.availableAgain)
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
    ? `https://discontinuedclub.com/assets/images/sold/branded/${item.id}.webp`
    : imageUrl;
  const description = `${item.name} was previously sold by Discontinued Club. View the archived listing and browse current ${category.copy} inventory.`;
  const availability = item.availableAgain ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const status = item.availableAgain ? 'Available again' : 'Previously sold';
  const media = item.image
    ? `<img src="assets/images/sold/branded/${item.id}.webp" alt="${escapeHtml(item.name)} previously sold by Discontinued Club" width="1200" height="1200">`
    : '<div class="sold-placeholder"><img src="assets/images/logo-mark-clean.png" alt=""><strong>Sold archive</strong><span>Original image unavailable</span></div>';
  const primaryHref = item.availableAgain ? `https://www.ebay.com/itm/${item.id}` : category.href;
  const primaryLabel = item.availableAgain ? 'View current eBay listing' : `Browse current ${category.label.toLowerCase()}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description,
    image: imageUrl,
    sku: item.id,
    brand: { '@type': 'Organization', name: 'Discontinued Club' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: item.price.replace('$', ''),
      availability,
      url: item.availableAgain ? `https://www.ebay.com/itm/${item.id}` : canonical,
      seller: { '@type': 'Organization', name: 'Discontinued Club' }
    }
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="../">
  <title>${escapeHtml(item.name)} | Discontinued Club Sold Archive</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:site_name" content="Discontinued Club">
  <meta property="og:type" content="product">
  <meta property="og:title" content="${escapeHtml(item.name)} | Sold Archive">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${displayImageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css?v=23">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body data-page="archive">
  <div id="site-header"></div>
  <main>
    <nav class="breadcrumb-band" aria-label="Breadcrumb"><div class="container breadcrumbs"><a href="index.html">Home</a><span>/</span><a href="sold-archive.html">Sold archive</a><span>/</span><span>${escapeHtml(item.name)}</span></div></nav>
    <section class="sold-product-section">
      <div class="container sold-product-layout">
        <div class="sold-product-media">${media}</div>
        <div class="sold-product-copy">
          <div class="sold-status${item.availableAgain ? ' available' : ''}">${status}</div>
          <div class="product-category">${category.label}</div>
          <h1>${escapeHtml(item.name)}</h1>
          <p class="sold-product-lead">This is a real product previously handled and sold by Discontinued Club. The record is preserved for collectors researching discontinued products, past availability, and identifying details.</p>
          <div class="sold-facts">
            <div><strong>Archive status</strong><span>${status}</span></div>
            <div><strong>Recorded price</strong><span>${escapeHtml(item.price)}</span></div>
            <div><strong>Department</strong><span>${category.label}</span></div>
            <div><strong>Original item ID</strong><span>${item.id}</span></div>
          </div>
          <div class="hero-actions"><a class="btn btn-dark" href="${primaryHref}"${item.availableAgain ? ' target="_blank" rel="noopener"' : ''}>${primaryLabel}</a><a class="btn btn-light" href="contact.html">Ask us to find one</a></div>
        </div>
      </div>
    </section>
    <section class="section section-muted"><div class="container archive-note"><div><div class="section-kicker">The Discontinued Club archive</div><h2>Sold does not mean forgotten.</h2></div><p>Past listings stay searchable as a reference for collectors and anyone trying to identify something that disappeared. Availability changes, so check the current shop or contact us about a specific product.</p><a class="text-link" href="sold-archive.html">Explore all previously sold products &rarr;</a></div></section>
  </main>
  <div id="site-footer"></div>
  <script src="assets/app.js?v=23"></script>
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
