import Stripe from 'stripe';
import { inventoryAdjustment } from '../../lib/stripe-inventory.mjs';

async function updatePurchasedInventory(stripe, sessionId) {
  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100,
    expand: ['data.price.product']
  });
  const results = [];

  for (const line of lineItems.data) {
    const product = line.price?.product;
    const adjustment = inventoryAdjustment(product, line.quantity, sessionId);
    if (adjustment.status === 'already_applied') {
      results.push({ productId: product.id, status: adjustment.status, stock: adjustment.stock });
      continue;
    }
    if (adjustment.status !== 'update') {
      throw new Error(`Could not update Stripe inventory for checkout line ${line.id}: ${adjustment.status}`);
    }

    await stripe.products.update(product.id, {
      metadata: {
        dc_stock: String(adjustment.nextStock),
        dc_last_sale_session: sessionId
      }
    });
    results.push({
      productId: product.id,
      status: 'updated',
      previousStock: adjustment.previousStock,
      stock: adjustment.nextStock,
      quantity: line.quantity
    });
  }

  return { lineItems, results };
}

export default async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook is not configured', { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, request.headers.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Invalid Stripe webhook signature', error.message);
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    if (session.metadata?.source === 'discontinuedclub.com' && session.payment_status !== 'unpaid') {
      try {
        const { lineItems, results } = await updatePurchasedInventory(stripe, session.id);
        console.log(JSON.stringify({
          event: 'direct_order_paid',
          sessionId: session.id,
          amountTotal: session.amount_total,
          customerEmail: session.customer_details?.email,
          listingIds: session.metadata.listing_ids,
          items: lineItems.data.map((line) => ({ description: line.description, quantity: line.quantity })),
          inventory: results
        }));
      } catch (error) {
        console.error('Paid order inventory update failed', session.id, error.message);
        return new Response('Inventory update failed', { status: 500 });
      }
    }
  }

  return new Response('ok', { status: 200 });
};
