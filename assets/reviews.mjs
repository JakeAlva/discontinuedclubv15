function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function reviewCard(review) {
  const card = node('article', '', 'customer-review');
  const author = node('div', '', 'customer-review-author');
  const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' }).format(new Date(review.submittedAt));
  author.append(node('strong', review.displayName), node('span', 'Verified purchase', 'customer-review-verified'), node('small', date));
  const content = node('div');
  const stars = node('div', '\u2605'.repeat(review.rating) + '\u2606'.repeat(5 - review.rating), 'customer-review-stars');
  stars.setAttribute('aria-label', `${review.rating} out of 5 stars`);
  content.append(stars, node('p', review.body));
  if (review.buyAgain != null) content.append(node('p', review.buyAgain ? 'Would buy again' : 'Would not buy again', 'customer-review-again'));
  card.append(author, content);
  return card;
}

document.querySelectorAll('[data-reviews]').forEach((host) => {
  const summary = host.querySelector('[data-review-summary]');
  const list = host.querySelector('[data-review-list]');
  const more = host.querySelector('[data-review-more]');
  let nextOffset = 0;
  let loading = false;
  async function load() {
    if (loading) return;
    loading = true; more.disabled = true;
    try {
      const params = new URLSearchParams({ offset: String(nextOffset) });
      if (host.dataset.reviewProduct) params.set('product', host.dataset.reviewProduct);
      const response = await fetch(`/.netlify/functions/reviews?${params}`, { cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      summary.replaceChildren();
      if (data.count) {
        summary.append(node('strong', `${data.average.toFixed(1)} / 5`), node('span', `${data.count} ${data.count === 1 ? 'review' : 'reviews'}`));
      } else summary.textContent = 'No published reviews yet.';
      if (data.preview) summary.append(node('p', 'Local test data only', 'review-preview'));
      if (nextOffset === 0) list.replaceChildren();
      list.append(...data.reviews.map(reviewCard));
      nextOffset = data.nextOffset;
      more.textContent = 'Load more reviews'; more.hidden = nextOffset == null;
    } catch {
      summary.textContent = 'Reviews are temporarily unavailable.';
      more.textContent = 'Try again'; more.hidden = false;
    } finally { loading = false; more.disabled = false; }
  }
  more.addEventListener('click', load);
  load();
});
