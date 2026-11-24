import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { catalog, categories, directPriceCents, formatMoney, storeConfig } from '../lib/store-catalog.mjs';
import { soldItems, slugify } from './sold-data.mjs';
import { browsableSoldItems } from '../lib/browse-catalog.mjs';

const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const label = (category) => categories[category]?.label || 'Other finds';
const productSlug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}`;

function productCard(item) {
  const href = `products/${productSlug(item)}.html`;
  const direct = storeConfig.directCheckoutEnabled === true && item.directCheckoutEnabled !== false;
  const price = direct ? formatMoney(directPriceCents(item)) : item.price;
  const version = item.imageVersion || (item.id === '407134944288' ? '4pack-2' : '38');
  return `<article class="product-card" data-category="${item.category}"><a class="product-image" href="${href}"><img src="assets/images/listings/branded/${item.id}.webp?v=${version}" alt="${escape(item.name)}" width="1200" height="1200" loading="lazy"></a><div class="product-content"><div class="product-category">${escape(label(item.category))}</div><div class="product-name"><a href="${href}">${escape(item.name)}</a></div><div class="product-detail">${escape(item.detail)}</div><div class="product-pricing"><span><small>${direct ? 'Direct price' : 'Available on eBay'}</small><strong>${escape(price)}</strong></span></div><div class="product-actions"><a class="btn btn-acid product-add" href="${href}">View item &rarr;</a></div></div></article>`;
}

async function soldCard(item, root) {
  const href = `sold/${slugify(item.name)}-${item.id}.html`;
  const src = `assets/images/sold/branded/${item.id}.webp?v=uniform-sold-20261124`;
  const hasImage = await access(resolve(root, src)).then(() => true, () => false);
  const image = hasImage ? `<img src="${src}" alt="${escape(item.name)}" width="1200" height="1200" loading="lazy">` : '<div class="sold-placeholder">Photo unavailable</div>';
  return `<article class="product-card sold-card" data-category="${item.category}" data-availability="out"><a class="product-image" href="${href}">${image}<span class="condition-badge sold-badge">Out of stock</span></a><div class="product-content"><div class="product-category">${escape(label(item.category))}</div><div class="product-name"><a href="${href}">${escape(item.name)}</a></div><div class="product-detail">Currently unavailable. Ask to hear from us if we find more.</div><div class="product-actions"><a class="btn btn-light product-add" href="contact.html?restock=${item.id}">Notify me</a><a class="text-link" href="${href}">View item &rarr;</a></div></div></article>`;
}

export async function renderStaticCatalogs(html, root) {
  const unavailableCards = new Map(await Promise.all(browsableSoldItems().map(async (item) => [item.id, await soldCard(item, root)])));
  const footer = `<footer><div class="container"><div class="footer-main"><div class="footer-brand"><a class="footer-logo" href="index.html">Discontinued Club</a></div><nav class="footer-column" aria-label="Shop"><strong>Shop</strong><a href="out-now.html">All listings</a><a href="rare-drinks.html">Rare drinks</a></nav><nav class="footer-column" aria-label="Journal"><strong>Discover</strong><a href="blog.html">Discontinued journal</a><a href="discontinued-monster-energy-flavors.html">Monster archive</a><a href="discontinued-red-bull-flavors.html">Red Bull editions</a></nav><nav class="footer-column" aria-label="Company"><strong>Discontinued Club</strong><a href="about.html">About</a><a href="contact.html">Contact</a></nav><nav class="footer-column" aria-label="Policies"><strong>Policies</strong><a href="shipping-returns.html">Shipping &amp; returns</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></nav></div></div></footer>`;
  html = html.replace('<div id="site-footer"></div>', `<div id="site-footer">${footer}</div>`);
  // Only replace the known empty build-time slots; browser JS enhances these cards.
  html = html.replace(/<div\b([^>]*\bdata-catalog\b[^>]*)><\/div>/g, (_, attributes) => {
    const category = attributes.match(/\bdata-category="([^"]+)"/)?.[1];
    const limit = Number(attributes.match(/\bdata-limit="(\d+)"/)?.[1] || 0);
    let items = catalog.filter((item) => (!category || item.category === category) && (!attributes.includes('data-featured="true"') || item.featured));
    if (limit) items = items.slice(0, limit);
    const unavailable = attributes.includes('data-include-sold') ? browsableSoldItems().filter((item) => !category || item.category === category).map((item) => unavailableCards.get(item.id)).join('') : '';
    return `<div${attributes}>${items.map(productCard).join('')}${unavailable}</div>`;
  });
  if (html.includes('data-sold-catalog></div>')) {
    const cards = await Promise.all(soldItems.map((item) => soldCard(item, root)));
    html = html.replace('data-sold-catalog></div>', `data-sold-catalog>${cards.join('')}</div>`);
  }
  return html;
}
