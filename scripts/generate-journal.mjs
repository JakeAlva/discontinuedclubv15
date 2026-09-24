import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { reports } from './journal-data.mjs';
import { catalog } from '../lib/store-catalog.mjs';
import { generateJournalLibrary } from './generate-journal-library.mjs';

const root = resolve(import.meta.dirname, '..');
const journalDirectory = resolve(root, 'journal');
const defaultCheckedDate = '2026-09-11';
const reportCheckedDate = (report) => report.checkedDate || defaultCheckedDate;
const checkedLabelFor = (report) => new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
}).format(new Date(`${reportCheckedDate(report)}T00:00:00Z`));
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
  const related = reports.filter((candidate) => candidate.slug !== report.slug && (report.relatedSlugs
    ? report.relatedSlugs.includes(candidate.slug)
    : candidate.brand === report.brand || candidate.statusKey === report.statusKey)).slice(0, 2);
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
  const buyerNotes = report.buyerParagraphs
    ? `<section id="buyer-notes"><h2>${report.buyerHeading || 'Before you buy'}</h2>${report.buyerParagraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}</section>`
    : `<section id="buyer-notes"><h2>What buyers and collectors should check</h2><p>Verify the exact flavor name, package design, can size, country labeling, condition, quantity, and the seller's photo before buying. A marketplace listing can combine an old image with newer inventory, and a foreign-market can may use similar colors for a different formula. The can shown here is one specific reference design, not a promise that every listing uses the same package.</p><p>For older full cans, treat the purchase as a collectible first. Storage history is rarely complete, and sealed cans can leak, swell, or change internally over time. A printed date and intact seal help identify an item, but they do not guarantee that an aged beverage remains suitable to drink.</p></section>`;
  const disclosure = report.disclosure || `Discontinued Club is an independent retailer and is not affiliated with or endorsed by ${report.brand}. This report uses a U.S.-market definition of discontinued`;
  const evidenceImages = report.evidenceImages ? `<section id="evidence-images"><h2>The submitted frames</h2><p>These are reference images from the shared reel, not authenticated product photography. Open a frame to inspect the original photograph and visible credits.</p><div class="article-evidence-gallery">${report.evidenceImages.map((item) => `<figure><a href="${item.image}"><img src="${item.image}" alt="${item.alt}" width="960" height="1280" loading="lazy"></a><figcaption>${item.alt}</figcaption></figure>`).join('')}</div></section>` : '';
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
          <figure class="article-hero-media"><img src="${report.image}" alt="${report.imageAlt}" width="1200" height="1200" style="aspect-ratio: 1 / 1" fetchpriority="high"><figcaption>${report.caption}${imageCredit}</figcaption></figure>
        </div>
      </header>
      <div class="container article-layout">
        <div class="article-body">
          <section class="article-answer" aria-labelledby="short-answer"><div class="section-kicker">The short answer</div><h2 id="short-answer">${report.answerHeading}</h2><p>${report.answer}</p></section>
          ${sections}${evidenceImages ? `\n          ${evidenceImages}` : ''}
          <section id="status-language"><h2>How to read this status</h2>${statusExplanation(report)}</section>
          ${buyerNotes}
          ${shop}
          <section id="faq" class="article-faq"><div class="section-kicker">Frequently asked</div><h2>${report.faqHeading || `${report.product} questions`}</h2>${faqMarkup(report)}</section>
          <section id="sources" class="article-sources"><div class="section-kicker">Evidence desk</div><h2>Sources checked</h2><ol>${sourceList(report)}</ol><p class="article-disclosure">${disclosure}${report.disclosure ? ' Last reviewed' : ' and was last reviewed'} ${checkedLabel}. Product status can change after that date; corrections are recorded when stronger evidence appears.</p></section>
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


await mkdir(journalDirectory, { recursive: true });
await rm(journalDirectory, { recursive: true, force: true });
await mkdir(journalDirectory, { recursive: true });
await Promise.all(reports.map((report) => writeFile(resolve(journalDirectory, `${report.slug}.html`), articleMarkup(report))));
await generateJournalLibrary(root, reports);
console.log(`Generated ${reports.length} journal reports and the journal index.`);
