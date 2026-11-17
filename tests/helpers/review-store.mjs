export function memoryReviewStore() {
  const records = new Map();
  let version = 0;
  return {
    records,
    async getWithMetadata(key) { return records.has(key) ? structuredClone(records.get(key)) : null; },
    async setJSON(key, value, options = {}) {
      const previous = records.get(key);
      if ((options.onlyIfNew && previous) || (options.onlyIfMatch && previous?.etag !== options.onlyIfMatch)) return { modified: false };
      const etag = `"v${++version}"`;
      records.set(key, { data: structuredClone(value), etag });
      return { modified: true, etag };
    },
    async *list({ prefix }) {
      const keys = [...records.keys()].filter((key) => key.startsWith(prefix));
      // Deliberately small pages exercise pagination independently of Netlify defaults.
      for (let i = 0; i < keys.length; i += 2) yield { blobs: keys.slice(i, i + 2).map((key) => ({ key })) };
    }
  };
}

export const samplePurchase = {
  verified: true, paymentIntentId: 'pi_TESTonly', products: [
    { id: '407343435479', name: 'Sample Winter Wonderland', category: 'drinks', image: '/assets/images/listings/branded/407343435479.webp', url: '/out-now.html' },
    { id: '407329572793', name: 'Sample Voodoo Vanilla', category: 'drinks', image: '/assets/images/listings/branded/407329572793.webp', url: '/out-now.html' }
  ]
};

export function submission(token, overrides = {}) {
  return {
    token, displayName: 'Sample Buyer', consent: true, website: '',
    products: [{ id: samplePurchase.products[0].id, rating: 2, body: 'Sample flavor review, not a real testimonial.', buyAgain: false }],
    company: { rating: 5, body: 'Sample company review, not a real testimonial.' }, ...overrides
  };
}
