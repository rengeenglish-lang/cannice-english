const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const [,, html, out, secs, fps] = process.argv;
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox','--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport:{width:1080,height:1920} });
  await page.goto('file://'+path.resolve(html));
  await page.waitForTimeout(500);
  const N = Math.round(secs*fps);
  const ff = spawn('ffmpeg',['-y','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium',out],{stdio:['pipe','inherit','inherit']});
  for (let i=0;i<N;i++){
    await page.evaluate(t=>window.render(t), i/fps);
    const buf = await page.screenshot({type:'jpeg',quality:92});
    if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
  }
  ff.stdin.end(); await new Promise(r=>ff.on('close',r));
  await browser.close();
})();
