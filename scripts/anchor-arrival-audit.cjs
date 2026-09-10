/**
 * Check visible arrival points for navigation/search links, every consultant,
 * named hospital/review targets, and treatment/cancer sections.
 * Run against an existing server with AUDIT_BASE. WIDTHS and MOTIONS are
 * comma-separated; ANCHOR_OUTPUT sets the JSON report and WORKERS bounds pages.
 * HREF_FILTER narrows a follow-up run to matching destinations.
 * Geometry is scoped evidence, alongside keyboard checks and npm run a11y.
 */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const repo = path.resolve(__dirname, '..');
const ts = require(path.join(repo, 'node_modules/typescript'));
const resolve = Module._resolveFilename;
Module._resolveFilename = function(name, ...args) { return resolve.call(this, name.startsWith('@/') ? path.join(repo, 'src', name.slice(2)) : name, ...args); };
require.extensions['.ts'] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const { navSections } = require(path.join(repo, 'src/content/navigation.ts'));
const { searchIndex } = require(path.join(repo, 'src/content/searchIndex.ts'));
const { getAllConsultants } = require(path.join(repo, 'src/content/queries.ts'));
const { cancerGroups } = require(path.join(repo, 'src/content/cancerGroups.ts'));
const { therapies } = require(path.join(repo, 'src/content/therapies.ts'));
const { locationSlugsForConsultant } = require(path.join(repo, 'src/content/consultantSites.ts'));
const { chromium } = require(path.join(repo, 'node_modules/playwright'));
const links = new Map();
for (const id of ['partnership','approach','cancers','consultants','feedback','referrals']) links.set(`/#${id}`, id);
for (const section of navSections) for (const group of section.groups) for (const link of group.links) if (link.href.includes('#')) links.set(link.href, link.label);
for (const entry of searchIndex) if (entry.href.includes('#')) links.set(entry.href, entry.title);
for (const c of getAllConsultants()) for (const id of ['overview','about','cancer-expertise','treatments','locations','fees','professional-work','reviews','patient-reviews','peer-reviews','contact',...locationSlugsForConsultant(c.slug).map(slug=>'location-'+slug)]) links.set(`/consultants/${c.slug}#${id}`, `${c.name}: ${id}`);
for (const therapy of therapies) for (const id of ['understanding','when-considered','what-to-expect','care-team','about-information',...(therapy.sections||[]).map(section=>section.id)]) links.set(`/treatments/${therapy.slug}#${id}`, `${therapy.title}: ${id}`);
for (const group of cancerGroups) for (const id of ['specialists','treatments','locations']) links.set(`/specialities?type=${group.id}#${id}`, `${group.id}: ${id}`);
for (const id of ['medicine-treatments','radiotherapy-treatments','clinical-trials','treatment-faqs']) links.set(`/treatments#${id}`, id);
for (const id of ['cancer-finder-panel','browse-all','not-sure','contact-next-step']) links.set(`/specialities#${id}`, id);
const widths = (process.env.WIDTHS || '1440,720,320').split(',').map(Number);
const motions = (process.env.MOTIONS || 'reduce,no-preference').split(',');
const entries = [...links].filter(([href]) => !process.env.HREF_FILTER || href.includes(process.env.HREF_FILTER));
const jobs = widths.flatMap(width => motions.flatMap(motion => entries.map(([href,label]) => ({width,motion,href,label}))));
const results=[];
(async()=>{
 const browser=await chromium.launch({args:['--use-mock-keychain']});
 try {
  await Promise.all(Array.from({length:Number(process.env.WORKERS)||4},async()=>{
   const context=await browser.newContext();
   while(jobs.length){
    const job=jobs.shift();
    // Each case measures a fresh arrival. Reusing a document while changing
    // viewport/motion can retain its native hash scroll and animation state.
    const page=await context.newPage();
    try{
     await page.setViewportSize({width:job.width,height:job.width===720?450:job.width===320?780:900});
     await page.emulateMedia({reducedMotion:job.motion});
     const res=await page.goto((process.env.AUDIT_BASE||'http://127.0.0.1:3000')+job.href,{waitUntil:'networkidle',timeout:60000});
     await page.waitForTimeout(1400);
     const data=await page.evaluate(()=>{
      const hash=decodeURIComponent(location.hash.slice(1));
      let target=document.getElementById(hash);
      if(!target&&location.pathname==='/contact')target=document.getElementById('next-step-heading');
      const visible=e=>{if(!e)return false;const r=e.getBoundingClientRect();return r.width>8&&r.height>8&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[hidden],[aria-hidden="true"]');};
      const visited=new Set();
      while(target&&!visible(target)&&target.dataset.anchorFallbackId&&!visited.has(target.id)){visited.add(target.id);target=document.getElementById(target.dataset.anchorFallbackId);}
      if(!target)return {missing:true,hash};
      // The animated desktop medicine scene uses a zero-height scroll marker.
      // Measure its active heading, not the marker's screen-reader-only label.
      const medicineContent=hash==='medicine-treatments'&&document.querySelector('[data-treatment-medicine-scene] [aria-hidden="false"]');
      const content=(visible(medicineContent)&&medicineContent)||target.querySelector('[data-anchor-content]')||target;
      const heading=visible(content)&&content.matches('h1,h2,h3,button,input')?content:[...content.querySelectorAll('h1,h2,h3,fieldset,nav,summary,label')].find(visible);
      const r=(heading||content).getBoundingClientRect();
      const header=document.querySelector('[data-site-header]')?.getBoundingClientRect().bottom||0;
      return {hash,text:(heading||content).textContent.trim().replace(/\s+/g,' ').slice(0,110),top:r.top,bottom:r.bottom,header,viewportHeight:innerHeight,targetTop:target.getBoundingClientRect().top,expanded:target.matches('[aria-expanded]')?target.getAttribute('aria-expanded'):target.querySelector('[aria-expanded]')?.getAttribute('aria-expanded'),active:document.querySelector('[aria-label="Consultant profile sections"] [aria-current]')?.getAttribute('href'),overflow:document.documentElement.scrollWidth>innerWidth,hidden:!visible(heading||content)};
     });
     results.push({...job,status:res?.status(),...data});
    }catch(e){results.push({...job,error:e.message});}
    finally{await page.close();}
    if(results.length%25===0)console.log(`Measured ${results.length}, ${jobs.length} remaining`);
   }
   await context.close();
  }));
 }finally{await browser.close();}
 const output=process.env.ANCHOR_OUTPUT||path.join(repo,'.next-navigation-audit','anchor-arrivals.json');
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,JSON.stringify(results,null,2));
 const issues=results.filter(r=>r.error||r.missing||r.hidden||r.overflow||r.status>=400||r.top<r.header+8||r.top>r.viewportHeight*.65||r.bottom>r.viewportHeight);
 console.log(JSON.stringify({total:results.length,issues},null,2));
 process.exitCode=issues.length?1:0;
})();
