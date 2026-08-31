(function () {
  const EBAY_STORE = 'https://www.ebay.com/usr/discontinuedclub';
  const catalog = window.DC_CATALOG || [];
  const soldCatalog = window.DC_SOLD_CATALOG || [];
  const categories = window.DC_CATEGORIES || {};
  const storeConfig = window.DC_STORE_CONFIG || { directDiscountPercent: 3.5, standardShippingCents: 749, freeShippingThresholdCents: 10000, defaultMaxQuantity: 1, maxCartLines: 20 };
  const CART_KEY = 'dc_direct_cart_v1';
  const categoryLabels = {
    drinks: 'Rare drinks',
    apparel: 'Sports & apparel',
    collectibles: 'Collectibles & cards',
    care: 'Personal care',
    other: 'Other finds'
  };

  const navItems = [
    { href: 'out-now.html', label: 'Shop', key: 'shop' },
    { href: 'rare-drinks.html', label: 'Rare Drinks', key: 'drinks' },
    { href: 'sold-archive.html', label: 'Sold Archive', key: 'archive' },
    { href: 'blog.html', label: 'Journal', key: 'blog' },
    { href: 'about.html', label: 'About', key: 'about' }
  ];

  function navMarkup() {
    const activeKey = document.body.dataset.page || '';
    return navItems.map(function (item) {
      const active = item.key === activeKey ? ' active' : '';
      return '<a href="' + item.href + '" class="' + active.trim() + '">' + item.label + '</a>';
    }).join('');
  }

  function headerMarkup() {
    return [
      '<div class="announcement">Lower direct prices &nbsp;|&nbsp; Free shipping on $100+ &nbsp;|&nbsp; Same-day handling before 12 PM CT</div>',
      '<header class="site-header">',
      '  <div class="container site-header-inner">',
      '    <a class="logo-link" href="index.html" aria-label="Discontinued Club home"><img src="assets/images/logo-mark-clean.png" alt=""><span class="logo-type"><strong>Discontinued</strong><small>Club</small></span></a>',
      '    <nav class="desktop-nav" aria-label="Primary navigation">' + navMarkup() + '</nav>',
      '    <div class="header-actions">',
      '      <a class="icon-button" href="out-now.html" aria-label="Search the store" title="Search the store"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></a>',
      '      <button class="icon-button cart-trigger" type="button" aria-label="Open shopping cart" title="Shopping cart" data-cart-open><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7Z"></path><path d="M9 8V5a3 3 0 0 1 6 0v3"></path></svg><span class="cart-count" data-cart-count>0</span></button>',
      '      <a class="btn btn-dark header-shop" href="out-now.html">Shop direct</a>',
      '      <button class="icon-button mobile-trigger" id="mobile-trigger" type="button" aria-label="Open menu" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg></button>',
      '    </div>',
      '  </div>',
      '</header>',
      '<div class="mobile-overlay" id="mobile-overlay"></div>',
      '<aside class="mobile-drawer" id="mobile-drawer" aria-hidden="true">',
      '  <div class="mobile-drawer-top"><a class="mobile-logo" href="index.html"><img src="assets/images/logo-mark-clean.png" alt=""><span class="logo-type"><strong>Discontinued</strong><small>Club</small></span></a><button class="mobile-close" id="mobile-close" type="button" aria-label="Close menu">&times;</button></div>',
      '  <nav class="mobile-links" aria-label="Mobile navigation">' + navMarkup() + '<a href="contact.html">Contact</a></nav>',
      '  <div class="mobile-drawer-bottom"><a class="btn btn-acid" href="out-now.html">Shop direct</a><a class="btn btn-light" href="' + EBAY_STORE + '" target="_blank" rel="noopener">Visit our eBay store</a><div class="mobile-note">Buy direct for the lowest price or use the matching eBay listing when you prefer eBay checkout and buyer protection.</div></div>',
      '</aside>',
      '<div class="cart-overlay" id="cart-overlay" data-cart-close></div>',
      '<aside class="cart-drawer" id="cart-drawer" aria-hidden="true" aria-labelledby="cart-title">',
      '  <div class="cart-drawer-head"><div><span class="section-kicker">Direct checkout</span><h2 id="cart-title">Your cart</h2></div><button class="cart-close" type="button" aria-label="Close cart" data-cart-close>&times;</button></div>',
      '  <div class="cart-items" id="cart-items"></div>',
      '  <div class="cart-drawer-foot" id="cart-summary">',
      '    <div class="shipping-progress"><div class="shipping-progress-copy"><strong data-shipping-progress-copy>Free shipping at $100</strong><span data-shipping-progress-amount></span></div><div class="shipping-progress-track" aria-hidden="true"><i data-shipping-progress-bar></i></div></div>',
      '    <div class="cart-total"><span>Item subtotal</span><strong data-cart-subtotal>$0.00</strong></div>',
      '    <div class="cart-cost-line"><span data-cart-shipping-label>Shipping</span><strong data-cart-shipping>$7.49</strong></div>',
      '    <div class="cart-cost-line cart-estimate"><span>Estimated total</span><strong data-cart-estimate>$0.00</strong></div>',
      '    <p>Estimated total is before any required sales tax. Final details are shown in secure Stripe Checkout.</p>',
      '    <button class="btn btn-dark btn-full cart-checkout" type="button" data-cart-checkout>Continue to secure checkout</button>',
      '    <div class="checkout-message" data-checkout-message role="status"></div>',
      '    <div class="stripe-note"><span aria-hidden="true">S</span> Payments processed securely by Stripe</div>',
      '  </div>',
      '</aside>'
    ].join('');
  }

  function footerMarkup() {
    return [
      '<footer>',
      '  <div class="container">',
      '    <div class="footer-main">',
      '      <div class="footer-brand"><a class="footer-logo" href="index.html"><img src="assets/images/logo-mark-clean.png" alt=""><span class="logo-type"><strong>Discontinued</strong><small>Club</small></span></a><p>A focused resale store for rare drinks, discontinued goods, sports gear, collectibles, and everyday products that are getting harder to find.</p></div>',
      '      <div class="footer-column"><strong>Shop</strong><a href="out-now.html">All listings</a><a href="out-now.html?category=drinks">Rare drinks</a><a href="out-now.html?category=apparel">Sports & apparel</a></div>',
      '      <div class="footer-column"><strong>Discover</strong><a href="sold-archive.html">Previously sold</a><a href="out-now.html?category=collectibles">Collectibles & cards</a><a href="blog.html">Discontinued journal</a></div>',
      '      <div class="footer-column"><strong>Discontinued Club</strong><a href="about.html">About</a><a href="contact.html">Contact</a><a href="' + EBAY_STORE + '" target="_blank" rel="noopener">eBay profile</a></div>',
      '      <div class="footer-column"><strong>Policies</strong><a href="shipping-returns.html">Shipping & returns</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></div>',
      '    </div>',
      '    <div class="footer-bottom"><span>&copy; 2026 Discontinued Club</span><span>Direct payments are processed securely by Stripe. eBay remains available as a separate checkout option.</span></div>',
      '  </div>',
      '</footer>'
    ].join('');
  }

  const headerHost = document.getElementById('site-header');
  const footerHost = document.getElementById('site-footer');
  if (headerHost) headerHost.innerHTML = headerMarkup();
  if (footerHost) footerHost.innerHTML = footerMarkup();

  const trigger = document.getElementById('mobile-trigger');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-overlay');
  const closeButton = document.getElementById('mobile-close');

  function openMenu() {
    if (!trigger || !drawer || !overlay) return;
    document.body.classList.add('menu-open');
    drawer.classList.add('show');
    overlay.classList.add('show');
    trigger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    if (!trigger || !drawer || !overlay) return;
    document.body.classList.remove('menu-open');
    drawer.classList.remove('show');
    overlay.classList.remove('show');
    trigger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  }

  if (trigger) trigger.addEventListener('click', openMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);
  if (closeButton) closeButton.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
      closeFinder();
      closeCart();
    }
  });

  function productCard(item) {
    const href = 'https://www.ebay.com/itm/' + item.id;
    const directCents = getDirectPriceCents(item);
    const ebayCents = parsePriceCents(item.price);
    const savings = Math.max(0, ebayCents - directCents);
    const stock = getMaxQuantity(item);
    const stockLabel = stock > 1 ? stock + ' in stock' : 'Last one';
    const imageAlt = escapeHtml(item.name + ' - current Discontinued Club inventory');
    return [
      '<article class="product-card" data-category="' + item.category + '" data-search="' + escapeHtml((item.name + ' ' + item.detail).toLowerCase()) + '">',
      '  <div class="product-image"><img src="assets/images/listings/branded/' + item.id + '.webp" alt="' + imageAlt + '" loading="lazy" width="1200" height="1200"><span class="condition-badge">' + stockLabel + '</span></div>',
      '  <div class="product-content">',
      '    <div class="product-category">' + categoryLabels[item.category] + '</div>',
      '    <div class="product-name">' + escapeHtml(item.name) + '</div>',
      '    <div class="product-detail">' + escapeHtml(item.detail) + '</div>',
      '    <div class="product-pricing"><span><small>Direct price</small><strong>' + formatMoney(directCents) + '</strong></span><span class="market-price"><small>eBay price</small><s>' + item.price + '</s></span></div>',
      '    <div class="product-savings">Save ' + formatMoney(savings) + ' on the item price</div>',
      '    <div class="product-actions"><button class="btn btn-dark product-add" type="button" data-add-to-cart="' + item.id + '">Add to cart</button><a class="ebay-option" href="' + href + '" target="_blank" rel="noopener" aria-label="Buy ' + escapeHtml(item.name) + ' on eBay">Buy on eBay</a></div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function soldCard(item) {
    const image = item.image
      ? '<img src="assets/images/sold/branded/' + item.id + '.webp" alt="' + escapeHtml(item.name + ' previously sold by Discontinued Club') + '" loading="lazy" width="1200" height="1200">'
      : '<div class="sold-placeholder"><img src="assets/images/logo-mark-clean.png" alt=""><strong>Sold archive</strong><span>Original image unavailable</span></div>';
    const status = item.availableAgain ? 'Available again' : 'Previously sold';
    return [
      '<article class="product-card sold-card" data-category="' + item.category + '" data-search="' + escapeHtml(item.name.toLowerCase()) + '">',
      '  <a href="sold/' + item.slug + '.html" aria-label="View the archive record for ' + escapeHtml(item.name) + '">',
      '    <div class="product-image">' + image + '<span class="condition-badge sold-badge' + (item.availableAgain ? ' available' : '') + '">' + status + '</span></div>',
      '    <div class="product-content">',
      '      <div class="product-category">' + categoryLabels[item.category] + '</div>',
      '      <div class="product-name">' + escapeHtml(item.name) + '</div>',
      '      <div class="product-detail">Real Discontinued Club sales record</div>',
      '      <div class="product-bottom"><span class="sold-price"><small>Recorded sale</small><strong>' + item.price + '</strong></span><span class="product-buy">View archive &rarr;</span></div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function parsePriceCents(value) {
    const amount = Number(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
  }

  function getDirectPriceCents(item) {
    if (Number.isInteger(item.directPriceCents) && item.directPriceCents > 0) return item.directPriceCents;
    const discount = Math.max(0, Math.min(50, Number(storeConfig.directDiscountPercent) || 0));
    return Math.max(50, Math.round(parsePriceCents(item.price) * (1 - discount / 100)));
  }

  function formatMoney(cents) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  }

  function getMaxQuantity(item) {
    return Math.max(1, Number(item.maxQuantity || storeConfig.defaultMaxQuantity || 1));
  }

  function loadCart() {
    try {
      const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (!Array.isArray(value)) return [];
      return value.map(function (line) {
        const item = catalog.find(function (candidate) { return candidate.id === String(line.id); });
        if (!item) return null;
        return { id: item.id, quantity: Math.min(getMaxQuantity(item), Math.max(1, Number(line.quantity) || 1)) };
      }).filter(Boolean).slice(0, Number(storeConfig.maxCartLines) || 20);
    } catch (error) {
      return [];
    }
  }

  let cart = loadCart();

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (error) { /* Storage can be disabled. */ }
    renderCart();
  }

  function getCartDetails() {
    return cart.map(function (line) {
      const item = catalog.find(function (candidate) { return candidate.id === line.id; });
      return item ? { item: item, quantity: line.quantity } : null;
    }).filter(Boolean);
  }

  function getShippingQuote(subtotal, details) {
    const threshold = Math.max(1, Number(storeConfig.freeShippingThresholdCents) || 10000);
    const standardShipping = Math.max(0, Number(storeConfig.standardShippingCents) || 749);
    const weightOz = details.reduce(function (total, line) {
      return total + Math.max(1, Number(line.item.shippingWeightOz) || 32) * line.quantity;
    }, 0);
    const tiers = Array.isArray(storeConfig.shippingTiers) ? storeConfig.shippingTiers : [];
    const tier = tiers.find(function (candidate) { return weightOz <= Number(candidate.maxWeightOz); }) || tiers[tiers.length - 1];
    const calculatedShipping = Math.max(standardShipping, Number(tier && tier.amountCents) || standardShipping);
    const remaining = Math.max(0, threshold - subtotal);
    return {
      amount: remaining === 0 ? 0 : calculatedShipping,
      threshold: threshold,
      remaining: remaining,
      progress: Math.min(100, Math.round((subtotal / threshold) * 100)),
      weightOz: weightOz
    };
  }

  function renderCart() {
    const details = getCartDetails();
    const itemCount = details.reduce(function (sum, line) { return sum + line.quantity; }, 0);
    const subtotal = details.reduce(function (sum, line) { return sum + getDirectPriceCents(line.item) * line.quantity; }, 0);
    const shipping = getShippingQuote(subtotal, details);
    document.querySelectorAll('[data-cart-count]').forEach(function (host) {
      host.textContent = itemCount;
      host.classList.toggle('show', itemCount > 0);
    });
    document.querySelectorAll('[data-cart-subtotal]').forEach(function (host) { host.textContent = formatMoney(subtotal); });
    document.querySelectorAll('[data-cart-shipping]').forEach(function (host) { host.textContent = shipping.amount ? formatMoney(shipping.amount) : 'Free'; });
    document.querySelectorAll('[data-cart-shipping-label]').forEach(function (host) {
      host.textContent = shipping.amount ? 'Shipping (' + Math.max(1, Math.ceil(shipping.weightOz / 16)) + ' lb est.)' : 'Shipping';
    });
    document.querySelectorAll('[data-cart-estimate]').forEach(function (host) { host.textContent = formatMoney(subtotal + shipping.amount); });
    document.querySelectorAll('[data-shipping-progress-copy]').forEach(function (host) {
      host.textContent = shipping.remaining ? 'Free shipping at ' + formatMoney(shipping.threshold) : 'Free shipping unlocked';
    });
    document.querySelectorAll('[data-shipping-progress-amount]').forEach(function (host) {
      host.textContent = shipping.remaining ? 'Add ' + formatMoney(shipping.remaining) + ' more' : 'Your order ships free';
    });
    document.querySelectorAll('[data-shipping-progress-bar]').forEach(function (host) { host.style.width = shipping.progress + '%'; });

    const host = document.getElementById('cart-items');
    if (!host) return;
    if (!details.length) {
      host.innerHTML = '<div class="cart-empty"><span>Your cart is empty</span><strong>Start with something hard to find.</strong><a class="btn btn-dark" href="out-now.html">Browse current inventory</a></div>';
      const summary = document.getElementById('cart-summary');
      if (summary) summary.hidden = true;
      return;
    }
    const summary = document.getElementById('cart-summary');
    if (summary) summary.hidden = false;
    host.innerHTML = details.map(function (line) {
      const item = line.item;
      const maxQuantity = getMaxQuantity(item);
      const quantityControl = maxQuantity > 1
        ? '<div class="cart-quantity"><button type="button" data-cart-decrease="' + item.id + '" aria-label="Decrease quantity">&minus;</button><span>' + line.quantity + '</span><button type="button" data-cart-increase="' + item.id + '" aria-label="Increase quantity"' + (line.quantity >= maxQuantity ? ' disabled' : '') + '>+</button></div><span class="cart-stock">' + maxQuantity + ' available</span>'
        : '<span class="cart-one-only">Quantity 1</span>';
      return [
        '<div class="cart-line">',
        '  <img src="assets/images/listings/branded/' + item.id + '.webp" alt="">',
        '  <div class="cart-line-copy"><strong>' + escapeHtml(item.name) + '</strong><span>' + escapeHtml(item.detail) + '</span><div class="cart-line-controls">' + quantityControl + '<button type="button" class="cart-remove" data-cart-remove="' + item.id + '">Remove</button></div></div>',
        '  <b>' + formatMoney(getDirectPriceCents(item) * line.quantity) + '</b>',
        '</div>'
      ].join('');
    }).join('');
  }

  function openCart() {
    const drawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    if (!drawer || !cartOverlay) return;
    closeMenu();
    document.body.classList.add('cart-open');
    drawer.classList.add('show');
    cartOverlay.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    document.body.classList.remove('cart-open');
    if (drawer) {
      drawer.classList.remove('show');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (cartOverlay) cartOverlay.classList.remove('show');
  }

  function addToCart(id) {
    const item = catalog.find(function (candidate) { return candidate.id === id; });
    if (!item) return;
    const line = cart.find(function (candidate) { return candidate.id === id; });
    if (line) line.quantity = Math.min(getMaxQuantity(item), line.quantity + 1);
    else if (cart.length < (Number(storeConfig.maxCartLines) || 20)) cart.push({ id: id, quantity: 1 });
    saveCart();
    openCart();
  }

  function changeCartQuantity(id, amount) {
    const line = cart.find(function (candidate) { return candidate.id === id; });
    const item = catalog.find(function (candidate) { return candidate.id === id; });
    if (!line || !item) return;
    line.quantity = Math.max(0, Math.min(getMaxQuantity(item), line.quantity + amount));
    if (!line.quantity) cart = cart.filter(function (candidate) { return candidate.id !== id; });
    saveCart();
  }

  async function startCheckout(button) {
    if (!cart.length || button.disabled) return;
    const message = document.querySelector('[data-checkout-message]');
    button.disabled = true;
    button.textContent = 'Opening Stripe...';
    if (message) message.textContent = '';
    try {
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      });
      const data = await response.json().catch(function () { return {}; });
      if (!response.ok || !data.url) throw new Error(data.error || 'Direct checkout is not active in this preview yet.');
      window.location.assign(data.url);
    } catch (error) {
      if (message) message.textContent = error.message;
      button.disabled = false;
      button.textContent = 'Continue to secure checkout';
    }
  }

  function setupCart() {
    document.addEventListener('click', function (event) {
      const addButton = event.target.closest('[data-add-to-cart]');
      if (addButton) { addToCart(addButton.dataset.addToCart); return; }
      if (event.target.closest('[data-cart-open]')) { openCart(); return; }
      if (event.target.closest('[data-cart-close]')) { closeCart(); return; }
      const removeButton = event.target.closest('[data-cart-remove]');
      if (removeButton) { cart = cart.filter(function (line) { return line.id !== removeButton.dataset.cartRemove; }); saveCart(); return; }
      const decrease = event.target.closest('[data-cart-decrease]');
      if (decrease) { changeCartQuantity(decrease.dataset.cartDecrease, -1); return; }
      const increase = event.target.closest('[data-cart-increase]');
      if (increase) { changeCartQuantity(increase.dataset.cartIncrease, 1); return; }
      const checkout = event.target.closest('[data-cart-checkout]');
      if (checkout) startCheckout(checkout);
    });
    renderCart();
  }

  function renderCatalogs() {
    document.querySelectorAll('[data-catalog]').forEach(function (host) {
      const category = host.dataset.category || 'all';
      const featuredOnly = host.dataset.featured === 'true';
      const limit = Number(host.dataset.limit || 0);
      let items = catalog.slice();
      if (category !== 'all') items = items.filter(function (item) { return item.category === category; });
      if (featuredOnly) items = items.filter(function (item) { return item.featured; });
      if (limit > 0) items = items.slice(0, limit);
      host.innerHTML = items.map(productCard).join('');
    });
  }

  function renderSoldCatalog() {
    document.querySelectorAll('[data-sold-catalog]').forEach(function (host) {
      host.innerHTML = soldCatalog.map(soldCard).join('');
    });
  }

  function setupCatalogFilters() {
    const grid = document.querySelector('[data-shop-catalog]');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.product-card'));
    const search = document.getElementById('catalog-search');
    const tabs = Array.from(document.querySelectorAll('[data-filter-category]'));
    const count = document.getElementById('catalog-count');
    const empty = document.getElementById('catalog-empty');
    const params = new URLSearchParams(window.location.search);
    let currentCategory = categories[params.get('category')] ? params.get('category') : 'all';
    let query = (params.get('q') || '').trim().toLowerCase();

    if (search) search.value = params.get('q') || '';

    function update() {
      let visible = 0;
      cards.forEach(function (card) {
        const categoryMatch = currentCategory === 'all' || card.dataset.category === currentCategory;
        const searchMatch = !query || (card.dataset.search || '').includes(query);
        card.hidden = !(categoryMatch && searchMatch);
        if (!card.hidden) visible += 1;
      });
      tabs.forEach(function (tab) {
        tab.classList.toggle('active', tab.dataset.filterCategory === currentCategory);
      });
      if (count) count.textContent = visible + (visible === 1 ? ' item' : ' items');
      if (empty) empty.classList.toggle('show', visible === 0);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        currentCategory = tab.dataset.filterCategory;
        update();
      });
    });
    if (search) {
      search.addEventListener('input', function () {
        query = search.value.trim().toLowerCase();
        update();
      });
    }
    update();
  }

  function setupSoldFilters() {
    const grid = document.querySelector('[data-sold-catalog]');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.product-card'));
    const search = document.getElementById('sold-search');
    const tabs = Array.from(document.querySelectorAll('[data-sold-filter-category]'));
    const count = document.getElementById('sold-count');
    const empty = document.getElementById('sold-empty');
    const params = new URLSearchParams(window.location.search);
    const allowed = ['all', 'drinks', 'apparel', 'collectibles', 'other'];
    let currentCategory = allowed.includes(params.get('category')) ? params.get('category') : 'all';
    let query = (params.get('q') || '').trim().toLowerCase();
    if (search) search.value = params.get('q') || '';

    function update() {
      let visible = 0;
      cards.forEach(function (card) {
        const categoryMatch = currentCategory === 'all' || card.dataset.category === currentCategory || (currentCategory === 'other' && card.dataset.category === 'care');
        const searchMatch = !query || (card.dataset.search || '').includes(query);
        card.hidden = !(categoryMatch && searchMatch);
        if (!card.hidden) visible += 1;
      });
      tabs.forEach(function (tab) {
        tab.classList.toggle('active', tab.dataset.soldFilterCategory === currentCategory);
      });
      if (count) count.textContent = visible + (visible === 1 ? ' product' : ' products');
      if (empty) empty.classList.toggle('show', visible === 0);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        currentCategory = tab.dataset.soldFilterCategory;
        update();
      });
    });
    if (search) {
      search.addEventListener('input', function () {
        query = search.value.trim().toLowerCase();
        update();
      });
    }
    update();
  }

  function addSoldSchema() {
    if (!document.querySelector('[data-sold-catalog]') || !soldCatalog.length) return;
    const items = soldCatalog.map(function (item, index) {
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: item.name,
          image: item.image ? 'https://discontinuedclub.com/assets/images/sold/' + item.image : 'https://discontinuedclub.com/assets/images/logo-mark-clean.png',
          url: 'https://discontinuedclub.com/sold/' + item.slug + '.html',
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: item.price.replace('$', ''),
            availability: item.availableAgain ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: { '@type': 'Organization', name: 'Discontinued Club' }
          }
        }
      };
    });
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: items });
    document.head.appendChild(script);
  }

  function addCatalogSchema() {
    const schemaHost = document.querySelector('[data-shop-catalog]');
    if (!schemaHost) return;
    const schemaCategory = schemaHost.dataset.category || 'all';
    const schemaCatalog = schemaCategory === 'all' ? catalog : catalog.filter(function (item) { return item.category === schemaCategory; });
    const items = schemaCatalog.map(function (item, index) {
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: item.name,
          description: item.detail,
          image: 'https://discontinuedclub.com/assets/images/listings/' + item.image,
          url: 'https://discontinuedclub.com/out-now.html?item=' + item.id,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: (getDirectPriceCents(item) / 100).toFixed(2),
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'Discontinued Club' }
          }
        }
      };
    });
    if (!items.length) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: items });
    document.head.appendChild(script);
  }

  const finderKey = 'dc_store_finder_seen';
  function finderMarkup() {
    return [
      '<div class="brand-finder" id="brand-finder" aria-hidden="true">',
      '  <div class="brand-finder-backdrop" data-finder-close></div>',
      '  <section class="brand-finder-dialog" role="dialog" aria-modal="true" aria-labelledby="finder-title">',
      '    <button class="brand-finder-close" type="button" aria-label="Close store finder" data-finder-close>&times;</button>',
      '    <div class="section-kicker">Find it faster</div>',
      '    <h2 id="finder-title">What are you looking for?</h2>',
      '    <p>Jump straight to one of the four live departments. Buy direct for the lowest price or choose the matching eBay listing.</p>',
      '    <div class="finder-grid">',
      finderOption('Rare drinks', 'Limited, discontinued, and international beverages', '23 items', 'drinks'),
      finderOption('Sports & apparel', 'Jerseys, shoes, and vintage skate gear', '16 items', 'apparel'),
      finderOption('Collectibles & cards', 'Pokemon, Funko, and collector inventory', '4 items', 'collectibles'),
      finderOption('Personal care', 'Hard-to-find body wash and hair care', '5 items', 'care'),
      '    </div>',
      '    <div class="finder-actions"><a class="btn btn-dark" href="out-now.html" data-finder-choice>Browse all 48 listings</a><button class="btn btn-light" type="button" data-finder-close>Keep browsing</button></div>',
      '  </section>',
      '</div>'
    ].join('');
  }

  function finderOption(name, copy, count, category) {
    return '<a class="finder-option" href="out-now.html?category=' + category + '" data-finder-choice><span><strong>' + name + '</strong><span>' + copy + '</span></span><b>' + count + '</b></a>';
  }

  function openFinder() {
    const finder = document.getElementById('brand-finder');
    if (!finder) return;
    finder.classList.add('show');
    finder.setAttribute('aria-hidden', 'false');
  }

  function closeFinder() {
    const finder = document.getElementById('brand-finder');
    if (!finder) return;
    finder.classList.remove('show');
    finder.setAttribute('aria-hidden', 'true');
    sessionStorage.setItem(finderKey, '1');
  }

  function setupFinder() {
    document.body.insertAdjacentHTML('beforeend', finderMarkup());
    document.querySelectorAll('[data-finder-close]').forEach(function (element) {
      element.addEventListener('click', closeFinder);
    });
    document.querySelectorAll('[data-finder-choice]').forEach(function (element) {
      element.addEventListener('click', function () { sessionStorage.setItem(finderKey, '1'); });
    });
    const params = new URLSearchParams(window.location.search);
    const googleEntry = /(^|\.)google\./i.test(document.referrer.replace(/^https?:\/\//, '').split('/')[0]);
    const shouldOpen = params.get('showFinder') === '1' || (document.body.dataset.page === 'home' && googleEntry && !sessionStorage.getItem(finderKey));
    if (shouldOpen) window.setTimeout(openFinder, 350);
  }

  function replaceOldProductPages() {
    const path = window.location.pathname.split('/').pop() || '';
    if (!path.startsWith('product-')) return;
    const main = document.querySelector('main');
    if (!main) return;
    main.innerHTML = '<section class="page-hero compact"><div class="container"><div class="eyebrow">Listing status</div><h1>This item is not currently listed.</h1><p class="lead">Discontinued Club only publishes items that are ready to buy. Browse the current storefront to see all live inventory.</p><div class="hero-actions"><a class="btn btn-dark" href="out-now.html">View current listings</a><a class="btn btn-light" href="' + EBAY_STORE + '" target="_blank" rel="noopener">Open eBay store</a></div></div></section>';
  }

  renderCatalogs();
  renderSoldCatalog();
  setupCart();
  setupCatalogFilters();
  setupSoldFilters();
  addCatalogSchema();
  addSoldSchema();
  setupFinder();
  replaceOldProductPages();
}());
