import { chromium } from 'playwright';
import { contrastProbe, SELECTORS } from './measure.mjs';

const BASE = 'https://akmalariq.dev';
const SCOPE = ['/','/privacy/','/terms/','/projects/','/demos/','/demos/weekly-report/',
  '/demos/reorder-and-margin/','/demos/seller-ledger/','/product/','/demo/','/404.html',
  '/projects/dompet/','/projects/earthquake/','/projects/jakarta-geomarketing/',
  '/projects/retail-replenishment-optimization/','/projects/promotion-lift-optimization/',
  '/projects/ooh-media-planner/','/projects/dashboard-factory/',
  '/projects/retail-demand-forecasting-ai/'];
const PAGES = SCOPE.filter(p => !['/dompet/','/ooh-media-planner/','/dashboard-factory/'].some(x=>p.includes(x)));

const b = await chromium.launch();
const rows = [];
const headers = new Map();

for (const path of PAGES) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0,120)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,120)); });
  let status = 0;
  try {
    const resp = await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
    status = resp?.status() ?? 0;
    await p.waitForTimeout(400);
    const d = await p.evaluate(({ probe, sels }) => {
      eval(probe);
      const one = s => document.querySelector(s);
      const css = [...document.querySelectorAll('link[rel=stylesheet]')].map(l => l.getAttribute('href'));
      const order = css.map(h => (h.match(/(tokens|style|site|nav)\.css/) || [])[1]).filter(Boolean);
      const imgs = [...document.querySelectorAll('img')];
      return {
        title: document.title,
        desc: document.querySelector('meta[name=description]')?.content || null,
        descLen: (document.querySelector('meta[name=description]')?.content || '').length,
        canonical: document.querySelector('link[rel=canonical]')?.href || null,
        robots: document.querySelector('meta[name=robots]')?.content || null,
        ogTitle: !!document.querySelector('meta[property="og:title"]'),
        ogImage: !!document.querySelector('meta[property="og:image"]'),
        h1: document.querySelectorAll('h1').length,
        h1Text: one('h1')?.textContent.trim().slice(0,40) || null,
        header: !!one('header.header'),
        footer: !!one('footer.footer'),
        skip: !!one('.skip-link'),
        navLinks: document.querySelectorAll('nav.nav a').length,
        divider: document.querySelectorAll('.nav-divider').length,
        themeAttr: document.documentElement.getAttribute('data-theme'),
        inlineTheme: !!document.head.querySelector('script:not([src])'),
        cssOrder: order,
        lang: document.documentElement.lang,
        imgsNoAlt: imgs.filter(i => !i.hasAttribute('alt')).length,
        contrast: sels.map(s => window.__probe.check(s)).filter(Boolean).filter(r => !r.pass).map(r => r.sel),
        headerHTML: one('header.header')?.outerHTML.replace(/\s+/g,' ').slice(0,400) || null,
        footerHTML: one('footer.footer')?.outerHTML.replace(/\s+/g,' ').slice(0,300) || null,
      };
    }, { probe: contrastProbe, sels: SELECTORS });
    if (d.headerHTML) headers.set(path, d.headerHTML);
    rows.push({ path, status, errs, ...d });
  } catch (e) {
    rows.push({ path, status, errs: ['FETCH: ' + String(e).slice(0,80)] });
  }
  await p.close();
}
await b.close();

// ---- report ----
const fail = (r, k, expect) => {
  const v = r[k];
  const bad = typeof expect === 'function' ? !expect(v) : v !== expect;
  return bad ? `      ${k}: ${JSON.stringify(v)}` : null;
};
const problems = [];
for (const r of rows) {
  const out = [];
  out.push(fail(r,'status',200));
  out.push(fail(r,'h1',1));
  out.push(fail(r,'h1Text', v => !!v && v.length > 3));
  if (!['/demo/','/404.html'].includes(r.path)) out.push(fail(r,'title', v => !!v && v.length >= 10 && v.length <= 65));
  out.push(fail(r,'desc', v => !!v));
  if (!['/demo/','/404.html'].includes(r.path)) out.push(fail(r,'descLen', v => v >= 50 && v <= 160));
  if (!['/demo/','/404.html'].includes(r.path)) {
    out.push(fail(r,'canonical', v => !!v));
    out.push(fail(r,'ogTitle', true));
    out.push(fail(r,'ogImage', true));
  }
  if (!['/demo/','/404.html'].includes(r.path)) {
    out.push(fail(r,'header', true));
    out.push(fail(r,'footer', true));
  }
  if (!['/demo/','/404.html'].includes(r.path)) out.push(fail(r,'skip', true));
  if (!['/404.html'].includes(r.path)) out.push(fail(r,'navLinks', v => v === 5 || v === 6));
  if (!['/demo/','/404.html'].includes(r.path)) {
    out.push(fail(r,'divider', 1));
    out.push(fail(r,'themeAttr', v => !!v));
  }
  out.push(fail(r,'lang', 'en'));
  out.push(fail(r,'imgsNoAlt', 0));
  out.push(fail(r,'cssOrder', v => v.join(',') === 'tokens,style,site,nav' || v.length === 0));
  if (r.contrast.length) out.push(`      contrast FAIL: ${r.contrast.join(', ')}`);
  if (r.errs.length) out.push(`      js: ${r.errs.slice(0,2).join(' | ')}`);
  const clean = out.filter(Boolean);
  problems.push({ path: r.path, clean });
}

let bad = 0;
console.log('\n=== PER-PAGE ===');
for (const { path, clean } of problems) {
  if (clean.length) { bad += clean.length; console.log(`  ✗ ${path}`); clean.forEach(c => console.log(c)); }
  else console.log(`  ✓ ${path}`);
}

// header consistency
console.log('\n=== HEADER CONSISTENCY ===');
const uniq = new Set(headers.values());
console.log(`  ${headers.size} pages with a header, ${uniq.size} distinct header markup`);
if (uniq.size > 1) {
  console.log('  ✗ headers differ. variants:');
  const seen = new Map();
  for (const [p, h] of headers) if (!seen.has(h)) seen.set(h, p);
  [...seen.keys()].forEach(h => console.log('    - starts: ' + h.slice(0, 110)));
}
console.log(`\n  TOTAL ISSUES: ${bad + (uniq.size > 1 ? 1 : 0)}`);
