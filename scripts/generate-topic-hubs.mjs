import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { reports } from './journal-data.mjs';
import { catalog } from '../lib/store-catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const publicRoot = 'https://discontinuedclub.com';
const productSlug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}.html`;
const currentProductHrefs = new Set(catalog.map((item) => `products/${productSlug(item)}`));

const hubs = [
  {
    slug: 'discontinued-monster-energy-flavors',
    theme: 'monster',
    eyebrow: 'Monster Energy status desk',
    title: 'Discontinued Monster Energy flavors in the U.S.',
    seoTitle: 'Discontinued Monster Energy Flavors: 2026 U.S. List',
    description: 'A researched 2026 U.S. list of discontinued Monster Energy flavors, retired versions, and current discontinuation rumors with evidence for every status.',
    lede: 'A current, evidence-graded guide to Monster flavors that left U.S. distribution, changed form, or are only rumored to be next.',
    filter: (report) => report.brand === 'Monster Energy',
    introHeading: 'The clearest Monster discontinuation list we can support right now.',
    intro: [
      'Monster has a large portfolio, frequent line extensions, and product pages that can remain online after normal distribution changes. That makes a simple list unreliable unless every flavor is checked against current U.S. catalogs, retailer resets, and dated reporting. This page separates supported discontinuations from package or formula changes and from claims that are still only rumors.',
      'The confirmed U.S. departures in this index include Ultra Watermelon, Reserve Peaches N Creme, and Ultra Red. Reserve Orange Dreamsicle needs a more precise answer: the Reserve version ended, while Monster introduced a new standard Orange Dreamsicle. Ultra Fantasy Ruby Red, Rehab Green Tea, and Rio Punch remain on the watch list because a specific report names an October date but Monster still presents them publicly.',
      'Reserve White Pineapple now has a separate report covering its apparent U.S. lineup exit, official overseas listings, and resale availability. Its evidence grade is lineup-based: no dated manufacturer discontinuation notice was located.',
      'Aussie Style Lemonade was reported as a 2025 U.S. discontinuation and is absent from the current American catalog. Our September 16, 2026 review also checks its continuing official listings in Australia and Great Britain. This is a current status review of an earlier departure, not a newly announced 2026 cut.',
      'Our September 21 report checks Rehab Strawberry Lemonade, another reported 2025 departure. It distinguishes the retired red Rehab can from the separate Juice Strawberry Lemonade introduced in 2026, and explains the limits of a surviving regional product page.'
    ],
    faq: [
      ['Which Monster Energy flavors are confirmed discontinued in the U.S. in this guide?', 'Ultra Watermelon, Reserve Peaches N Creme, and Ultra Red are classified as discontinued in normal U.S. distribution based on the evidence reviewed for their individual reports.'],
      ['Is Monster Reserve White Pineapple discontinued?', 'It appears to have left the U.S. range, while remaining officially listed in Spain, Portugal, and South Africa. The report identifies that conclusion as lineup-based rather than an authenticated manufacturer notice.'],
      ['Are Ruby Red, Rehab Green Tea, and Rio Punch discontinued?', 'Not yet in this guide. They are labeled rumored, not confirmed, because public Monster pages remain active and no official public announcement has been located.'],
      ['Is Orange Dreamsicle discontinued?', 'The older Monster Reserve Orange Dreamsicle version is discontinued, but a newer standard Monster Orange Dreamsicle continues the flavor concept.']
    ]
  },
  {
    slug: 'discontinued-red-bull-flavors',
    theme: 'redbull',
    eyebrow: 'Red Bull editions desk',
    title: 'Discontinued Red Bull flavors in the U.S.',
    seoTitle: 'Discontinued Red Bull Flavors: 2026 U.S. Editions List',
    description: 'See which Red Bull flavors and Sugarfree formats left the United States, plus the 2026 Fuji Apple return and why its Sugarfree version did not come back.',
    lede: 'The 2026 U.S. Red Bull changes, explained edition by edition so international cans, seasonal stock, and regular-sugar versions do not muddy the answer.',
    filter: (report) => report.brand === 'Red Bull',
    introHeading: 'Four 2026 cuts, plus a permanent return without its U.S. Sugarfree format.',
    intro: [
      'The original Blue Edition Blueberry and Green Edition Curuba Elderflower are discontinued from normal U.S. distribution. Red Bull also ended two specific sugarfree variants: Red Edition Watermelon Sugarfree and Amber Edition Strawberry Apricot Sugarfree. Their regular-sugar counterparts are separate products, so seeing a current red or amber can does not reverse the sugarfree discontinuation.',
      'Fuji Apple & Ginger creates the opposite kind of confusion. The flavor returned permanently in August 2026 as Apple Edition, but Red Bull says the current U.S. product is only offered with sugar. The 2025 Winter Edition Sugarfree was real U.S. inventory, and a Sugarfree Apple Edition remains current in some foreign markets, but neither makes it part of the permanent U.S. lineup.',
      'Red Bull manages its Editions by country. A flavor can still be produced overseas after it disappears from the American range, and imported cans can appear in U.S. search results. This index uses the current United States lineup as its primary market test, then checks specific 2026 reporting and remaining inventory context in each full article.'
    ],
    faq: [
      ['Is Red Bull Blueberry discontinued?', 'Yes in the United States. Current foreign-market Blueberry cans do not make it a current U.S. product.'],
      ['Is Curuba Elderflower discontinued?', 'Yes in normal U.S. distribution. Remaining U.S. cans and imported stock can still be sold after the range change.'],
      ['Are regular Watermelon and Strawberry Apricot also discontinued?', 'The 2026 reports here concern the Sugarfree Watermelon and Sugarfree Strawberry Apricot variants. Regular-sugar Editions are separate products and must be checked independently.'],
      ['Is Fuji Apple & Ginger discontinued?', 'No. The flavor returned permanently in the United States as Apple Edition on August 31, 2026. The U.S. Sugarfree version from the 2025 Winter Edition did not return with it.']
    ]
  },
  {
    slug: 'discontinued-energy-drink-flavors-2026',
    theme: 'energy',
    eyebrow: '2026 U.S. flavor index',
    title: 'Discontinued energy drink flavors in 2026.',
    seoTitle: 'Discontinued Energy Drink Flavors 2026: U.S. Status Index',
    description: 'A researched U.S. index of 2026 discontinued energy drink flavors and credible rumors from Monster, Red Bull, Alani Nu, CELSIUS, and more.',
    lede: 'One place to check confirmed U.S. flavor exits, retired versions, and credible rumors without treating every empty shelf as proof.',
    filter: (report) => ['Monster Energy', 'Red Bull', 'Alani Nu', 'CELSIUS'].includes(report.brand),
    introHeading: 'A cross-brand U.S. index built for the question shoppers actually ask.',
    intro: [
      'A flavor can vanish for several reasons: a national discontinuation, a regional distribution change, a limited release ending, a reformulation, or a package redesign. Search results often collapse those situations into the same answer. This index keeps the labels separate and links every conclusion to a full report with dated sources and a plain-English evidence grade.',
      'The current 2026 index covers confirmed or distribution-supported exits from Red Bull, Monster Energy, Alani Nu, and CELSIUS, plus a Monster format change and three active rumor-watch reports. The list grows in researched batches. It is not padded with unsourced social posts, and a flavor is not called discontinued simply because one retailer is out of stock.'
    ],
    faq: [
      ['What does discontinued mean on this site?', 'It means the exact flavor or version is no longer in normal United States marketing and distribution. Foreign availability and leftover inventory are documented separately.'],
      ['Does an old product page prove a flavor is current?', 'No. Brand and retailer pages can remain online after distribution ends, so current catalogs and dated distribution evidence are weighed together.'],
      ['Why are rumors included?', 'People search before brands make announcements. Rumors are useful when clearly labeled, sourced, and kept separate from confirmed discontinuations.']
    ]
  }
];

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

function reportCard(report) {
  const shop = report.shop && currentProductHrefs.has(report.shop.href)
    ? `<a class="topic-shop-link" href="${report.shop.href}">Shop the matching product</a>`
    : '';
  return `<article class="topic-report-card"><a class="topic-report-media" href="journal/${report.slug}.html"><img src="${report.image}" alt="${escapeHtml(report.imageAlt)}" width="1200" height="1200" style="aspect-ratio: 1 / 1" loading="lazy"></a><div class="topic-report-copy"><div class="journal-card-meta"><span class="journal-status status-${report.statusKey}">${report.statusLabel}</span><span>${report.brand}</span></div><h3><a href="journal/${report.slug}.html">${escapeHtml(report.title)}</a></h3><p>${escapeHtml(report.cardCopy)}</p><div class="topic-report-links"><a class="text-link" href="journal/${report.slug}.html">Read the evidence &rarr;</a>${shop}</div></div></article>`;
}

function reportGroup(title, copy, group) {
  if (!group.length) return '';
  return `<section class="section topic-report-section"><div class="container"><div class="section-head"><div><div class="section-kicker">Evidence index</div><div class="section-title">${title}</div></div><div class="section-copy">${copy}</div></div><div class="topic-report-grid">${group.map(reportCard).join('')}</div></div></section>`;
}

function hubMarkup(hub) {
  const selected = reports.filter(hub.filter);
  const checkedDate = selected.reduce((latest, report) => report.checkedDate > latest ? report.checkedDate : latest, '2026-09-12');
  const checkedLabel = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${checkedDate}T00:00:00Z`));
  const confirmed = selected.filter((report) => report.statusKey === 'discontinued');
  const watch = selected.filter((report) => report.statusKey === 'rumor');
  const context = selected.filter((report) => ['format', 'current'].includes(report.statusKey));
  const artwork = selected.slice(0, 3).map((report, index) => `<img class="topic-can topic-can-${index + 1}" src="${report.image}" alt="" width="1200" height="1200" ${index ? 'loading="lazy"' : ''}>`).join('');
  const url = `${publicRoot}/${hub.slug}.html`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: hub.title,
    description: hub.description,
    url,
    dateModified: checkedDate,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: selected.length,
      itemListElement: selected.map((report, index) => ({ '@type': 'ListItem', position: index + 1, url: `${publicRoot}/journal/${report.slug}.html`, name: report.title }))
    }
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: hub.faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } }))
  };
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${hub.seoTitle}</title>
  <meta name="description" content="${hub.description}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:site_name" content="Discontinued Club">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${hub.seoTitle}">
  <meta property="og:description" content="${hub.description}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${publicRoot}/${selected[0].image}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css?v=44">
  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema).replace(/</g, '\\u003c')}</script>
