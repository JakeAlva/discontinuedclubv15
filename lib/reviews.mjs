import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export class ReviewError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

const hash = (value) => createHash('sha256').update(value).digest('hex');
const fail = (message, status) => { throw new ReviewError(message, status); };
const recordKey = (id) => `orders/${id}`;
const statuses = new Set(['pending', 'approved', 'hidden']);
export const moderationReasons = ['spam', 'personal_information', 'abusive_content', 'unrelated_content', 'author_request'];

export function secureEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && timingSafeEqual(a, b);
}

function text(value, label, min, max) {
  if (typeof value !== 'string') fail(`${label} is required.`);
  const normalized = value.trim().replace(/\r\n?/g, '\n');
  if (normalized.length < min || normalized.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(normalized)) {
    fail(`${label} must be ${min}-${max} characters.`);
  }
  return normalized;
}

function rating(value) {
  if (!Number.isInteger(value) || value < 1 || value > 5) fail('Choose a rating from 1 to 5.');
  return value;
}

function validateSubmission(input, order) {
  if (input.consent !== true) fail('Permission to publish your review is required.');
  if (input.website) fail('Submission could not be accepted.');
  const displayName = text(input.displayName, 'Display name', 1, 40);
  if (/@|https?:|www\.|\n/.test(displayName)) fail('Use a first name or nickname, not contact details.');
  if (!Array.isArray(input.products) || input.products.length > order.products.length) fail('Invalid product selection.');
  const seen = new Set();
  const products = input.products.map((entry) => {
    if (!entry || seen.has(entry.id)) fail('Each purchased product can be reviewed once.');
    const product = order.products.find((item) => item.id === entry.id);
    if (!product) fail('Only products from this order can be reviewed.');
    seen.add(entry.id);
    if (![true, false, null].includes(entry.buyAgain)) fail('Choose whether you would buy this product again.');
    return { id: product.id, rating: rating(entry.rating), body: text(entry.body, 'Product review', 5, 2000), buyAgain: entry.buyAgain };
  });
  const company = input.company == null ? null : {
    rating: rating(input.company.rating), body: text(input.company.body, 'Company review', 5, 2000)
  };
  if (!products.length && !company) fail('Add a product review or a company review.');
  return { displayName, products, company, consent: true, consentVersion: '2026-11-17' };
}

function publicProduct(product) {
  return { id: product.id, name: product.name, image: product.image, url: product.url, category: product.category };
}

