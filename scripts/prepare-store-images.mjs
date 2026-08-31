import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from '/Users/jetlifejake/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';

const root = process.cwd();
const listingDir = path.join(root, 'assets/images/listings');
const listingFiles = (await fs.readdir(listingDir)).filter((file) => file.endsWith('.webp'));

for (const file of listingFiles) {
  const source = path.join(listingDir, file);
  const temporary = path.join(listingDir, file.replace('.webp', '.prepared.webp'));
  await sharp(source)
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 1 }, threshold: 16 })
    .resize(520, 520, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .webp({ quality: 88 })
    .toFile(temporary);
  await fs.rename(temporary, source);
}

await sharp(path.join(root, 'assets/images/logo.png'))
  .extract({ left: 400, top: 230, width: 1248, height: 900 })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 4 })
  .resize(240, 240, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(root, 'assets/images/logo-mark-v2.png'));
