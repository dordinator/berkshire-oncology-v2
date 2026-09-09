const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const globalCss = fs.readFileSync('src/app/globals.css', 'utf8');
assert.match(globalCss, /--radius-button: 15px;/);
assert.match(globalCss, /--radius-panel: 20px;/);
const config = fs.readFileSync('tailwind.config.ts', 'utf8');
assert.match(config, /button: "var\(--radius-button\)"/);
assert.match(config, /panel: "var\(--radius-panel\)"/);
const navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
assert.match(navbar, /rounded-panel border border-black/);
assert.match(navbar, /rounded-panel border border-transparent/);
assert.match(navbar, /rounded-t-panel rounded-b-none/);
for (const file of ['HomeHero.module.css', 'HomeChapters.module.css']) {
  const css = fs.readFileSync(`src/components/sections/home/${file}`, 'utf8');
  assert.match(css, /border-radius: var\(--radius-button\)/);
  assert.doesNotMatch(css, /border-radius: (?:8px|28px|1\.75rem)/);
}

// No route can mount the old controls or restore a saved preview radius.
function checkSource(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) checkSource(file);
    else if (/\.(?:tsx?|jsx?|css)$/.test(file)) {
      const source = fs.readFileSync(file, 'utf8');
      assert.doesNotMatch(source, /CornerPreview|berkshire-corner-preview|corner-preview-controls/, file);
      assert.doesNotMatch(source, /setProperty\(["']--radius-(?:button|panel)["']/, file);
    }
  }
}
checkSource('src');
console.log('PASS: fixed 15px buttons and 20px panels/navbar; corner controls and persisted overrides removed site-wide.');
