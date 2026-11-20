import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

// Original manufacturer product artwork, resized for the existing listing slots.
const image = await sharp(process.argv[2]).resize(1200, 1200).webp({ quality: 92 }).toBuffer();
for (const variant of ['', 'branded/', 'merchant/']) {
  await writeFile(new URL(`../assets/images/listings/${variant}bloom-pear-scare.webp`, import.meta.url), image);
}
