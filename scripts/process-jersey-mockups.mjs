import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from '/Users/jetlifejake/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';

const root = '/Users/jetlifejake/Downloads/discontinuedclubv15-main';
const outputDir = path.join(root, 'assets/images/listings/mockups');
const mockups = {
  '407064120905': '/Users/jetlifejake/.codex/generated_images/019ed1b8-43f6-7822-81c5-a9b5616c0622/exec-a080b5e8-0e12-4c16-bf02-e03d898ea07a.png',
  '407063808795': '/Users/jetlifejake/.codex/generated_images/019ed1b8-43f6-7822-81c5-a9b5616c0622/exec-ad71061e-3b2a-41e1-a86b-ede09a5c136c.png',
  '407063633707': '/Users/jetlifejake/.codex/generated_images/019ed1b8-43f6-7822-81c5-a9b5616c0622/exec-d98b6a1e-3cdc-4c93-80fe-0b65b2377460.png',
  '407063650804': '/Users/jetlifejake/.codex/generated_images/019ed1b8-43f6-7822-81c5-a9b5616c0622/exec-6478004e-5e48-43b6-9393-bc16dec522eb.png',
  '407063463950': '/Users/jetlifejake/.codex/generated_images/019ed1b8-43f6-7822-81c5-a9b5616c0622/exec-039b1a64-c441-44a3-8151-7473dc8f11cb.png',
  '407063539708': '/Users/jetlifejake/.codex/generated_images/019ed1b8-43f6-7822-81c5-a9b5616c0622/exec-c3f39d02-895f-4123-8922-de3b8c51cd9b.png',
  '407117217273': '/Users/jetlifejake/.codex/generated_images/019ed1b8-43f6-7822-81c5-a9b5616c0622/exec-97f2c6a0-e218-4858-8d1f-d7f0ab3ea496.png',
  '407064096234': '/Users/jetlifejake/.codex/generated_images/019ed1b8-43f6-7822-81c5-a9b5616c0622/exec-1c2322ba-06e9-4442-9a3b-17b172992abf.png',
  '407086613910': '/Users/jetlifejake/.codex/generated_images/019ed1b8-43f6-7822-81c5-a9b5616c0622/exec-42842f09-8b8f-4c8a-a97e-fbcfb30ba4e8.png'
};

await mkdir(outputDir, { recursive: true });

await Promise.all(Object.entries(mockups).map(async ([id, source]) => {
  await sharp(source)
    .resize(1000, 1000, { fit: 'cover' })
    .webp({ quality: 92, effort: 5 })
    .toFile(path.join(outputDir, `${id}.webp`));
}));

console.log(`Processed ${Object.keys(mockups).length} jersey mockups.`);
