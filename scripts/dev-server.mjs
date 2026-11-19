import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from 'node:process';

try {
  if (process.env.REVIEW_PREVIEW !== '1' && process.env.FUNNEL_PREVIEW !== '1') loadEnvFile('.env');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const root = fileURLToPath(new URL(process.env.PREVIEW_BUILD === '1' ? '../dist/' : '../', import.meta.url));
const host = '127.0.0.1';
const port = Number(process.env.PORT || 4173);
process.env.PUBLIC_SITE_URL = process.env.LOCAL_SITE_URL || `http://${host}:${port}`;

const functions = new Map([
  ['/.netlify/functions/inventory', '../netlify/functions/inventory.mjs'],
  ['/.netlify/functions/create-checkout', '../netlify/functions/create-checkout.mjs'],
  ['/.netlify/functions/checkout-status', '../netlify/functions/checkout-status.mjs'],
  ['/.netlify/functions/stripe-webhook', '../netlify/functions/stripe-webhook.mjs'],
  ['/.netlify/functions/reviews', '../netlify/functions/reviews.mjs'],
  ['/.netlify/functions/review-invitation', '../netlify/functions/review-invitation.mjs'],
  ['/.netlify/functions/review-submit', '../netlify/functions/review-submit.mjs'],
  ['/.netlify/functions/review-admin', '../netlify/functions/review-admin.mjs']
]);

const reviewPreview = process.env.REVIEW_PREVIEW === '1'
  ? await (await import('./review-preview.mjs')).startReviewPreview(process.env.PUBLIC_SITE_URL) : null;
const previewRoutes = new Map(reviewPreview ? [
  ['/.netlify/functions/reviews', reviewPreview.handlers.publicReviews],
  ['/.netlify/functions/review-invitation', reviewPreview.handlers.invitation],
  ['/.netlify/functions/review-submit', reviewPreview.handlers.submit],
  ['/.netlify/functions/review-admin', reviewPreview.handlers.admin]
] : []);
const funnelPreview = process.env.FUNNEL_PREVIEW === '1' ? await (await import('./funnel-preview.mjs')).startFunnelPreview(process.env.PUBLIC_SITE_URL) : null;
if (funnelPreview) {
  previewRoutes.set('/.netlify/functions/funnel-event', funnelPreview.collect);
  previewRoutes.set('/.netlify/functions/funnel-report', funnelPreview.report);
  functions.set('/.netlify/functions/funnel-event', '../netlify/functions/funnel-event.mjs');
  functions.set('/.netlify/functions/funnel-report', '../netlify/functions/funnel-report.mjs');
}

const mimeTypes = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8'
};

function send(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, { 'Cache-Control': 'no-store', ...headers });
  response.end(body);
}

async function readRequestBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 30000) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function runFunction(modulePath, request, response) {
  try {
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await readRequestBody(request);
    const handlerRequest = new Request(new URL(request.url, process.env.PUBLIC_SITE_URL), {
      method: request.method,
      headers: request.headers,
      body,
      duplex: body ? 'half' : undefined
    });
    const handler = previewRoutes.get(new URL(request.url, process.env.PUBLIC_SITE_URL).pathname) || (await import(modulePath)).default;
    const result = await handler(handlerRequest);
    const headers = Object.fromEntries(result.headers.entries());
    response.writeHead(result.status, headers);
    response.end(Buffer.from(await result.arrayBuffer()));
  } catch (error) {
    console.error('Local function error', error.message);
    send(response, 500, JSON.stringify({ error: 'The local checkout server could not complete this request.' }), {
      'Content-Type': 'application/json; charset=utf-8'
    });
  }
}

function publicFilePath(pathname) {
  const decoded = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  const segments = decoded.split('/').filter(Boolean);
  if (segments.some((segment) => segment.startsWith('.'))) return null;

  const isAsset = decoded.startsWith('/assets/');
  const isPage = decoded.endsWith('.html') || decoded === '/robots.txt' || decoded === '/sitemap.xml';
  if (!isAsset && !isPage) return null;

  const filePath = resolve(root, `.${decoded}`);
  if (!filePath.startsWith(`${resolve(root)}${sep}`)) return null;
  return filePath;
}

async function serveFile(pathname, response) {
  try {
    const filePath = publicFilePath(pathname);
    if (!filePath || !(await stat(filePath)).isFile()) throw new Error('Not found');
    const extension = extname(filePath).toLowerCase();
    send(response, 200, await readFile(filePath), {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream'
    });
  } catch {
    send(response, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
}

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, process.env.PUBLIC_SITE_URL).pathname;
  if ((reviewPreview || funnelPreview) && pathname === '/.netlify/functions/inventory') {
    const { catalog } = await import('../lib/store-catalog.mjs');
    return send(response, 200, JSON.stringify({ inventory: catalog.map((item) => ({ id: item.id, quantity: item.maxQuantity || 1 })) }), { 'Content-Type': 'application/json' });
  }
  if ((reviewPreview || funnelPreview) && ['/.netlify/functions/create-checkout', '/.netlify/functions/checkout-status', '/.netlify/functions/stripe-webhook'].includes(pathname)) {
    return send(response, 503, JSON.stringify({ error: 'Payments are disabled in review preview.' }), { 'Content-Type': 'application/json' });
  }
  const modulePath = functions.get(pathname);
  if (modulePath) return runFunction(modulePath, request, response);
  return serveFile(pathname, response);
});

server.listen(port, host, () => {
  console.log(`Discontinued Club storefront running at ${process.env.PUBLIC_SITE_URL}`);
  console.log(reviewPreview ? 'Review preview: isolated local storage; Stripe and email are disabled.' : 'Checkout uses the configured local environment.');
});

async function stop() {
  server.close();
  await reviewPreview?.stop();
  process.exit(0);
}
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
