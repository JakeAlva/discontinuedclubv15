import { funnelService } from '../../lib/funnel-runtime.mjs';
import { funnelHandler } from '../../lib/funnel-http.mjs';
export const config = { rateLimit: { windowSize: 60, windowLimit: 120, aggregateBy: ['ip'] } };
export default (request, context) => funnelHandler(() => funnelService(context))(request);
