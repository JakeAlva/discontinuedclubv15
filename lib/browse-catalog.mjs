import { catalog } from './store-catalog.mjs';
import { soldItems, slugify } from '../scripts/sold-data.mjs';

// Same product/format under a newer listing, or an older duplicate sale record.
// Keep legacy URLs working, but do not show a second unavailable shop card.
export const replacementListings = {
  '407293533835': '407347352383',
  '407205693415': '407347352383',
  '407195902675': '407260159541',
  '406794619457': '406794860747',
  '406711357702': '406713894369'
};

export function browsableSoldItems(active = catalog, previous = soldItems) {
  const activeIds = new Set(active.map((item) => item.id));
  return previous.filter((item) => !activeIds.has(item.id) && !replacementListings[item.id])
    .map((item) => ({ ...item, category: item.category === 'other' ? 'home' : item.category,
      image: item.imageUrl ? `${item.id}.webp` : null,
      slug: `${slugify(item.name)}-${item.id}` }));
}
