import { funnelService } from '../../lib/funnel-runtime.mjs';
export const config = { schedule: '@daily' };
export default async (request, context) => {
  await funnelService(context).cleanup();
};
