import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalog, categories } from '../lib/store-catalog.mjs';
import { renderListingCounts } from '../lib/catalog-file.mjs';

test('count slots follow additions, removals and empty departments, counting listings not units', () => {
  const html = '<span data-listing-count="all">99</span> <span data-listing-count="kids-shoes">99</span> <span data-listing-count="care">99</span> <p>4 packs, 20 cards</p>';
  const items = [{ category: 'kids-shoes', maxQuantity: 5 }, { category: 'care', maxQuantity: 10 }];
  assert.equal(renderListingCounts(html, items), '<span data-listing-count="all">2</span> <span data-listing-count="kids-shoes">1</span> <span data-listing-count="care">1</span> <p>4 packs, 20 cards</p>');
  const added = renderListingCounts(html, [...items, { category: 'kids-shoes' }]);
  assert.match(added, /data-listing-count="all">3</);
  assert.match(added, /data-listing-count="kids-shoes">2</);
  const removed = renderListingCounts(added, []);
  assert.equal((removed.match(/>0<\/span>/g) || []).length, 3);
  assert.equal(renderListingCounts(added, [...items, { category: 'kids-shoes' }]), added);
});

test('every static storefront count agrees with the catalog in source and published HTML', async () => {
  for (const prefix of ['', 'dist/']) {
    for (const [file, slots] of [['index.html', 7], ['out-now.html', 2], ['rare-drinks.html', 1]]) {
      const html = await readFile(new URL(`../${prefix}${file}`, import.meta.url), 'utf8');
      const matches = [...html.matchAll(/data-listing-count="([a-z-]+)">(\d+)<\/span>/g)];
      assert.equal(matches.length, slots, `${prefix}${file} count slots`);
      for (const [, category, value] of matches) {
        const expected = category === 'all' ? catalog.length : catalog.filter((item) => item.category === category).length;
        assert.equal(Number(value), expected, `${prefix}${file}: ${category}`);
        assert.equal(categories[category].count, expected, `Catalog metadata: ${category}`);
      }
      assert.equal(renderListingCounts(html, catalog), html);
    }
    const home = await readFile(new URL(`../${prefix}index.html`, import.meta.url), 'utf8');
    for (const category of Object.keys(categories).filter((key) => key !== 'all')) {
      assert.ok(home.includes(`href="out-now.html?category=${category}"`));
      assert.ok(home.includes(`data-listing-count="${category}"`));
    }
  }
});
