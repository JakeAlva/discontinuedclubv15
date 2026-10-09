import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { catalog } from '../lib/store-catalog.mjs';

const app = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
const code = app.slice(app.indexOf('  function setupProductGallery()'), app.indexOf('  function replaceOldProductPages()'));

function element(extra = {}) {
  const listeners = {};
  const properties = {};
  const attributes = {};
  const classes = new Set();
  return {
    listeners, properties, attributes, classes,
    style: { setProperty: (key, value) => { properties[key] = value; } },
    classList: {
      toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
      remove: (name) => classes.delete(name),
      add: (name) => classes.add(name)
    },
    addEventListener: (name, callback) => { listeners[name] = callback; },
    setAttribute: (key, value) => { attributes[key] = value; },
    emit: (name, event = {}) => listeners[name]?.(event),
    ...extra
  };
}

function setup({ hover = true, zoomable = true, thumbnails = true, padding = 0, naturalHeight = 1200 } = {}) {
  const image = element({ src: '/shoe.webp', naturalWidth: 1200, naturalHeight, clientWidth: 600, clientHeight: 600 });
  const lens = element();
  const zoom = element({
    disabled: true,
    clientWidth: 600, clientHeight: 600, clientLeft: 0, clientTop: 0,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 600 }),
    setPointerCapture(id) { this.capture = id; },
    hasPointerCapture(id) { return this.capture === id; },
    releasePointerCapture() { this.capture = null; }
  });
  const thumb = element({ dataset: { productGallerySrc: '/sole.webp', productGalleryAlt: 'Soles' } });
  const window = element({
    matchMedia: () => ({ matches: hover }),
    getComputedStyle: () => ({ paddingLeft: String(padding), paddingRight: String(padding), paddingTop: String(padding), paddingBottom: String(padding) })
  });
  runInNewContext(code + '\nsetupProductGallery();', {
    window,
    document: {
      querySelector: (selector) => selector === '[data-product-main-image]' ? image : !zoomable ? null : selector === '[data-product-zoom]' ? zoom : lens,
      querySelectorAll: () => thumbnails ? [thumb] : []
    }
  });
  return { image, zoom, lens, thumb, window };
}

test('shoe product pages offer accessible zoom controls; other departments keep their existing galleries', async () => {
  for (const item of catalog) {
    const slug = `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}`;
    const html = await readFile(new URL(`../products/${slug}.html`, import.meta.url), 'utf8');
    if (item.category === 'kids-shoes') {
      assert.match(html, /<button[^>]+data-product-zoom[^>]+aria-label="Magnify product photo"[^>]+aria-pressed="false"/);
      assert.match(html, /data-product-lens aria-hidden="true"/);
    } else {
      assert.doesNotMatch(html, /data-product-zoom/);
    }
  }
});

test('fine-pointer hover moves a bounded magnifying lens while the original photo stays unchanged', () => {
  const { zoom, lens, image } = setup();
  assert.equal(zoom.disabled, false);
  assert.equal(lens.style.backgroundSize, '1200px 1200px');
  zoom.emit('pointerenter', { pointerType: 'mouse', clientX: 150, clientY: 300 });
  assert.equal(zoom.attributes['aria-pressed'], 'true');
  assert.equal(lens.style.left, '40px');
  assert.equal(lens.style.top, '190px');
  assert.equal(lens.style.backgroundPosition, '-190px -490px');
  assert.equal(image.style.transform, undefined);
  zoom.emit('pointermove', { pointerType: 'mouse', clientX: 700, clientY: -10 });
  assert.equal(lens.style.left, '374px');
  assert.equal(lens.style.top, '6px');
  zoom.emit('pointerleave', { pointerType: 'mouse' });
  assert.equal(zoom.attributes['aria-pressed'], 'false');
  assert.equal(lens.style.left, '190px');
});

