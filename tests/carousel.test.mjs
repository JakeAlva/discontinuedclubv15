import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

test('campaign carousel promotes one real product per slide', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const slides = html.match(/<article class="campaign-slide[\s\S]*?<\/article>/g) ?? [];

  assert.equal(slides.length, 4);
  for (const slide of slides) {
    assert.equal((slide.match(/class="campaign-visual"/g) ?? []).length, 1);
    assert.equal((slide.match(/<img /g) ?? []).length, 1);
    assert.match(slide, /href="products\/[^"]+\.html"/);
    assert.match(slide, /src="assets\/images\/campaign\/scenes\/[^"]+-desktop\.webp\?v=4"/);
    assert.match(slide, /srcset="assets\/images\/campaign\/scenes\/[^"]+-mobile\.webp\?v=4"/);
  }

  assert.equal((html.match(/<strong>Out now<\/strong>/gi) ?? []).length, 1);
  assert.match(html, /Destined Rivals four-pack/);
  assert.match(html, /Five lots available/);
  assert.doesNotMatch(html, /class="campaign-price"/);
});
