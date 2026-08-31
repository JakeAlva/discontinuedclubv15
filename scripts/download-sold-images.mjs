import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from '/Users/jetlifejake/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';
import { soldItems } from './sold-data.mjs';

const root = '/Users/jetlifejake/Downloads/discontinuedclubv15-main';
const outputDir = path.join(root, 'assets/images/sold');

await mkdir(outputDir, { recursive: true });

for (const item of soldItems.filter((entry) => entry.imageUrl)) {
  const response = await fetch(item.imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`Failed ${item.id}: ${response.status}`);
  const input = Buffer.from(await response.arrayBuffer());
  await sharp(input)
    .trim({ background: '#ffffff', threshold: 8 })
    .resize(900, 900, { fit: 'contain', background: '#ffffff' })
    .webp({ quality: 90, effort: 5 })
    .toFile(path.join(outputDir, `${item.id}.webp`));
}

console.log(`Downloaded ${soldItems.filter((item) => item.imageUrl).length} sold listing images.`);