test('touch leaves normal scrolling available, then supports tap zoom, drag and tap reset', () => {
  const { zoom, lens } = setup({ hover: false });
  zoom.emit('pointerenter', { pointerType: 'touch', clientX: 150, clientY: 150 });
  zoom.emit('pointerdown', { pointerType: 'touch', pointerId: 1, clientX: 150, clientY: 150 });
  assert.equal(zoom.capture, undefined);
  zoom.emit('click', { detail: 1 });
  assert.equal(zoom.attributes['aria-pressed'], 'true');
  zoom.emit('pointerdown', { pointerType: 'touch', pointerId: 2, clientX: 150, clientY: 150 });
  assert.equal(zoom.capture, 2);
  zoom.emit('pointermove', { pointerType: 'touch', pointerId: 2, clientX: 210, clientY: 90 });
  assert.equal(lens.style.left, '100px');
  assert.equal(lens.style.top, '6px');
  assert.equal(lens.style.backgroundPosition, '-310px -70px');
  zoom.emit('pointermove', { pointerType: 'touch', pointerId: 2, clientX: 260, clientY: 400 });
  assert.ok(Math.abs(parseFloat(lens.style.top) - 156) < 0.001);
  assert.ok(Math.abs(parseFloat(lens.style.top) + parseFloat(lens.style.height) - 376) < 0.001);
  assert.ok(Math.abs(parseFloat(lens.style.backgroundPosition.split(' ')[1]) + 690) < 0.001);
  zoom.emit('pointerup', { pointerId: 2 });
  zoom.emit('click', { detail: 1 });
  assert.equal(zoom.attributes['aria-pressed'], 'true');
  zoom.emit('pointerleave', { pointerType: 'touch' });
  assert.equal(zoom.attributes['aria-pressed'], 'true');
  zoom.emit('pointerdown', { pointerType: 'touch', pointerId: 3, clientX: 200, clientY: 100 });
  zoom.emit('pointerup', { pointerId: 3 });
  zoom.emit('click', { detail: 1 });
  assert.equal(zoom.attributes['aria-pressed'], 'false');
});

test('keyboard activation, arrow panning and Escape work even without thumbnails', () => {
  const { zoom, lens } = setup({ thumbnails: false });
  zoom.emit('click', { detail: 0 });
  assert.equal(zoom.attributes['aria-pressed'], 'true');
  let prevented = false;
  zoom.emit('keydown', { key: 'ArrowRight', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(lens.style.left, '250px');
  zoom.emit('keydown', { key: 'Escape', preventDefault() {}, stopPropagation() {} });
  assert.equal(zoom.attributes['aria-pressed'], 'false');
  zoom.emit('click', { detail: 0 });
  zoom.emit('blur');
  assert.equal(zoom.attributes['aria-pressed'], 'false');
});

test('changing photos resets zoom and waits for the new image; load errors disable zoom', () => {
  const { image, zoom, lens, thumb } = setup();
  zoom.emit('click', { detail: 0 });
  thumb.emit('click');
  assert.equal(zoom.attributes['aria-pressed'], 'false');
  assert.equal(zoom.disabled, true);
  assert.equal(image.src, '/sole.webp');
  assert.equal(image.alt, 'Soles');
  assert.ok(thumb.classes.has('active'));
  image.naturalWidth = 1600;
  image.emit('load');
  assert.equal(zoom.disabled, false);
  assert.equal(lens.style.backgroundSize, '1500px 1125px');
  assert.equal(lens.style.backgroundImage, 'url("/sole.webp")');
  image.emit('error');
  assert.equal(zoom.disabled, true);
  assert.equal(zoom.attributes['aria-pressed'], 'false');
});

test('low-resolution images are not enlarged, and resizing resets the zoom', () => {
  const { image, zoom, window } = setup();
  zoom.emit('click', { detail: 0 });
  window.emit('resize');
  assert.equal(zoom.attributes['aria-pressed'], 'false');
  image.naturalWidth = 400;
  image.naturalHeight = 400;
  image.emit('load');
  assert.equal(zoom.disabled, true);
  zoom.emit('click', { detail: 0 });
  assert.equal(zoom.attributes['aria-pressed'], 'false');
});

test('non-shoe thumbnails still switch images without zoom listeners', () => {
  const { image, thumb, zoom } = setup({ zoomable: false });
  thumb.emit('click');
  assert.equal(image.src, '/sole.webp');
  assert.equal(Object.keys(zoom.listeners).length, 0);
});

test('magnification aligns with padded, non-square photos and uses a circular lens instead of transforming the image', async () => {
  const { zoom, lens } = setup({ padding: 18, naturalHeight: 800 });
  zoom.emit('click', { detail: 0 });
  assert.equal(lens.style.backgroundSize, '1200px 800px');
  const [left, top] = lens.style.backgroundPosition.split(' ').map(parseFloat);
  assert.ok(Math.abs(left + 490) < 0.001);
  assert.ok(Math.abs(top + 290) < 0.001);
  const css = await readFile(new URL('../assets/style.css', import.meta.url), 'utf8');
  assert.match(css, /\.gallery-magnifier\s*\{[^}]*border-radius: 50%/);
  assert.doesNotMatch(css, /\.current-gallery-zoom\.is-zoomed img\s*\{[^}]*transform/);
});
