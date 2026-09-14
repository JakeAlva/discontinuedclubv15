import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { reports } from './journal-data.mjs';
import { catalog } from '../lib/store-catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const journalDirectory = resolve(root, 'journal');
const defaultCheckedDate = '2026-09-11';
const reportCheckedDate = (report) => report.checkedDate || defaultCheckedDate;
const checkedLabelFor = (report) => new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
}).format(new Date(`${reportCheckedDate(report)}T00:00:00Z`));
const latestCheckedReport = reports.reduce((latest, report) => (
  reportCheckedDate(report) > reportCheckedDate(latest) ? report : latest
));
const productSlug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}.html`;
const currentProductHrefs = new Set(catalog.map((item) => `products/${productSlug(item)}`));

function articleUrl(report) {
  return `https://discontinuedclub.com/journal/${report.slug}.html`;
}

function imageUrl(report) {
  return `https://discontinuedclub.com/${report.image}`;
}

function sourceList(report) {
  return report.sources.map((source) => `<li><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.label}</a>${source.note ? `, ${source.note}` : ''}.</li>`).join('');
}

function faqMarkup(report) {
  return report.faq.map((item, index) => `<details${index === 0 ? ' open' : ''}><summary>${item.question}</summary><p>${item.answer}</p></details>`).join('\n            ');
}

function schemaMarkup(report) {
  const checkedDate = reportCheckedDate(report);
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: report.title,
        description: report.description,
        datePublished: checkedDate,
        dateModified: report.modifiedDate || checkedDate,
        mainEntityOfPage: articleUrl(report),
        image: imageUrl(report),
        author: { '@type': 'Organization', name: 'Discontinued Club Research', url: 'https://discontinuedclub.com/about.html' },
        publisher: { '@type': 'Organization', name: 'Discontinued Club', logo: { '@type': 'ImageObject', url: 'https://discontinuedclub.com/assets/images/logo-mark-clean.png' } },
        articleSection: report.lane,
        about: { '@type': 'Thing', name: report.product }
      },
      {
        '@type': 'FAQPage',
        mainEntity: report.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer.replace(/<[^>]+>/g, '') }
        }))
      }
    ]
  }).replace(/</g, '\\u003c');
}

function statusExplanation(report) {
  if (report.statusParagraphs) return report.statusParagraphs.map((paragraph) => `<p>${paragraph}</p>`).join('');
  if (report.statusKey === 'rumor') {
    return `<p><strong>Rumored is not the same as discontinued.</strong> This page exists because the report is specific, recent, and likely to be searched, but the public evidence is not yet strong enough for a final verdict. The product remains current until the reported change takes effect or a manufacturer, distributor, or broad retail reset confirms it.</p><p>That distinction protects readers from a common failure in flavor news: a screenshot or secondhand comment gets repeated until search results present it as an announcement. We preserve the original claim, identify what can be independently checked, and keep the headline answer conditional.</p>`;
  }
  if (report.statusKey === 'current') {
    return `<p><strong>Current means the flavor is still marketed in the United States.</strong> It does not mean every chain or region stocks it. A current product can be absent locally because of distributor territories, limited shelf space, or retailer assortment choices.</p><p>Packaging receives its own status. A retired can design can be collectible even while the flavor inside remains in production. This report names the package separately whenever the design, size, or formula is the part that disappeared.</p>`;
  }
  if (report.statusKey === 'format') {
    return `<p><strong>Format discontinued means the exact version shown is over, not necessarily the flavor idea.</strong> A new can, formula, line, size, or name can carry a similar profile after the older product leaves U.S. distribution.</p><p>Collectors should compare the full front label, line name, size, ingredient panel, and production marks. A replacement is evidence that the earlier version ended; it is not proof that the two liquids or packages are identical.</p>`;
  }
  return `<p><strong>Discontinued in the U.S. means the flavor is no longer being marketed through normal U.S. distribution.</strong> It can still be current abroad, remain on an old brand page, or appear as sell-through inventory. Those leftovers do not change the U.S. status, but they do explain why a search may produce apparently conflicting answers.</p><p>We do not use worldwide availability to reverse a U.S. conclusion. International production is reported as context, and remaining American stock is described as old inventory unless evidence shows a true relaunch.</p>`;
}

function relatedReports(report) {
  const related = reports.filter((candidate) => candidate.slug !== report.slug && (candidate.brand === report.brand || candidate.statusKey === report.statusKey)).slice(0, 2);
  return related.map((candidate) => `<a href="journal/${candidate.slug}.html"><span class="journal-status status-${candidate.statusKey}">${candidate.statusLabel}</span><strong>${candidate.title}</strong><p>${candidate.cardCopy}</p></a>`).join('');
}