export function createReviewService({ store, now = () => new Date(), random = () => randomBytes(32).toString('hex') }) {
  async function read(id) {
    if (!/^[a-f0-9]{64}$/.test(id || '')) fail('Review not found.', 404);
    const entry = await store.getWithMetadata(recordKey(id), { type: 'json', consistency: 'strong' });
    if (entry && !entry.etag) fail('Review storage could not verify the current version. Please try again later.', 503);
    return entry;
  }

  async function fromToken(token) {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token)) fail('This review link is not valid.', 404);
    const [id] = token.split('.');
    const entry = await read(id);
    if (!entry || !secureEqual(entry.data.tokenHash, hash(token))) fail('This review link is not valid.', 404);
    if (Date.parse(entry.data.expiresAt) <= now().getTime()) fail('This review link has expired. Contact us for a new invitation.', 410);
    return entry;
  }

  async function invite(purchase, { renew = false } = {}) {
    if (!purchase?.verified || !purchase.paymentIntentId || !purchase.products?.length) fail('A verified paid website order is required.', 422);
    const id = hash(purchase.paymentIntentId);
    const existing = await read(id);
    if (existing?.data.review) fail('This order already has a review.', 409);
    if (existing && !renew) fail('An invitation already exists. Reissue it to replace the previous link.', 409);
    const token = `${id}.${random()}`;
    const createdAt = now().toISOString();
    const expiresAt = new Date(now().getTime() + 45 * 86400000).toISOString();
    const record = {
      version: 1, id, paymentIntentId: purchase.paymentIntentId, tokenHash: hash(token),
      createdAt: existing?.data.createdAt || createdAt, invitedAt: createdAt, expiresAt,
      products: purchase.products.map(publicProduct), review: null, status: 'pending'
    };
    const result = await store.setJSON(recordKey(id), record, existing ? { onlyIfMatch: existing.etag } : { onlyIfNew: true });
    if (!result.modified) fail('The order changed. Refresh and try again.', 409);
    return { id, token, expiresAt, products: record.products };
  }

  async function invitation(token) {
    const { data } = await fromToken(token);
    return { products: data.products.map(publicProduct), submitted: Boolean(data.review), expiresAt: data.expiresAt };
  }

  async function submit(input) {
    const entry = await fromToken(input.token);
    if (entry.data.review) fail('Your review has already been received. Thank you.', 409);
    const review = { ...validateSubmission(input, entry.data), submittedAt: now().toISOString() };
    // One conditional write prevents double submissions, even across concurrent functions.
    const result = await store.setJSON(recordKey(entry.data.id), { ...entry.data, review, status: 'pending' }, { onlyIfMatch: entry.etag });
    if (!result.modified) fail('This order changed or a review was already submitted. Refresh the page.', 409);
    return { received: true };
  }

  async function records() {
    const entries = [];
    for await (const page of store.list({ prefix: 'orders/', paginate: true })) {
      for (let start = 0; start < page.blobs.length; start += 20) {
        const batch = await Promise.all(page.blobs.slice(start, start + 20).map(({ key }) => store.getWithMetadata(key, { type: 'json', consistency: 'strong' })));
        entries.push(...batch.filter(Boolean));
      }
    }
    return entries;
  }

  async function published({ productId = '', offset = 0, limit = 10 } = {}) {
    if (productId && !/^(?:\d{8,20}|[a-z][a-z0-9-]{2,63})$/.test(productId)) fail('Invalid product.');
    if (!Number.isInteger(offset) || offset < 0 || offset > 100000) fail('Invalid page.');
    const reviews = [];
    for (const { data } of await records()) {
      if (data.status !== 'approved' || data.review?.consent !== true) continue;
      const section = productId ? data.review.products.find((item) => item.id === productId) : data.review.company;
      if (!section) continue;
      reviews.push({
        displayName: data.review.displayName, rating: section.rating, body: section.body,
        ...(productId ? { buyAgain: section.buyAgain } : {}),
        submittedAt: data.review.submittedAt, verifiedPurchase: true
      });
    }
    reviews.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    const count = reviews.length;
    return {
      count, average: count ? Math.round(reviews.reduce((sum, entry) => sum + entry.rating, 0) / count * 10) / 10 : null,
      reviews: reviews.slice(offset, offset + limit), nextOffset: offset + limit < count ? offset + limit : null
    };
  }

  async function queue({ status = 'pending', offset = 0 } = {}) {
    if (!statuses.has(status) || !Number.isInteger(offset) || offset < 0) fail('Invalid review filter.');
    const entries = (await records()).filter(({ data }) => data.review && data.status === status)
      .sort((a, b) => b.data.review.submittedAt.localeCompare(a.data.review.submittedAt));
    return {
      count: entries.length,
      reviews: entries.slice(offset, offset + 20).map(({ data, etag }) => ({
        id: data.id, etag, status: data.status, products: data.products.map(publicProduct),
        review: data.review, moderation: data.moderation || null
      })),
      nextOffset: offset + 20 < entries.length ? offset + 20 : null
    };
  }

  async function moderate({ id, etag, status, reason = '' }) {
    if (!['approved', 'hidden'].includes(status)) fail('Choose publish or hide.');
    if (status === 'hidden' && !moderationReasons.includes(reason)) fail('Choose a moderation reason.');
    const entry = await read(id);
    if (!entry?.data.review) fail('Review not found.', 404);
    if (!etag || etag !== entry.etag) fail('This review changed. Reload before moderating.', 409);
    const data = { ...entry.data, status, moderation: { reason: status === 'hidden' ? reason : '', at: now().toISOString() } };
    const result = await store.setJSON(recordKey(id), data, { onlyIfMatch: etag });
    if (!result.modified) fail('This review changed. Reload before moderating.', 409);
    return { saved: true, status };
  }

  return { invite, invitation, submit, published, queue, moderate };
}
