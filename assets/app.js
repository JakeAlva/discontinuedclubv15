(function () {
  const EBAY_STORE = 'https://www.ebay.com/usr/discontinuedclub';
  const STRIPE_BADGE = '<a class="stripe-badge-link" href="https://stripe.com" target="_blank" rel="noopener noreferrer" aria-label="Payments powered by Stripe"><img class="stripe-badge" src="assets/images/powered-by-stripe.svg" alt="Powered by Stripe" width="150" height="34"></a>';
  const catalog = window.DC_CATALOG || [];
  const soldCatalog = window.DC_SOLD_CATALOG || [];
  const categories = window.DC_CATEGORIES || {};
  const storeConfig = window.DC_STORE_CONFIG || { directDiscountPercent: 3.5, standardShippingCents: 749, freeShippingThresholdCents: 20000, defaultMaxQuantity: 1, maxCartLines: 20 };
  const freeShippingThresholdCents = Math.max(1, Number(storeConfig.freeShippingThresholdCents) || 20000);
  const directCheckoutEnabled = storeConfig.directCheckoutEnabled === true;
  const directCheckoutDateLabel = storeConfig.directCheckoutDateLabel || 'coming soon';
  const directCheckoutNotice = directCheckoutDateLabel.toLowerCase() === 'coming soon'
    ? 'Direct checkout coming soon'
    : 'Direct checkout expected ' + directCheckoutDateLabel;
  const CART_KEY = 'dc_direct_cart_v1';
  const categoryLabels = {
    drinks: 'Rare drinks',
    apparel: 'Sports & apparel',
    'kids-shoes': "Designer kids' shoes",
    collectibles: 'Collectibles & cards',
    care: 'Personal care',
    home: 'Home & hobby',
    other: 'Other finds'
  };

  function productSlug(item) {
    const slug = String(item.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return 'products/' + slug + '-' + item.id + '.html';
  }

  function listingImagePath(item, variant, absolute) {
    const version = item.imageVersion || (item.id === '407134944288' ? '4pack-2' : '38');
    const path = 'assets/images/listings/' + variant + '/' + item.id + '.webp?v=' + version;
    return absolute ? 'https://discontinuedclub.com/' + path : path;
  }

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
    const shippingThresholdLabel = formatMoney(freeShippingThresholdCents);
    const announcement = directCheckoutEnabled
      ? 'Lower direct prices &nbsp;|&nbsp; Free shipping on ' + shippingThresholdLabel + '+ &nbsp;|&nbsp; Same-day handling before 12 PM CT'
      : directCheckoutNotice + ' &nbsp;|&nbsp; Current inventory available on eBay';
    const cartControls = directCheckoutEnabled ? [
      '      <div class="cart-status" data-cart-status>',
      '        <button class="icon-button cart-trigger" type="button" aria-label="Open shopping cart" title="Shopping cart" data-cart-open><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7Z"></path><path d="M9 8V5a3 3 0 0 1 6 0v3"></path></svg><span class="cart-count" data-cart-count>0</span></button>',
      '        <div class="cart-nudge" data-cart-nudge aria-hidden="true" role="status">',
      '          <div class="cart-nudge-head"><strong data-shipping-progress-copy>Free shipping at ' + shippingThresholdLabel + '</strong><span data-shipping-progress-amount></span></div>',
      '          <div class="shipping-progress-track" aria-hidden="true"><i data-shipping-progress-bar></i></div>',
      '          <button type="button" data-cart-open>View cart</button>',
      '        </div>',
      '      </div>'
    ].join('') : '';
    const headerShop = directCheckoutEnabled
      ? '      <a class="btn btn-dark header-shop" href="out-now.html">Shop direct</a>'
      : '      <a class="btn btn-dark header-shop" href="' + EBAY_STORE + '" target="_blank" rel="noopener">Shop on eBay</a>';
    const mobileCheckout = directCheckoutEnabled
      ? '<a class="btn btn-acid" href="out-now.html">Shop direct</a><a class="btn btn-light" href="' + EBAY_STORE + '" target="_blank" rel="noopener">Visit our eBay store</a><div class="mobile-note">Buy direct for the lowest price or use the matching eBay listing when you prefer eBay checkout and buyer protection.</div>'
      : '<a class="btn btn-dark" href="' + EBAY_STORE + '" target="_blank" rel="noopener">Shop current inventory on eBay</a><a class="btn btn-light" href="out-now.html">Browse the storefront</a><div class="mobile-note">' + directCheckoutNotice + '. Until then, every current product links to its matching eBay listing.</div>';
    const cartDrawer = directCheckoutEnabled ? [
      '<div class="cart-overlay" id="cart-overlay" data-cart-close></div>',
      '<aside class="cart-drawer" id="cart-drawer" aria-hidden="true" aria-labelledby="cart-title">',
      '  <div class="cart-drawer-head"><div><span class="section-kicker">Direct checkout</span><h2 id="cart-title">Your cart</h2></div><button class="cart-close" type="button" aria-label="Close cart" data-cart-close>&times;</button></div>',
      '  <div class="cart-items" id="cart-items"></div>',
      '  <div class="cart-drawer-foot" id="cart-summary">',
      '    <div class="shipping-progress"><div class="shipping-progress-copy"><strong data-shipping-progress-copy>Free shipping at ' + shippingThresholdLabel + '</strong><span data-shipping-progress-amount></span></div><div class="shipping-progress-track" aria-hidden="true"><i data-shipping-progress-bar></i></div></div>',
      '    <div class="cart-total"><span>Item subtotal</span><strong data-cart-subtotal>$0.00</strong></div>',
      '    <div class="cart-cost-line"><span data-cart-shipping-label>Shipping</span><strong data-cart-shipping>$7.49</strong></div>',
      '    <div class="cart-cost-line cart-estimate"><span>Estimated total</span><strong data-cart-estimate>$0.00</strong></div>',
      '    <p>Estimated total is before any required sales tax. Final details are shown in secure hosted checkout.</p>',
      '    <button class="btn btn-acid btn-full cart-checkout purchase-button" type="button" data-cart-checkout><span>Continue to secure checkout</span><span class="purchase-arrow" aria-hidden="true">&rarr;</span></button>',
      '    <div class="checkout-message" data-checkout-message role="status"></div>',
      '    <div class="stripe-note"><span>Payments processed securely</span>' + STRIPE_BADGE + '</div>',
      '  </div>',
      '</aside>'
    ].join('') : '';
    return [
      '<div class="announcement">' + announcement + '</div>',
      '<header class="site-header">',
      '  <div class="container site-header-inner">',
      '    <a class="logo-link" href="index.html" aria-label="Discontinued Club home"><img src="assets/images/logo-mark-clean.png" alt=""><span class="logo-type"><strong>Discontinued</strong><small>Club</small></span></a>',
      '    <nav class="desktop-nav" aria-label="Primary navigation">' + navMarkup() + '</nav>',
      '    <div class="header-actions">',
      '      <button class="icon-button" type="button" id="store-search-trigger" aria-label="Search the store" title="Search the store" aria-haspopup="dialog" aria-controls="store-search-dialog" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></button>',
      cartControls,
      headerShop,
      '      <button class="icon-button mobile-trigger" id="mobile-trigger" type="button" aria-label="Open menu" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg></button>',
      '    </div>',
      '  </div>',
      '</header>',
      '<dialog class="header-search" id="store-search-dialog" aria-labelledby="store-search-title">',
      '  <div class="header-search-head"><h2 id="store-search-title">Search the store</h2><button class="icon-button" type="button" data-search-close aria-label="Close search" title="Close search"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"></path></svg></button></div>',
      '  <form action="out-now.html" method="get" role="search" aria-label="Store search">',
      '    <div class="header-search-field"><label class="sr-only" for="header-search-input">Product, brand, or flavor</label><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg><input id="header-search-input" name="q" type="search" placeholder="Product, brand, or flavor" autocomplete="off" enterkeyhint="search" autofocus></div>',
      '    <p class="header-search-status" id="header-search-status" role="status" aria-live="polite" aria-atomic="true"></p>',
      '    <ul class="header-search-results" id="header-search-results" aria-label="Matching products"></ul>',
      '    <p class="header-search-empty" id="header-search-empty" hidden>No matching products. Try another brand or flavor.</p>',
      '    <div class="header-search-foot"><button class="btn btn-dark" type="submit" id="header-search-all">Browse all listings <span aria-hidden="true">&rarr;</span></button></div>',
      '  </form>',
      '</dialog>',
      '<div class="mobile-overlay" id="mobile-overlay"></div>',
      '<aside class="mobile-drawer" id="mobile-drawer" aria-hidden="true">',
      '  <div class="mobile-drawer-top"><a class="mobile-logo" href="index.html"><img src="assets/images/logo-mark-clean.png" alt=""><span class="logo-type"><strong>Discontinued</strong><small>Club</small></span></a><button class="mobile-close" id="mobile-close" type="button" aria-label="Close menu">&times;</button></div>',
      '  <nav class="mobile-links" aria-label="Mobile navigation">' + navMarkup() + '<a href="contact.html">Contact</a></nav>',
      '  <div class="mobile-drawer-bottom">' + mobileCheckout + '</div>',
      '</aside>',
      cartDrawer
    ].join('');
  }

  function footerMarkup() {
    const checkoutCopy = directCheckoutEnabled
      ? '<span>Direct payments are processed securely</span>' + STRIPE_BADGE + '<span>eBay remains available as a separate checkout option.</span>'
      : directCheckoutNotice + '. Current purchases are completed through eBay.';
    return [
      '<footer>',
      '  <div class="container">',
      '    <div class="footer-main">',
      '      <div class="footer-brand"><a class="footer-logo" href="index.html"><img src="assets/images/logo-mark-clean.png" alt=""><span class="logo-type"><strong>Discontinued</strong><small>Club</small></span></a><p>A focused resale store for rare drinks, discontinued goods, sports gear, collectibles, and everyday products that are getting harder to find.</p></div>',
      '      <div class="footer-column"><strong>Shop</strong><a href="out-now.html">All listings</a><a href="out-now.html?category=drinks">Rare drinks</a><a href="out-now.html?category=apparel">Sports & apparel</a><a href="out-now.html?category=kids-shoes">Designer kids&#39; shoes</a></div>',
      '      <div class="footer-column"><strong>Discover</strong><a href="sold-archive.html">Previously sold</a><a href="blog.html">Discontinued journal</a><a href="discontinued-energy-drink-flavors-2026.html">2026 flavor index</a></div>',
      '      <div class="footer-column"><strong>Discontinued Club</strong><a href="about.html">About</a><a href="contact.html">Contact</a><a href="' + EBAY_STORE + '" target="_blank" rel="noopener">eBay profile</a></div>',
      '      <div class="footer-column"><strong>Policies</strong><a href="shipping-returns.html">Shipping & returns</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></div>',
      '    </div>',
      '    <div class="footer-bottom"><span>&copy; 2026 Discontinued Club</span><span>' + checkoutCopy + '</span></div>',
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
    closeHeaderSearch();
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

  function normalizeSearch(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function matchesProductSearch(text, query) {
    const haystack = normalizeSearch(text);
    return normalizeSearch(query).split(/\s+/).every(function (word) { return haystack.includes(word); });
  }

  function closeHeaderSearch() {
    const dialog = document.getElementById('store-search-dialog');
    if (dialog && dialog.open) dialog.close();
  }

  function setupHeaderSearch() {
    const searchTrigger = document.getElementById('store-search-trigger');
    const dialog = document.getElementById('store-search-dialog');
    if (!searchTrigger || !dialog) return;
    const input = document.getElementById('header-search-input');
    const results = document.getElementById('header-search-results');
    const status = document.getElementById('header-search-status');
    const empty = document.getElementById('header-search-empty');
    const all = document.getElementById('header-search-all');

    function update() {
      const query = input.value.trim();
      const matches = catalog.filter(function (item) {
        return matchesProductSearch(item.name + ' ' + item.detail + ' ' + categoryLabels[item.category], query);
      });
      status.textContent = query ? matches.length + (matches.length === 1 ? ' matching product' : ' matching products') : 'Current listings';
      empty.hidden = matches.length > 0;
      all.disabled = matches.length === 0;
      all.textContent = query ? (matches.length === 1 ? 'View 1 result' : 'View all ' + matches.length + ' results') : 'Browse all listings';
      results.innerHTML = matches.slice(0, 6).map(function (item) {
        const price = directCheckoutEnabled && item.directCheckoutEnabled !== false ? formatMoney(getDirectPriceCents(item)) : item.price;
        return '<li><a class="header-search-result" href="' + productSlug(item) + '"><img src="' + listingImagePath(item, 'branded', false) + '" alt="" width="64" height="64"><span class="header-search-copy"><small>' + escapeHtml(categoryLabels[item.category] || 'Current inventory') + '</small><strong>' + escapeHtml(item.name) + '</strong></span><b>' + escapeHtml(price) + '</b></a></li>';
      }).join('');
    }

    searchTrigger.addEventListener('click', function () {
      closeMenu();
      closeCart();
      closeFinder();
      update();
      dialog.showModal();
      document.body.classList.add('search-open');
      searchTrigger.setAttribute('aria-expanded', 'true');
      input.focus({ preventScroll: true });
    });
    input.addEventListener('input', update);
    dialog.querySelector('[data-search-close]').addEventListener('click', closeHeaderSearch);
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeHeaderSearch();
      } else if (event.key === 'Tab') {
        const controls = Array.from(dialog.querySelectorAll('button:not(:disabled), input, a[href]'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    dialog.addEventListener('close', function () {
      document.body.classList.remove('search-open');
      searchTrigger.setAttribute('aria-expanded', 'false');
      searchTrigger.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', function (event) {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeHeaderSearch();
    });
  }

  function productCard(item) {
    const directCheckoutEnabled = storeConfig.directCheckoutEnabled === true && item.directCheckoutEnabled !== false;
    const href = 'https://www.ebay.com/itm/' + item.id;
    const detailHref = productSlug(item);
    const directCents = getDirectPriceCents(item);
    const ebayCents = parsePriceCents(item.price);
    const savings = Math.max(0, ebayCents - directCents);
    const stock = getMaxQuantity(item);
    const stockLabel = stock > 1 ? stock + ' in stock' : 'Last one';
    const stockBadge = item.category === 'kids-shoes' ? '' : '<span class="condition-badge">' + stockLabel + '</span>';
    const imageAlt = escapeHtml(item.name + ' - current Discontinued Club inventory');
    const pricing = directCheckoutEnabled
      ? '<div class="product-pricing"><span><small>Direct price</small><strong>' + formatMoney(directCents) + '</strong></span><span class="market-price"><small>eBay price</small><s>' + item.price + '</s></span></div><div class="product-savings">Save ' + formatMoney(savings) + ' on the item price</div>'
      : '<div class="product-pricing"><span><small>Available on eBay</small><strong>' + item.price + '</strong></span></div>';
    const actions = directCheckoutEnabled
      ? '<button class="btn btn-acid product-add purchase-button" type="button" data-add-to-cart="' + item.id + '"><span data-add-label>Add to cart</span><span class="purchase-arrow" aria-hidden="true">&rarr;</span></button><a class="ebay-option" href="' + href + '" target="_blank" rel="noopener" aria-label="Buy ' + escapeHtml(item.name) + ' on eBay">Buy on eBay</a>'
      : '<a class="btn btn-dark product-add" href="' + href + '" target="_blank" rel="noopener" aria-label="Buy ' + escapeHtml(item.name) + ' on eBay">Buy on eBay</a><a class="ebay-option" href="' + detailHref + '">View details</a>';
    return [
      '<article class="product-card" data-category="' + item.category + '" data-search="' + escapeHtml((item.name + ' ' + item.detail + ' ' + categoryLabels[item.category]).toLowerCase()) + '">',
      '  <a class="product-image" href="' + detailHref + '"><img src="' + listingImagePath(item, 'branded', false) + '" alt="' + imageAlt + '" loading="lazy" width="1200" height="1200">' + stockBadge + '</a>',
      '  <div class="product-content">',
      '    <div class="product-category">' + categoryLabels[item.category] + '</div>',
      '    <div class="product-name"><a href="' + detailHref + '">' + escapeHtml(item.name) + '</a></div>',
      '    <div class="product-detail">' + escapeHtml(item.detail) + '</div>',
      '    ' + pricing,
      '    <div class="product-actions">' + actions + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function soldCard(item) {
    const image = item.image
      ? '<img src="assets/images/sold/branded/' + item.id + '.webp" alt="' + escapeHtml(item.name + ' previously sold by Discontinued Club') + '" loading="lazy" width="1200" height="1200">'
      : '<div class="sold-placeholder"><img src="assets/images/logo-mark-clean.png" alt=""><strong>Sold archive</strong><span>Original image unavailable</span></div>';
    const status = item.availableAgain ? 'Available again' : item.soldOut ? 'Sold out' : 'Previously sold';
    return [
      '<article class="product-card sold-card" data-category="' + item.category + '" data-search="' + escapeHtml(item.name.toLowerCase()) + '">',
      '  <a href="sold/' + item.slug + '.html" aria-label="View the archive record for ' + escapeHtml(item.name) + '">',
      '    <div class="product-image">' + image + '<span class="condition-badge sold-badge' + (item.availableAgain ? ' available' : '') + '">' + status + '</span></div>',
      '    <div class="product-content">',
      '      <div class="product-category">' + categoryLabels[item.category] + '</div>',
      '      <div class="product-name">' + escapeHtml(item.name) + '</div>',
      '      <div class="product-detail">Real Discontinued Club sales record</div>',
      '      <div class="product-bottom"><span class="sold-price"><small>' + escapeHtml(item.priceLabel || 'Recorded sale') + '</small><strong>' + item.price + '</strong></span><span class="product-buy">View archive &rarr;</span></div>',
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
        if (!item || item.directCheckoutEnabled === false) return null;
        return { id: item.id, quantity: Math.min(getMaxQuantity(item), Math.max(1, Number(line.quantity) || 1)) };
      }).filter(Boolean).slice(0, Number(storeConfig.maxCartLines) || 20);
    } catch (error) {
      return [];
    }
  }

  let cart = loadCart();

  function cartQuantityFor(id) {
    const line = cart.find(function (candidate) { return candidate.id === id; });
    return line ? line.quantity : 0;
  }

  function syncAddButtons(onlyId) {
    document.querySelectorAll('[data-add-to-cart]').forEach(function (button) {
      const id = button.dataset.addToCart;
      if (onlyId && id !== onlyId) return;
      const item = catalog.find(function (candidate) { return candidate.id === id; });
      if (!item) return;
      const maxQuantity = getMaxQuantity(item);
      const singlePair = item.category === 'kids-shoes' && maxQuantity === 1;
      const quantity = cartQuantityFor(id);
      const atLimit = quantity >= maxQuantity;
      const label = button.querySelector('[data-add-label]');
      const arrow = button.querySelector('.purchase-arrow');
      let buttonLabel = 'Add to cart';

      if (atLimit) buttonLabel = singlePair ? 'In your cart' : (maxQuantity === 1 ? 'Last one in cart' : 'All stock in cart');
      else if (quantity > 0) buttonLabel = 'Add another';

      const limitMessage = singlePair ? 'This pair is already in your cart' : (maxQuantity === 1 ? 'The last available one is already in your cart' : 'All available units are already in your cart');
      button.disabled = atLimit;
      button.classList.toggle('is-cart-full', atLimit);
      button.title = atLimit
        ? limitMessage
        : 'Add ' + item.name + ' to cart';
      button.setAttribute('aria-label', atLimit
        ? item.name + ': ' + limitMessage.toLowerCase()
        : buttonLabel + ': ' + item.name);
      if (label) label.textContent = buttonLabel;
      if (arrow) arrow.textContent = atLimit ? '\u2713' : (quantity > 0 ? '+' : '\u2192');
    });

    document.querySelectorAll('[data-product-action-feedback]').forEach(function (host) {
      const id = host.dataset.productActionFeedback;
      if (onlyId && id !== onlyId) return;
      const item = catalog.find(function (candidate) { return candidate.id === id; });
      if (!item) return;
      const maxQuantity = getMaxQuantity(item);
      const quantity = cartQuantityFor(id);
      if (!quantity) host.textContent = 'In-stock items are reserved when checkout is completed.';
      else if (item.category === 'kids-shoes') host.textContent = 'In your cart. Availability is confirmed at checkout.';
      else if (quantity >= maxQuantity && maxQuantity === 1) host.textContent = 'The last available one is held in your cart.';
      else if (quantity >= maxQuantity) host.textContent = 'All ' + maxQuantity + ' available units are in your cart.';
      else host.textContent = quantity + ' of ' + maxQuantity + ' available units ' + (quantity === 1 ? 'is' : 'are') + ' in your cart.';
    });
  }

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
    const threshold = freeShippingThresholdCents;
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

  let renderedCartCount = null;
  let cartNudgeTimer = null;

  function hideCartNudge() {
    const nudge = document.querySelector('[data-cart-nudge]');
    if (!nudge) return;
    nudge.classList.remove('show');
    nudge.setAttribute('aria-hidden', 'true');
  }

  function acknowledgeCartAddition() {
    const trigger = document.querySelector('.cart-trigger');
    const nudge = document.querySelector('[data-cart-nudge]');
    if (!trigger || !nudge) return;
    window.clearTimeout(cartNudgeTimer);
    trigger.classList.remove('cart-attention');
    void trigger.offsetWidth;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) trigger.classList.add('cart-attention');
    nudge.classList.add('show');
    nudge.setAttribute('aria-hidden', 'false');
    cartNudgeTimer = window.setTimeout(function () {
      trigger.classList.remove('cart-attention');
      hideCartNudge();
    }, 5200);
  }

  function renderCart() {
    const details = getCartDetails();
    const itemCount = details.reduce(function (sum, line) { return sum + line.quantity; }, 0);
    const subtotal = details.reduce(function (sum, line) { return sum + getDirectPriceCents(line.item) * line.quantity; }, 0);
    const shipping = getShippingQuote(subtotal, details);
    document.querySelectorAll('[data-cart-count]').forEach(function (host) {
      host.textContent = itemCount;
      host.classList.toggle('show', itemCount > 0);
      if (renderedCartCount !== null && itemCount > renderedCartCount) {
        host.classList.remove('bump');
        void host.offsetWidth;
        host.classList.add('bump');
        window.setTimeout(function () { host.classList.remove('bump'); }, 420);
      }
    });
    document.querySelectorAll('[data-cart-status]').forEach(function (host) {
      host.classList.toggle('has-items', itemCount > 0);
    });
    if (!itemCount) hideCartNudge();
    renderedCartCount = itemCount;
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
    syncAddButtons();

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
        '  <img src="' + listingImagePath(item, 'branded', false) + '" alt="">',
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
    hideCartNudge();
    closeMenu();
    closeHeaderSearch();
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

  function selectedProductQuantity(id) {
    const picker = Array.from(document.querySelectorAll('[data-product-quantity-picker]')).find(function (candidate) {
      return candidate.dataset.productId === id;
    });
    return picker ? Math.max(1, Number(picker.querySelector('[data-product-quantity]')?.value) || 1) : 1;
  }

  function showAddFeedback(id, added) {
    if (added <= 0) {
      syncAddButtons(id);
      return;
    }
    const message = added === 1 ? 'Added to cart' : added + ' added to cart';
    document.querySelectorAll('[data-add-to-cart]').forEach(function (button) {
      if (button.dataset.addToCart !== id) return;
      const label = button.querySelector('[data-add-label]');
      const arrow = button.querySelector('.purchase-arrow');
      if (label) label.textContent = 'Added';
      if (arrow) arrow.textContent = '\u2713';
      button.classList.add('is-added');
      window.setTimeout(function () {
        button.classList.remove('is-added');
        syncAddButtons(id);
      }, 1100);
    });
    document.querySelectorAll('[data-product-action-feedback]').forEach(function (host) {
      if (host.dataset.productActionFeedback === id) host.textContent = message + '.';
    });
  }

  function celebrateCartAddition(button) {
    if (!button || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = button.getBoundingClientRect();
    const burst = document.createElement('span');
    const pieces = [
      [-58, -36, -110, '#d7ff43', 0], [-42, -57, -72, '#2d5bf0', 20], [-21, -66, 95, '#ffca2c', 8],
      [0, -72, 180, '#e6442f', 26], [23, -65, 80, '#ffffff', 12], [45, -54, 130, '#2d5bf0', 30],
      [60, -32, 115, '#d7ff43', 4], [-64, -10, -160, '#ffca2c', 24], [64, -7, 155, '#e6442f', 16],
      [-36, -22, 60, '#ffffff', 32], [34, -25, -45, '#ffca2c', 6], [4, -45, 120, '#d7ff43', 18]
    ];
    burst.className = 'purchase-confetti';
    burst.setAttribute('aria-hidden', 'true');
    burst.style.left = (rect.left + rect.width / 2) + 'px';
    burst.style.top = (rect.top + rect.height / 2) + 'px';
    pieces.forEach(function (piece, index) {
      const particle = document.createElement('i');
      particle.style.setProperty('--confetti-x', piece[0] + 'px');
      particle.style.setProperty('--confetti-y', piece[1] + 'px');
      particle.style.setProperty('--confetti-mid-x', (piece[0] * .78) + 'px');
      particle.style.setProperty('--confetti-rotate', piece[2] + 'deg');
      particle.style.setProperty('--confetti-mid-rotate', (piece[2] * .7) + 'deg');
      particle.style.setProperty('--confetti-color', piece[3]);
      particle.style.setProperty('--confetti-delay', piece[4] + 'ms');
      if (index % 4 === 0) particle.className = 'is-dot';
      burst.appendChild(particle);
    });
    document.body.appendChild(burst);
    button.classList.remove('purchase-reward');
    void button.offsetWidth;
    button.classList.add('purchase-reward');
    window.setTimeout(function () {
      button.classList.remove('purchase-reward');
      burst.remove();
    }, 720);
  }

  function addToCart(id, requestedQuantity) {
    const item = catalog.find(function (candidate) { return candidate.id === id; });
    if (!item || item.directCheckoutEnabled === false) return null;
    const max = getMaxQuantity(item);
    const quantity = Math.max(1, Math.min(max, Number(requestedQuantity) || 1));
    const line = cart.find(function (candidate) { return candidate.id === id; });
    const before = line ? line.quantity : 0;
    if (line) line.quantity = Math.min(max, line.quantity + quantity);
    else if (cart.length < (Number(storeConfig.maxCartLines) || 20)) cart.push({ id: id, quantity: quantity });
    saveCart();
    const current = cart.find(function (candidate) { return candidate.id === id; });
    return { item: item, added: Math.max(0, (current ? current.quantity : 0) - before), maxQuantity: max };
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
    if (!directCheckoutEnabled) return;
    if (!cart.length || button.disabled) return;
    const message = document.querySelector('[data-checkout-message]');
    button.disabled = true;
    button.classList.add('is-loading');
    button.innerHTML = '<span>Opening secure checkout...</span>';
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
      button.classList.remove('is-loading');
      button.innerHTML = '<span>Continue to secure checkout</span><span class="purchase-arrow" aria-hidden="true">&rarr;</span>';
    }
  }

  function setupProductQuantity() {
    document.querySelectorAll('[data-product-quantity-picker]').forEach(function (picker) {
      const output = picker.querySelector('[data-product-quantity]');
      const decrease = picker.querySelector('[data-product-quantity-decrease]');
      const increase = picker.querySelector('[data-product-quantity-increase]');
      const max = Math.max(1, Number(picker.dataset.max) || 1);
      const price = Math.max(1, Number(picker.dataset.price) || 1);
      const threshold = Math.max(1, Number(picker.dataset.freeShippingThreshold) || freeShippingThresholdCents);

      function update(value) {
        const quantity = Math.max(1, Math.min(max, Number(value) || 1));
        output.value = quantity;
        output.textContent = quantity;
        decrease.disabled = quantity <= 1;
        increase.disabled = quantity >= max;
        const note = document.querySelector('[data-product-order-note="' + picker.dataset.productId + '"]');
        if (note) {
          const remaining = Math.max(0, threshold - (price * quantity));
          note.textContent = remaining ? formatMoney(remaining) + ' away from free standard shipping.' : 'This quantity qualifies for free standard shipping.';
        }
      }

      decrease.addEventListener('click', function () { update(Number(output.value) - 1); });
      increase.addEventListener('click', function () { update(Number(output.value) + 1); });
      update(1);
    });
  }

  function setupCart() {
    if (!directCheckoutEnabled) return;
    document.addEventListener('click', function (event) {
      const addButton = event.target.closest('[data-add-to-cart]');
      if (addButton) {
        const id = addButton.dataset.addToCart;
        const requestedQuantity = addButton.dataset.addQuantitySource ? selectedProductQuantity(id) : 1;
        const result = addToCart(id, requestedQuantity);
        if (result) {
          showAddFeedback(id, result.added);
          if (result.added > 0) {
            celebrateCartAddition(addButton);
            acknowledgeCartAddition();
          }
        }
        return;
      }
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
        const searchMatch = matchesProductSearch(card.dataset.search || '', query);
        card.hidden = !(categoryMatch && searchMatch);
        if (!card.hidden) visible += 1;
      });
      tabs.forEach(function (tab) {
        const active = tab.dataset.filterCategory === currentCategory;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-pressed', String(active));
      });
      const activeTab = tabs.find(function (tab) { return tab.dataset.filterCategory === currentCategory; });
      const tabRow = activeTab && activeTab.parentElement;
      if (tabRow && tabRow.scrollWidth > tabRow.clientWidth) {
        const rowBounds = tabRow.getBoundingClientRect();
        const tabBounds = activeTab.getBoundingClientRect();
        if (tabBounds.left < rowBounds.left || tabBounds.right > rowBounds.right) {
          tabRow.scrollLeft += tabBounds.left - rowBounds.left - (tabRow.clientWidth - tabBounds.width) / 2;
        }
      }
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
          image: listingImagePath(item, 'merchant', true),
          url: 'https://discontinuedclub.com/' + productSlug(item),
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: ((directCheckoutEnabled && item.directCheckoutEnabled !== false ? getDirectPriceCents(item) : parsePriceCents(item.price)) / 100).toFixed(2),
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
      '  <section class="brand-finder-dialog" role="dialog" aria-modal="true" aria-labelledby="finder-title" aria-describedby="finder-description">',
      '    <button class="brand-finder-close" type="button" aria-label="Close store finder" data-finder-close>&times;</button>',
      '    <div class="finder-editorial-head">',
      '      <div class="finder-title-block">',
      '        <div class="finder-brand-line"><img src="assets/images/logo-mark-clean.png" alt=""><span>Discontinued Club / Live storefront</span></div>',
      '        <div class="section-kicker">Your shortcut into the club</div>',
      '        <h2 id="finder-title">Where should we take you?</h2>',
      '        <p id="finder-description">Choose a department and we will open the live shelf. Every image below is a real product from current inventory.</p>',
      '      </div>',
      '      <div class="finder-live-count"><strong>' + catalog.length + '</strong><span>current listings<br>ready to explore</span></div>',
      '    </div>',
      '    <div class="finder-grid">',
      finderOption('Rare drinks', 'Limited, discontinued, and international beverages', categoryCount('drinks'), 'drinks'),
      finderOption('Sports & apparel', 'Jerseys, shoes, and vintage skate gear', categoryCount('apparel'), 'apparel'),
      finderOption("Designer kids' shoes", "Pre-owned designer sneakers in children's sizes", categoryCount('kids-shoes'), 'kids-shoes'),
      finderOption('Collectibles & cards', 'Pokemon, Funko, and collector inventory', categoryCount('collectibles'), 'collectibles'),
      finderOption('Personal care', 'Hard-to-find body wash and hair care', categoryCount('care'), 'care'),
      finderOption('Home & hobby', 'Practical finds for home and hobby projects', categoryCount('home'), 'home'),
      '    </div>',
      '    <div class="finder-actions"><span><strong>Want the whole shelf?</strong><small>See every current find in one place.</small></span><div><a class="btn btn-dark" href="out-now.html" data-finder-choice>Browse all ' + catalog.length + '</a><button class="btn btn-light" type="button" data-finder-close>Stay here</button></div></div>',
      '  </section>',
      '</div>'
    ].join('');
  }

  function categoryCount(category) {
    const count = catalog.filter(function (item) { return item.category === category; }).length;
    return count + (count === 1 ? ' item' : ' items');
  }

  function finderOption(name, copy, count, category) {
    const spotlightIds = { care: '406763456229' };
    const spotlight = catalog.find(function (item) { return item.id === spotlightIds[category]; })
      || catalog.find(function (item) { return item.category === category; });
    const categoryNumber = ['drinks', 'apparel', 'kids-shoes', 'collectibles', 'care', 'home'].indexOf(category) + 1;
    const image = spotlight
      ? '<img src="' + listingImagePath(spotlight, 'branded', false) + '" alt="' + escapeHtml(spotlight.name) + '" width="1200" height="1200">'
      : '<span class="finder-option-placeholder">DC</span>';
    return [
      '<a class="finder-option" data-category="' + category + '" href="out-now.html?category=' + category + '" data-finder-choice aria-label="Shop ' + escapeHtml(name) + ', ' + count + '">',
      '  <span class="finder-option-media">' + image + '</span>',
      '  <span class="finder-option-copy">',
      '    <span class="finder-option-topline"><small>0' + categoryNumber + ' / Department</small><b>' + count + '</b></span>',
      '    <strong>' + escapeHtml(name) + '</strong>',
      '    <span class="finder-option-description">' + escapeHtml(copy) + '</span>',
      '    <span class="finder-option-cta">Explore the shelf <i aria-hidden="true">&rarr;</i></span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function openFinder() {
    const finder = document.getElementById('brand-finder');
    if (!finder) return;
    document.body.classList.add('finder-open');
    finder.classList.add('show');
    finder.setAttribute('aria-hidden', 'false');
    const close = finder.querySelector('.brand-finder-close');
    if (close) close.focus({ preventScroll: true });
  }

  function closeFinder() {
    const finder = document.getElementById('brand-finder');
    if (!finder) return;
    document.body.classList.remove('finder-open');
    finder.classList.remove('show');
    finder.setAttribute('aria-hidden', 'true');
    sessionStorage.setItem(finderKey, '1');
  }

  function setupFinder() {
    const params = new URLSearchParams(window.location.search);
    const googleEntry = /(^|\.)google\./i.test(document.referrer.replace(/^https?:\/\//, '').split('/')[0]);
    const shouldOpen = params.get('showFinder') === '1' || (document.body.dataset.page === 'home' && googleEntry && !sessionStorage.getItem(finderKey));
    if (!shouldOpen) return;
    document.body.insertAdjacentHTML('beforeend', finderMarkup());
    document.querySelectorAll('[data-finder-close]').forEach(function (element) {
      element.addEventListener('click', closeFinder);
    });
    document.querySelectorAll('[data-finder-choice]').forEach(function (element) {
      element.addEventListener('click', function () { sessionStorage.setItem(finderKey, '1'); });
    });
    window.setTimeout(openFinder, 350);
  }

  function setupCampaignCarousel() {
    const carousel = document.querySelector('[data-campaign-carousel]');
    if (!carousel) return;
    const track = carousel.querySelector('[data-campaign-track]');
    const slides = Array.from(carousel.querySelectorAll('[data-campaign-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-campaign-dot]'));
    const previous = carousel.querySelector('[data-campaign-prev]');
    const next = carousel.querySelector('[data-campaign-next]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeIndex = 0;
    let timer = 0;
    let scrollFrame = 0;

    if (!track || slides.length < 2) return;

    function updateControls(index) {
      activeIndex = (index + slides.length) % slides.length;
      dots.forEach(function (dot, dotIndex) {
        const isActive = dotIndex === activeIndex;
        dot.classList.toggle('active', isActive);
        if (isActive) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    function showSlide(index, behavior) {
      const nextIndex = (index + slides.length) % slides.length;
      updateControls(nextIndex);
      track.scrollTo({ left: slides[nextIndex].offsetLeft, behavior: behavior || 'smooth' });
    }

    function stopAutoplay() {
      window.clearInterval(timer);
      timer = 0;
    }

    function startAutoplay() {
      stopAutoplay();
      if (reducedMotion.matches || document.hidden) return;
      timer = window.setInterval(function () { showSlide(activeIndex + 1, 'smooth'); }, 7000);
    }

    track.addEventListener('scroll', function () {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(function () {
        const index = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        updateControls(Math.min(slides.length - 1, Math.max(0, index)));
      });
    }, { passive: true });
    if (previous) previous.addEventListener('click', function () { showSlide(activeIndex - 1); startAutoplay(); });
    if (next) next.addEventListener('click', function () { showSlide(activeIndex + 1); startAutoplay(); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () { showSlide(Number(dot.dataset.campaignDot) || 0); startAutoplay(); });
    });
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', function (event) {
      if (!carousel.contains(event.relatedTarget)) startAutoplay();
    });
    track.addEventListener('pointerdown', stopAutoplay, { passive: true });
    track.addEventListener('pointerup', startAutoplay, { passive: true });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stopAutoplay(); else startAutoplay(); });
    reducedMotion.addEventListener('change', startAutoplay);
    window.addEventListener('resize', function () { showSlide(activeIndex, 'auto'); });
    updateControls(0);
    startAutoplay();
  }

  function setupProductGallery() {
    const mainImage = document.querySelector('[data-product-main-image]');
    const thumbnails = Array.from(document.querySelectorAll('[data-product-gallery-src]'));
    if (!mainImage) return;
    const zoom = document.querySelector('[data-product-zoom]');
    const lens = document.querySelector('[data-product-lens]');
    let zoomed = false;
    let scale = 1;
    let x = 50;
    let y = 50;
    let drag = null;
    let dragged = false;
    let geometry = null;
    let touchLens = false;

    function position(nextX, nextY) {
      x = Math.max(0, Math.min(100, nextX));
      y = Math.max(0, Math.min(100, nextY));
      if (!geometry || !lens) return;
      const pointX = geometry.width * x / 100;
      const pointY = geometry.height * y / 100;
      const radius = geometry.diameter / 2;
      const centerX = Math.max(radius + 6, Math.min(geometry.width - radius - 6, pointX));
      // Keep the touch lens above the fingertip so it does not obscure the detail.
      const centerY = Math.max(radius + 6, Math.min(geometry.height - radius - 20, pointY - (touchLens ? radius + 24 : 0)));
      lens.style.left = (centerX - radius) + 'px';
      lens.style.top = (centerY - radius) + 'px';
      lens.style.backgroundPosition = (radius - (pointX - geometry.offsetX) * scale) + 'px ' + (radius - (pointY - geometry.offsetY) * scale) + 'px';
    }

    function setZoom(active) {
      if (!zoom) return;
      zoomed = active && !zoom.disabled;
      zoom.classList.toggle('is-zoomed', zoomed);
      zoom.setAttribute('aria-pressed', String(zoomed));
      const label = zoomed ? 'Close photo magnifier' : 'Magnify product photo';
      zoom.setAttribute('aria-label', label);
      zoom.title = label;
      if (!zoomed) position(50, 50);
    }

    function measureZoom() {
      if (!zoom || !lens) return;
      const styles = window.getComputedStyle(mainImage);
      const left = parseFloat(styles.paddingLeft) || 0;
      const top = parseFloat(styles.paddingTop) || 0;
      const contentWidth = mainImage.clientWidth - left - (parseFloat(styles.paddingRight) || 0);
      const contentHeight = mainImage.clientHeight - top - (parseFloat(styles.paddingBottom) || 0);
      const ratio = Math.min(contentWidth / mainImage.naturalWidth, contentHeight / mainImage.naturalHeight);
      // Match object-fit: contain, including padding, without exceeding original resolution.
      scale = Math.min(2.5, Math.max(1, 1 / ratio));
      zoom.disabled = !mainImage.naturalWidth || !mainImage.naturalHeight || !Number.isFinite(ratio) || ratio <= 0 || scale <= 1;
      if (!zoom.disabled) {
        const width = zoom.clientWidth;
        const height = zoom.clientHeight;
        const photoWidth = mainImage.naturalWidth * ratio;
        const photoHeight = mainImage.naturalHeight * ratio;
        const diameter = Math.min(220, Math.max(150, Math.min(width, height) * 0.45));
        geometry = { width: width, height: height, diameter: diameter, offsetX: left + (contentWidth - photoWidth) / 2, offsetY: top + (contentHeight - photoHeight) / 2 };
        lens.style.width = diameter + 'px';
        lens.style.height = diameter + 'px';
        lens.style.backgroundImage = 'url(' + JSON.stringify(mainImage.currentSrc || mainImage.src) + ')';
        lens.style.backgroundSize = (photoWidth * scale) + 'px ' + (photoHeight * scale) + 'px';
        position(x, y);
      }
      if (zoom.disabled) setZoom(false);
    }

    if (zoom && lens) {
      const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
      function followPointer(event) {
        const bounds = zoom.getBoundingClientRect();
        touchLens = event.pointerType === 'touch' || event.pointerType === 'pen';
        position((event.clientX - bounds.left - zoom.clientLeft) / zoom.clientWidth * 100, (event.clientY - bounds.top - zoom.clientTop) / zoom.clientHeight * 100);
      }
      zoom.addEventListener('pointerenter', function (event) {
        if (event.pointerType !== 'mouse' || !hover.matches) return;
        measureZoom();
        followPointer(event);
        setZoom(true);
      });
      zoom.addEventListener('pointerleave', function (event) {
        if (event.pointerType === 'mouse') setZoom(false);
      });
      zoom.addEventListener('pointerdown', function (event) {
        dragged = false;
        if (event.pointerType === 'mouse') return;
        followPointer(event);
        if (!zoomed) return;
        drag = { id: event.pointerId, clientX: event.clientX, clientY: event.clientY };
        zoom.setPointerCapture(event.pointerId);
      });
      zoom.addEventListener('pointermove', function (event) {
        if (!zoomed) return;
        if (event.pointerType === 'mouse' && hover.matches) {
          followPointer(event);
        } else if (drag && drag.id === event.pointerId) {
          const dx = event.clientX - drag.clientX;
          const dy = event.clientY - drag.clientY;
          if (Math.abs(dx) + Math.abs(dy) > 5) dragged = true;
          followPointer(event);
        }
      });
      function endDrag(event) {
        if (zoom.hasPointerCapture(event.pointerId)) zoom.releasePointerCapture(event.pointerId);
        drag = null;
      }
      zoom.addEventListener('pointerup', endDrag);
      zoom.addEventListener('pointercancel', function (event) { endDrag(event); setZoom(false); });
      zoom.addEventListener('click', function (event) {
        if (dragged && event.detail !== 0) { dragged = false; return; }
        if (event.detail === 0) { touchLens = false; position(50, 50); }
        measureZoom();
        setZoom(!zoomed);
      });
      zoom.addEventListener('keydown', function (event) {
        if (!zoomed) return;
        const movement = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[event.key];
        if (movement) { event.preventDefault(); position(x + movement[0], y + movement[1]); }
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setZoom(false); }
      });
      zoom.addEventListener('blur', function () { setZoom(false); });
      mainImage.addEventListener('load', measureZoom);
      mainImage.addEventListener('error', function () { zoom.disabled = true; setZoom(false); });
      window.addEventListener('resize', function () { setZoom(false); measureZoom(); });
      measureZoom();
    }

    thumbnails.forEach(function (thumbnail) {
      thumbnail.addEventListener('click', function () {
        setZoom(false);
        if (zoom) zoom.disabled = true;
        mainImage.src = thumbnail.dataset.productGallerySrc;
        mainImage.alt = thumbnail.dataset.productGalleryAlt || '';
        thumbnails.forEach(function (candidate) { candidate.classList.remove('active'); });
        thumbnail.classList.add('active');
      });
    });
  }

  function replaceOldProductPages() {
    const path = window.location.pathname.split('/').pop() || '';
    if (!path.startsWith('product-')) return;
    const main = document.querySelector('main');
    if (!main) return;
    main.innerHTML = '<section class="page-hero compact"><div class="container"><div class="eyebrow">Listing status</div><h1>This item is not currently listed.</h1><p class="lead">Discontinued Club only publishes items that are ready to buy. Browse the current storefront to see all live inventory.</p><div class="hero-actions"><a class="btn btn-dark" href="out-now.html">View current listings</a><a class="btn btn-light" href="' + EBAY_STORE + '" target="_blank" rel="noopener">Open eBay store</a></div></div></section>';
  }

  document.querySelectorAll('[data-listing-count]').forEach(function (host) {
    const category = host.dataset.listingCount;
    host.textContent = category === 'all' ? catalog.length : catalog.filter(function (item) { return item.category === category; }).length;
  });
  renderCatalogs();
  renderSoldCatalog();
  setupProductQuantity();
  setupCart();
  setupHeaderSearch();
  setupCatalogFilters();
  setupSoldFilters();
  addCatalogSchema();
  addSoldSchema();
  setupFinder();
  setupCampaignCarousel();
  setupProductGallery();
  replaceOldProductPages();
}());
