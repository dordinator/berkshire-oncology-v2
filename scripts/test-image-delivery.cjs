const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { getImageProps } = require("next/image");
const sharp = require("sharp");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");

function component(file) {
  const filename = path.join(root, file);
  const output = ts.transpileModule(read(file), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", output)(createRequire(filename), module, module.exports);
  return module.exports.default;
}

async function main() {
  const MediaImage = component("src/components/site/MediaHeroImage.tsx");
  const args = { src: "/home/hero.jpg", sizes: "42vw", media: "(min-width: 1024px)" };
  const markup = renderToStaticMarkup(React.createElement(MediaImage, { ...args, alt: "", className: "object-cover" }));
  const expected = getImageProps({ src: args.src, sizes: args.sizes, fill: true, alt: "" }).props;
  assert(markup.includes('media="(min-width: 1024px)"'));
  assert(markup.includes('fetchpriority="high"'));
  assert(markup.includes(expected.srcSet.replaceAll("&", "&amp;")));
  assert(!/<img[^>]*srcSet=/.test(markup), "No network candidates on the fallback img");

  const photo = renderToStaticMarkup(React.createElement(MediaImage, {
    src: "/tariffs/hero-plan-a.webp", srcSet: "/tariffs/hero-plan-a-1280.webp 1280w, /tariffs/hero-plan-a.webp 2880w",
    sizes: "1214px", media: "(width < 768px)", alt: "", className: "object-cover",
  }));
  assert(photo.includes('<picture><source media="(width &lt; 768px)"'));
  assert(photo.includes('loading="eager"'));
  assert(photo.includes('src="data:image/gif;'));
  assert(photo.includes('position:absolute'));

  const hub = read("src/app/treatments/TreatmentHero.tsx");
  assert(hub.includes('media="(min-width: 1280px)"'));
  assert(hub.includes('media="(width < 1280px)"'));
  const detail = read("src/components/treatments/TreatmentDetailHero.tsx");
  assert(detail.includes('mobile ? "(width < 1024px)" : "(min-width: 1024px)"'));
  const types = read("src/components/sections/specialities/CancerTypesPrototype.tsx");
  assert(types.includes('media="(min-width: 1024px)"'));
  assert(!/\bpriority\s*\n/.test(types));
  const fees = read("src/components/sections/tariffs/FeesHero.tsx");
  assert(fees.includes('sizes="1214px"'), "Preserve resolution for the 680px tall phone crop");
  assert(fees.includes('180svh'), "Account for tall desktop hero crops");
  assert(fees.includes('/tariffs/hero-plan-a.webp 2880w'), "Retain original for high-density screens");

  const assetDir = path.join(root, "public/links/responsive");
  for (const name of fs.readdirSync(assetDir)) {
    const [, source, widthText] = name.match(/^(.*)-(\d+)\.webp$/);
    const original = path.join(root, "public/links", `${source}.png`);
    const derivative = path.join(assetDir, name);
    assert(fs.statSync(derivative).size < fs.statSync(original).size, `${name} must save bytes`);
    const wanted = await sharp(original).resize({ width: Number(widthText) }).ensureAlpha().raw().toBuffer();
    const actual = await sharp(derivative).ensureAlpha().raw().toBuffer();
    assert.equal(actual.length, wanted.length);
    for (let i=0;i<actual.length;i+=4) {
      assert.equal(actual[i+3], wanted[i+3], `${name}: alpha`);
      if (wanted[i+3]) assert(actual.subarray(i,i+3).equals(wanted.subarray(i,i+3)), `${name}: lossless visible RGB`);
    }
  }
  const originalBytes=fs.statSync(path.join(root,"public/tariffs/hero-plan-a.webp")).size;
  for(const width of [1280,1920]) {
    const file=path.join(root,`public/tariffs/hero-plan-a-${width}.webp`);
    const m=await sharp(file).metadata();
    assert.equal(m.width,width);
    assert(Math.abs(m.width/m.height-2880/1614)<0.003);
    assert(fs.statSync(file).size<originalBytes);
  }
  console.log("Image delivery contracts, smaller assets and lossless logo pixels passed.");
}
main().catch(e=>{console.error(e);process.exitCode=1;});
