import { randomUUID } from 'node:crypto';

export function preorderOpen(item, now = Date.now()) {
  return Boolean(item?.preorder && now < Date.parse(item.preorder.closesAt));
}

export function preorderForCart(lines, now = Date.now()) {
  const preorders = lines.filter(({ item }) => item.preorder);
  if (!preorders.length) return null;
  if (lines.length !== 1) throw new Error('Preorder items need a separate cart from in-stock products. Please order them separately.');
  if (!preorderOpen(preorders[0].item, now)) throw new Error('This preorder is closed. Please contact us for current availability.');
  return preorders[0];
}

export function preorderMessage(item) {
  return `PREORDER: payment is collected now. Expected to ship ${item.preorder.shipDateLabel}, subject to the incoming delivery. Order separately from in-stock items. Contact jacob@discontinuedclub.com to cancel before shipment. If delayed, we will contact you with an updated date and cancellation/refund options.`;
}

export async function openPreorderCheckout(stripe, inventory, line, params) {
  const { item, quantity } = line;
  const claim = await inventory.reserve(item, quantity, stripe);
  const metadata = {
    ...params.metadata,
    dc_preorder_item: item.id,
    dc_preorder_reservation: claim.reservation,
    dc_preorder_slots: claim.indexes.join(','),
    dc_preorder_ship_date: item.preorder.shipDate,
    dc_preorder_ship_label: item.preorder.shipDateLabel
  };
  const rate = params.shipping_options[0].shipping_rate_data;
  const { delivery_estimate, ...shippingRate } = rate;
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      ...params,
      payment_method_types: ['card'],
      metadata,
      payment_intent_data: { ...params.payment_intent_data, metadata },
      shipping_options: [{ shipping_rate_data: { ...shippingRate, display_name: `Preorder shipping - expected ${item.preorder.shipDateLabel}` } }],
      custom_text: {
        shipping_address: { message: preorderMessage(item) },
        submit: { message: `You are paying now for a PREORDER. Expected shipment: ${item.preorder.shipDateLabel}, not the delivery date.` }
      }
    }, { idempotencyKey: `preorder-${claim.reservation}` });
  } catch (error) {
    // Only a definitive validation failure is safe to release. Network/5xx outcomes
    // could have created a payable session, so retain those claims for inspection.
    if (error.type === 'StripeInvalidRequestError') await inventory.release(item, claim.reservation, claim.indexes);
    throw error;
  }
  try {
    await inventory.attach(item, claim, session);
  } catch (error) {
    const expired = await stripe.checkout.sessions.expire(session.id);
    await inventory.settle(item, expired);
    throw error;
  }
  return session;
}

// One conditional claim per physical can, never a shared read/modify/write counter.
// Unknown Stripe outcomes keep their claim until reconciled; they cannot oversell stock.
export function createPreorderInventory(store, { now = Date.now, token = randomUUID } = {}) {
  const key = (item, index) => `${item.id}/${item.preorder.batch}/unit-${index}`;
  const read = (item, index) => store.getWithMetadata(key(item, index), { type: 'json', consistency: 'strong' });
  const slots = (item) => Array.from({ length: item.preorder.capacity }, (_, index) => index);
  async function write(item, index, data, previous) {
    if (previous && !previous.etag) throw new Error('Preorder inventory storage unavailable.');
    const result = await store.setJSON(key(item, index), data, previous ? { onlyIfMatch: previous.etag } : { onlyIfNew: true });
    if (!result || typeof result.modified !== 'boolean' || (result.modified && !result.etag)) throw new Error('Preorder inventory storage unavailable.');
    return result.modified;
  }
  function verifySession(data, session) {
    return session.metadata?.source === 'discontinuedclub.com'
      && session.metadata?.dc_preorder_reservation === data.reservation
      && (!data.sessionId || data.sessionId === session.id);
  }
  async function settle(item, session) {
    const reservation = session.metadata?.dc_preorder_reservation;
    const indexes = String(session.metadata?.dc_preorder_slots || '').split(',').map(Number);
    if (!reservation || !session.metadata?.dc_preorder_slots || session.metadata?.dc_preorder_item !== item.id || !indexes.length
      || new Set(indexes).size !== indexes.length || indexes.some((i) => !Number.isInteger(i) || i < 0 || i >= item.preorder.capacity)) {
      throw new Error('Preorder inventory reference is invalid.');
    }
    const status = session.payment_status === 'paid' ? 'paid' : session.status === 'expired' ? 'free' : null;
    if (!status) return;
    for (const index of indexes) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const previous = await read(item, index);
        if (!previous || previous.data.reservation !== reservation) {
          if (status === 'free') break;
          throw new Error('Paid preorder inventory claim was not found.');
        }
        if (!verifySession(previous.data, session)) throw new Error('Preorder session does not match its inventory claim.');
        if (previous.data.status === 'paid' || previous.data.status === status) break;
        if (await write(item, index, { ...previous.data, status, sessionId: session.id }, previous)) break;
        if (attempt === 4) throw new Error('Preorder inventory is busy.');
      }
    }
  }
  async function available(item, stripe) {
    const entries = await Promise.all(slots(item).map((index) => read(item, index)));
    const sessionIds = [...new Set(entries.filter((e) => e?.data.status === 'held' && e.data.sessionId).map((e) => e.data.sessionId))];
    for (const sessionId of sessionIds) await settle(item, await stripe.checkout.sessions.retrieve(sessionId));
    const current = sessionIds.length ? await Promise.all(slots(item).map((index) => read(item, index))) : entries;
    return current.filter((entry) => !entry || entry.data.status === 'free').length;
  }
  async function release(item, reservation, indexes) {
    for (const index of indexes) {
      const previous = await read(item, index);
      if (previous?.data.reservation === reservation && previous.data.status === 'held' && !previous.data.sessionId) {
        await write(item, index, { ...previous.data, status: 'free' }, previous);
      }
    }
  }
  async function reserve(item, quantity, stripe) {
    if (!preorderOpen(item, now())) throw new Error('This preorder is closed.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > item.preorder.capacity) throw new Error('Invalid preorder quantity.');
    await available(item, stripe);
    const reservation = token();
    const indexes = [];
    try {
      for (const index of slots(item)) {
        const previous = await read(item, index);
        if (previous && previous.data.status !== 'free') continue;
        if (await write(item, index, { status: 'held', reservation, createdAt: now(), sessionId: null }, previous)) indexes.push(index);
        if (indexes.length === quantity) return { reservation, indexes };
      }
      throw new Error('The available preorder quantity changed. Please reduce your quantity or try again shortly.');
    } catch (error) {
      await release(item, reservation, indexes);
      throw error;
    }
  }
  async function attach(item, claim, session) {
    for (const index of claim.indexes) {
      let attached = false;
      for (let attempt = 0; attempt < 5 && !attached; attempt++) {
        const previous = await read(item, index);
        if (previous?.data.reservation !== claim.reservation || !verifySession(previous.data, session)) throw new Error('Preorder inventory claim changed.');
        if (previous.data.sessionId === session.id) attached = true;
        else attached = await write(item, index, { ...previous.data, sessionId: session.id }, previous);
      }
      if (!attached) throw new Error('Preorder inventory could not confirm checkout.');
    }
  }
  return { available, reserve, attach, release, settle };
}
