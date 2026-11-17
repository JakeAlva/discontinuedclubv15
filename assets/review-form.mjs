const token = new URLSearchParams(window.location.hash.slice(1)).get('invite') || '';
const form = document.getElementById('review-form');
const state = document.getElementById('review-state');
const submitStatus = document.getElementById('review-submit-status');
let products = [];

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function starField(name, label) {
  const fieldset = element('fieldset', '', 'review-rating');
  fieldset.append(element('legend', label));
  const stars = element('div', '', 'review-stars');
  for (let score = 1; score <= 5; score++) {
    const label = element('label', '', 'review-star');
    label.title = `${score} ${score === 1 ? 'star' : 'stars'}`;
    const input = document.createElement('input');
    input.type = 'radio'; input.name = name; input.value = String(score); input.required = true;
    const glyph = element('span', '\u2605'); glyph.setAttribute('aria-hidden', 'true');
    label.append(input, glyph, element('span', `${score} ${score === 1 ? 'star' : 'stars'}`, 'sr-only'));
    stars.append(label);
    input.addEventListener('change', () => {
      stars.querySelectorAll('label').forEach((item, i) => item.classList.toggle('is-filled', i < score));
    });
  }
  fieldset.append(stars);
  return fieldset;
}

function toggleFields(container, skip) {
  container.hidden = skip;
  container.querySelectorAll('input, textarea, select').forEach((input) => { input.disabled = skip; });
}

function productFields(product) {
  const section = element('section', '', 'review-form-section');
  section.dataset.reviewProduct = product.id;
  const heading = element('div', '', 'review-product');
  const image = document.createElement('img'); image.src = product.image; image.alt = product.name; image.width = 100; image.height = 100;
  const copy = element('div'); copy.append(element('small', 'Verified purchase'), element('h2', product.name));
  heading.append(image, copy); section.append(heading);
  const skip = element('label', '', 'review-check review-skip');
  const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.name = `skip-${product.id}`;
  skip.append(checkbox, element('span', product.category === 'drinks' ? "I haven't tried this flavor yet" : 'Skip this product review'));
  const fields = element('div', '', 'review-fields');
  fields.append(starField(`product-${product.id}`, product.category === 'drinks' ? 'Flavor rating' : 'Product rating'));
  const bodyField = element('div', '', 'review-field');
  const label = element('label', product.category === 'drinks' ? 'What did you think of the flavor?' : 'What did you think of the product?');
  label.htmlFor = `body-${product.id}`;
  const body = document.createElement('textarea'); body.id = label.htmlFor; body.name = label.htmlFor; body.minLength = 5; body.maxLength = 2000; body.required = true;
  bodyField.append(label, body); fields.append(bodyField);
  const againField = element('div', '', 'review-field');
  const againLabel = element('label', 'Would you buy it again?'); againLabel.htmlFor = `again-${product.id}`;
  const select = document.createElement('select'); select.id = againLabel.htmlFor; select.name = againLabel.htmlFor;
  [['', 'Prefer not to say'], ['yes', 'Yes'], ['no', 'No']].forEach(([value, text]) => { const option = element('option', text); option.value = value; select.append(option); });
  againField.append(againLabel, select); fields.append(againField);
  checkbox.addEventListener('change', () => toggleFields(fields, checkbox.checked));
  section.append(skip, fields);
  return section;
}

async function api(endpoint, body) {
  const response = await fetch(`/.netlify/functions/${endpoint}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(20000)
  });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || 'Please try again.'), { status: response.status });
  return data;
}

function received() {
  form.hidden = true; state.hidden = false; state.classList.remove('review-error');
  state.replaceChildren(element('h2', 'Thank you for sharing.'), element('p', 'Your review has been received and is awaiting moderation.'));
  const shop = element('a', 'Back to the shop', 'btn btn-dark'); shop.href = '/out-now.html'; state.append(shop); state.focus();
}

document.getElementById('company-rating').append(starField('company-rating', 'Company rating'));
document.getElementById('skip-company').addEventListener('change', (event) => toggleFields(document.getElementById('company-fields'), event.target.checked));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const selected = products.filter((product) => !data.has(`skip-${product.id}`)).map((product) => ({
    id: product.id, rating: Number(data.get(`product-${product.id}`)), body: data.get(`body-${product.id}`),
    buyAgain: data.get(`again-${product.id}`) === 'yes' ? true : data.get(`again-${product.id}`) === 'no' ? false : null
  }));
  const company = document.getElementById('skip-company').checked ? null : { rating: Number(data.get('company-rating')), body: data.get('companyBody') };
  if (!selected.length && !company) { submitStatus.textContent = 'Add a product review or a company review.'; submitStatus.className = 'review-error'; return; }
  const button = form.querySelector('[type="submit"]'); button.disabled = true;
  submitStatus.className = ''; submitStatus.textContent = 'Submitting...';
  try {
    await api('review-submit', { token, displayName: data.get('displayName'), products: selected, company, consent: data.has('consent'), website: data.get('website') });
    received();
  } catch (error) {
    if (error.status === 409) {
      try { if ((await api('review-invitation', { token })).submitted) { received(); return; } } catch {}
    }
    submitStatus.className = 'review-error';
    submitStatus.textContent = error.status ? error.message : 'Unable to submit right now. Your entries are still here; please try again.';
  } finally { button.disabled = false; }
});

try {
  if (!token) throw new Error('Open the private review link from your invitation email. For help, contact jacob@discontinuedclub.com.');
  const invitation = await api('review-invitation', { token });
  document.getElementById('review-preview').hidden = !invitation.preview;
  if (invitation.submitted) {
    received();
    state.querySelector('p').textContent = 'We already received a review for this order. For changes, email jacob@discontinuedclub.com.';
  } else {
    products = invitation.products;
    document.getElementById('review-products').replaceChildren(...products.map(productFields));
    state.hidden = true; form.hidden = false;
  }
} catch (error) {
  state.classList.add('review-error');
  state.textContent = error.message || 'Your invitation could not be opened. Please try again later.';
}
