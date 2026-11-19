import { createFunnelService } from '../lib/funnel.mjs';
import { funnelHandler } from '../lib/funnel-http.mjs';
import { memoryReviewStore } from '../tests/helpers/review-store.mjs';

// Explicit local-only QA. No Stripe calls, email, customer data or production writes.
export async function startFunnelPreview(origin) {
  if (process.env.NETLIFY || !['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('Preview is local-only');
  const service = createFunnelService(memoryReviewStore());
  console.log('Funnel preview: synthetic stock; payments disabled. Local-only key: local-funnel-preview-not-a-production-secret');
  return {
    collect: funnelHandler(() => service, { origin }),
    report: funnelHandler(() => service, { origin, admin: true, adminKey: () => 'local-funnel-preview-not-a-production-secret' })
  };
}
