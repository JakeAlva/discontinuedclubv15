export const PAGE_SIZE = 6;
export const statuses = [
  ['discontinued', 'U.S. discontinued'],
  ['rumor', 'Rumor watch'],
  ['current', 'Still available'],
  ['format', 'Retired versions']
];
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const normalize = (value) => String(value).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
export const pageFile = (page) => page === 1 ? 'blog.html' : `blog-page-${page}.html`;

export function readState(url) {
  const params = url.searchParams;
  const staticPage = url.pathname.match(/blog-page-(\d+)\.html$/)?.[1] || '1';
  const page = Number(params.get('page') || staticPage);
  return {
    q: (params.get('q') || '').trim().slice(0, 160),
    brand: params.get('brand') || '',
    status: statuses.some(([key]) => key === params.get('status')) ? params.get('status') : '',
    sort: params.get('sort') === 'az' ? 'az' : 'newest',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1
  };
}

export function selectReports(reports, state) {
  const words = normalize(state.q || '').split(/\s+/).filter(Boolean);
  const filtered = reports.filter((report) => {
    if (state.brand && report.brand !== state.brand) return false;
    if (state.status && report.statusKey !== state.status) return false;
    const text = normalize(`${report.title} ${report.product} ${report.brand} ${report.cardCopy}`);
    return words.every((word) => text.includes(word));
  }).sort((a, b) => state.sort === 'az'
    ? a.product.localeCompare(b.product, 'en') || a.slug.localeCompare(b.slug)
    : b.date.localeCompare(a.date) || a.product.localeCompare(b.product, 'en') || a.slug.localeCompare(b.slug));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number.isSafeInteger(state.page) ? state.page : 1));
  return { total: filtered.length, pages, page, items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) };
}

export function pageNumbers(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const numbers = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  return numbers.flatMap((n, i) => i && n - numbers[i - 1] > 1 ? [null, n] : [n]);
}

export function stateHref(state, page = state.page) {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.brand) params.set('brand', state.brand);
  if (state.status) params.set('status', state.status);
  if (state.sort === 'az') params.set('sort', 'az');
  if (!params.size) return pageFile(page);
  if (page > 1) params.set('page', page);
  return `blog.html?${params}`;
}

