const assert = require('node:assert/strict');
const fs = require('node:fs');
const postcss = require('postcss');

const button = fs.readFileSync('src/components/ui/Button.tsx', 'utf8');
const hero = postcss.parse(fs.readFileSync('src/components/sections/home/HomeHero.module.css', 'utf8'));
const globalCss = postcss.parse(fs.readFileSync('src/app/globals.css', 'utf8'));
function declaration(css, selector, property, outsideMedia = false) {
  let value;
  css.walkRules(rule => {
    if (outsideMedia && rule.parent.type !== 'root') return;
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
  assert.equal(declaration(hero, `.button.primary:${state}`, 'background-color'), undefined);
  assert.equal(declaration(hero, `.button.primary:${state}`, 'transition-delay'), undefined);
  assert.equal(declaration(hero, `.button.primary:${state}`, 'color'), 'var(--home-white)');
  assert.equal(declaration(hero, `.button.primary:${state}`, 'border-color'), 'var(--home-blue)');
  assert.equal(declaration(hero, `.button.secondary:${state}`, 'color'), 'var(--home-ink)');
  assert.equal(declaration(hero, `.button.secondary:${state}`, 'border-color'), 'var(--home-white)');
}
// Uncover a solid blue surface: no white remains underneath the completed fill.
// The link must not clip its keyboard focus ring or add a second rounded edge.
assert.equal(declaration(hero, '.button.primary', 'background'), 'transparent');
assert.equal(declaration(hero, '.button.primary', 'overflow'), 'visible');
assert.equal(declaration(hero, '.button.primary::before', 'content'), undefined);
assert.equal(declaration(hero, '.button.primary::after', 'content'), 'none');
const surface = '.button.primary > span[aria-hidden]';
const wipe = `${surface} > span`;
assert.match(button, /variant === "onPhoto" && <span \/>/);
assert.equal(declaration(hero, surface, 'background'), 'var(--home-blue)');
assert.equal(declaration(hero, surface, 'z-index'), '-1');
assert.equal(declaration(hero, surface, 'border-radius'), '0');
assert.equal(declaration(hero, surface, 'clip-path'), undefined);
const mask = declaration(hero, surface, 'mask-image');
assert.ok(mask.includes("width='100%25' height='100%25'"));
assert.ok(!mask.includes('viewBox'));
const radius = parseFloat(declaration(globalCss, ':root', '--radius-button'));
assert.equal(radius, 15);
assert.ok(mask.includes(`rx='${radius}'`), 'SVG mask must match the fixed radius token');
assert.equal(declaration(hero, surface, 'mask-size'), '100% 100%');
assert.equal(declaration(hero, surface, 'mask-repeat'), 'no-repeat');
assert.equal(declaration(hero, surface, 'transform'), 'none');
assert.equal(declaration(hero, surface, 'transition'), 'none');
assert.equal(declaration(hero, surface, 'pointer-events'), 'none');
assert.equal(declaration(hero, wipe, 'background'), 'var(--home-white)');
assert.equal(declaration(hero, wipe, 'inset'), '0 calc(0px - var(--radius-button)) 0 0');
assert.equal(declaration(hero, wipe, 'border-radius'), undefined);
assert.equal(declaration(hero, wipe, 'transform'), 'translateX(-1%)');
assert.equal(declaration(hero, wipe, 'box-shadow'), '0 -2px var(--home-white), 0 2px var(--home-white)');
assert.equal(declaration(hero, wipe, 'transition', true), 'transform 500ms cubic-bezier(.65, 0, .25, 1)');
for (const state of ['hover', 'focus-visible']) {
  assert.equal(declaration(hero, `.button.primary:${state} > span[aria-hidden] > span`, 'transform'), 'translateX(100%)');
}
for (const corner of ['before', 'after']) {
  assert.equal(declaration(hero, `${wipe}::${corner}`, 'height'), 'var(--radius-button)');
  assert.equal(declaration(hero, `${wipe}::${corner}`, 'left'), 'calc(0px - var(--radius-button))');
  assert.equal(declaration(hero, `${wipe}::${corner}`, 'width'), 'calc(var(--radius-button) * 2)');
  assert.ok(declaration(hero, `${wipe}::${corner}`, 'background').includes('M0 0H2V1H1A1 1 0 0 0 0 0Z'));
}
assert.equal(declaration(hero, `${wipe}::after`, 'transform'), 'scaleY(-1)');
// The white complement's left edge equals the old blue wipe's right edge
// throughout the same eased progress, including when reversing direction.
for (const width of [160, 208.4296875, 340]) {
  const movingWidth = width + radius;
  for (const progress of [0, 0.1, 0.35, 0.5, 0.85, 1]) {
    const oldFront = movingWidth * (1 - 1.01 + 1.01 * progress);
    const newFront = movingWidth * (-0.01 + 1.01 * progress);
    assert.ok(Math.abs(oldFront - newFront) < 1e-10);
  }
}
assert.equal(declaration(hero, '.button.primary', 'position'), undefined, 'Remove temporary fixed test positioning');
assert.equal(declaration(hero, '.button.primary', 'transform'), undefined, 'Remove temporary magnification');
assert.equal(declaration(hero, wipe, 'visibility'), undefined, 'Restore the actual interactive paint layer');
assert.equal(declaration(hero, '.button > span[aria-hidden]', 'transition', true), 'transform 500ms cubic-bezier(.65, 0, .25, 1)');
let reducedMotion;
hero.walkAtRules('media', rule => {
  if (rule.params === '(prefers-reduced-motion: reduce)') reducedMotion = rule;
});
assert.ok(reducedMotion);
assert.equal(declaration(reducedMotion, '.button.button:is(:hover, :focus-visible)', 'transition'), 'none');
assert.equal(declaration(reducedMotion, wipe, 'transition'), 'none');
assert.match(button, /focus-visible:text-white/);
assert.match(button, /group-hover:translate-x-0 group-focus-visible:translate-x-0 motion-reduce:transition-none/);
assert.equal(declaration(hero, '.button.secondary > span[aria-hidden]', 'background'), 'var(--home-white)');
assert.equal(declaration(hero, '.button.button', 'border-radius'), 'var(--radius-button)');
assert.equal(declaration(hero, '.button.button', 'border'), '0 solid var(--home-white)');
assert.equal(declaration(hero, '.button > span[aria-hidden]', 'inset'), '0');
assert.equal(declaration(hero, '.button::after', 'inset'), '0');
assert.equal(declaration(hero, '.button::after', 'border'), '2px solid');
assert.equal(declaration(hero, '.button::after', 'border-color'), 'inherit');
assert.equal(declaration(hero, '.button::after', 'pointer-events'), 'none');
assert.equal(declaration(hero, '.button:focus-visible', 'outline'), '3px solid var(--home-white)');
console.log('PASS: shared fill CSS, hero grouped paint/overlay-border structure, hover/focus colours and reduced-motion hooks. Browser visual verification is separate.');
