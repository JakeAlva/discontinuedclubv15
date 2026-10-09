import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog } from '../lib/store-catalog.mjs';
import { renderListingCounts } from '../lib/catalog-file.mjs';
import { renderStaticCatalogs } from './static-catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
const rootExtensions = ['.html', '.xml'];
const excludedPages = new Set([
  'upcoming.html',
  'signup.html',
  'signup-success.html',
  'join-club.html',
  'join-club-success.html'
]);
const rootFiles = await readdir(root, { withFileTypes: true });
const faviconMarkup = '  <link rel="icon" type="image/png" sizes="96x96" href="/favicon.png">\n  <link rel="apple-touch-icon" href="/assets/images/logo-mark-clean.png">';
const assetVersion = '90';

async function canonicalUrl(file) {
  const html = await readFile(file, 'utf8');
  if (/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) return null;
  return html.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || null;
}

async function sitemapUrls(files) {
  const urls = [...new Set((await Promise.all(files.map(canonicalUrl))).filter(Boolean))].sort();
  const modified = new Map();
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const url = await canonicalUrl(file);
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const data = JSON.parse(match[1]);
      for (const entity of data['@graph'] || [data]) {
        if (['Article', 'CollectionPage'].includes(entity['@type']) && /^\d{4}-\d{2}-\d{2}$/.test(entity.dateModified || '')) modified.set(url, entity.dateModified);
      }
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url.replace(/&/g, '&amp;')}</loc>${modified.has(url) ? `<lastmod>${modified.get(url)}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
}

function sitemapIndex(names) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${names.map((name) => `  <sitemap><loc>https://discontinuedclub.com/${name}</loc></sitemap>`).join('\n')}
</sitemapindex>
`;
}

const rootPages = rootFiles
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .filter((entry) => !entry.name.startsWith('product-') && !entry.name.startsWith('brand-') && !excludedPages.has(entry.name))
  .map((entry) => resolve(root, entry.name));
for (const file of rootPages) {
  const html = await readFile(file, 'utf8');
  const updated = renderListingCounts(html, catalog);
  if (updated !== html) await writeFile(file, updated);
}
const productPages = (await readdir(resolve(root, 'products'), { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => resolve(root, 'products', entry.name));
const soldPages = (await readdir(resolve(root, 'sold'), { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => resolve(root, 'sold', entry.name));
const journalPages = (await readdir(resolve(root, 'journal'), { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => resolve(root, 'journal', entry.name));

await Promise.all([
  writeFile(resolve(root, 'sitemap.xml'), sitemapIndex(['sitemap-pages.xml', 'sitemap-products.xml', 'sitemap-journal.xml', 'sitemap-sold.xml'])),
  writeFile(resolve(root, 'sitemap-pages.xml'), await sitemapUrls(rootPages)),
  writeFile(resolve(root, 'sitemap-products.xml'), await sitemapUrls(productPages)),
  writeFile(resolve(root, 'sitemap-sold.xml'), await sitemapUrls(soldPages)),
  writeFile(resolve(root, 'sitemap-journal.xml'), await sitemapUrls(journalPages))
]);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const publishRootFiles = await readdir(root, { withFileTypes: true });
for (const entry of publishRootFiles) {
  if (!entry.isFile()) continue;
  const retiredCatalogPage = entry.name.startsWith('product-') || entry.name.startsWith('brand-');
  if (retiredCatalogPage || excludedPages.has(entry.name)) continue;
  if (entry.name === 'robots.txt' || entry.name === '_redirects' || entry.name === 'favicon.png' || rootExtensions.some((extension) => entry.name.endsWith(extension))) {
    await cp(resolve(root, entry.name), resolve(output, entry.name));
  }
}

for (const directory of ['assets', 'products', 'sold', 'journal']) {
  await cp(resolve(root, directory), resolve(output, directory), { recursive: true });
}

async function injectFavicon(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) return injectFavicon(file);
    if (!entry.isFile() || !entry.name.endsWith('.html')) return;
    let html = await readFile(file, 'utf8');
    html = await renderStaticCatalogs(html, root);
    html = html
      .replace(/assets\/style\.css\?v=[^"']+/g, `assets/style.css?v=${assetVersion}`)
      .replace(/assets\/catalog\.js\?v=[^"']+/g, `assets/catalog.js?v=${assetVersion}`)
      .replace(/assets\/sold-catalog\.js\?v=[^"']+/g, `assets/sold-catalog.js?v=${assetVersion}`)
      .replace(/assets\/app\.js\?v=[^"']+/g, `assets/app.js?v=${assetVersion}`)
      .replace(/assets\/journal-library\.mjs\?v=[^"']+/g, `assets/journal-library.mjs?v=${assetVersion}`)
      .replace(/assets\/journal-index\.json\?v=[^"']+/g, `assets/journal-index.json?v=${assetVersion}`);
    if (!html.includes('rel="icon"')) html = html.replace('</head>', `${faviconMarkup}\n</head>`);
    await writeFile(file, html);
  }));
}

await injectFavicon(output);

console.log(`Built static storefront in ${output}`);