export function cardMarkup(report) {
  const e = escapeHtml;
  const href = `journal/${e(report.slug)}.html`;
  const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${report.date}T00:00:00Z`));
  return `<article class="journal-entry"><a class="journal-entry-image" href="${href}" tabindex="-1" aria-hidden="true"><img src="${e(report.image)}" alt="" width="100" height="160" loading="lazy"></a><div class="journal-entry-copy"><div class="journal-entry-meta"><span class="journal-status status-${e(report.statusKey)}">${e(report.statusLabel)}</span></div><h2><a href="${href}">${e(report.title)}</a></h2><p>${e(report.cardCopy)}</p><div class="journal-entry-date"><time datetime="${e(report.date)}">${date}</time><span>${e(report.readTime)} min read</span></div></div></article>`;
}

export function paginationMarkup(result, state) {
  if (result.pages <= 1) return '';
  const link = (page, text, label, numeric = false) => `<a href="${escapeHtml(stateHref(state, page))}" data-journal-page="${page}"${numeric ? ' class="journal-page-number"' : ''} aria-label="${label}"${page === result.page ? ' aria-current="page"' : ''}>${text}</a>`;
  return `${result.page > 1 ? link(result.page - 1, '&larr;', 'Previous page') : '<span class="journal-page-disabled" aria-hidden="true">&larr;</span>'}${pageNumbers(result.page, result.pages).map((n) => n === null ? '<span class="journal-page-gap" aria-hidden="true">&hellip;</span>' : link(n, n, `Page ${n}`, true)).join('')}<span class="journal-page-position">Page ${result.page} of ${result.pages}</span>${result.page < result.pages ? link(result.page + 1, '&rarr;', 'Next page') : '<span class="journal-page-disabled" aria-hidden="true">&rarr;</span>'}`;
}

export const resultLabel = (result) => result.total
  ? result.total === 1 ? '1 article' : `${(result.page - 1) * PAGE_SIZE + 1}-${Math.min(result.page * PAGE_SIZE, result.total)} of ${result.total} articles`
  : 'No matching articles';

async function mountLibrary(root) {
  const form = root.querySelector('form');
  const fieldset = form.querySelector('fieldset');
  const results = root.querySelector('[data-journal-results]');
  const count = root.querySelector('[data-journal-count]');
  const pagination = root.querySelector('[data-journal-pagination]');
  const reset = root.querySelector('[data-journal-reset]');
  let reports;
  try {
    const response = await fetch(root.dataset.index);
    if (!response.ok) throw new Error('Journal index unavailable');
    reports = await response.json();
    if (!Array.isArray(reports)) throw new Error('Invalid journal index');
  } catch {
    root.querySelector('[data-journal-error]').hidden = false;
    return;
  }
  fieldset.disabled = false;
  let state = readState(new URL(location.href));
  const legacyStatus = { '#confirmed': 'discontinued', '#watch': 'rumor', '#context': 'format' }[location.hash];
  if (legacyStatus && !state.status) state = { ...state, status: legacyStatus, page: 1 };
  let timer;

  function render(historyMode, focusResults = false) {
    if (!reports.some((report) => report.brand === state.brand)) state.brand = '';
    const result = selectReports(reports, state);
    state.page = result.page;
    for (const key of ['q', 'brand', 'status', 'sort']) {
      if (document.activeElement !== form.elements[key]) form.elements[key].value = state[key];
    }
    results.innerHTML = result.items.length ? result.items.map(cardMarkup).join('') : '<div class="journal-empty"><h2>No articles found</h2><p>Try another flavor or remove a filter.</p><button type="button" data-clear-results>Clear search &amp; filters</button></div>';
    count.textContent = resultLabel(result);
    pagination.innerHTML = paginationMarkup(result, state);
    pagination.hidden = result.pages <= 1;
    reset.hidden = !(state.q || state.brand || state.status || state.sort === 'az');
    const filtered = Boolean(state.q || state.brand || state.status || state.sort === 'az');
    const canonical = new URL(pageFile(filtered ? 1 : result.page), location.href).href;
    document.querySelector('link[rel="canonical"]').href = canonical;
    document.querySelector('meta[name="robots"]').content = `${filtered ? 'noindex' : 'index'}, follow, max-image-preview:large`;
    document.querySelector('meta[property="og:url"]').content = canonical;
    document.title = `Discontinued Drink News & Flavor Status Reports${!filtered && result.page > 1 ? ` - Page ${result.page}` : ''} | Discontinued Club`;
    document.querySelector('script[type="application/ld+json"]').textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'The Discontinued Journal', url: canonical,
      mainEntity: { '@type': 'ItemList', itemListElement: result.items.map((report, i) => ({
        '@type': 'ListItem', position: (result.page - 1) * PAGE_SIZE + i + 1,
        url: new URL(`journal/${report.slug}.html`, location.href).href, name: report.title
      })) }
    });
    if (historyMode) history[historyMode]({ journal: true }, '', stateHref(state));
    if (focusResults) {
      count.focus({ preventScroll: true });
      count.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }

  function applyFilters(historyMode) {
    clearTimeout(timer);
    state = { q: form.elements.q.value.trim().slice(0, 160), brand: form.elements.brand.value, status: form.elements.status.value, sort: form.elements.sort.value, page: 1 };
    render(historyMode);
  }
  form.addEventListener('submit', (event) => { event.preventDefault(); applyFilters('pushState'); });
  form.elements.q.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => applyFilters('replaceState'), 180);
  });
  form.querySelectorAll('select').forEach((select) => select.addEventListener('change', () => applyFilters('pushState')));
  function clearFilters() {
    clearTimeout(timer);
    form.reset();
    state = { q: '', brand: '', status: '', sort: 'newest', page: 1 };
    render('pushState');
    form.elements.q.focus();
  }
  reset.addEventListener('click', clearFilters);
  results.addEventListener('click', (event) => { if (event.target.closest('[data-clear-results]')) clearFilters(); });
  pagination.addEventListener('click', (event) => {
    const link = event.target.closest('[data-journal-page]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    clearTimeout(timer);
    state = readState(new URL(link.href));
    render('pushState', true);
  });
  window.addEventListener('popstate', () => {
    clearTimeout(timer);
    state = readState(new URL(location.href));
    for (const key of ['q', 'brand', 'status', 'sort']) form.elements[key].value = state[key];
    render(null);
  });
  render('replaceState');
}

if (typeof document !== 'undefined') {
  const library = document.querySelector('[data-journal-library]');
  if (library) mountLibrary(library);
}
