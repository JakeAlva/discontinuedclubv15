const status = document.getElementById('admin-status');
const login = document.getElementById('admin-login');
const panel = document.getElementById('review-admin');
const list = document.getElementById('moderation-list');
const filter = document.getElementById('admin-filter');
const more = document.getElementById('admin-more');
let key = '';
let offset = 0;
let busy = false;

function node(tag, text, className) {
  const item = document.createElement(tag);
  if (text) item.textContent = text;
  if (className) item.className = className;
  return item;
}

async function api(body) {
  const response = await fetch('/.netlify/functions/review-admin', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body), cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(30000)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function showError(error) { status.className = 'review-error'; status.textContent = error.message || 'Request failed. Please try again.'; }

function card(entry) {
  const article = node('article', '', 'review-moderation-item');
  article.append(node('strong', entry.review.displayName), node('p', new Date(entry.review.submittedAt).toLocaleString(), 'review-policy'));
  const sections = entry.review.products.map((review) => ({ ...review, title: entry.products.find((product) => product.id === review.id)?.name || 'Product' }));
  if (entry.review.company) sections.push({ ...entry.review.company, title: 'Discontinued Club' });
  sections.forEach((review) => {
    article.append(node('h3', `${review.title} / ${review.rating} out of 5`), node('p', review.body));
    if (review.buyAgain != null) article.append(node('p', review.buyAgain ? 'Would buy again' : 'Would not buy again', 'review-policy'));
  });
  const actions = node('div', '', 'review-actions');
  const approve = node('button', 'Publish review', 'btn btn-acid'); approve.type = 'button';
  const reason = node('select', '', 'review-admin-reason'); reason.setAttribute('aria-label', 'Reason for hiding review');
  const reasons = [['', 'Reason for hiding'], ['spam', 'Spam'], ['personal_information', 'Personal information'], ['abusive_content', 'Abusive content'], ['unrelated_content', 'Unrelated content'], ['author_request', 'Author requested removal']];
  reasons.forEach(([value, label]) => { const option = node('option', label); option.value = value; reason.append(option); });
  const hide = node('button', 'Hide review', 'btn btn-light'); hide.type = 'button';
  async function moderate(target) {
    approve.disabled = hide.disabled = true;
    try {
      await api({ action: 'moderate', id: entry.id, etag: entry.etag, status: target, reason: reason.value });
      status.className = ''; status.textContent = target === 'approved' ? 'Review published.' : 'Review hidden.';
      await load(true);
    } catch (error) { showError(error); }
    finally { approve.disabled = hide.disabled = false; }
  }
  approve.addEventListener('click', () => moderate('approved'));
  hide.addEventListener('click', () => { if (!reason.value) { reason.focus(); showError(new Error('Choose a moderation reason.')); } else moderate('hidden'); });
  if (entry.status !== 'approved') actions.append(approve);
  actions.append(reason, hide); article.append(actions);
  return article;
}

async function load(reset = false) {
  if (busy) return;
  busy = true; more.disabled = true; filter.disabled = true;
  try {
    const data = await api({ action: 'list', status: filter.value, offset: reset ? 0 : offset });
    if (reset) list.replaceChildren();
    if (!data.count) list.append(node('p', 'No reviews in this queue.'));
    list.append(...data.reviews.map(card));
    offset = data.nextOffset; more.hidden = offset == null;
  } finally { busy = false; more.disabled = false; filter.disabled = false; }
}

login.addEventListener('submit', async (event) => {
  event.preventDefault();
  key = document.getElementById('admin-key').value;
  const button = login.querySelector('button'); button.disabled = true;
  try {
    await load(true);
    login.hidden = true; panel.hidden = false;
    document.getElementById('admin-key').value = '';
    status.textContent = ''; status.className = '';
  } catch (error) { key = ''; showError(error); }
  finally { button.disabled = false; }
});
document.getElementById('admin-lock').addEventListener('click', () => {
  key = ''; panel.hidden = true; login.hidden = false; list.replaceChildren();
  document.getElementById('invite-link').value = ''; document.getElementById('invite-result').hidden = true;
  document.getElementById('payment-reference').value = ''; status.textContent = '';
  document.getElementById('admin-check-status').textContent = '';
});
document.getElementById('admin-check').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const result = document.getElementById('admin-check-status');
  button.disabled = true; result.textContent = 'Checking isolated review storage...';
  try {
    const data = await api({ action: 'check' });
    result.textContent = `Passed ${data.checks.length} checks: ${data.checks.join(', ')}. Customer reviews were not changed.`;
  } catch (error) { result.textContent = error.message || 'Storage check failed.'; }
  finally { button.disabled = false; }
});
filter.addEventListener('change', () => load(true).catch(showError));
more.addEventListener('click', () => load().catch(showError));
document.getElementById('admin-invite').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button'); button.disabled = true;
  const data = new FormData(event.currentTarget);
  document.getElementById('invite-result').hidden = true;
  try {
    const result = await api({ action: 'invite', paymentIntentId: data.get('paymentIntentId'), renew: data.has('renew') });
    document.getElementById('invite-link').value = result.url;
    document.getElementById('invite-expiry').textContent = `Expires ${new Date(result.expiresAt).toLocaleDateString()}. Link created only; no email has been sent.`;
    document.getElementById('invite-result').hidden = false;
    status.className = ''; status.textContent = 'Private invitation created.';
  } catch (error) { showError(error); }
  finally { button.disabled = false; }
});
