import { chromium } from 'playwright';
const BASE='https://akmalariq.dev';
const PAGES=['/','/privacy/','/terms/','/projects/','/demos/','/demos/weekly-report/','/demos/reorder-and-margin/',
 '/demos/seller-ledger/','/product/','/demo/','/projects/earthquake/','/projects/jakarta-geomarketing/',
 '/projects/promotion-lift-optimization/','/projects/retail-replenishment-optimization/','/projects/retail-demand-forecasting-ai/'];
const b=await chromium.launch();
const found=new Map();
for (const path of PAGES){
  const p=await b.newPage();
  await p.goto(BASE+path,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(300);
  const hrefs=await p.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')));
  for(const h of hrefs){ if(!h||h.startsWith('#')||h.startsWith('mailto:')||h.startsWith('tel:'))continue;
    let u; try{u=new URL(h,BASE+path);}catch{continue;}
    if(u.origin!==BASE)continue;
    const k=u.pathname+u.search;
    if(!found.has(k))found.set(k,new Set());
    found.get(k).add(path);
  }
  await p.close();
}
const targets=[...found.keys()];
console.log('  checking '+targets.length+' unique internal targets…');
const bad=[];
for(const t of targets){
  const p=await b.newPage();
  let st=0; try{const r=await p.goto(BASE+t,{waitUntil:'domcontentloaded',timeout:20000});st=r.status();}catch{st=0;}
  await p.close();
  if(st!==200){ bad.push([t,st,[...found.get(t)].join(', ')]); }
}
await b.close();
if(!bad.length) console.log('  ✓ all internal links resolve (200)');
else { console.log('  ✗ broken internal links:');
  for(const [t,st,from] of bad) console.log(`     ${st||'ERR'}  ${t}\n          linked from: ${from}`); }
console.log('  TOTAL BROKEN: '+bad.length);
