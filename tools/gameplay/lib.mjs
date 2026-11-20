import fs from 'fs';
import { chromium } from 'playwright';
export { chromium };
export const CHROME = process.env.CHROME_PATH || undefined;   // Playwright's own Chromium unless set
export const OUT = new URL('../../public/assets3/gameplay', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
export const SCR = process.env.SCRATCH || 'tmp';
// Opens a recording session. Returns {page, ctx, t(), tap(x,y), drag(x1,y1,x2,y2,ms), finish(name)}
export async function session(name, { record=true }={}) {
  const b = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
  const dir = SCR+'/vid_'+name; fs.rmSync(dir,{recursive:true,force:true});
  const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true,
    ...(record?{recordVideo:{dir, size:{width:780,height:1688}}}:{}) });
  const page = await ctx.newPage();
  const events=[]; let t0=Date.now();
  const S = { page, ctx, events, b, dir,
    start(){ t0=Date.now(); },
    t(){ return (Date.now()-t0)/1000; },
    async tap(x,y,label=''){ events.push({type:'tap',t:+S.t().toFixed(2),x,y,label});
      await page.mouse.move(x,y); await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up(); await page.mouse.move(385,520); },
    async tapEl(sel,label=''){ const el = typeof sel==='string'? page.locator(sel).first(): sel; const bb = await el.boundingBox(); if(!bb) throw new Error('nobox '+sel);
      return S.tap(Math.round(bb.x+bb.width/2),Math.round(bb.y+bb.height/2),label||String(sel)); },
    async drag(x1,y1,x2,y2,ms=450,label=''){ events.push({type:'drag',t:+S.t().toFixed(2),x1,y1,x2,y2,dur:ms/1000,label});
      await page.mouse.move(x1,y1); await page.mouse.down(); const n=Math.max(6,Math.round(ms/30));
      for(let i=1;i<=n;i++){ await page.mouse.move(x1+(x2-x1)*i/n, y1+(y2-y1)*i/n); await page.waitForTimeout(ms/n); }
      await page.mouse.up(); },
    async dragEl(a,b2,ms,label){ const A=await (typeof a==='string'?page.locator(a).first():a).boundingBox(); const B=await (typeof b2==='string'?page.locator(b2).first():b2).boundingBox();
      return S.drag(A.x+A.width/2,A.y+A.height/2,B.x+B.width/2,B.y+B.height/2,ms,label); },
    async finish(out, {trimStart=0, dur=12}={}) {
      const vp = page.video(); await ctx.close(); const src = await vp.path(); await b.close();
      fs.writeFileSync(`${OUT}/${out}.json`, JSON.stringify({viewport:{w:390,h:844},video:{w:780,h:1688,fps:30},trimStart,events:events.map(e=>({...e,t:+(e.t-trimStart).toFixed(2)})).filter(e=>e.t>=0)},null,1));
      const { execFileSync } = await import('child_process');
      execFileSync('ffmpeg',['-y','-ss',String(trimStart),'-i',src,'-t',String(dur),'-r','30','-an','-c:v','libx264','-pix_fmt','yuv420p','-crf','18',`${OUT}/${out}.mp4`],{stdio:'ignore'});
      return src; }
  };
  return S;
}
