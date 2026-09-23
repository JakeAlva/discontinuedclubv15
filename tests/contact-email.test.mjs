import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

test('public contact and policy pages display and link the current email address', async () => {
  for (const directory of ['', 'dist']) {
    for (const file of ['contact.html', 'privacy.html', 'terms.html']) {
      const html = await readFile(resolve(root, directory, file), 'utf8');
      assert.match(html, /href="mailto:jacob@discontinuedclub\.com">jacob@discontinuedclub\.com<\/a>/, file);
      assert.doesNotMatch(html, /hello@discontinuedclub\.com/i, file);
    }
  }
});
