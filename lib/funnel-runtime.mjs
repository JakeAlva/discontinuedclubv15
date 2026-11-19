import { getStore } from '@netlify/blobs';
import { createFunnelService } from './funnel.mjs';

export function funnelService(context) {
  if (!context?.deploy?.context || !/^[A-Za-z0-9_-]+$/.test(context.deploy.id || '')) throw new Error('Analytics runtime unavailable');
  const suffix = context.deploy.context === 'production' ? 'production' : `preview-${context.deploy.id}`;
  return createFunnelService(getStore({ name: `dc-funnel-v1-${suffix}`, consistency: 'strong' }));
}
