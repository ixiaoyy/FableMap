const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, 'artifacts', 'research', 'ai-creation-sites');
const sites = [
  { slug: 'krea', name: 'Krea', url: 'https://www.krea.ai/' },
  { slug: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.co/' },
  { slug: 'replit-ai', name: 'Replit AI', url: 'https://replit.com/ai' },
];
const viewports = [{name:'desktop',width:1366,height:900},{name:'mobile',width:390,height:844}];
function sanitize(text=''){return text.replace(/\s+/g,' ').trim().slice(0,1000)}
async function cap(browser, site){
 const dir=path.join(outputRoot,site.slug);fs.mkdirSync(dir,{recursive:true});const result={...site,capturedAt:new Date().toISOString(),publicOnly:true,attemptedLoginOrBypass:false,viewports:{}};
 for(const viewport of viewports){const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},ignoreHTTPSErrors:true,locale:'en-US',userAgent:viewport.name==='mobile'?'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1':undefined}); const page=await context.newPage();
 try{const response=await page.goto(site.url,{waitUntil:'domcontentloaded',timeout:45000}); await page.waitForTimeout(4500); const title=await page.title().catch(()=>''); const text=sanitize(await page.locator('body').innerText({timeout:4000}).catch(()=>'')); const blocked=/captcha|verify you are human|access denied|enable cookies|cloudflare|just a moment/i.test(`${title} ${text}`); const screenshot=path.join(dir,`${site.slug}-home-${viewport.name}.png`); await page.screenshot({path:screenshot,fullPage:true,timeout:30000}); result.viewports[viewport.name]={ok:true,blocked,status:response?.status()||null,finalUrl:page.url(),title,screenshot:path.relative(repoRoot,screenshot).replace(/\\/g,'/'),textSample:text};}
 catch(error){const screenshot=path.join(dir,`${site.slug}-home-${viewport.name}-failure.png`); try{await page.screenshot({path:screenshot,fullPage:true,timeout:10000})}catch{} result.viewports[viewport.name]={ok:false,error:error.message,screenshot:fs.existsSync(screenshot)?path.relative(repoRoot,screenshot).replace(/\\/g,'/'):null};}
 await context.close().catch(()=>{});
 }
 fs.writeFileSync(path.join(dir,'capture.json'), JSON.stringify(result,null,2)+'\n'); return result;
}
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-proxy-server']}); const results=[]; try{for(const site of sites){console.log('capturing '+site.slug); results.push(await cap(browser,site));}} finally{await browser.close().catch(()=>{})} console.log(JSON.stringify(results.map(s=>({slug:s.slug,desktop:s.viewports.desktop,mobile:s.viewports.mobile})),null,2));})();
