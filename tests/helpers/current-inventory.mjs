import { readFile } from 'node:fs/promises';

const read = (name) => readFile(new URL(`../../data/${name}`, import.meta.url), 'utf8');
const baseline = JSON.parse(await read('ebay-inventory-update-2026-11-02.json'));
export const winterUpdate = JSON.parse(await read('winter-wonderland-update-2026-11-09.json'));
export const currentListingId = (id) => winterUpdate.previousIds.includes(id) ? winterUpdate.id : id;
export const currentSnapshot = baseline.activeSnapshot.map(([id, price, quantity]) => (
  winterUpdate.previousIds.includes(id)
    ? [winterUpdate.id, winterUpdate.ebayPriceCents, winterUpdate.quantity]
    : [id, price, quantity]
));
