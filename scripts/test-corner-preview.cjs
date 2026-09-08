const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync('src/components/site/CornerPreview.tsx', 'utf8');
function find(node, predicate) {
  if (Array.isArray(node)) return node.flatMap(child => find(child, predicate));
  if (!node || typeof node !== 'object') return [];
  return [...(predicate(node) ? [node] : []), ...find(node.props?.children, predicate)];
}
function mount(saved, blocked = false) {
  let cursor = 0, dirty = true, tree, pending, stored = saved;
  const values = [], effects = [], properties = new Map();
  const exports = {};
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in values)) values[i] = initial;
      return [values[i], value => { values[i] = value; dirty = true; }];
    },
    useEffect(fn, deps) {
      const i = cursor++, previous = effects[i];
      if (!previous || deps.some((value, j) => value !== previous.deps[j])) pending.push(() => {
        previous?.cleanup?.(); effects[i] = { deps, cleanup: fn() };
      });
    },
  };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    exports, document: { documentElement: { style: {
      setProperty: (key, value) => properties.set(key, value), removeProperty: key => properties.delete(key),
    } } },
    localStorage: {
      getItem: () => { if (blocked) throw Error('blocked'); return stored; },
      setItem: (_, value) => { if (blocked) throw Error('blocked'); stored = value; },
    },
    require(name) {
      if (name === 'react') return react;
      if (name.endsWith('.css')) return { default: new Proxy({}, { get: (_, key) => key }) };
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
      throw Error(name);
    },
  });
  function flush() {
    while (dirty) { dirty = false; cursor = 0; pending = []; tree = exports.default(); pending.forEach(fn => fn()); }
  }
  flush();
  return {
    props: properties,
    inputs: () => find(tree, n => n.type === 'input'),
    event: fn => { fn(); flush(); },
    buttons: () => find(tree, n => n.type === 'button'),
    controls: () => find(tree, n => n.props.id === 'corner-preview-controls')[0],
    stored: () => stored,
    unmount: () => effects.forEach(effect => effect?.cleanup?.()),
  };
}
const app = mount(null);
assert.equal(app.props.get('--radius-button'), '8px');
assert.equal(app.props.get('--radius-panel'), '28px');
for (const input of app.inputs()) {
  assert.equal(input.props.min, '8'); assert.equal(input.props.max, '28'); assert.equal(input.props.step, '1');
}
for (let value = 8; value <= 28; value++) {
  app.event(() => app.inputs()[0].props.onChange({ target: { value: String(value) } }));
  assert.equal(app.props.get('--radius-button'), `${value}px`);
  assert.equal(app.props.get('--radius-panel'), '28px');
}
for (let value = 8; value <= 28; value++) {
  app.event(() => app.inputs()[1].props.onChange({ target: { value: String(value) } }));
  assert.equal(app.props.get('--radius-panel'), `${value}px`);
  assert.equal(app.props.get('--radius-button'), '28px');
}
app.event(() => app.buttons()[0].props.onClick());
assert.equal(app.controls().props.hidden, true);
assert.equal(app.buttons()[0].props['aria-expanded'], false);
app.event(() => app.buttons()[0].props.onClick());
assert.equal(app.controls().props.hidden, false);
const restored = mount(app.stored());
assert.equal(restored.props.get('--radius-button'), '28px');
app.event(() => app.buttons()[1].props.onClick());
assert.equal(app.props.get('--radius-button'), '8px');
assert.equal(app.props.get('--radius-panel'), '28px');
for (const saved of ['broken', '{"buttons":100,"panels":-1}', '{"buttons":"20","panels":8.5}']) {
  const invalid = mount(saved);
  assert.equal(invalid.props.get('--radius-button'), '8px');
  assert.equal(invalid.props.get('--radius-panel'), '28px');
}
const blocked = mount(null, true);
blocked.event(() => blocked.inputs()[0].props.onChange({ target: { value: '16' } }));
assert.equal(blocked.props.get('--radius-button'), '16px');
app.unmount(); assert.equal(app.props.size, 0);
const layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
assert.match(layout, /process\.env\.NODE_ENV === "development" && <CornerPreview/);
for (const file of ['HomeHero.module.css', 'HomeChapters.module.css']) {
  const css = fs.readFileSync(`src/components/sections/home/${file}`, 'utf8');
  assert.match(css, /border-radius: var\(--radius-button\)/);
  assert.doesNotMatch(css, /border-radius: (?:8px|28px|1\.75rem)/);
}
console.log('PASS: independent 8–28px controls, defaults, reset, collapse, persistence, invalid/blocked storage, cleanup, shared home tokens, development-only control.');
