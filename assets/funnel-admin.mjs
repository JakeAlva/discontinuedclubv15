const status = document.getElementById('funnel-status');
const panel = document.getElementById('funnel-report');
const login = document.getElementById('funnel-login');
let key = '';
let busy = false;
const labels = { visit: 'Shopping sessions', product_view: 'Viewed a product', add_to_cart: 'Added to cart', checkout_attempt: 'Tried checkout', checkout_opened: 'Stripe checkout created', purchase: 'Paid sessions', browsing: 'Browsing only', product: 'Product page', cart: 'Cart / checkout attempt', checkout_error: 'Checkout error', checkout: 'Checkout, no payment yet', paid: 'Paid' };
function node(tag, text) { const element = document.createElement(tag); element.textContent = text; return element; }
function totals(id, counts) {
  const host = document.getElementById(id); host.replaceChildren();
  for (const [label, count] of Object.entries(counts)) {
    const row = node('div', ''); row.append(node('span', labels[label]), node('strong', count)); host.append(row);
  }
}
function rows(id, entries, columns, name) {
  const body = document.getElementById(id); body.replaceChildren();
  for (const entry of entries) {
    const row = node('tr', ''); row.append(node('th', name(entry)));
    columns.forEach((column) => row.append(node('td', entry[column]))); body.append(row);
  }
  if (!entries.length) { const row = node('tr', ''); const cell = node('td', 'No activity recorded in this range.'); cell.colSpan = columns.length + 1; row.append(cell); body.append(row); }
}
async function load() {
  if (busy) return;
  busy = true; status.textContent = 'Loading report...';
  document.querySelectorAll('button, select').forEach((element) => { element.disabled = true; });
  try {
    const response = await fetch('/.netlify/functions/funnel-report', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ days: Number(document.getElementById('funnel-days').value) }), cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(60000) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Report unavailable');
    totals('funnel-stages', data.counts); totals('funnel-stops', data.stopped);
    rows('funnel-articles', data.articles, ['visits', 'clicks', 'carts', 'checkouts', 'purchases'], (row) => row.article.replace('/journal/', '').replace(/^\//, '').replace('.html', '').replaceAll('-', ' '));
    rows('funnel-products', data.products, ['views', 'carts'], (row) => (window.DC_CATALOG || []).find((item) => item.id === row.id)?.name || row.id);
    document.getElementById('funnel-period').textContent = `${data.from} to ${data.through} UTC. Updated ${new Date(data.generatedAt).toLocaleString()}.`;
    document.getElementById('funnel-sales').textContent = `${data.purchases} paid orders / ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.revenueCents / 100)} paid, including shipping and tax, before fees or refunds. ${data.errors} sessions with checkout errors. ${data.ebayExits} sessions followed an eBay link.`;
    login.hidden = true; panel.hidden = false; status.textContent = '';
    document.getElementById('funnel-key').value = '';
  } catch (error) { status.textContent = error.message; }
  finally { busy = false; document.querySelectorAll('button, select').forEach((element) => { element.disabled = false; }); }
}
login.addEventListener('submit', (event) => { event.preventDefault(); key = document.getElementById('funnel-key').value; load(); });
document.getElementById('funnel-refresh').addEventListener('click', load);
document.getElementById('funnel-days').addEventListener('change', load);
document.getElementById('funnel-lock').addEventListener('click', () => { key = ''; panel.hidden = true; login.hidden = false; document.getElementById('funnel-key').value = ''; status.textContent = ''; ['funnel-stages', 'funnel-stops', 'funnel-articles', 'funnel-products'].forEach((id) => document.getElementById(id).replaceChildren()); });
