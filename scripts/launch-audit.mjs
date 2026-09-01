import { access, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { catalog, directPriceCents, maxQuantity, priceLookupKey, storeConfig } from '../lib/store-catalog.mjs';

try {
  loadEnvFile('.env');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const root = resolve(import.meta.dirname, '..');
const previewMode = process.argv.includes('--preview');
const directCheckoutEnabled = storeConfig.directCheckoutEnabled === true;
const results = [];

function check(condition, label, detail) {
  results.push({ status: condition ? 'PASS' : 'FAIL', label, detail: condition ? '' : detail });
}

function warn(condition, label, detail) {
  results.push({ status: condition ? 'PASS' : 'WARN', label, detail: condition ? '' : detail });
}

async function exists(relativePath) {
  try {
    await access(resolve(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

const ids = catalog.map((item) => item.id);
const productSlug = (item) => `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}.html`;
check(catalog.length > 0, 'Catalog contains current products', 'Add at least one current product.');
check(new Set(ids).size === ids.length, 'Catalog product IDs are unique', 'Remove duplicate catalog IDs.');
check(
  catalog.every((item) => directPriceCents(item) > 0 && maxQuantity(item) > 0 && Number(item.shippingWeightOz) > 0),
  'Catalog prices, quantities, and weights are valid',
  'Every product needs a positive price, quantity, and shipping weight.'
);
check(
  new Set(catalog.map(priceLookupKey)).size === catalog.length,
  'Stripe lookup keys are unique',
  'Each catalog product needs a unique Stripe lookup key.'
);

const missingImages = [];
const missingMerchantImages = [];
for (const id of ids) {
  if (!(await exists(`assets/images/listings/branded/${id}.webp`))) missingImages.push(id);
  if (!(await exists(`assets/images/listings/merchant/${id}.webp`))) missingMerchantImages.push(id);
}
check(!missingImages.length, 'Every current product has a branded image', `Missing branded images: ${missingImages.join(', ')}`);
check(!missingMerchantImages.length, 'Every current product has a logo-free merchant image', `Missing merchant images: ${missingMerchantImages.join(', ')}`);

const missingProductPages = [];
for (const item of catalog) {
  if (!(await exists(`products/${productSlug(item)}`))) missingProductPages.push(item.id);
}
check(!missingProductPages.length, 'Every current product has a dedicated detail page', `Missing product pages: ${missingProductPages.join(', ')}`);

const appSource = await readFile(resolve(root, 'assets/app.js'), 'utf8');
const stripeSyncSource = await readFile(resolve(root, 'scripts/sync-stripe-products.mjs'), 'utf8');
const checkoutSource = await readFile(resolve(root, 'netlify/functions/create-checkout.mjs'), 'utf8');
check(
  appSource.includes('/assets/images/listings/merchant/') && stripeSyncSource.includes('/assets/images/listings/merchant/'),
  'Product schema and Stripe catalog use merchant-safe images',
  'Point product schema and Stripe catalog images to the logo-free merchant image directory.'
);
check(
  directCheckoutEnabled || checkoutSource.includes("STRIPE_CHECKOUT_ENABLED !== 'true'"),
  'Disabled checkout is also blocked server-side',
  'Keep the Netlify checkout function behind the STRIPE_CHECKOUT_ENABLED launch flag.'
);

const requiredPages = [
  'index.html',
  'out-now.html',
  'rare-drinks.html',
  'sold-archive.html',
  'blog.html',
  'about.html',
  'contact.html',
  'checkout-success.html',
  'shipping-returns.html',
  'privacy.html',
  'terms.html'
];
const missingPages = [];
for (const page of requiredPages) {
  if (!(await exists(page))) missingPages.push(page);
}
check(!missingPages.length, 'Storefront and policy pages exist', `Missing pages: ${missingPages.join(', ')}`);

const requiredFunctions = [
  'netlify/functions/create-checkout.mjs',
  'netlify/functions/checkout-status.mjs',
  'netlify/functions/stripe-webhook.mjs'
];
const missingFunctions = [];
for (const file of requiredFunctions) {
  if (!(await exists(file))) missingFunctions.push(file);
}
check(!missingFunctions.length, 'Checkout and webhook functions exist', `Missing functions: ${missingFunctions.join(', ')}`);
check(await exists('google89cd7965ed90b8bf.html'), 'Google Search Console verification file exists', 'Restore the Google verification HTML file.');

const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
const productSitemap = await readFile(resolve(root, 'sitemap-products.xml'), 'utf8');
const missingSitemapPages = requiredPages
  .filter((page) => page !== 'checkout-success.html')
  .filter((page) => page !== 'index.html' ? !sitemap.includes(`/${page}`) : !sitemap.includes('https://discontinuedclub.com/</loc>'));
check(!missingSitemapPages.length, 'Public pages are present in the sitemap', `Missing sitemap entries: ${missingSitemapPages.join(', ')}`);
const missingProductSitemapPages = catalog.filter((item) => !productSitemap.includes(`/products/${productSlug(item)}`)).map((item) => item.id);
check(!missingProductSitemapPages.length, 'Every current product is present in the product sitemap', `Missing product sitemap entries: ${missingProductSitemapPages.join(', ')}`);

if (directCheckoutEnabled) {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  const keyMode = /^(sk|rk)_live_/.test(secretKey) ? 'live' : /^(sk|rk)_test_/.test(secretKey) ? 'test' : 'missing';
  check(
    previewMode ? keyMode === 'test' : keyMode === 'live',
    `Stripe ${previewMode ? 'test' : 'live'} key is configured`,
    previewMode ? 'Use a restricted Stripe test key for preview checkout.' : 'Configure a restricted Stripe live key in Netlify before production.'
  );

  const webhookConfigured = /^whsec_[A-Za-z0-9_]+$/.test(process.env.STRIPE_WEBHOOK_SECRET || '');
  if (previewMode) {
    warn(webhookConfigured, 'Stripe webhook secret is configured', 'Preview checkout can run without it, but paid test orders will not decrement inventory automatically.');
  } else {
    check(webhookConfigured, 'Stripe live webhook secret is configured', 'Create the production webhook and add its signing secret to Netlify.');
  }
} else {
  check(true, 'Direct checkout is intentionally disabled', '');
}

const publicSiteUrl = (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
check(publicSiteUrl === 'https://discontinuedclub.com', 'Canonical production URL is configured', 'Set PUBLIC_SITE_URL=https://discontinuedclub.com.');

if (directCheckoutEnabled) {
  const automaticTax = process.env.STRIPE_AUTOMATIC_TAX;
  check(automaticTax === 'true' || automaticTax === 'false', 'Stripe tax behavior is explicit', 'Set STRIPE_AUTOMATIC_TAX to true or false after reviewing tax registrations.');
  if (!previewMode) {
    check(process.env.STRIPE_TAX_REVIEWED === 'true', 'Sales-tax registration decision is acknowledged', 'Review tax obligations, then set STRIPE_TAX_REVIEWED=true in Netlify.');
  }
}

let trackedFiles = [];
try {
  trackedFiles = execFileSync('git', ['ls-files'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  }).trim().split('\n').filter(Boolean);
} catch {
  results.push({ status: 'WARN', label: 'Tracked-file secret scan', detail: 'Git tracked files could not be listed.' });
}

const exposedSecrets = [];
const secretPattern = /\b(?:sk|rk)_(?:test|live)_[A-Za-z0-9]{20,}|\bwhsec_[A-Za-z0-9]{20,}/;
if (trackedFiles.length) {
  for (const relativePath of trackedFiles) {
    if (relativePath.startsWith('assets/images/') || relativePath.startsWith('sold/')) continue;
    try {
      const content = await readFile(resolve(root, relativePath), 'utf8');
      if (secretPattern.test(content)) exposedSecrets.push(relativePath);
    } catch {
      // Binary and removed tracked files are ignored by this text-only scan.
    }
  }
  check(!exposedSecrets.length, 'No Stripe secrets appear in tracked source', `Potential secrets found in: ${exposedSecrets.join(', ')}`);
}

const failures = results.filter((result) => result.status === 'FAIL');
const warnings = results.filter((result) => result.status === 'WARN');
console.log(`Discontinued Club ${previewMode ? 'preview' : 'production'} launch audit\n`);
for (const result of results) {
  console.log(`[${result.status}] ${result.label}${result.detail ? `\n       ${result.detail}` : ''}`);
}
console.log(`\n${results.length - failures.length - warnings.length} passed, ${warnings.length} warning(s), ${failures.length} blocker(s).`);

if (failures.length) process.exitCode = 1;
