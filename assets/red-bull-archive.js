(() => {
  const archive = document.querySelector('.red-bull-archive');
  if (!archive) return;
  const form = archive.querySelector('[data-archive-filters]');
  const entries = [...archive.querySelectorAll('[data-archive-entry]')];
  const years = [...archive.querySelectorAll('[data-archive-year]')];
  const count = archive.querySelector('[data-archive-count]');
  const empty = archive.querySelector('[data-archive-empty]');
  const reset = form.querySelector('[type="reset"]');
  const statusPicker = archive.querySelector('[data-status-picker]');
  const status = statusPicker.querySelector('select');
  const picker = archive.querySelector('[data-year-picker]');
  const select = picker.querySelector('select');
  const header = document.getElementById('site-header');
  const normalize = (text) => text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
  function filter() {
    const terms = form.elements.q.value.trim().split(/\s+/).map(normalize).filter(Boolean);
    let visible = 0;
    entries.forEach((entry) => {
      const retired = ['discontinued', 'seasonal'].includes(entry.dataset.status);
      const matchesStatus = status.value === 'all' || (status.value === 'retired' ? retired : !retired);
      entry.hidden = !matchesStatus || !terms.every((term) => normalize(entry.dataset.search).includes(term));
      if (!entry.hidden) visible += 1;
    });
    years.forEach((year) => { year.hidden = !year.querySelector('[data-archive-entry]:not([hidden])'); });
    count.textContent = `${visible} ${visible === 1 ? 'entry' : 'entries'} found`;
    count.hidden = !terms.length && status.value === 'all';
    reset.hidden = !terms.length;
    empty.hidden = visible !== 0;
  }
  function filterFromInput() {
    filter();
    select.value = '';
    const top = archive.getBoundingClientRect().top + window.scrollY - header.getBoundingClientRect().height;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'instant' });
  }
  function clear() {
    form.elements.q.value = '';
    status.value = 'all';
    filter();
  }
  form.hidden = false;
  picker.hidden = false;
  statusPicker.hidden = false;
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', filterFromInput);
  form.addEventListener('reset', () => queueMicrotask(filterFromInput));
  status.addEventListener('change', filterFromInput);
  archive.querySelector('[data-archive-clear]').addEventListener('click', () => {
    clear();
    filterFromInput();
    form.elements.q.focus();
  });
  function revealHash() {
    const target = document.getElementById(location.hash.slice(1));
    const year = target?.closest('[data-archive-year]');
    if (!year) return;
    clear();
    select.value = year.id.replace('red-bull-year-', '');
    target.scrollIntoView({ block: 'start' });
  }
  select.addEventListener('change', () => {
    if (!select.value) return;
    history.pushState(null, '', `#red-bull-year-${select.value}`);
    revealHash();
  });
  archive.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#red-bull-year-"]');
    if (!link) return;
    event.preventDefault();
    history.pushState(null, '', link.hash);
    revealHash();
  });
  window.addEventListener('hashchange', revealHash);
  const measureHeader = () => document.documentElement.style.setProperty('--monster-header-height', `${header.getBoundingClientRect().height}px`);
  measureHeader();
  new ResizeObserver(measureHeader).observe(header);
  const observer = new IntersectionObserver((changes) => {
    if (form.elements.q.value || status.value !== 'all') return;
    const current = changes.find((change) => change.isIntersecting);
    if (current) select.value = current.target.id.replace('red-bull-year-', '');
  }, { rootMargin: '-30% 0px -55% 0px' });
  years.forEach((year) => observer.observe(year));
  if (location.hash.startsWith('#red-bull-')) revealHash();
})();