</head>
<body data-page="blog">
  <div id="site-header"></div>
  <main>
    <nav class="breadcrumbs container" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="blog.html">Journal</a><span>/</span><span>${escapeHtml(hub.title)}</span></nav>
    <section class="topic-hero topic-hero-${hub.theme}"><div class="container topic-hero-grid"><div class="topic-hero-copy"><div class="eyebrow">${hub.eyebrow}</div><h1>${hub.title}</h1><p>${hub.lede}</p><div class="hero-actions"><a class="btn btn-dark" href="#reports">Browse the status reports</a><a class="btn btn-light" href="rare-drinks.html">Shop rare drinks</a></div></div><div class="topic-hero-art" aria-hidden="true">${artwork}<span>${selected.length} researched reports</span></div></div></section>
    <section class="journal-desk-band"><div class="container journal-desk-grid"><div><span>Market covered</span><strong>United States</strong></div><div><span>Reports indexed</span><strong>${selected.length} articles</strong></div><div><span>Index reviewed</span><strong>${checkedLabel}</strong></div><div><span>Rule</span><strong>Rumors stay separate</strong></div></div></section>
    <section class="section topic-intro" id="reports"><div class="container topic-intro-grid"><div><div class="section-kicker">Current answer</div><h2>${hub.introHeading}</h2></div><div class="topic-intro-copy">${hub.intro.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div></div></section>
${reportGroup('Confirmed U.S. discontinuations', 'These products have evidence supporting an end to normal U.S. marketing or distribution. Each article explains the evidence and the limits of the conclusion.', confirmed)}
${reportGroup('Retired versions and important distinctions', 'A discontinued package, sub-line, or formula does not always mean the broader flavor name disappeared. These reports identify exactly what changed.', context)}
${reportGroup('Rumored next, not confirmed', 'These claims are specific enough to investigate but do not yet meet the standard for a confirmed U.S. discontinuation.', watch)}
    <section class="section topic-method"><div class="container topic-method-grid"><div class="topic-method-copy"><div class="section-kicker">How this index works</div><h2>Current U.S. distribution decides the label.</h2><p>Discontinued Club checks official U.S. product catalogs first, then looks for dated brand statements, distributor notices, retailer resets, and broad changes in availability. A single empty shelf, a marketplace listing, or an old product page is not enough by itself.</p><p>International production is still useful context. It can explain why a flavor appears in search results or can be imported after American distribution ends. For this index, however, a product that is no longer sold through normal U.S. channels is treated as discontinued in the United States.</p><p>Remaining inventory does not reverse a discontinuation. Retailers and collectors can sell sealed stock long after a product leaves production. Product pages linked from these reports show the exact item offered by Discontinued Club rather than a generic replacement photo.</p></div><aside class="topic-checklist"><strong>Before trusting a status claim</strong><span>Check the exact flavor and sub-line.</span><span>Separate U.S. and foreign availability.</span><span>Look for a dated evidence review.</span><span>Do not confuse old stock with current production.</span></aside></div></section>
    <section class="section topic-faq"><div class="container"><div class="section-head"><div><div class="section-kicker">Quick answers</div><div class="section-title">Questions this index settles</div></div><a class="text-link" href="blog.html">Open the full journal &rarr;</a></div><div class="topic-faq-grid">${hub.faq.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join('')}</div></div></section>
  </main>
  <div id="site-footer"></div>
  <script src="assets/catalog.js?v=44"></script>
  <script src="assets/app.js?v=44"></script>
</body>
</html>
`;
}

await Promise.all(hubs.map((hub) => writeFile(resolve(root, `${hub.slug}.html`), hubMarkup(hub))));
console.log(`Generated ${hubs.length} discontinued-flavor topic hubs.`);
