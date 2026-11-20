import { getStore } from '@netlify/blobs';
import { createPreorderInventory } from './preorders.mjs';

export function preorderInventory(context) {
  if (!context?.deploy?.context || !/^[A-Za-z0-9_-]+$/.test(context.deploy.id || '')) throw new Error('Preorder inventory runtime unavailable.');
  const suffix = context.deploy.context === 'production' ? 'production' : `preview-${context.deploy.id}`;
  return createPreorderInventory(getStore({ name: `dc-preorders-v1-${suffix}`, consistency: 'strong' }));
}
