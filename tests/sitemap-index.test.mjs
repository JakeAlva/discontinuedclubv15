import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the root sitemap is an index for every canonical URL collection', async () => {
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  assert.match(sitemap, /<sitemapindex/);
  for (const name of ['sitemap-pages.xml', 'sitemap-products.xml', 'sitemap-journal.xml', 'sitemap-sold.xml']) {
    assert.ok(sitemap.includes(`https://discontinuedclub.com/${name}`));
  }
});
