import Stripe from 'stripe';

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
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] });
      console.log(JSON.stringify({
        event: 'direct_order_paid',
        sessionId: session.id,
        amountTotal: session.amount_total,
        customerEmail: session.customer_details?.email,
        listingIds: session.metadata.listing_ids,
        items: fullSession.line_items?.data.map((line) => ({ description: line.description, quantity: line.quantity })) || []
      }));
    }
  }

  return new Response('ok', { status: 200 });
};
