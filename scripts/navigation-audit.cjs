/**
 * Browser regression audit for canonical navigation and legacy redirects.
 * Start a built or development server, then run npm run audit:links.
 * AUDIT_BASE selects the server; NAV_AUDIT_OUTPUT selects the report directory.
 * Checks dropdown content, actual rendered links/anchors, cancer selections,
 * verified consultant sites, consultant filters, same-page navigation, history,
 * contact intents, legacy redirects, and the mobile menu.
 */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const repo = path.resolve(__dirname, '..');
const requireRepo = Module.createRequire(path.join(repo, 'package.json'));
const ts = requireRepo('typescript');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) { return originalResolve.call(this, name.startsWith('@/') ? path.join(repo, 'src', name.slice(2)) : name, ...args); };
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const { navSections } = require(path.join(repo, 'src/content/navigation.ts'));
const { searchIndex } = require(path.join(repo, 'src/content/searchIndex.ts'));
const { cancerGroups, unlistedGroup } = require(path.join(repo, 'src/content/cancerGroups.ts'));
const { getConsultantsForSpeciality, getAllConsultants } = require(path.join(repo, 'src/content/queries.ts'));
const { locationSlugsForConsultant } = require(path.join(repo, 'src/content/consultantSites.ts'));
const { therapies, getTherapiesForConsultant } = require(path.join(repo, 'src/content/therapies.ts'));
const { chromium } = requireRepo('playwright');
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:3000';
const output = path.resolve(process.env.NAV_AUDIT_OUTPUT || path.join(repo, '.next-navigation-audit'));
fs.mkdirSync(output, { recursive: true });
const issues = [], pages = [], menus = [], errors = [];
const legacy = /^(\/specialities\/|\/consultants\/(by-treatment|profiles|clinical-oncologists|medical-oncologists)(?:$|[?#])|\/links(?:$|[?#])|\/contact-concept)/;
const groups = [...cancerGroups, unlistedGroup];
const routeMap = require(path.join(repo, 'src/content/cancerRoutes.json'));
for (const group of groups)
    for (const slug of group.slugs) {
        if (routeMap[slug] !== group.id)
            throw new Error('Cancer redirect mapping differs from finder: ' + slug);
    }
const virtualContact = ['consultation', 'guidance', 'patient-portal', 'referral', 'professional', 'professional-joining-partnership', 'professional-practice-role'];
(async () => {
    const browser = await chromium.launch({ args: ['--use-mock-keychain'] });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', error => errors.push({ url: page.url(), message: error.message }));
    await page.goto(base);
    await page.locator('main').waitFor();
    for (const section of navSections) {
        await page.locator(`#nav-trigger-${section.id}`).hover();
        await page.waitForTimeout(450);
        const links = await page.locator('#nav-panel a').evaluateAll(as => as.map(a => ({ label: a.textContent.trim(), href: a.getAttribute('href') })));
        const expected = section.groups.flatMap(g => g.links);
        for (const l of expected)
            if (!links.some(a => a.href === l.href && a.label === l.label))
                issues.push({ kind: 'dropdown', section: section.id, missing: l });
        menus.push({ section: section.id, links });
    }
    await page.mouse.move(0, 999);
    const destinations = new Set([...navSections.flatMap(s => [s.href, ...s.groups.flatMap(g => g.links.map(l => l.href))]), ...searchIndex.map(e => e.href), ...getAllConsultants().map(c => `/consultants/${c.slug}`)]);
    for (const g of cancerGroups)
        destinations.add(`/specialities?type=${g.id}#locations`);
    for (const t of therapies)
        destinations.add(`/consultants?view=treatments&treatment=${t.slug}#consultant-list`);
    const documents = new Map();
    for (const href of destinations) {
        if (!href.startsWith('/'))
            continue;
        const u = new URL(href, base);
        const key = u.pathname + u.search;
        if (!documents.has(key))
            documents.set(key, new Set());
        if (u.hash)
            documents.get(key).add(decodeURIComponent(u.hash.slice(1)));
    }
    let count = 0;
    for (const [doc, hashes] of documents) {
        const url = new URL(doc, base);
        const firstHash = hashes.values().next().value;
        if (firstHash)
            url.hash = firstHash;
        const response = await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1100);
        const status = response?.status() ?? (await page.request.get(base + doc)).status();
        if (status !== 200)
            issues.push({ kind: 'status', doc, status });
        if (url.pathname === '/specialities') {
            for (const button of await page.locator('#treatments button[aria-expanded]').all()) {
                await button.click();
                for (const href of await page.locator('#treatments a[href]').evaluateAll(as => as.map(a => a.getAttribute('href'))))
                    if (href.startsWith('/'))
                        destinations.add(href);
            }
        }
        const links = await page.locator('a[href]').evaluateAll(as => as.map(a => ({ href: a.getAttribute('href'), label: a.textContent.trim().slice(0, 90) })));
        for (const link of links) {
            if (legacy.test(link.href))
                issues.push({ kind: 'legacy-link', doc, ...link });
            if (link.href?.startsWith('/') || link.href?.startsWith('#'))
                destinations.add(new URL(link.href, url).href.replace(base, ''));
        }
        const ids = await page.locator('[id]').evaluateAll(es => es.map(e => e.id));
        for (const hash of hashes) {
            if (doc === '/contact' && virtualContact.includes(hash)) {
                await page.goto(base + doc + '#' + hash);
                await page.waitForTimeout(300);
                if (!await page.locator('#next-step-heading').isVisible())
                    issues.push({ kind: 'contact-intent', hash });
            }
            else if (!ids.includes(hash))
                issues.push({ kind: 'missing-anchor', doc, hash });
        }
        if (url.pathname === '/specialities' && url.searchParams.has('type')) {
            const id = url.searchParams.get('type'), group = groups.find(g => g.id === id);
            const expected = new Set(group.slugs.flatMap(s => getConsultantsForSpeciality(s).map(c => c.slug)));
            const actual = await page.locator('#specialists a[href^="/consultants/"]').evaluateAll(as => as.map(a => a.getAttribute('href').split('/').pop()));
            if ([...expected].sort().join() != [...new Set(actual)].sort().join())
                issues.push({ kind: 'cancer-selection', id, expected: [...expected], actual });
            if (id !== 'sarcoma') {
                const sites = new Set([...expected].flatMap(locationSlugsForConsultant));
                const panels = await page.locator('#locations button[aria-controls]').evaluateAll(es => es.map(e => e.getAttribute('aria-controls').replace('care-location-', '')));
                if ([...sites].sort().join() != panels.sort().join())
                    issues.push({ kind: 'cancer-locations', id, expected: [...sites], actual: panels });
                for (const button of await page.locator('#locations button[aria-controls]').all()) {
                    await button.click();
                    if (await button.getAttribute('aria-expanded') !== 'true')
                        issues.push({ kind: 'location-control', id });
                }
            }
        }
        if (url.pathname === '/consultants') {
            const role = url.searchParams.get('role'), treatment = url.searchParams.get('treatment');
            const expected = getAllConsultants().filter(c => (!role || c.role.toLowerCase().includes(role)) && (!treatment || getTherapiesForConsultant(c.slug).some(t => t.slug === treatment))).map(c => c.slug);
            if (url.searchParams.get('sort') === 'az')
                expected.sort((a, b) => a.split('-').at(-1).localeCompare(b.split('-').at(-1)));
            const actual = [...new Set(await page.locator('main a[href^="/consultants/"]').evaluateAll(as => as.map(a => a.getAttribute('href').split('/').pop())))];
            if (expected.join() != actual.join())
                issues.push({ kind: 'consultant-filter', doc, expected, actual });
        }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
        if (overflow)
            issues.push({ kind: 'overflow', doc });
        pages.push({ doc, status, links: links.length, anchors: ids });
        if (++count % 5 === 0)
            console.log(`Audited ${count}/${documents.size} documents/states`);
    }
    // Validate every fragment discovered in rendered content against its document.
    for (const href of destinations) {
        const u = new URL(href, base);
        if (u.origin !== base)
            continue;
        if (legacy.test(href))
            issues.push({ kind: 'legacy-destination', href });
        const key = u.pathname + u.search, hash = decodeURIComponent(u.hash.slice(1));
        let doc = pages.find(p => p.doc === key);
        if (!doc) {
            const res = await page.goto(u.href, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(350);
            doc = { doc: key, status: res?.status() ?? (await page.request.get(u.href)).status(), anchors: await page.locator('[id]').evaluateAll(es => es.map(e => e.id)) };
            pages.push(doc);
        }
        if (doc.status !== 200)
            issues.push({ kind: 'linked-status', href, status: doc.status });
        if (hash && !doc.anchors.includes(hash) && !(u.pathname === '/contact' && virtualContact.includes(hash)))
            issues.push({ kind: 'linked-anchor', href });
    }
    // The important regression: dropdown navigation between two selections on the same pathname.
    await page.goto(base + '/specialities?type=breast#specialists');
    await page.waitForTimeout(400);
    await page.locator('#nav-trigger-cancer-types').hover();
    await page.waitForTimeout(400);
    await page.locator('#nav-panel a').filter({ hasText: 'Bowel (Colorectal) Cancer' }).click();
    await page.waitForTimeout(800);
    if (!page.url().includes('type=colorectal'))
        issues.push({ kind: 'same-page-navigation', url: page.url() });
    if (!await page.locator('#specialists').innerText().then(t => t.includes('bowel') || t.includes('colorectal')))
        issues.push({ kind: 'same-page-content' });
    if (await page.locator('#nav-panel').getAttribute('aria-hidden') !== 'true')
        issues.push({ kind: 'menu-stays-open' });
    await page.goBack();
    await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1100);
    if (!page.url().includes('type=breast'))
        issues.push({ kind: 'history', url: page.url() });
    await page.goto(base + '/contact#guidance');
    await page.waitForTimeout(400);
    await page.locator('#nav-trigger-about').hover();
    await page.waitForTimeout(400);
    await page.locator('#nav-panel a[href="/contact#referral"]').click();
    await page.waitForTimeout(700);
    if (!await page.locator('#next-step-heading').innerText().then(t => t.includes('referral')))
        issues.push({ kind: 'contact-same-page-intent', heading: await page.locator('#next-step-heading').innerText() });
    // Preserve every legacy bookmark as a direct redirect to its current destination.
    const { pathToFileURL } = require('node:url');
    const { default: config } = await import(pathToFileURL(path.join(repo, 'next.config.mjs')));
    const redirects = await config.redirects();
    for (const redirect of redirects) {
        const response = await page.request.get(base + redirect.source, { maxRedirects: 0 });
        const location = response.headers().location;
        if (response.status() !== 308 || !location || new URL(location, base).href !== new URL(redirect.destination, base).href) {
            issues.push({ kind: 'redirect', source: redirect.source, status: response.status(), location });
        }
    }
    // Desktop screenshot of the reused list/map and a mobile reflow check.
    await page.goto(base + '/specialities?type=breast#locations');
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo({ top: document.querySelector('#locations').getBoundingClientRect().top + scrollY, behavior: 'instant' }));
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(output, 'cancer-locations-desktop.png') });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo({ top: document.querySelector('#locations').getBoundingClientRect().top + scrollY, behavior: 'instant' }));
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(output, 'cancer-locations-mobile.png') });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2))
        issues.push({ kind: 'mobile-overflow' });
    // Mobile navigation shares the primary destinations and closes after selection.
    await page.goto(base);
    await page.getByRole('button', { name: 'Open menu' }).click();
    const mobileLinks = await page.locator('#site-mobile-menu a').evaluateAll(as => as.map(a => a.getAttribute('href')));
    for (const section of navSections)
        if (!mobileLinks.includes(section.href))
            issues.push({ kind: 'mobile-menu', missing: section.href });
    await page.locator('#site-mobile-menu a[href="/specialities"]').click();
    await page.waitForTimeout(500);
    if (await page.locator('#site-mobile-menu').isVisible())
        issues.push({ kind: 'mobile-menu-stays-open' });
    const report = { date: new Date().toISOString(), base, menus, mobileLinks, redirects: redirects.length, pages, destinations: [...destinations], issues, errors };
    fs.writeFileSync(path.join(output, 'link-audit.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ menus: menus.length, mobileLinks: mobileLinks.length, redirects: redirects.length, documents: pages.length, destinations: destinations.size, issues, errors }, null, 2));
    await browser.close();
    process.exitCode = issues.length || errors.length ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });
