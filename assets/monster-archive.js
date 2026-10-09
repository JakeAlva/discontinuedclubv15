(() => {
  const form = document.querySelector('[data-archive-filters]');
  if (!form) return;
  const entries = [...document.querySelectorAll('[data-archive-entry]')];
  const years = [...document.querySelectorAll('[data-archive-year]')];
  const count = document.querySelector('[data-archive-count]');
  const empty = document.querySelector('[data-archive-empty]');
  const reset = form.querySelector('[type="reset"]');
  const picker = document.querySelector('[data-year-picker]');
  const select = picker.querySelector('select');
  const normalize = (text) => text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
  function filter() {
    const terms = form.elements.q.value.trim().split(/\s+/).map(normalize).filter(Boolean);
    let visible = 0;
    entries.forEach((entry) => {
      entry.hidden = !terms.every((term) => normalize(entry.dataset.search).includes(term));
      if (!entry.hidden) visible += 1;
    });
    years.forEach((year) => {
      year.hidden = !year.querySelector('[data-archive-entry]:not([hidden])');
    });
    count.textContent = `${visible} ${visible === 1 ? 'flavor' : 'flavors'} found`;
    count.hidden = !terms.length;
    reset.hidden = !terms.length;
    empty.hidden = visible !== 0;
  }
  function clear() {
    form.elements.q.value = '';
    filter();
  }
  function filterFromInput() {
    filter();
    select.value = '';
    // Keep a search started deep in the history above its first result.
    const top = document.querySelector('.monster-archive').getBoundingClientRect().top
      + window.scrollY - document.getElementById('site-header').getBoundingClientRect().height;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'instant' });
  }
  form.hidden = false;
  picker.hidden = false;
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', filterFromInput);
  form.addEventListener('reset', () => queueMicrotask(filterFromInput));
  document.querySelector('[data-archive-clear]').addEventListener('click', () => {
    clear();
    filterFromInput();
    form.elements.q.focus();
  });
  const legacyYears = { 'monster-era-2000': 2002, 'monster-era-2010': 2010, 'monster-era-2017': 2018, 'monster-era-2022': 2025 };
  function revealHash() {
    const hash = location.hash.slice(1);
    const target = document.getElementById(legacyYears[hash] ? `monster-year-${legacyYears[hash]}` : hash);
    const year = target?.closest('[data-archive-year]');
    if (year) {
      clear();
      select.value = year.id.replace('monster-year-', '');
      target.scrollIntoView({ block: 'start' });
    }
  }
  window.addEventListener('hashchange', revealHash);
  select.addEventListener('change', () => {
    if (!select.value) return;
    history.pushState(null, '', `#monster-year-${select.value}`);
    revealHash();
  });
  document.querySelector('.monster-archive').addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#monster-year-"]');
    if (link) {
      event.preventDefault();
      history.pushState(null, '', link.hash);
      revealHash();
    }
  });
  const header = document.getElementById('site-header');
  const measureHeader = () => document.documentElement.style.setProperty('--monster-header-height', `${header.getBoundingClientRect().height}px`);
  measureHeader();
  new ResizeObserver(measureHeader).observe(header);
  const observer = new IntersectionObserver((changes) => {
    if (form.elements.q.value) return;
    const current = changes.find((change) => change.isIntersecting);
    if (current) select.value = current.target.id.replace('monster-year-', '');
  }, { rootMargin: '-30% 0px -55% 0px' });
  years.forEach((year) => observer.observe(year));
  if (location.hash.startsWith('#monster-')) revealHash();
})();
