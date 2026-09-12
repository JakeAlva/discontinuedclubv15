import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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
const assetVersion = '46';

async function canonicalUrl(file) {
  const html = await readFile(file, 'utf8');
  if (/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) return null;
  return html.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || null;
}

async function sitemapUrls(files) {
  const urls = (await Promise.all(files.map(canonicalUrl))).filter(Boolean).sort();
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url.replace(/&/g, '&amp;')}</loc></url>`).join('\n')}
</urlset>
`;
}

const rootPages = rootFiles
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .filter((entry) => !entry.name.startsWith('product-') && !entry.name.startsWith('brand-') && !excludedPages.has(entry.name))
  .map((entry) => resolve(root, entry.name));
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
  writeFile(resolve(root, 'sitemap.xml'), await sitemapUrls(rootPages)),
  writeFile(resolve(root, 'sitemap-products.xml'), await sitemapUrls(productPages)),
  writeFile(resolve(root, 'sitemap-sold.xml'), await sitemapUrls(soldPages)),
  writeFile(resolve(root, 'sitemap-journal.xml'), await sitemapUrls(journalPages))
]);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of rootFiles) {
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
    html = html
      .replace(/assets\/style\.css\?v=[^"']+/g, `assets/style.css?v=${assetVersion}`)
      .replace(/assets\/catalog\.js\?v=[^"']+/g, `assets/catalog.js?v=${assetVersion}`)
      .replace(/assets\/app\.js\?v=[^"']+/g, `assets/app.js?v=${assetVersion}`);
    if (!html.includes('rel="icon"')) html = html.replace('</head>', `${faviconMarkup}\n</head>`);
    await writeFile(file, html);
  }));
}

await injectFavicon(output);

console.log(`Built static storefront in ${output}`);
