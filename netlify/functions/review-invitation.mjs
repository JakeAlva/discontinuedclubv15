import { handleReview } from '../../lib/review-runtime.mjs';
export const config = { rateLimit: { windowSize: 60, windowLimit: 20, aggregateBy: ['ip'] } };
export default (request, context) => handleReview('invitation', request, context);
