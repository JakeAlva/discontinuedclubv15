import { createReviewService, ReviewError } from './reviews.mjs';

// The caller supplies a separate diagnostic store, never the customer review store.
export async function checkReviewStorage(store) {
  const service = createReviewService({ store });
  const checks = [];
  function verify(condition, name) {
    if (!condition) throw new ReviewError(`Review storage check failed: ${name}.`, 503);
    checks.push(name);
  }
  const product = { id: '999999999999', name: 'Storage check fixture', category: 'other', image: '/assets/images/logo-mark-clean.png', url: '/reviews.html' };
  const invite = await service.invite({ verified: true, paymentIntentId: 'diagnostic-fixture', products: [product] });
  verify(!(await service.invitation(invite.token)).submitted, 'Private invitation');
  const submission = {
    token: invite.token, displayName: 'Storage check only', consent: true, products: [
      { id: product.id, rating: 2, body: 'Synthetic storage check, not a customer testimonial.', buyAgain: false }
    ], company: { rating: 5, body: 'Synthetic storage check, not a customer testimonial.' }
  };
  const outcomes = await Promise.allSettled([service.submit(submission), service.submit(submission)]);
  verify(outcomes.filter((result) => result.status === 'fulfilled').length === 1 &&
    outcomes.some((result) => result.status === 'rejected' && result.reason.status === 409), 'Duplicate protection');
  verify((await createReviewService({ store }).invitation(invite.token)).submitted, 'Saved submission');
  verify((await service.published()).count === 0, 'Pending review privacy');
  const pending = (await service.queue()).reviews[0];
  verify(Boolean(pending?.etag), 'Moderation queue');
  await service.moderate({ id: pending.id, etag: pending.etag, status: 'approved' });
  const company = await service.published();
  const flavor = await service.published({ productId: product.id });
  verify(company.count === 1 && company.average === 5 && flavor.count === 1 && flavor.average === 2, 'Separate ratings');
  verify(!JSON.stringify(company).includes(invite.token) && !JSON.stringify(company).includes('diagnostic-fixture'), 'Public data privacy');
  const approved = (await service.queue({ status: 'approved' })).reviews[0];
  await service.moderate({ id: approved.id, etag: approved.etag, status: 'hidden', reason: 'author_request' });
  verify((await service.published()).count === 0, 'Hide review');
  return { ok: true, checkedAt: new Date().toISOString(), checks };
}
