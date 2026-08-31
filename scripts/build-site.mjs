import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
const rootExtensions = ['.html', '.xml'];
const excludedPages = new Set([
  'upcoming.html',
  'signup.html',
  'signup-success.html',
  'join-club.html',
  'join-club-success.html'
]);
const rootFiles = await readdir(root, { withFileTypes: true });

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of rootFiles) {
  if (!entry.isFile()) continue;
  const retiredCatalogPage = entry.name.startsWith('product-') || entry.name.startsWith('brand-');
  if (retiredCatalogPage || excludedPages.has(entry.name)) continue;
  if (entry.name === 'robots.txt' || entry.name === '_redirects' || rootExtensions.some((extension) => entry.name.endsWith(extension))) {
    await cp(resolve(root, entry.name), resolve(output, entry.name));
  }
}

for (const directory of ['assets', 'sold']) {
  await cp(resolve(root, directory), resolve(output, directory), { recursive: true });
}

console.log(`Built static storefront in ${output}`);
