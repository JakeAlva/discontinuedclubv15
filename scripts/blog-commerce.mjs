import { directPriceCents, formatMoney } from '../lib/store-catalog.mjs';

// Curated from the leading Search Console / Netlify article pages on November 18.
export const articleProducts = {
  '/discontinued-monster-energy-flavors.html': { heading: 'Monster flavors from our shelves', ids: ['407205333909', '407205596661', '407205565491'] },
  '/journal/ghost-aw-root-beer-energy-drink-permanent-2027.html': { heading: 'More creamy flavor finds', note: 'These are different products, not Ghost A&W Root Beer.', ids: ['406705689212', '407329572793', '407205596661'] },
  '/discontinued-energy-drink-flavors-2026.html': { heading: 'Hard-to-find energy drinks', ids: ['407205333909', '407329572793', '407373107823'] },
  '/journal/java-monster-dubai-chocolate-release-2026.html': { heading: 'Other Monster flavors in the store', note: 'These are not Java Monster Dubai Chocolate or coffee drinks.', ids: ['407205596661', '407205333909', '407205665076'] },
  '/journal/is-coca-cola-cherry-float-discontinued.html': { heading: 'More cola flavors to explore', note: 'Different flavors, each with its own listing and condition details.', ids: ['407365323849', '406728820274', '406705689212'] },
  '/journal/is-celsius-raspberry-acai-green-tea-discontinued.html': { heading: 'Other fruit-flavored energy drinks', note: 'These alternatives are not Celsius or green tea.', ids: ['407332173468', '407205665076', '407203191955'] },
  '/journal/starry-cranberry-blizz-zero-sugar-return-2026.html': { heading: 'Cranberry Blizz from our shelves', ids: ['406795510403'] },
  '/journal/is-alani-lime-slush-coming-back-return-rumor.html': { heading: 'Alani Nu from our shelves', ids: ['407347352383', '407329572793', '407332173468'] },
  '/discontinued-red-bull-flavors.html': { heading: 'Red Bull Editions from our shelves', ids: ['407373107823', '407207373104', '407203191955'] }
};
const escape = (text) => String(text).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
export function injectArticleProducts(html, path, catalog) {
  const selection = articleProducts[path];
  if (!selection || html.includes('data-article-products')) return html;
  const items = selection.ids.map((id) => catalog.find((item) => item.id === id && item.directCheckoutEnabled !== false)).filter(Boolean);
  if (!items.length) return html;
  const cards = items.map((item) => {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const href = `products/${slug}-${item.id}.html`;
    return `<article class="article-product" data-recommended-product="${item.id}" hidden><a href="${href}"><img src="/assets/images/listings/branded/${item.id}.webp" alt="${escape(item.name)}" width="300" height="300" loading="lazy"></a><div><h3><a href="${href}">${escape(item.name)}</a></h3><p><strong>${formatMoney(directPriceCents(item))}</strong> <span data-stock-id="${item.id}">Checking stock</span></p><a class="text-link" href="${href}">View product</a></div></article>`;
  }).join('');
  const markup = `<section class="article-products" data-article-products hidden><div class="container"><div class="section-kicker">From our shelves</div><h2>${selection.heading}</h2>${selection.note ? `<p>${selection.note}</p>` : ''}<div class="article-products-grid">${cards}</div><p class="article-products-note">Check the listing for package size, printed dates and condition. Older drinks may be offered as collectibles. Availability is confirmed again at checkout.</p></div></section>`;
  if (html.includes('class="article-answer"')) return html.replace(/(<section class="article-answer"[\s\S]*?<\/section>)/, (match) => match + markup);
  if (html.includes('class="topic-hero ')) return html.replace(/(<section class="topic-hero [\s\S]*?<\/section>)/, (match) => match + markup);
  return html.replace(/(<header class="monster-history-header[\s\S]*?<\/header>)/, (match) => match + markup);
}
