import Stripe from 'stripe';

export const config = {
  rateLimit: { windowSize: 60, windowLimit: 60, aggregateBy: ['ip'] }
};

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

export default async (request) => {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);
  if (!process.env.STRIPE_SECRET_KEY) return json({ error: 'Stripe is not connected.' }, 503);
  const sessionId = new URL(request.url).searchParams.get('session_id') || '';
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) return json({ error: 'Invalid checkout reference.' }, 400);

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.source !== 'discontinuedclub.com') return json({ error: 'Checkout reference not found.' }, 404);
    return json({
      paid: session.payment_status === 'paid' || session.payment_status === 'no_payment_required',
      orderReference: session.id.slice(-10).toUpperCase(),
      email: session.customer_details?.email || '',
      amountTotal: session.amount_total || 0,
      currency: session.currency || 'usd'
    });
  } catch (error) {
    console.error('Checkout status error', error);
    return json({ error: 'Checkout reference not found.' }, 404);
  }
};