function articleMarkup(report) {
  const checkedDate = reportCheckedDate(report);
  const checkedLabel = checkedLabelFor(report);
  const shop = report.shop && currentProductHrefs.has(report.shop.href)
    ? `<section class="article-shop-callout"><div><div class="section-kicker">Collector inventory</div><h2>${report.shop.heading}</h2><p>${report.shop.copy}</p></div><a class="btn btn-dark" href="${report.shop.href}">${report.shop.cta}</a></section>`
    : '<!-- No matching current store listing at publication. -->';
  const sections = report.sections.map((section) => `<section id="${section.id}"><h2>${section.heading}</h2>${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}</section>`).join('\n          ');
  const imageCredit = report.imageCredit ? ` Image source: ${report.imageCredit}.` : '';
  const sectionHref = (id) => `journal/${report.slug}.html#${id}`;
  const toc = report.sections.map((section) => `<a href="${sectionHref(section.id)}">${section.toc || section.heading}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="../">
  <title>${report.seoTitle}</title>
  <meta name="description" content="${report.description}">
  <link rel="canonical" href="${articleUrl(report)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:site_name" content="Discontinued Club">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${report.title}">
  <meta property="og:description" content="${report.description}">
  <meta property="og:url" content="${articleUrl(report)}">
  <meta property="og:image" content="${imageUrl(report)}">
  <meta property="article:published_time" content="${checkedDate}">
  <meta property="article:modified_time" content="${report.modifiedDate || checkedDate}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css?v=44">
  <script type="application/ld+json">${schemaMarkup(report)}</script>
</head>
<body data-page="blog">
  <div id="site-header"></div>
  <main>
    <nav class="breadcrumbs container" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="blog.html">Journal</a><span>/</span><span>${report.product}</span></nav>
    <article>
      <header class="article-hero article-hero-${report.theme}">
        <div class="container article-hero-grid">
          <div class="article-hero-copy">
            <div class="article-status-row"><span class="journal-status status-${report.statusKey}">${report.statusLabel}</span><span>${report.lane}</span></div>
            <h1>${report.title}</h1>
            <p class="article-deck">${report.deck}</p>
            <div class="article-byline"><span>By Discontinued Club Research</span><time datetime="${checkedDate}">Checked ${checkedLabel}</time><span>${report.readTime} minute read</span></div>
          </div>
          <figure class="article-hero-media"><img src="${report.image}" alt="${report.imageAlt}" width="1200" height="1200" fetchpriority="high"><figcaption>${report.caption}${imageCredit}</figcaption></figure>
        </div>
      </header>
      <div class="container article-layout">
        <div class="article-body">
          <section class="article-answer" aria-labelledby="short-answer"><div class="section-kicker">The short answer</div><h2 id="short-answer">${report.answerHeading}</h2><p>${report.answer}</p></section>
          ${sections}
          <section id="status-language"><h2>How to read this status</h2>${statusExplanation(report)}</section>
          <section id="buyer-notes"><h2>What buyers and collectors should check</h2><p>Verify the exact flavor name, package design, can size, country labeling, condition, quantity, and the seller's photo before buying. A marketplace listing can combine an old image with newer inventory, and a foreign-market can may use similar colors for a different formula. The can shown here is one specific reference design, not a promise that every listing uses the same package.</p><p>For older full cans, treat the purchase as a collectible first. Storage history is rarely complete, and sealed cans can leak, swell, or change internally over time. A printed date and intact seal help identify an item, but they do not guarantee that an aged beverage remains suitable to drink.</p></section>
          ${shop}
          <section id="faq" class="article-faq"><div class="section-kicker">Frequently asked</div><h2>${report.product} questions</h2>${faqMarkup(report)}</section>
          <section id="sources" class="article-sources"><div class="section-kicker">Evidence desk</div><h2>Sources checked</h2><ol>${sourceList(report)}</ol><p class="article-disclosure">Discontinued Club is an independent retailer and is not affiliated with or endorsed by ${report.brand}. This report uses a U.S.-market definition of discontinued and was last reviewed ${checkedLabel}. Product status can change after that date; corrections are recorded when stronger evidence appears.</p></section>
        </div>
        <aside class="article-sidebar" aria-label="Article guide">
          <div class="article-sidebar-block"><strong>U.S. conclusion</strong><span class="journal-status status-${report.statusKey}">${report.statusLabel}</span><p>${report.sidebar}</p></div>
          <div class="article-sidebar-block evidence-grade"><strong>Evidence level</strong><span>${report.evidenceGrade}</span><p>${report.evidenceNote}</p></div>
          <nav class="article-toc" aria-label="On this page"><strong>On this page</strong>${toc}<a href="${sectionHref('status-language')}">Status definition</a><a href="${sectionHref('buyer-notes')}">Buyer notes</a><a href="${sectionHref('faq')}">FAQ</a><a href="${sectionHref('sources')}">Sources</a></nav>
          <div class="article-sidebar-block"><strong>Found new evidence?</strong><p>Send an official statement, distributor notice, package photo, or dated shelf change for review.</p><a class="text-link" href="contact.html">Submit a correction &rarr;</a></div>
        </aside>
      </div>
      <section class="article-related"><div class="container"><div class="section-head"><div><div class="section-kicker">Keep researching</div><div class="section-title">Related U.S. status reports</div></div><a class="text-link" href="blog.html">All journal reports &rarr;</a></div><div class="article-related-grid">${relatedReports(report)}</div></div></section>
    </article>
  </main>
  <div id="site-footer"></div>
  <script src="assets/catalog.js?v=44"></script>
  <script src="assets/app.js?v=44"></script>
</body>
</html>
`;
}

function reportCard(report, featured = false) {
  const checkedDate = reportCheckedDate(report);
  const checkedLabel = checkedLabelFor(report);
  return `<article class="journal-card${featured ? ' journal-card-featured' : ''}"><a class="journal-card-media" href="journal/${report.slug}.html"><img src="${report.image}" alt="${report.imageAlt}" width="1200" height="1200" loading="lazy"><span class="journal-article-label">${report.articleLabel || 'Status report'}</span></a><div class="journal-card-copy"><div class="journal-card-meta"><span class="journal-status status-${report.statusKey}">${report.statusLabel}</span><span>${report.brand}</span><time datetime="${checkedDate}">${checkedLabel}</time></div><h2><a href="journal/${report.slug}.html">${report.title}</a></h2><p>${report.cardCopy}</p><a class="text-link" href="journal/${report.slug}.html">Read the ${report.readTime}-minute report &rarr;</a></div></article>`;
}

function blogMarkup() {
  const lead = reports.find((report) => report.slug === 'is-red-bull-blue-edition-blueberry-discontinued');
  const confirmed = reports.filter((report) => report.statusKey === 'discontinued' && report.slug !== lead.slug);
  const latest = reports.find((report) => report.featured);
  const watch = reports.filter((report) => report.statusKey === 'rumor' && report !== latest);
  const context = reports.filter((report) => ['current', 'format'].includes(report.statusKey));
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'The Discontinued Journal', url: 'https://discontinuedclub.com/blog.html', hasPart: reports.map((report) => ({ '@type': 'Article', headline: report.title, url: articleUrl(report) })) }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>U.S. Discontinued Drink News & Flavor Status Reports | Discontinued Club</title>
  <meta name="description" content="Research-backed U.S. status reports for discontinued and rumored energy drink and soda flavors from Monster, Red Bull, Alani Nu, Celsius, Mountain Dew, and more.">
  <link rel="canonical" href="https://discontinuedclub.com/blog.html"><meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:site_name" content="Discontinued Club"><meta property="og:type" content="website"><meta property="og:title" content="The Discontinued Journal"><meta property="og:description" content="U.S. flavor status reports with dated evidence, clear conclusions, and rumors kept separate from confirmed departures."><meta property="og:url" content="https://discontinuedclub.com/blog.html"><meta property="og:image" content="https://discontinuedclub.com/assets/images/hero-journal-v4.webp"><meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><link rel="stylesheet" href="assets/style.css?v=44"><script type="application/ld+json">${schema}</script>
</head>
<body data-page="blog"><div id="site-header"></div><main>
  <section class="store-hero store-hero-campaign"><picture class="store-hero-picture"><source media="(max-width: 1120px)" srcset="assets/images/hero-journal-v2.webp"><img class="store-hero-media" src="assets/images/hero-journal-v4.webp" alt="Discontinued drink research desk with retired flavors and collector notes" width="1774" height="887" fetchpriority="high"></picture><div class="container store-hero-grid"><div class="hero-copy"><div class="eyebrow">The Discontinued Journal</div><h1>What is leaving U.S. shelves next?</h1><p class="lead">Direct answers for discontinued flavors, package changes, and credible rumors. Every report is dated, sourced, and written for the United States first.</p><div class="hero-actions"><a class="btn btn-dark" href="#confirmed">Read confirmed reports</a><a class="btn btn-light" href="#watch">Open rumor watch</a></div></div></div></section>
  <section class="journal-desk-band"><div class="container journal-desk-grid"><div><span>Coverage standard</span><strong>United States market</strong></div><div><span>Reports published</span><strong>${reports.length} individual articles</strong></div><div><span>Last evidence review</span><strong>${checkedLabelFor(latestCheckedReport)}</strong></div><div><span>Status rule</span><strong>Flavor and package tracked separately</strong></div></div></section>
  ${latest ? `<section class="section" id="latest"><div class="container"><div class="section-head"><div><div class="section-kicker">Latest from the journal</div><h2 class="section-title">${checkedLabelFor(latest)}</h2></div></div><div class="journal-grid">${reportCard(latest, true)}</div></div></section>` : ''}
  <section class="journal-topic-nav" aria-labelledby="topic-index-title"><div class="container"><div class="journal-topic-heading"><div><div class="section-kicker">Research by topic</div><h2 id="topic-index-title">Start with the complete list.</h2></div><p>Brand and year indexes collect the individual evidence reports into faster answers for broad discontinuation searches.</p></div><div class="journal-topic-links"><a href="discontinued-energy-drink-flavors-2026.html"><span>2026 U.S. index</span><strong>Discontinued energy drink flavors</strong></a><a href="discontinued-monster-energy-flavors.html"><span>Brand index</span><strong>Monster Energy</strong></a><a href="discontinued-red-bull-flavors.html"><span>Brand index</span><strong>Red Bull Editions</strong></a></div></div></section>
  <section class="section" id="confirmed"><div class="container"><div class="section-head"><div><div class="section-kicker">Confirmed and distribution-supported</div><div class="section-title">U.S. discontinued flavor reports</div></div><div class="section-copy">A missing U.S. flavor is classified as discontinued here even when other countries still sell it. Remaining stock and stale product pages are documented, not mistaken for a relaunch.</div></div><div class="journal-grid">${reportCard(lead, true)}${confirmed.map((report) => reportCard(report)).join('')}</div></div></section>
  <section class="section journal-watch-section" id="watch"><div class="container"><div class="section-head"><div><div class="section-kicker">Discontinuation watch</div><div class="section-title">Reported next, not confirmed yet</div></div><div class="section-copy">These stories answer the rumor without promoting it to fact. Each page names the original report, the claimed timing, and the public evidence that still conflicts with it.</div></div><div class="journal-grid journal-grid-three">${watch.map((report) => reportCard(report)).join('')}</div></div></section>
  <section class="section section-muted" id="context"><div class="container"><div class="section-head"><div><div class="section-kicker">Flavor versus package</div><div class="section-title">Current drinks with retired versions</div></div><div class="section-copy">A current flavor can still have a discontinued can design, formula, size, or sub-line. These reports keep those answers separate.</div></div><div class="journal-grid journal-grid-context">${context.map((report) => reportCard(report)).join('')}</div></div></section>
  <section class="section"><div class="container content-grid"><div class="content-copy"><div class="section-kicker">Editorial standard</div><h2>Useful, specific, and honest about uncertainty.</h2><p>Brand announcements and current U.S. catalogs come first. Distributor notices and broad retail resets can establish real-world discontinuation when a brand leaves an old page online. Community reports start investigations but remain labeled as rumors until stronger evidence arrives.</p><p>There is no authoritative all-brand registry of discontinued flavors. The index expands in researched batches so it can become comprehensive without publishing guesses as facts.</p></div><div class="fact-list"><div class="fact-row"><strong>U.S. first</strong><span>International availability is context, not the deciding status.</span></div><div class="fact-row"><strong>One product</strong><span>Every article image shows one exact can so reports are easy to identify.</span></div><div class="fact-row"><strong>Evidence grade</strong><span>Each story explains whether the conclusion is official, distribution-supported, or unconfirmed.</span></div><div class="fact-row"><strong>Correction trail</strong><span>Reports show a checked date and change when new evidence arrives.</span></div></div></div></section>
  <section class="section"><div class="container content-grid"><div class="content-copy"><div class="section-kicker">Help the reporting desk</div><h2>Send the shelf photo or notice everyone is talking about.</h2><p>Distributor emails, retailer reset sheets, date-coded cans, package changes, and repeated regional sightings can move a report from rumor to confirmed.</p><div class="hero-actions"><a class="btn btn-dark" href="contact.html">Submit a product tip</a><a class="btn btn-light" href="rare-drinks.html">Shop rare drinks</a></div></div><aside class="note-panel"><h3>Rumor pages are intentionally visible.</h3><p>People search for rumors before brands publish statements. A clearly labeled watch report is more useful than silence, provided the article never disguises a claim as confirmation.</p></aside></div></section>
</main><div id="site-footer"></div><script src="assets/catalog.js?v=44"></script><script src="assets/app.js?v=44"></script></body></html>
`;
}

await mkdir(journalDirectory, { recursive: true });
await rm(journalDirectory, { recursive: true, force: true });
await mkdir(journalDirectory, { recursive: true });
await Promise.all(reports.map((report) => writeFile(resolve(journalDirectory, `${report.slug}.html`), articleMarkup(report))));
await writeFile(resolve(root, 'blog.html'), blogMarkup());
console.log(`Generated ${reports.length} journal reports and the journal index.`);
