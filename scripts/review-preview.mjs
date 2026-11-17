import { randomBytes } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { localReviewStore } from './local-review-store.mjs';
import { catalog } from '../lib/store-catalog.mjs';
import { createReviewService, ReviewError } from '../lib/reviews.mjs';
import { createReviewHandlers } from '../lib/review-http.mjs';

export async function startReviewPreview(siteUrl) {
  if (process.env.NETLIFY || !['127.0.0.1', 'localhost'].includes(new URL(siteUrl).hostname)) throw new Error('Review preview is local-only.');
  const directory = resolve(import.meta.dirname, '../.netlify/review-preview', String(Date.now()));
  await mkdir(directory, { recursive: true });
  const store = localReviewStore(directory);
  const item = catalog.find((product) => product.id === '407343435479');
  const purchase = { verified: true, paymentIntentId: 'pi_review_preview', products: [{
    id: item.id, name: item.name, category: item.category, image: `/assets/images/listings/branded/${item.id}.webp`,
    url: `/products/${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}.html`
  }] };
  const invitation = await createReviewService({ store }).invite(purchase);
  const adminKey = randomBytes(32).toString('hex');
  const handlers = createReviewHandlers({
    getStore: () => store, adminKey: () => adminKey, siteUrl: () => siteUrl, preview: true,
    getDiagnosticStore: () => localReviewStore(resolve(directory, 'checks', randomBytes(8).toString('hex'))),
    loadPurchase: async (id) => { if (id !== purchase.paymentIntentId) throw new ReviewError('Only the sample order is available in local preview.'); return purchase; }
  });
  console.log(`Sample review: ${siteUrl}/review.html#invite=${invitation.token}`);
  console.log(`Local review admin: ${siteUrl}/review-admin.html`);
  console.log(`Local-only administrator key: ${adminKey}`);
  return { handlers, stop: async () => {} };
}
