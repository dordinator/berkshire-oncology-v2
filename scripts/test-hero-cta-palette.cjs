const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const resolveConfig = require('tailwindcss/resolveConfig');
const loadConfig = require('tailwindcss/loadConfig');
const { theme } = resolveConfig(loadConfig(path.resolve('tailwind.config.ts')));

const read = file => fs.readFileSync(file, 'utf8');
const css = postcss.parse(read('src/app/globals.css'));
function declaration(selector, property) {
  let value;
  css.walkRules(rule => {
    if (rule.selectors.includes(selector)) {
      rule.walkDecls(property, decl => { value = decl.value; });
    }
  });
  return value;
}

// Resolve the shared palette aliases; the homepage and public UI now use
// the same approved colours rather than maintaining separate literal values.
function rootColour(name) {
  const value = declaration(':root', name);
  const variable = /^var\((--[\w-]+)\)$/.exec(value);
  if (variable) return rootColour(variable[1]);
  const reference = /^theme\(([\w.]+)\)$/.exec(value);
  if (reference) return reference[1].split('.').reduce((object, key) => object[key], theme);
  return value;
}
assert.equal(rootColour('--home-ink'), '#0e2f55');
assert.equal(rootColour('--home-blue'), '#164c88');
assert.equal(rootColour('--brand-ink'), rootColour('--home-ink'));
assert.equal(rootColour('--brand-blue'), rootColour('--home-blue'));
assert.equal(rootColour('--brand-mulberry'), '#843d57');
assert.equal(rootColour('--home-mulberry'), rootColour('--brand-mulberry'));
for (const selector of ['.type-button.hero-cta-primary', '.type-button.hero-cta-primary:is(:hover, :focus-visible)']) {
  assert.equal(declaration(selector, 'background-color'), 'var(--home-ink)');
  assert.equal(declaration(selector, 'border-color'), 'var(--home-ink)');
  assert.equal(declaration(selector, 'color'), 'var(--home-white)');
}
for (const selector of ['.type-button.hero-cta-secondary', '.type-button.hero-cta-secondary:is(:hover, :focus-visible)']) {
  assert.equal(declaration(selector, '--cta-border-color'), 'var(--home-ink)');
  assert.equal(declaration(selector, 'color'), 'var(--home-ink)');
}
assert.equal(declaration('.site-button.hero-cta-primary > span[aria-hidden]', 'background'), 'var(--home-blue)');
assert.equal(declaration('.ink-cta.hero-cta-primary::before', 'background'), 'var(--home-blue)');
assert.equal(declaration('.site-button.hero-cta-secondary > span[aria-hidden]', 'background'), 'color-mix(in srgb, var(--home-ink) 5%, transparent)');

// Opt-in rules may change paint only, never geometry, motion or focus layout.
css.walkRules(rule => {
  if (!rule.selector.includes('hero-cta-')) return;
  rule.walkDecls(decl => assert.ok(
    ['background', 'background-color', 'border-color', 'color', '--cta-border-color'].includes(decl.prop),
    `Unexpected hero palette property: ${decl.prop}`,
  ));
});

const routes = {
  'src/app/treatments/TreatmentHero.tsx': [1, 1],
  'src/components/sections/patients/PatientsHero.tsx': [1, 1],
  'src/components/sections/tariffs/FeesHero.tsx': [1, 1],
  'src/components/treatments/TreatmentDetailHero.tsx': [1, 0],
};
for (const [file, counts] of Object.entries(routes)) {
  const source = read(file);
  for (const [index, type] of ['primary', 'secondary'].entries()) {
    assert.equal((source.match(new RegExp(`hero-cta-${type}`, 'g')) || []).length, counts[index], file);
  }
}
for (const file of ['src/components/ui/Button.tsx', 'src/components/sections/home/HomeHero.tsx', 'src/components/sections/home/HomeHero.module.css']) {
  assert.doesNotMatch(read(file), /hero-cta-/, 'Default and photo button families must stay separate');
}
// The approved WCAG profile has its own overview component. Its booking
// control already uses the shared palette without the older hero opt-in.
assert.match(read('src/app/consultants/[slug]/page.tsx'), /<ConsultantProfileOverview/);
const profile = read('src/components/consultants/ConsultantProfileOverview.module.css');
assert.match(profile, /\.appointmentButton \{[^}]*background: var\(--brand-ink\)/);
assert.match(profile, /\.appointmentButton:hover \{ background: var\(--brand-blue\)/);
const treatments = read('src/app/treatments/TreatmentHero.tsx');
assert.match(treatments, /href="#treatment-index" className="hero-cta-primary"/);
assert.match(treatments, /href="#what-we-do-not-provide" variant="ghost" className="hero-cta-secondary"/);
assert.match(treatments, /flex sm:mt-8 md:hidden xl:mt-11 xl:flex/);
assert.match(treatments, /HeroLinks className="hidden md:flex xl:hidden"/);
assert.match(read('src/components/treatments/TreatmentDetailHero.tsx'), /font-medium text-sage-ink/);

function contrastOnWhite(hex) {
  const rgb = hex.match(/[a-f\d]{2}/gi).map(n => parseInt(n, 16) / 255)
    .map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
  return 1.05 / (rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 + .05);
}
for (const colour of ['0e2f55', '164c88']) assert.ok(contrastOnWhite(colour) >= 4.5);
console.log('PASS: hero-only palette opt-ins, shared/photo defaults preserved, paint-only changes and solid-label contrast. Browser checks are separate.');
