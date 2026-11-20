import { resolve } from 'node:path';
import { createUniformListingImageBuffers } from './listing-image-template.mjs';

function allowedEbayImageUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== 'https:' || url.hostname !== 'i.ebayimg.com' || url.username || url.password) {
    throw new Error('The eBay image URL did not use the approved HTTPS image host');
  }
  return url;
}
async function downloadImage(url, fetcher = fetch) {
  const response = await fetcher(allowedEbayImageUrl(url), {
    signal: AbortSignal.timeout(30000),
    redirect: 'error'
  });
  if (!response.ok) throw new Error(`Could not download eBay listing photo (HTTP ${response.status})`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) throw new Error('The eBay listing photo response was not an image');
  const announcedSize = Number(response.headers.get('content-length') || 0);
  if (announcedSize > 20_000_000) throw new Error('The eBay listing photo exceeded 20 MB');
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > 20_000_000) throw new Error('The eBay listing photo exceeded 20 MB');
  return buffer;
}

export async function createSyncedListingImageBuffers(imageUrl, {
  root = resolve(import.meta.dirname, '..'),
  fetcher = fetch
} = {}) {
  const source = await downloadImage(imageUrl, fetcher);
  const images = await createUniformListingImageBuffers(source, { root });
  return { source: images.merchant, ...images };
}
