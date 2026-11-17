import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

// Development only: the production functions use Netlify Blobs, never local disk.
export function localReviewStore(directory) {
  let writes = Promise.resolve();
  function filename(key) {
    if (!/^orders\/[a-f0-9]{64}$/.test(key)) throw new Error('Invalid local review key');
    return join(directory, `${key.slice(7)}.json`);
  }
  const store = {
    async getWithMetadata(key) {
      try { return JSON.parse(await readFile(filename(key), 'utf8')); }
      catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    },
    setJSON(key, data, options = {}) {
      const next = writes.then(async () => {
        const previous = await store.getWithMetadata(key);
        if ((options.onlyIfNew && previous) || (options.onlyIfMatch && previous?.etag !== options.onlyIfMatch)) return { modified: false };
        const etag = `"${randomUUID()}"`;
        await mkdir(directory, { recursive: true });
        const target = filename(key);
        const temp = `${target}.${randomUUID()}.tmp`;
        await writeFile(temp, JSON.stringify({ data, etag }), { mode: 0o600, flag: 'wx' });
        await rename(temp, target);
        return { modified: true, etag };
      });
      writes = next.catch(() => {});
      return next;
    },
    async *list({ prefix }) {
      let files;
      try { files = await readdir(directory); }
      catch (error) { if (error.code === 'ENOENT') return; throw error; }
      const blobs = files.filter((file) => /^[a-f0-9]{64}\.json$/.test(file))
        .map((file) => ({ key: `orders/${file.slice(0, -5)}` })).filter(({ key }) => key.startsWith(prefix));
      for (let offset = 0; offset < blobs.length; offset += 100) yield { blobs: blobs.slice(offset, offset + 100) };
    }
  };
  return store;
}
