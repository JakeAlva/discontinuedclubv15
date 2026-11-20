(async function () {
  const reference = new URLSearchParams(location.hash.slice(1));
  const title = document.querySelector('[data-return-title]');
  const copy = document.querySelector('[data-return-copy]');
  const item = reference.get('item');
  const reservation = reference.get('reservation');
  history.replaceState(null, '', location.pathname);
  if (!item || !reservation) {
    title.textContent = 'Checkout was not changed.';
    copy.textContent = 'There is no preorder reference in this link. Contact us if you need help with an existing order.';
    return;
  }
  try {
    const response = await fetch('/.netlify/functions/preorder-cancel', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, reservation })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    title.textContent = result.paid ? 'Your preorder is already paid.' : 'Checkout closed. No payment was made.';
    copy.textContent = result.paid
      ? 'Your paid order was not cancelled. To request cancellation before shipment, email jacob@discontinuedclub.com.'
      : 'Your temporary stock reservation has been released. Your cart is still here when you are ready.';
  } catch (error) {
    title.textContent = 'We could not confirm checkout status.';
    copy.textContent = error.message || 'Please contact jacob@discontinuedclub.com before trying again if you submitted a payment.';
  }
}());
