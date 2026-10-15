import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url));
const assets = ['style.css', 'catalog.js', 'sold-catalog.js', 'app.js', 'journal-library.mjs', 'journal-index.json'];

test('every published HTML page uses a content-based version for shared assets', async () => {
  const hash = createHash('sha256');
  for (const asset of assets) hash.update(asset).update('\0').update(await read(`assets/${asset}`));
  const expected = hash.digest('hex').slice(0, 12);
  const files = await readdir(new URL('../dist/', import.meta.url), { recursive: true });
  let checked = 0;
  for (const file of files.filter((file) => file.endsWith('.html'))) {
    const html = (await read(`dist/${file}`)).toString();
    for (const match of html.matchAll(/assets\/(style\.css|catalog\.js|sold-catalog\.js|app\.js|journal-library\.mjs|journal-index\.json)\?v=([^"']+)/g)) {
      assert.equal(match[2], expected, `${file}: ${match[1]} cannot retain a stale cache key`);
      checked++;
    }
  }
  assert.ok(checked > 400, 'Version checks cover product, journal and navigation pages');
});
