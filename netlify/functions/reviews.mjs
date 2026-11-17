import { handleReview } from '../../lib/review-runtime.mjs';
export const config = { rateLimit: { windowSize: 60, windowLimit: 60, aggregateBy: ['ip'] } };
export default (request, context) => handleReview('publicReviews', request, context);
