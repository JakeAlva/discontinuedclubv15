import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from 'node:process';

try {
  loadEnvFile('.env');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const root = fileURLToPath(new URL('../', import.meta.url));
const host = '127.0.0.1';
const port = Number(process.env.PORT || 4173);
process.env.PUBLIC_SITE_URL = process.env.LOCAL_SITE_URL || `http://${host}:${port}`;

const functions = new Map([
  ['/.netlify/functions/create-checkout', '../netlify/functions/create-checkout.mjs'],
  ['/.netlify/functions/checkout-status', '../netlify/functions/checkout-status.mjs'],
  ['/.netlify/functions/stripe-webhook', '../netlify/functions/stripe-webhook.mjs']
]);

const mimeTypes = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
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
    const { default: handler } = await import(modulePath);
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
  const modulePath = functions.get(pathname);
  if (modulePath) return runFunction(modulePath, request, response);
  return serveFile(pathname, response);
});

server.listen(port, host, () => {
  console.log(`Discontinued Club storefront running at ${process.env.PUBLIC_SITE_URL}`);
  console.log('Stripe mode: sandbox');
});
