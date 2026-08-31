(async function () {
  const title = document.querySelector('[data-success-title]');
  const copy = document.querySelector('[data-success-copy]');
  const confirmation = document.querySelector('[data-order-confirmation]');
  const sessionId = new URLSearchParams(window.location.search).get('session_id');

  if (!sessionId) {
    title.textContent = 'We could not find that order.';
    copy.textContent = 'Open the confirmation link from Stripe again or contact us with the email used at checkout.';
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/checkout-status?session_id=' + encodeURIComponent(sessionId));
    const data = await response.json();
    if (!response.ok || !data.paid) throw new Error(data.error || 'Payment is still processing.');
    localStorage.removeItem('dc_direct_cart_v1');
    document.querySelectorAll('[data-cart-count]').forEach(function (host) { host.textContent = '0'; host.classList.remove('show'); });
    title.textContent = 'Your order is in.';
    copy.textContent = 'A Stripe receipt has been sent to ' + (data.email || 'the email used at checkout') + '. We will prepare the shipment next.';
    confirmation.hidden = false;
    confirmation.innerHTML = '<span>Order reference</span><strong>' + data.orderReference + '</strong><span>Total paid</span><strong>' + new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency || 'USD' }).format(data.amountTotal / 100) + '</strong>';
  } catch (error) {
    title.textContent = 'Payment confirmation is still loading.';
    copy.textContent = error.message + ' Stripe will still email a receipt when payment is complete.';
  }
}());
