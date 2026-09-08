const assert = require('node:assert/strict');
const fs = require('node:fs');
const postcss = require('postcss');

const button = fs.readFileSync('src/components/ui/Button.tsx', 'utf8');
const hero = postcss.parse(fs.readFileSync('src/components/sections/home/HomeHero.module.css', 'utf8'));
const globalCss = postcss.parse(fs.readFileSync('src/app/globals.css', 'utf8'));
function declaration(css, selector, property) {
  let value;
  css.walkRules(rule => {
    if (rule.selectors.includes(selector)) {
      rule.walkDecls(property, decl => { value = decl.value; });
    }
  });
  return value;
}

// The fill has the same dimensions and radius as the outer border box.
// At every preview radius, its corner centre coincides with the parent's.
assert.match(button, /absolute -inset-\[2px\] -z-10 rounded-\[inherit\]/);
assert.match(button, /overflow-hidden rounded-button/);
assert.equal(declaration(globalCss, '.ink-cta::before', 'inset'), '-2px');
for (let radius = 8; radius <= 28; radius++) {
  const border = 2;
  const fillInset = -2;
  assert.equal(border + fillInset + radius, radius);
}

// End-state colour and border changes must agree for pointer and keyboard.
for (const state of ['hover', 'focus-visible']) {
  assert.equal(declaration(hero, `.button.primary:${state}`, 'color'), 'var(--home-white)');
  assert.equal(declaration(hero, `.button.primary:${state}`, 'border-color'), 'var(--home-blue)');
  assert.equal(declaration(hero, `.button.secondary:${state}`, 'color'), 'var(--home-ink)');
  assert.equal(declaration(hero, `.button.secondary:${state}`, 'border-color'), 'var(--home-white)');
}
assert.match(button, /focus-visible:text-white/);
assert.match(button, /group-hover:translate-x-0 group-focus-visible:translate-x-0 motion-reduce:transition-none/);
assert.equal(declaration(hero, '.button.primary > span[aria-hidden]', 'background'), 'var(--home-blue)');
assert.equal(declaration(hero, '.button.secondary > span[aria-hidden]', 'background'), 'var(--home-white)');
assert.equal(declaration(hero, '.button', 'border-radius'), 'var(--radius-button)');
assert.equal(declaration(hero, '.button:focus-visible', 'outline'), '3px solid var(--home-white)');
console.log('PASS: site-wide fill geometry at 8–28px, hero hover/focus colours, side-fill and reduced-motion hooks.');
