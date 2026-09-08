// Run: node scripts/test-testimonial-preview.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relativePath, imports = {}) {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, require: (name) => {
    if (name in imports) return imports[name];
    if (name.endsWith('.css')) return { default: new Proxy({}, { get: (_, key) => key }) };
    if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    throw new Error(`Unexpected import: ${name}`);
  } });
  return exports;
}
function stateHook() {
  let value;
  return { useState: (initial) => {
    if (value === undefined) value = initial;
    return [value, (next) => { value = typeof next === 'function' ? next(value) : next; }];
  } };
}
function find(node, predicate) {
  if (Array.isArray(node)) return node.flatMap((child) => find(child, predicate));
  if (!node || typeof node !== 'object') return [];
  return [...(predicate(node) ? [node] : []), ...find(node.props?.children, predicate)];
}
const Reader = function Reader() {};
const Cards = load('src/components/sections/home/TestimonialCards.tsx', { react: stateHook(), './TestimonialReader': { default: Reader } }).default;
const intro = { type: 'h2', props: { children: 'Patient reviews and feedback' } };
let tree = Cards({ intro });
assert.equal(tree.props['data-variant'], 'refined');
for (const variant of ['current', 'refined', 'current']) {
  const buttons = find(tree, (n) => n.type === 'button');
  assert.equal(buttons.length, 2);
  assert.equal(buttons.filter((n) => n.props['aria-pressed']).length, 1);
  buttons.find((n) => n.props.children.toLowerCase() === variant).props.onClick();
  tree = Cards({ intro });
  assert.equal(tree.props['data-variant'], variant);
  assert.equal(find(tree, (n) => n.type === Reader).length, 1, 'one stable reader, not duplicate carousels');
  assert.equal(find(tree, (n) => n === intro).length, 1, 'approved intro is retained');
  assert.equal(find(tree, (n) => n.props.id === 'feedback-comparison').length, 1);
}
const content = load('src/content/testimonials.ts');
const TestimonialReader = load('src/components/sections/home/TestimonialReader.tsx', { react: stateHook(), '@/content/testimonials': content }).default;
let quote = TestimonialReader();
for (let i = 0; i <= content.testimonials.length; i++) {
  const active = find(quote, (n) => n.type === 'figure' && !n.props['aria-hidden']);
  assert.equal(active.length, 1);
  assert.equal(find(active[0], (n) => n.type === 'blockquote')[0].props.children, content.testimonials[i % content.testimonials.length].quote);
  assert.equal(find(quote, (n) => n.props['data-copy-key'] === 'feedback.placeholder.warning').length, content.PLACEHOLDER ? 1 : 0);
  find(quote, (n) => n.props['aria-label'] === 'Next quotation')[0].props.onClick();
  quote = TestimonialReader();
}
console.log('PASS: refined default; reversible toggle; exclusive pressed state; stable reader; preserved intro, quotes and prototype warning; carousel navigation/wrap.');
