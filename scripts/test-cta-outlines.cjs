const assert = require('node:assert/strict');
const fs = require('node:fs');
const postcss = require('postcss');

const read = file => fs.readFileSync(file, 'utf8');
const css = postcss.parse(read('src/app/globals.css'));
const hero = postcss.parse(read('src/components/sections/home/HomeHero.module.css'));
function declaration(sheet, selector, property) {
  let value;
  sheet.walkRules(rule => {
    if (rule.selectors.includes(selector)) {
      rule.walkDecls(property, decl => { value = decl.value; });
    }
  });
  return value;
}

assert.equal(declaration(css, ':root', '--cta-border-width'), '2px');
assert.equal(declaration(css, ':root', '--radius-button'), '15px');
assert.equal(declaration(css, '[data-cta-outline]', 'border'), 'var(--cta-border-width) solid var(--cta-border-color, var(--brand-ink))');
assert.equal(declaration(css, '[data-cta-outline]', 'background-clip'), 'padding-box');
assert.equal(declaration(css, '[data-cta-outline]', 'border-radius'), 'var(--radius-button)');

// Deliberate opt-ins, not a broad selector that changes chips, cards or nav.
const controls = {
  'src/components/Footer.tsx': 1,
  'src/components/nav/MobileNav.tsx': 1,
  'src/components/sections/patients/PatientPathwayScroll.tsx': 1,
  'src/components/sections/home/ProfessionalRoutes.tsx': 1,
  'src/components/sections/home/CloseBand.tsx': 1,
  'src/components/sections/consultants/ConsultantFocusStrip.tsx': 1,
  'src/components/sections/contact/ContactNextStep.tsx': 2,
  'src/components/sections/specialities/CancerTypesPrototype.tsx': 2,
  'src/app/specialities/[slug]/page.tsx': 1,
  'src/components/treatments/TreatmentDetailPage.tsx': 1,
  'src/components/sections/tariffs/FeesHero.tsx': 1,
};
for (const [file, count] of Object.entries(controls)) {
  assert.equal((read(file).match(/data-cta-outline=/g) || []).length, count, file);
}

// The fees button keeps the merged bespoke-button keyboard focus treatment.
const fees = read('src/components/sections/tariffs/FeesHero.tsx');
assert.match(fees, /overflow-hidden rounded-full bg-white\/60/);
assert.match(fees, /px-\[calc\(1\.5rem-1px\)\] py-\[calc\(\.875rem-1px\)\]/);
assert.match(fees, /md:px-\[calc\(1rem-1px\)\] lg:px-\[calc\(1\.75rem-1px\)\]/);
const feeFill = postcss.parse(read('src/components/sections/tariffs/FeesHero.module.css'));
assert.equal(declaration(feeFill, '.fill', 'inset'), 'calc(0px - var(--cta-border-width))');
assert.equal(declaration(feeFill, '.secondary:focus-visible .fill', 'transform'), 'translateX(0)');

// One outer mask clips both the fill and its navy border. Never add another
// white rounded surface under the blue endpoint: that reintroduces the fringe.
const edge = '.button.primary > span[aria-hidden]::after';
assert.equal(declaration(hero, edge, 'inset'), 'var(--cta-border-width)');
assert.equal(declaration(hero, edge, 'border-radius'), 'calc(var(--radius-button) - var(--cta-border-width))');
assert.equal(declaration(hero, edge, 'box-shadow'), '0 0 0 20px var(--home-ink)');
assert.equal(declaration(hero, '.button.primary::after', 'content'), 'none');

console.log('PASS: explicit 2px CTA borders, fixed corners, fees focus/fill hooks and single-mask hero edge. Visual/dimension checks are separate.');
