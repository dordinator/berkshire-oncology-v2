const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync('src/app/treatments/TreatmentHero.tsx', 'utf8');

// Reuse the same pair: phones/desktop beside the intro; tablet below the photo.
assert.equal((source.match(/<HeroLinks className=/g) || []).length, 2);
assert.match(source, /<HeroLinks className="mt-7 flex sm:mt-8 md:hidden xl:mt-11 xl:flex"/);
assert.match(source, /<HeroLinks className="hidden md:flex xl:hidden"/);
assert.ok(source.indexOf('<HeroLinks className="mt-7') < source.indexOf('relative aspect-[4/3]'));

// Equal intrinsic widths on phones only; no global or desktop button resizing.
assert.match(source, /max-md:w-fit max-md:max-w-full max-md:items-stretch/);
assert.match(source, /left-0 right-0 overflow-hidden rounded-panel md:-left-10 md:right-\[calc\(50%-50vw\)\] md:rounded-l-panel md:rounded-r-none xl:hidden/);
assert.match(source, /pb-\[6\.5rem\] pt-24 sm:pt-28 md:pb-28 md:pt-28 xl:pb-0 xl:pt-36/);

// Preserve photo crops, desktop composition and approved CTA roles.
assert.match(source, /className="object-cover object-\[61%_45%\]"/);
assert.match(source, /className="object-cover object-\[60%_50%\]"/);
assert.match(source, /hidden w-\[70%\] xl:block/);
assert.match(source, /xl:grid-cols-\[minmax\(0,1fr\)_minmax\(0,1fr\)\] xl:gap-12/);
assert.match(source, /href="#treatment-index" className="hero-cta-primary"/);
assert.match(source, /href="#what-we-do-not-provide" variant="ghost" className="hero-cta-secondary"/);
console.log('PASS: phone-only order, equal-width grouping, inset 20px photo, tighter spacing and unchanged tablet/desktop layout contracts.');
