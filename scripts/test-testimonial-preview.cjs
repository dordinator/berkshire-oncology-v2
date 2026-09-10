// Run: node scripts/test-testimonial-preview.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relativePath, imports = {}, globals = {}) {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { ...globals, exports, require: (name) => {
    if (name in imports) return imports[name];
    if (name.endsWith('.css')) return { default: new Proxy({}, { get: (_, key) => key }) };
    if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    throw new Error(`Unexpected import: ${name}`);
  } });
  return exports;
}
function find(node, predicate) {
  if (Array.isArray(node)) return node.flatMap((child) => find(child, predicate));
  if (!node || typeof node !== 'object') return [];
  return [...(predicate(node) ? [node] : []), ...find(node.props?.children, predicate)];
}
const Reader = function Reader() {};
const Cards = load('src/components/sections/home/TestimonialCards.tsx', { './TestimonialReader': { default: Reader } }).default;
const intro = { type: 'h2', props: { children: 'Patient reviews and feedback' } };
const tree = Cards({ intro });
assert.equal(tree.props['data-variant'], 'refined');
assert.equal(find(tree, (n) => n.type === 'button').length, 0, 'comparison toggle removed');
assert.equal(find(tree, (n) => n.type === Reader).length, 1);
assert.equal(find(tree, (n) => n === intro).length, 1, 'approved intro is retained');
const content = load('src/content/testimonials.ts');
function mountReader(reduced = false) {
  const values = [], effects = [], timers = new Map(), listeners = new Map();
  let cursor = 0, pending = [], dirty = true, tree, now = 0, id = 0, intersection, disconnected = false;
  const state = (initial) => {
    const i = cursor++;
    if (!(i in values)) values[i] = initial;
    return [values[i], (next) => { values[i] = typeof next === 'function' ? next(values[i]) : next; dirty = true; }];
  };
  const react = {
    useState: state,
    useRef: (initial) => state({ current: initial })[0],
    useEffect: (fn, deps) => {
      const i = cursor++, previous = effects[i];
      if (!previous || deps.some((value, j) => value !== previous.deps[j])) pending.push(() => {
        previous?.cleanup?.(); effects[i] = { deps, cleanup: fn() };
      });
    },
  };
  const document = { hidden: false, addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: (key) => listeners.delete(key) };
  const media = { matches: reduced, addEventListener: (_, fn) => listeners.set('motion', fn), removeEventListener: () => listeners.delete('motion') };
  const Component = load('src/components/sections/home/TestimonialReader.tsx', { react, '@/content/testimonials': content }, {
    document,
    window: {
      matchMedia: () => media,
      setTimeout: (fn, ms) => { assert.equal(ms, 7000); timers.set(++id, { fn, due: now + ms }); return id; },
      clearTimeout: (id) => timers.delete(id),
    },
    IntersectionObserver: class {
      constructor(fn) { intersection = fn; }
      observe() { intersection([{ isIntersecting: true }]); }
      disconnect() { disconnected = true; }
    },
  }).default;
  function flush() {
    while (dirty) {
      dirty = false; cursor = 0; pending = []; tree = Component();
      tree.props.ref.current = {};
      pending.forEach((fn) => fn());
    }
  }
  flush();
  return {
    tree: () => tree,
    event: (fn) => { fn(); flush(); },
    advance: (ms) => {
      now += ms;
      [...timers].forEach(([id, timer]) => { if (timer.due <= now) { timers.delete(id); timer.fn(); } });
      flush();
    },
    visible: (value) => { intersection([{ isIntersecting: value }]); flush(); },
    pageVisible: (value) => { document.hidden = !value; listeners.get('visibilitychange')(); flush(); },
    timerCount: () => timers.size,
    unmount: () => { effects.forEach((effect) => effect?.cleanup?.()); assert.equal(timers.size, 0); assert.equal(listeners.size, 0); assert.ok(disconnected); },
  };
}
const reader = mountReader();
function assertQuote(index) {
  const quote = reader.tree();
  const active = find(quote, (n) => n.type === 'figure' && !n.props['aria-hidden']);
  assert.equal(active.length, 1);
  assert.equal(find(active[0], (n) => n.type === 'blockquote')[0].props.children, content.testimonials[index].quote);
  assert.equal(find(quote, (n) => n.props['data-copy-key'] === 'feedback.placeholder.warning').length, content.PLACEHOLDER ? 1 : 0);
}
assertQuote(0);
assert.equal(find(reader.tree(), (n) => n.props.id === 'home-feedback-quote')[0].props['aria-live'], 'off');
reader.advance(6999); assertQuote(0);
reader.advance(1); assertQuote(1);
for (let i = 2; i <= content.testimonials.length; i++) { reader.advance(7000); assertQuote(i % content.testimonials.length); }
reader.advance(6000);
reader.event(find(reader.tree(), (n) => n.props['aria-label'] === 'Next quotation')[0].props.onClick);
assertQuote(1);
reader.advance(1000); assertQuote(1);
reader.advance(6000); assertQuote(2);
reader.event(reader.tree().props.onPointerEnter); assert.equal(reader.timerCount(), 0);
reader.advance(14000); assertQuote(2);
reader.event(reader.tree().props.onPointerLeave); assert.equal(reader.timerCount(), 1);
reader.event(reader.tree().props.onFocus); assert.equal(reader.timerCount(), 0);
assert.equal(find(reader.tree(), (n) => n.props.id === 'home-feedback-quote')[0].props['aria-live'], 'polite');
reader.event(() => reader.tree().props.onBlur({ currentTarget: { contains: () => true }, relatedTarget: {} }));
assert.equal(reader.timerCount(), 0, 'focus moving between arrows remains paused');
reader.event(() => reader.tree().props.onBlur({ currentTarget: { contains: () => false }, relatedTarget: null }));
assert.equal(reader.timerCount(), 1);
reader.visible(false); assert.equal(reader.timerCount(), 0);
reader.visible(true); assert.equal(reader.timerCount(), 1);
reader.pageVisible(false); assert.equal(reader.timerCount(), 0);
reader.pageVisible(true); assert.equal(reader.timerCount(), 1);
reader.unmount();
const reducedReader = mountReader(true);
assert.equal(reducedReader.timerCount(), 0);
reducedReader.unmount();
console.log('PASS: refined only, no comparison toggle; quote/warning preservation; exact 7-second advance/wrap; manual timer reset; hover/focus; visibility; reduced motion; live announcements; cleanup.');
