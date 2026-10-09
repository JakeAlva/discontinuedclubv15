(() => {
  const form = document.querySelector('[data-archive-filters]');
  if (!form) return;
  const entries = [...document.querySelectorAll('[data-archive-entry]')];
  const eras = [...document.querySelectorAll('[data-archive-era]')];
  const count = document.querySelector('[data-archive-count]');
  const empty = document.querySelector('[data-archive-empty]');
  const normalize = (text) => text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
  function filter() {
    const query = normalize(form.elements.q.value.trim());
    const family = form.elements.family.value;
    const status = form.elements.status.value;
    let visible = 0;
    entries.forEach((entry) => {
      entry.hidden = !normalize(entry.textContent).includes(query)
        || (family && entry.dataset.family !== family)
        || (status && entry.dataset.status !== status);
      if (!entry.hidden) visible += 1;
    });
    eras.forEach((era) => {
      era.hidden = !era.querySelector('[data-archive-entry]:not([hidden])');
      era.open = Boolean(query || family || status) || era.hasAttribute('data-default-open');
    });
    count.textContent = `${visible} of ${entries.length} archive records`;
    empty.hidden = visible !== 0;
  }
  form.hidden = false;
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', filter);
  form.addEventListener('change', filter);
  form.addEventListener('reset', () => queueMicrotask(filter));
  function revealHash() {
    const target = document.getElementById(location.hash.slice(1));
    const era = target?.closest('[data-archive-era]');
    if (era) {
      if (target.hidden || era.hidden) { form.reset(); queueMicrotask(revealHash); return; }
      era.open = true;
      target.scrollIntoView({ block: 'start' });
    }
  }
  window.addEventListener('hashchange', revealHash);
  document.querySelector('.monster-archive-navigation nav').addEventListener('click', (event) => {
    const link = event.target.closest('a');
    const era = link && document.getElementById(link.hash.slice(1));
    if (era) {
      event.preventDefault();
      history.pushState(null, '', link.hash);
      revealHash();
    }
  });
  if (location.hash.startsWith('#monster-')) revealHash();
})();
