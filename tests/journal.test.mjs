import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const journalDirectory = resolve(root, 'journal');

const expectedArticles = [
  {
    file: 'is-mountain-dew-livewire-discontinued.html',
    source: 'mountaindew.com',
    product: 'products/mountain-dew-livewire-406795016704.html'
  },
  {
    file: 'is-red-bull-blue-edition-blueberry-discontinued.html',
    source: 'redbull.com',
    product: 'products/red-bull-blue-edition-blueberry-4-pack-407203102419.html'
  },
  {
    file: 'is-monster-ultra-red-discontinued.html',
    source: 'monsterenergy.com',
    product: 'products/monster-energy-ultra-red-2-pack-407205333909.html'
  }
];

function readableWordCount(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

test('journal launches with three substantial, sourced status reports', async () => {
  const files = (await readdir(journalDirectory)).filter((file) => file.endsWith('.html')).sort();
  assert.deepEqual(files, expectedArticles.map((article) => article.file).sort());

  for (const article of expectedArticles) {
    const html = await readFile(resolve(journalDirectory, article.file), 'utf8');
    assert.match(html, new RegExp(`<link rel="canonical" href="https://discontinuedclub\\.com/journal/${article.file}">`));
    assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/);
    assert.match(html, /<base href="\.\.\/">/);
    assert.match(html, /"@type":"Article"/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.match(html, /<time datetime="2026-09-11">/);
    assert.match(html, new RegExp(`https://[^"<]*${article.source.replace('.', '\\.')}`));
    assert.ok(html.includes(`href="${article.product}"`), `${article.file} should link to its relevant product`);
    assert.ok(readableWordCount(html) >= 1_000, `${article.file} should contain at least 1,000 readable words`);
    assert.doesNotMatch(html, /(?:href|src)="\.\.\/assets\//);
  }
});

test('journal index and sitemap expose every status report', async () => {
  const index = await readFile(resolve(root, 'blog.html'), 'utf8');
  const sitemap = await readFile(resolve(root, 'sitemap-journal.xml'), 'utf8');

  for (const article of expectedArticles) {
    assert.ok(index.includes(`journal/${article.file}`), `blog.html should link to ${article.file}`);
    assert.ok(sitemap.includes(`https://discontinuedclub.com/journal/${article.file}`), `journal sitemap should include ${article.file}`);
  }
});
