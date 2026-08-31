import sharp from "/Users/jetlifejake/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";

const heroes = [
  { source: "assets/images/hero-storefront-v3.webp", output: "assets/images/hero-storefront-v4.webp", seam: 795 },
  { source: "assets/images/hero-rare-drinks-v3.webp", output: "assets/images/hero-rare-drinks-v4.webp", seam: 895 },
  { source: "assets/images/hero-journal-v3.webp", output: "assets/images/hero-journal-v4.webp", seam: 850 },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

for (const hero of heroes) {
  const image = sharp(hero.source);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const start = hero.seam - 150;

  for (let y = 0; y < info.height; y += 1) {
    const sampleIndex = (y * info.width + hero.seam + 16) * info.channels;
    const sample = [data[sampleIndex], data[sampleIndex + 1], data[sampleIndex + 2]];
    const sampleBrightness = (sample[0] + sample[1] + sample[2]) / 3;
    const sampleRange = Math.max(...sample) - Math.min(...sample);

    if (sampleBrightness < 218 || sampleRange > 24) continue;

    for (let x = start; x < hero.seam; x += 1) {
      const index = (y * info.width + x) * info.channels;
      const amount = smoothstep(clamp((x - start) / (hero.seam - start), 0, 1));
      data[index] = Math.round(255 + (sample[0] - 255) * amount);
      data[index + 1] = Math.round(255 + (sample[1] - 255) * amount);
      data[index + 2] = Math.round(255 + (sample[2] - 255) * amount);
    }
  }

  await sharp(data, { raw: info }).webp({ quality: 92 }).toFile(hero.output);
}
