import { readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PAGE_SIZE, statuses, escapeHtml, selectReports, cardMarkup, pageFile, paginationMarkup, resultLabel } from '../assets/journal-library.mjs';

export async function generateJournalLibrary(root, reports) {
  const index = reports.map((report) => ({
    slug: report.slug, title: report.title, product: report.product, brand: report.brand,
    ...(report.brands ? { brands: report.brands } : {}),
    statusKey: report.statusKey, statusLabel: report.statusLabel, image: report.image,
    cardCopy: report.cardCopy, readTime: report.readTime, date: report.checkedDate || '2026-09-11'
  }));
  const brands = [...new Set(index.flatMap((report) => report.brands || [report.brand]))].sort();
  const pages = Math.ceil(index.length / PAGE_SIZE);
  const latest = index.map((report) => report.date).sort().at(-1);
  const e = escapeHtml;
  const options = (items) => items.map(([value, label]) => `<option value="${e(value)}">${e(label)}</option>`).join('');
  for (const file of await readdir(root)) {
    if (/^blog-page-\d+\.html$/.test(file) && Number(file.match(/\d+/)[0]) > pages) await rm(resolve(root, file));
  }
  await writeFile(resolve(root, 'assets/journal-index.json'), JSON.stringify(index));
  for (let page = 1; page <= pages; page++) {
    const state = { q: '', brand: '', status: '', sort: 'newest', page };
    const result = selectReports(index, state);
    const canonical = `https://discontinuedclub.com/${pageFile(page)}`;
    const title = `Product News, New Releases & Discontinued Favorites${page > 1 ? ` - Page ${page}` : ''} | Discontinued Club`;
    const description = `Explore ${reports.length} sourced U.S. product stories: new drinks and snacks, limited releases, discontinued favorites and rumor checks. Search by product, brand or status.${page > 1 ? ` Page ${page}.` : ''}`;
    const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'The Discontinued Journal', url: canonical, mainEntity: { '@type': 'ItemList', itemListElement: result.items.map((report, i) => ({ '@type': 'ListItem', position: (page - 1) * PAGE_SIZE + i + 1, url: `https://discontinuedclub.com/journal/${report.slug}.html`, name: report.title })) } }).replace(/</g, '\\u003c');
    await writeFile(resolve(root, pageFile(page)), `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="/">
  <title>${e(title)}</title><meta name="description" content="${e(description)}">
  <link rel="canonical" href="${canonical}"><meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:site_name" content="Discontinued Club"><meta property="og:type" content="website"><meta property="og:title" content="The Discontinued Journal"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://discontinuedclub.com/assets/images/hero-journal-v4.webp"><meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css?v=59"><script type="application/ld+json">${schema}</script>
</head><body data-page="blog"><div id="site-header"></div>
<main class="journal-library container" data-journal-library data-index="assets/journal-index.json?v=59">
  <header class="journal-masthead"><div class="journal-edition"><span>Independent reporting / United States market</span><span>${reports.length} articles &middot; Updated <time datetime="${latest}">${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${latest}T00:00:00Z`))}</time></span></div><h1>The Discontinued Journal<span>.</span></h1><p>What is new. What is gone. What is coming back.</p></header>
  <nav class="journal-library-topics" aria-label="Topic guides"><span>The indexes</span><a href="discontinued-energy-drink-flavors-2026.html">2026 flavor guide</a><a href="discontinued-monster-energy-flavors.html">Monster Energy</a><a href="discontinued-red-bull-flavors.html">Red Bull Editions</a></nav>
  <form class="journal-search-form" role="search" aria-label="Search journal" action="blog.html" method="get"><fieldset disabled><legend class="sr-only">Find an article</legend><label class="journal-search-field">Search articles<input type="search" name="q" placeholder="Product, brand, or keyword" maxlength="160" autocomplete="off" aria-controls="journal-results"></label><label>Brand<select name="brand"><option value="">All brands</option>${options(brands.map((brand) => [brand, brand]))}</select></label><label>Status<select name="status"><option value="">All statuses</option>${options(statuses)}</select></label><label>Sort by<select name="sort"><option value="newest">Newest first</option><option value="az">Product A-Z</option></select></label><button class="sr-only" type="submit">Search articles</button></fieldset></form>
  <noscript><p>Search requires JavaScript. All articles are available through the numbered pages below.</p></noscript><p data-journal-error hidden>Search is temporarily unavailable. You can still browse every article using the page links below.</p>
  <div class="journal-results-heading"><p id="journal-result-count" data-journal-count role="status" aria-live="polite" aria-atomic="true" tabindex="-1">${resultLabel(result)}</p><button type="button" data-journal-reset hidden>Clear filters</button></div>
  <section class="journal-results" id="journal-results" data-journal-results aria-labelledby="journal-result-count">${result.items.map(cardMarkup).join('')}</section>
  <nav class="journal-pagination" data-journal-pagination aria-label="Article pages"${pages <= 1 ? ' hidden' : ''}>${paginationMarkup(result, state)}</nav>
  <footer class="journal-library-notes"><details><summary>Our reporting standard</summary><p>U.S. availability comes first. Every article has a checked date, linked sources, and an evidence label. Discontinuation watch reports remain unconfirmed until stronger evidence supports a conclusion. A retired package is not automatically a retired flavor.</p><p>Manufacturer announcements and current U.S. catalogs are checked against dated reporting. We distinguish official confirmation from reported distribution changes, local shortages, and resale inventory.</p></details><a href="contact.html">Send a tip or correction &rarr;</a></footer>
</main><div id="site-footer"></div><script src="assets/catalog.js?v=59"></script><script src="assets/app.js?v=59"></script><script type="module" src="assets/journal-library.mjs?v=59"></script></body></html>`);
  }
}
