import { getStore } from '@netlify/blobs';
import { randomBytes } from 'node:crypto';
import Stripe from 'stripe';
import { createReviewHandlers } from './review-http.mjs';
import { verifiedReviewPurchase } from './review-purchase.mjs';
import { ReviewError } from './reviews.mjs';

export function reviewStoreName(context) {
  // Read trusted runtime context, not a request header or a build-only variable.
  if (!context?.deploy?.context || !/^[A-Za-z0-9_-]+$/.test(context.deploy.id || '')) throw new ReviewError('Review storage is not configured.', 503);
  return `dc-reviews-v1-${context.deploy.context === 'production' ? 'production' : `preview-${context.deploy.id}`}`;
}

export function handleReview(kind, request, context) {
  const production = context?.deploy?.context === 'production';
  const handlers = createReviewHandlers({
    getStore: () => getStore({ name: reviewStoreName(context), consistency: 'strong' }),
    getDiagnosticStore: () => {
      reviewStoreName(context);
      return getStore({ name: `dc-reviews-check-v1-${randomBytes(8).toString('hex')}`, consistency: 'strong' });
    },
    siteUrl: () => production ? (process.env.PUBLIC_SITE_URL || 'https://discontinuedclub.com') : new URL(request.url).origin,
    loadPurchase: (paymentIntentId) => {
      if (!production || !process.env.STRIPE_SECRET_KEY) throw new ReviewError('Live review invitations are not enabled in this environment.', 503);
      return verifiedReviewPurchase(new Stripe(process.env.STRIPE_SECRET_KEY), paymentIntentId);
    }
  });
  return handlers[kind](request);
}
