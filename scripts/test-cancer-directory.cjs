// Lightweight component/clock checks without browser automation or new dependencies.
// Run: node scripts/test-cancer-directory.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/components/sections/home/CancerDirectory.tsx'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const cards = Array.from({ length: 18 }, (_, i) => ({ slug: `type-${i}`, label: `Cancer ${i}`, href: `/specialities?type=${i}#specialists` }));

function mount({ reduced = false, items = cards } = {}) {
  const slots = [], effects = [], timers = new Map(), listeners = new Map();
  let cursor = 0, pending = [], dirty = true, tree, timerId = 0, intersection, disconnected = false;
  const state = (initial) => {
    const i = cursor++;
    if (!(i in slots)) slots[i] = initial;
    return [slots[i], (value) => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; dirty = true; }];
  };
  const react = {
    useState: state,
    useRef: (value) => state({ current: value })[0],
    useEffect: (fn, deps) => {
      const i = cursor++;
      const previous = effects[i];
      if (!previous || deps.some((value, j) => value !== previous.deps[j])) pending.push(() => {
        previous?.cleanup?.();
        effects[i] = { deps, cleanup: fn() };
      });
    },
  };
  const jsx = (type, props) => ({ type, props });
  const media = { matches: reduced, addEventListener: (_, fn) => listeners.set('motion', fn), removeEventListener: () => listeners.delete('motion') };
  const document = { hidden: false, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: (name) => listeners.delete(name) };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: (name) => {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === 'next/link') return { default: 'a' };
      if (name.endsWith('.css')) return { default: new Proxy({}, { get: (_, key) => key }) };
      throw new Error(`Unexpected import: ${name}`);
    },
    window: { matchMedia: () => media, setInterval: (fn, ms) => { assert.equal(ms, 5000); timers.set(++timerId, fn); return timerId; }, clearInterval: (id) => timers.delete(id) },
    document,
    IntersectionObserver: class {
      constructor(fn) { intersection = fn; }
      observe() { intersection([{ isIntersecting: true }]); }
      disconnect() { disconnected = true; }
    },
  });
  function walk(node, predicate) {
    if (Array.isArray(node)) return node.flatMap((child) => walk(child, predicate));
    if (!node || typeof node !== 'object') return [];
    return [...(predicate(node) ? [node] : []), ...walk(node.props?.children, predicate)];
  }
  function flush() {
    while (dirty) {
      dirty = false; cursor = 0; pending = [];
      tree = exports.default({ cards: items });
      walk(tree, (n) => { if (n.props.ref) n.props.ref.current = {}; return false; });
      pending.forEach((effect) => effect());
    }
  }
  flush();
  return {
    links: () => walk(tree, (n) => n.type === 'a'),
    slot: () => walk(tree, (n) => n.props.id === 'rotating-cancer-type')[0],
    button: () => walk(tree, (n) => n.type === 'button')[0],
    tick: () => { [...timers.values()].forEach((fn) => fn()); flush(); },
    event: (fn) => { fn(); flush(); },
    visible: (value) => { intersection([{ isIntersecting: value }]); flush(); },
    pageVisible: (value) => { document.hidden = !value; listeners.get('visibilitychange')(); flush(); },
    activeLabels: () => walk(tree, (n) => n.props['aria-hidden'] === false),
    timerCount: () => timers.size,
    unmount: () => { effects.forEach((effect) => effect?.cleanup?.()); assert.equal(timers.size, 0); assert.equal(listeners.size, 0); assert.ok(disconnected); },
  };
}

const app = mount();
assert.equal(app.links().length, 6);
const fixed = app.links().slice(0, 5).map((n) => n.props.href);
assert.equal(app.links()[5].props.href, cards[5].href);
assert.equal(app.timerCount(), 1);
for (let i = 0; i < 13; i++) {
  assert.equal(app.links()[5].props.href, cards[i + 5].href);
  assert.equal(app.activeLabels().length, 1);
  assert.equal(app.activeLabels()[0].props.children, cards[i + 5].label);
  app.tick();
  assert.deepEqual(app.links().slice(0, 5).map((n) => n.props.href), fixed);
}
assert.equal(app.links()[5].props.href, cards[5].href, 'wraps after every remaining cancer type');
for (const [enter, leave] of [['onPointerEnter', 'onPointerLeave'], ['onFocus', 'onBlur']]) {
  app.event(app.slot().props[enter]);
  assert.equal(app.timerCount(), 0);
  app.tick();
  assert.equal(app.links()[5].props.href, cards[5].href);
  app.event(app.slot().props[leave]);
  assert.equal(app.timerCount(), 1);
}
assert.equal(app.button(), undefined, 'no visible rotation control');
assert.equal(app.timerCount(), 1);
app.visible(false); assert.equal(app.timerCount(), 0);
app.visible(true); assert.equal(app.timerCount(), 1);
app.pageVisible(false); assert.equal(app.timerCount(), 0);
app.pageVisible(true); assert.equal(app.timerCount(), 1);
app.unmount();
const reduced = mount({ reduced: true });
assert.equal(reduced.timerCount(), 0, 'reduced motion disables autoplay by default');
reduced.unmount();
for (const length of [0, 5, 6]) {
  const small = mount({ items: cards.slice(0, length) });
  assert.equal(small.links().length, length);
  assert.equal(small.timerCount(), 0);
  assert.equal(small.button(), undefined);
  small.unmount();
}
console.log('PASS: six links; 5-second cycle through all remaining types; matching labels/destinations; wrap; hover/focus; no rotation control; visibility; reduced motion; cleanup; short lists.');
