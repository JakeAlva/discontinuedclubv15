
(function(){
  const navItems = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'out-now.html', label: 'Out Now', key: 'out' },
    { href: 'upcoming.html', label: 'Upcoming Drops', key: 'upcoming' },
    { href: 'about.html', label: 'About', key: 'about' },
    { href: 'contact.html', label: 'Contact', key: 'contact' },
    { href: 'signup.html', label: 'Sign Up', key: 'signup' }
  ];
  const activeKey = document.body.dataset.page || '';

  function navMarkup(){
    return navItems.map(item => {
      const active = item.key === activeKey ? ' active' : '';
      return `<a href="${item.href}" class="${active.trim()}">${item.label}</a>`;
    }).join('');
  }

  const host = document.getElementById('site-header');
  if (host){
    host.innerHTML = `
      <header class="site-header">
        <div class="container">
          <div class="site-header-inner">
            <a class="logo-link" href="index.html"><img src="assets/images/logo-header.png" alt="Discontinued Club"></a>
            <nav class="desktop-nav">${navMarkup()}</nav>
            <a href="join-club.html" class="btn btn-dark header-cta">Join the Club</a>
            <button class="mobile-trigger" id="mobile-trigger" aria-label="Open menu" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>
      <div class="mobile-overlay" id="mobile-overlay"></div>
      <aside class="mobile-drawer" id="mobile-drawer" aria-hidden="true">
        <div class="mobile-drawer-top">
          <a class="mobile-logo" href="index.html"><img src="assets/images/logo-header.png" alt="Discontinued Club"></a>
          <button class="mobile-close" id="mobile-close" aria-label="Close menu">×</button>
        </div>
        <nav class="mobile-links">${navMarkup()}</nav>
        <div class="mobile-drawer-bottom">
          <a href="join-club.html" class="btn btn-dark">Join the Club</a>
          <div class="mobile-note">Recently discontinued flavors, structured drops, and cleaner product pages.</div>
        </div>
      </aside>
    `;
  }

  const trigger = document.getElementById('mobile-trigger');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-overlay');
  const closeBtn = document.getElementById('mobile-close');

  function openMenu(){
    if(!trigger || !drawer || !overlay) return;
    document.body.classList.add('menu-open');
    trigger.classList.add('is-open');
    trigger.setAttribute('aria-expanded','true');
    drawer.classList.add('show');
    drawer.setAttribute('aria-hidden','false');
    overlay.classList.add('show');
  }

  function closeMenu(){
    if(!trigger || !drawer || !overlay) return;
    document.body.classList.remove('menu-open');
    trigger.classList.remove('is-open');
    trigger.setAttribute('aria-expanded','false');
    drawer.classList.remove('show');
    drawer.setAttribute('aria-hidden','true');
    overlay.classList.remove('show');
  }

  if (trigger) trigger.addEventListener('click', function(){
    if(drawer.classList.contains('show')) closeMenu(); else openMenu();
  });
  if (overlay) overlay.addEventListener('click', closeMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeMenu();
  });

  document.querySelectorAll('[data-countdown-target]').forEach(function(el){
    function update(){
      const diff = new Date(el.getAttribute('data-countdown-target')).getTime() - Date.now();
      if(diff <= 0){ el.textContent = 'LIVE'; return; }
      const d = Math.floor(diff/86400000);
      const h = String(Math.floor((diff%86400000)/3600000)).padStart(2,'0');
      const m = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
      const s = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
      el.textContent = `${d}D : ${h}H : ${m}M : ${s}S`;
    }
    update();
    setInterval(update, 1000);
  });
})();
