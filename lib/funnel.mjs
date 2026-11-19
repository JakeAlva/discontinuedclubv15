import { createHash } from 'node:crypto';
import journal from '../assets/journal-index.json' with { type: 'json' };
import { catalog } from './store-catalog.mjs';

export const stages = ['visit', 'product_view', 'add_to_cart', 'checkout_attempt', 'checkout_opened', 'purchase'];
export const clientEvents = new Set(['visit', 'article_view', 'recommendation_click', 'product_view', 'add_to_cart', 'checkout_attempt', 'checkout_error', 'ebay_exit']);
const products = new Set(catalog.map((item) => item.id));
const articles = new Set(journal.map((item) => `/journal/${item.slug}.html`).concat([
  '/discontinued-monster-energy-flavors.html', '/discontinued-energy-drink-flavors-2026.html', '/discontinued-red-bull-flavors.html'
]));
const DAY = 86400000;
export const dayOf = (time) => new Date(time).toISOString().slice(0, 10);
export const articlePath = (path) => articles.has(path) ? path : '';
export function validJourney(id, now = Date.now(), maxAgeDays = 90) {
  if (typeof id !== 'string' || !/^\d{4}-\d{2}-\d{2}_[a-f0-9-]{36}$/.test(id)) return false;
  const day = Date.parse(id.slice(0, 10));
  return Number.isFinite(day) && day <= now && now - day < (maxAgeDays + 1) * DAY;
}
export function checkoutAttribution(input, now = Date.now()) {
  if (!validJourney(input?.journey, now, 1)) return {};
  return { dc_journey: input.journey, dc_article: articlePath(input.article) };
}
export function sanitizeClientEvent(input, now = Date.now()) {
  if (!validJourney(input?.journey, now, 1) || !clientEvents.has(input?.event)) throw new Error('Invalid event');
  if (['product_view', 'add_to_cart', 'recommendation_click'].includes(input.event) && !products.has(input.product)) throw new Error('Invalid product');
  if (['article_view', 'recommendation_click'].includes(input.event) && !articlePath(input.article)) throw new Error('Invalid article');
  return {
    journey: input.journey, event: input.event,
    product: products.has(input.product) ? input.product : '',
    article: articlePath(input.article)
  };
}

export function createFunnelService(store, now = () => Date.now()) {
  async function record(input) {
    const key = `sessions/${input.journey}`;
    // Conditional writes keep simultaneous page, cart and webhook events from overwriting one another.
    for (let attempt = 0; attempt < 8; attempt++) {
      const previous = await store.getWithMetadata(key, { type: 'json', consistency: 'strong' });
      const entry = previous?.data || { startedAt: new Date(now()).toISOString(), article: '', events: {}, products: {}, purchases: {} };
      if (!entry.article && articlePath(input.article)) entry.article = input.article;
      if (entry.events[input.event] && !input.product && !input.purchase) return;
      entry.events[input.event] ||= new Date(now()).toISOString();
      if (input.product && (entry.products[input.product] || Object.keys(entry.products).length < 30)) {
        entry.products[input.product] ||= {};
        entry.products[input.product][input.event] = true;
      }
      if (input.purchase) entry.purchases[input.purchase.id] = { amount: input.purchase.amount, currency: input.purchase.currency };
      const result = await store.setJSON(key, entry, previous ? { onlyIfMatch: previous.etag } : { onlyIfNew: true });
      if (result.modified) return;
    }
    throw new Error('Analytics storage busy');
  }
  async function purchase(session) {
    if (session.livemode !== true || session.payment_status !== 'paid' || session.mode !== 'payment' || session.metadata?.source !== 'discontinuedclub.com') return false;
    if (!validJourney(session.metadata.dc_journey, now())) return false;
    if (!Number.isInteger(session.amount_total) || session.amount_total <= 0 || session.currency !== 'usd') return false;
    await record({ journey: session.metadata.dc_journey, article: articlePath(session.metadata.dc_article), event: 'purchase', purchase: {
      id: createHash('sha256').update(session.id).digest('hex'), amount: session.amount_total, currency: session.currency
    } });
    return true;
  }
  async function report(days = 7) {
    if (![1, 7, 28].includes(days)) throw new Error('Invalid reporting range');
    const records = [];
    for (let offset = 0; offset < days; offset++) {
      const day = dayOf(now() - offset * DAY);
      for await (const page of store.list({ prefix: `sessions/${day}_`, paginate: true })) {
        if (records.length + page.blobs.length > 10000) throw new Error('Report too large. Select a shorter range.');
        for (let start = 0; start < page.blobs.length; start += 20) {
          const batch = await Promise.all(page.blobs.slice(start, start + 20).map(({ key }) => store.getWithMetadata(key, { type: 'json' })));
          records.push(...batch.filter(Boolean).map((entry) => entry.data));
        }
      }
    }
    const counts = Object.fromEntries(stages.map((stage) => [stage, 0]));
    const stopped = { browsing: 0, product: 0, cart: 0, checkout_error: 0, checkout: 0, paid: 0 };
    const byArticle = new Map();
    const byProduct = new Map();
    let purchases = 0, revenueCents = 0, ebayExits = 0, errors = 0;
    for (const entry of records) {
      for (const stage of stages) if (stage === 'visit' || entry.events[stage]) counts[stage]++;
      const paid = Object.values(entry.purchases);
      purchases += paid.length;
      revenueCents += paid.reduce((sum, sale) => sum + sale.amount, 0);
      if (entry.events.ebay_exit) ebayExits++;
      if (entry.events.checkout_error) errors++;
      const last = entry.events.purchase ? 'paid' : entry.events.checkout_opened ? 'checkout' : entry.events.checkout_error ? 'checkout_error' : entry.events.add_to_cart ? 'cart' : entry.events.product_view ? 'product' : 'browsing';
      stopped[last]++;
      if (entry.article) {
        const row = byArticle.get(entry.article) || { article: entry.article, visits: 0, clicks: 0, carts: 0, checkouts: 0, purchases: 0 };
        row.visits++; row.clicks += Boolean(entry.events.recommendation_click); row.carts += Boolean(entry.events.add_to_cart); row.checkouts += Boolean(entry.events.checkout_opened); row.purchases += paid.length;
        byArticle.set(entry.article, row);
      }
      for (const [id, events] of Object.entries(entry.products)) {
        const row = byProduct.get(id) || { id, views: 0, carts: 0 };
        row.views += Boolean(events.product_view); row.carts += Boolean(events.add_to_cart); byProduct.set(id, row);
      }
    }
    return { days, from: dayOf(now() - (days - 1) * DAY), through: dayOf(now()), counts, stopped, purchases, revenueCents, ebayExits, errors,
      articles: [...byArticle.values()].sort((a, b) => b.visits - a.visits), products: [...byProduct.values()].sort((a, b) => b.views - a.views), generatedAt: new Date(now()).toISOString() };
  }
  async function cleanup() {
    let removed = 0;
    for await (const page of store.list({ prefix: 'sessions/', paginate: true })) {
      for (const { key } of page.blobs) {
        if (Date.parse(key.slice(9, 19)) < now() - 91 * DAY) { await store.delete(key); removed++; }
      }
    }
    return removed;
  }
  return { record, purchase, report, cleanup };
}
