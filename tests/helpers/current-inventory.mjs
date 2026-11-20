import { readFile } from 'node:fs/promises';

const read = (name) => readFile(new URL(`../../data/${name}`, import.meta.url), 'utf8');
const baseline = JSON.parse(await read('ebay-inventory-update-2026-11-02.json'));
export const winterUpdate = JSON.parse(await read('winter-wonderland-update-2026-11-09.json'));
export const novemberUpdate = JSON.parse(await read('ebay-inventory-update-2026-11-09.json'));
export const november18Update = JSON.parse(await read('ebay-inventory-update-2026-11-18.json'));
export const currentListingId = (id) => {
  const previous = winterUpdate.previousIds.includes(id) ? winterUpdate.id : novemberUpdate.relistings[id] || id;
  return november18Update.relistings[previous] || previous;
};
export const november16Update = JSON.parse(await read('ebay-inventory-update-2026-11-16.json'));
export const november9Snapshot = baseline.activeSnapshot
  .filter(([id]) => !novemberUpdate.removedIds.includes(id))
  .map(([id, price, quantity]) => (
  winterUpdate.previousIds.includes(id)
    ? [winterUpdate.id, winterUpdate.ebayPriceCents, winterUpdate.quantity]
    : [novemberUpdate.relistings[id] || id, price, novemberUpdate.quantityChanges[novemberUpdate.relistings[id] || id] ?? quantity]
  )).concat(novemberUpdate.additions);
export const november20Update = JSON.parse(await read('ebay-inventory-update-2026-11-20.json'));
export const currentSnapshot = november20Update.activeSnapshot;
