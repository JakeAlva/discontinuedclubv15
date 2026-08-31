import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from '/Users/jetlifejake/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs';

const images = {
  '407064120905': 'https://i.ebayimg.com/images/g/YhYAAeSwcGlqUWhU/s-l1600.webp',
  '407063808795': 'https://i.ebayimg.com/images/g/SDsAAeSwIX5qUTki/s-l1600.webp',
  '407063633707': 'https://i.ebayimg.com/images/g/~58AAeSw0XBqUR6-/s-l1600.webp',
  '407063650804': 'https://i.ebayimg.com/images/g/8iMAAeSw-1dqUSIb/s-l1600.webp',
  '407063463950': 'https://i.ebayimg.com/images/g/ABYAAeSwmaVqUQfI/s-l1600.webp',
  '407063539708': 'https://i.ebayimg.com/images/g/SlMAAeSwfE5qURLe/s-l1600.webp',
  '407117217273': 'https://i.ebayimg.com/images/g/NdcAAeSw1vZqcLew/s-l1600.webp',
  '407064096234': 'https://i.ebayimg.com/images/g/EUsAAeSwJaRqUWMf/s-l1600.webp',
  '407086613910': 'https://i.ebayimg.com/images/g/CwMAAeSwxUxqXlXE/s-l1600.webp'
};

const outputDir = path.join(process.cwd(), 'assets/images/listings/backs');
await fs.mkdir(outputDir, { recursive: true });

await Promise.all(Object.entries(images).map(async ([id, url]) => {
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const source = Buffer.from(await response.arrayBuffer());
  await sharp(source)
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 1 }, threshold: 16 })
    .resize(900, 900, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      withoutEnlargement: false
    })
    .webp({ quality: 90, effort: 4 })
    .toFile(path.join(outputDir, `${id}.webp`));
}));

console.log(`Downloaded ${Object.keys(images).length} matching jersey back views.`);
