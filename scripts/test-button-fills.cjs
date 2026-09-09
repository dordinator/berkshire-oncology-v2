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

// Source-level layout contracts; these do not test browser antialiasing.
// Hero buttons use the separate overlay border asserted below.
assert.match(button, /absolute -inset-\[2px\] -z-10 rounded-\[inherit\]/);
assert.match(button, /overflow-hidden rounded-button/);
assert.equal(declaration(globalCss, '.ink-cta::before', 'inset'), '-2px');

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
assert.equal(declaration(hero, '.button.button', 'border-radius'), 'var(--radius-button)');
assert.equal(declaration(hero, '.button.button', 'border'), '0 solid var(--home-white)');
assert.equal(declaration(hero, '.button > span[aria-hidden]', 'inset'), '0');
assert.equal(declaration(hero, '.button::after', 'inset'), '0');
assert.equal(declaration(hero, '.button::after', 'border'), '2px solid');
assert.equal(declaration(hero, '.button::after', 'border-color'), 'inherit');
assert.equal(declaration(hero, '.button::after', 'pointer-events'), 'none');
assert.equal(declaration(hero, '.button:focus-visible', 'outline'), '3px solid var(--home-white)');
console.log('PASS: shared fill CSS, hero single-clip/overlay-border structure, hover/focus colours and reduced-motion hooks. Browser visual verification is separate.');
