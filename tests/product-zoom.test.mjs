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

function setup({ hover = true, zoomable = true, thumbnails = true } = {}) {
  const image = element({ naturalWidth: 1200, naturalHeight: 1200, clientWidth: 600, clientHeight: 600 });
  const zoom = element({
    disabled: true,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 600 }),
    setPointerCapture(id) { this.capture = id; },
    hasPointerCapture(id) { return this.capture === id; },
    releasePointerCapture() { this.capture = null; }
  });
  const thumb = element({ dataset: { productGallerySrc: '/sole.webp', productGalleryAlt: 'Soles' } });
  const window = element({ matchMedia: () => ({ matches: hover }) });
  runInNewContext(code + '\nsetupProductGallery();', {
    window,
    document: {
      querySelector: (selector) => selector === '[data-product-main-image]' ? image : zoomable ? zoom : null,
      querySelectorAll: () => thumbnails ? [thumb] : []
    }
  });
  return { image, zoom, thumb, window };
}

test('shoe product pages offer accessible zoom controls; other departments keep their existing galleries', async () => {
  for (const item of catalog) {
    const slug = `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${item.id}`;
    const html = await readFile(new URL(`../products/${slug}.html`, import.meta.url), 'utf8');
    if (item.category === 'kids-shoes') {
      assert.match(html, /<button[^>]+data-product-zoom[^>]+aria-label="Zoom in on product photo"[^>]+aria-pressed="false"/);
    } else {
      assert.doesNotMatch(html, /data-product-zoom/);
    }
  }
});

test('fine-pointer hover zooms to original resolution, follows the pointer and resets on exit', () => {
  const { zoom } = setup();
  assert.equal(zoom.disabled, false);
  assert.equal(zoom.properties['--zoom-scale'], 2);
  zoom.emit('pointerenter', { pointerType: 'mouse', clientX: 150, clientY: 300 });
  assert.equal(zoom.attributes['aria-pressed'], 'true');
  assert.equal(zoom.properties['--zoom-x'], '25%');
  zoom.emit('pointermove', { pointerType: 'mouse', clientX: 700, clientY: -10 });
  assert.equal(zoom.properties['--zoom-x'], '100%');
  assert.equal(zoom.properties['--zoom-y'], '0%');
  zoom.emit('pointerleave', { pointerType: 'mouse' });
  assert.equal(zoom.attributes['aria-pressed'], 'false');
  assert.equal(zoom.properties['--zoom-x'], '50%');
});

test('touch leaves normal scrolling available, then supports tap zoom, drag and tap reset', () => {
  const { zoom } = setup({ hover: false });
  zoom.emit('pointerenter', { pointerType: 'touch', clientX: 150, clientY: 150 });
  zoom.emit('pointerdown', { pointerType: 'touch', pointerId: 1, clientX: 150, clientY: 150 });
  assert.equal(zoom.capture, undefined);
  zoom.emit('click', { detail: 1 });
  assert.equal(zoom.attributes['aria-pressed'], 'true');
  zoom.emit('pointerdown', { pointerType: 'touch', pointerId: 2, clientX: 150, clientY: 150 });
  assert.equal(zoom.capture, 2);
  zoom.emit('pointermove', { pointerType: 'touch', pointerId: 2, clientX: 210, clientY: 90 });
  assert.equal(zoom.properties['--zoom-x'], '40%');
  assert.equal(zoom.properties['--zoom-y'], '60%');
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
  const { zoom } = setup({ thumbnails: false });
  zoom.emit('click', { detail: 0 });
  assert.equal(zoom.attributes['aria-pressed'], 'true');
  let prevented = false;
  zoom.emit('keydown', { key: 'ArrowRight', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(zoom.properties['--zoom-x'], '60%');
  zoom.emit('keydown', { key: 'Escape', preventDefault() {}, stopPropagation() {} });
  assert.equal(zoom.attributes['aria-pressed'], 'false');
  zoom.emit('click', { detail: 0 });
  zoom.emit('blur');
  assert.equal(zoom.attributes['aria-pressed'], 'false');
});

test('changing photos resets zoom and waits for the new image; load errors disable zoom', () => {
  const { image, zoom, thumb } = setup();
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
  assert.equal(zoom.properties['--zoom-scale'], 2.5);
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
