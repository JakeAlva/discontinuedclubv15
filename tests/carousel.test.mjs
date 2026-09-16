import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

test('campaign carousel promotes one real product per slide', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const slides = html.match(/<article class="campaign-slide[\s\S]*?<\/article>/g) ?? [];

  assert.equal(slides.length, 5);
  for (const [index, slide] of slides.entries()) {
    assert.equal((slide.match(/class="campaign-visual"/g) ?? []).length, 1);
    assert.equal((slide.match(/<img /g) ?? []).length, 1);
    assert.match(slide, index < 4 ? /href="products\/[^"]+\.html"/ : /href="journal\/is-alani-nu-lime-slush-discontinued\.html"/);
    assert.match(slide, /src="assets\/images\/campaign\/scenes\/[^"]+-desktop\.webp\?v=\d+"/);
    assert.match(slide, /srcset="assets\/images\/campaign\/scenes\/[^"]+-mobile\.webp\?v=\d+"/);
    assert.ok(slide.includes('aria-label="' + (index + 1) + ' of 5"'));
  }

  assert.equal((html.match(/<strong>Out now<\/strong>/gi) ?? []).length, 1);
  assert.match(html, /Destined Rivals four-pack/);
  assert.match(html, /Five lots available/);
  assert.doesNotMatch(html, /class="campaign-price"/);
});

test('Lime Slush teaser stays last, indexable, and unavailable for purchase', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const slides = html.match(/<article class="campaign-slide[\s\S]*?<\/article>/g) ?? [];
  const teaser = slides.at(-1);
  assert.match(teaser, /campaign-slide-lime/);
  assert.match(teaser, /Currently unavailable/);
  assert.match(teaser, /One four-pack is reserved/);
  assert.match(teaser, /Date to be announced/);
  assert.doesNotMatch(teaser, /data-add-to-cart|href="products\/|preorder|next year|2027|\$/i);
  assert.equal((html.match(/data-campaign-dot="\d+"/g) ?? []).length, slides.length);
  for (const size of ['desktop', 'mobile']) {
    assert.ok((await stat(resolve(root, 'assets/images/campaign/scenes/lime-' + size + '.webp'))).size > 10000);
  }
  const journal = await readFile(resolve(root, 'journal/is-alani-nu-lime-slush-discontinued.html'), 'utf8');
  assert.match(journal, /not available to buy or preorder/);
  assert.match(journal, /not an announcement of new production or a manufacturer relaunch/);
  assert.ok((await readFile(resolve(root, 'sitemap-journal.xml'), 'utf8')).includes('is-alani-nu-lime-slush-discontinued.html'));
  assert.doesNotMatch(html, /<meta name="robots" content="noindex/);
});
