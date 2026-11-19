const CONSENT = 'dc_analytics_choice_v1';
const SESSION = 'dc_shopping_session_v1';
const blocked = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
const privatePage = /(?:review|checkout-success|funnel-admin)/.test(location.pathname);
let choice = '';
try { choice = localStorage.getItem(CONSENT) || ''; } catch { /* No optional tracking without storage. */ }
let current;
let prompt;
const canonical = document.querySelector('link[rel="canonical"]')?.href;
const path = canonical ? new URL(canonical).pathname : location.pathname;
const article = path.startsWith('/journal/') || /^\/discontinued-.*\.html$/.test(path) ? path : '';

function session() {
  if (blocked || privatePage || choice !== 'yes') return null;
  try {
    current = JSON.parse(sessionStorage.getItem(SESSION) || 'null');
    if (!current || Date.now() - current.updated > 30 * 60 * 1000 || Date.now() - current.started > 24 * 60 * 60 * 1000) {
      current = { journey: new Date().toISOString().slice(0, 10) + '_' + crypto.randomUUID(), article: '', started: Date.now() };
    }
    current.article ||= article;
    current.updated = Date.now();
    sessionStorage.setItem(SESSION, JSON.stringify(current));
    return current;
  } catch { return null; }
}

export function attribution() {
  const value = session();
  return value ? { journey: value.journey, article: value.article } : undefined;
}

export function track(event, detail = {}) {
  const value = attribution();
  if (!value) return;
  fetch('/.netlify/functions/funnel-event', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...value, event, product: detail.product || '', article: detail.article || value.article }),
    keepalive: true, credentials: 'omit', referrerPolicy: 'no-referrer'
  }).catch(() => {});
}

function pageView() {
  track('visit');
  if (article) track('article_view', { article });
  const product = document.querySelector('[data-product-quantity-picker]')?.dataset.productId;
  if (product) track('product_view', { product });
}

function setChoice(value) {
  choice = value;
  try { localStorage.setItem(CONSENT, value); if (value !== 'yes') sessionStorage.removeItem(SESSION); } catch { choice = 'no'; }
  prompt?.remove();
  if (choice === 'yes') pageView();
}

function showChoice() {
  if (blocked || privatePage || prompt?.isConnected) return;
  prompt = document.createElement('aside');
  prompt.className = 'analytics-choice';
  prompt.setAttribute('aria-label', 'Optional analytics');
  prompt.innerHTML = '<p>Help improve the shop with optional shopping analytics? No ads, contact details, or session recordings. <a href="/privacy.html#shopping-analytics">Privacy details</a></p><div><button class="btn btn-dark" type="button" data-analytics-yes>Allow analytics</button><button class="btn btn-light" type="button" data-analytics-no>No thanks</button></div>';
  prompt.querySelector('[data-analytics-yes]').addEventListener('click', () => setChoice('yes'));
  prompt.querySelector('[data-analytics-no]').addEventListener('click', () => setChoice('no'));
  document.body.append(prompt);
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  const host = link ? new URL(link.href).hostname : '';
  if (host === 'ebay.com' || host.endsWith('.ebay.com')) track('ebay_exit');
  if (event.target.closest('[data-analytics-choice]')) {
    if (blocked) document.querySelector('[data-analytics-status]').textContent = 'Optional analytics are off because your browser requests privacy.';
    else showChoice();
  }
});
window.addEventListener('storage', (event) => {
  if (event.key !== CONSENT) return;
  choice = event.newValue || '';
  if (choice !== 'yes') { current = null; try { sessionStorage.removeItem(SESSION); } catch {} }
  prompt?.remove();
});
if (!privatePage && !blocked && !choice) showChoice();
pageView();
