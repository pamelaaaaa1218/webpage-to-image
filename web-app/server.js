#!/usr/bin/env node
/*
 * webshot — 本地网页转高清整页长图服务
 * 复用本机 Chrome + puppeteer-core 渲染,清晰度与 webpage-to-image skill 完全一致。
 *
 * 用法:  npm install   然后   npm start   →   打开 http://localhost:7654
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = parseInt(process.env.PORT || '7654', 10);

let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch (e) { console.error('\n  ✗ 缺少依赖,请先运行:  npm install\n'); process.exit(1); }

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium', '/usr/bin/chromium-browser',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ].filter(Boolean);
  for (const p of candidates) { try { if (fs.existsSync(p)) return p; } catch (_) {} }
  return null;
}

// 复用同一个浏览器实例,加快连续渲染
let browserPromise = null;
function getBrowser() {
  if (!browserPromise) {
    const exe = findChrome();
    if (!exe) throw new Error('NO_CHROME');
    browserPromise = puppeteer.launch({
      executablePath: exe,
      headless: true,
      args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none'],
    });
  }
  return browserPromise;
}

async function renderShot({ url, width, scale, format, quality }) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({ width, height: 900, deviceScaleFactor: scale });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
    try { await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; }); } catch (_) {}
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); }
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 400));
    const dims = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
    const opts = { fullPage: true, type: format === 'jpeg' ? 'jpeg' : 'png' };
    if (format === 'jpeg') opts.quality = quality;
    const buf = await page.screenshot(opts);
    return { buf, dims };
  } finally {
    await page.close();
  }
}

const INDEX = fs.readFileSync(path.join(__dirname, 'index.html'));

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'X-Img-Width,X-Img-Height,X-Img-Bytes');

  if (u.pathname === '/' || u.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(INDEX);
  }

  if (u.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, chrome: !!findChrome() }));
  }

  if (u.pathname === '/render') {
    try {
      const url = u.searchParams.get('url');
      const width = Math.min(4000, Math.max(280, parseInt(u.searchParams.get('width') || '1440', 10)));
      const scale = Math.min(3, Math.max(1, parseFloat(u.searchParams.get('scale') || '2')));
      const format = (u.searchParams.get('format') || 'png').toLowerCase() === 'jpeg' ? 'jpeg' : 'png';
      const quality = Math.min(100, Math.max(1, parseInt(u.searchParams.get('quality') || '92', 10)));
      if (!url || !/^https?:\/\//i.test(url)) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: '请提供 http(s):// 开头的有效网址' }));
      }
      console.log(`  → 渲染 ${url}  (${width}px · ${scale}x · ${format})`);
      const { buf, dims } = await renderShot({ url, width, scale, format, quality });
      console.log(`  ✓ 完成 ${Math.round(width * scale)}×${Math.round(dims.h * scale)}px · ${(buf.length / 1048576).toFixed(2)}MB`);
      res.writeHead(200, {
        'Content-Type': format === 'jpeg' ? 'image/jpeg' : 'image/png',
        'X-Img-Width': String(Math.round(width * scale)),
        'X-Img-Height': String(Math.round(dims.h * scale)),
        'X-Img-Bytes': String(buf.length),
      });
      return res.end(buf);
    } catch (e) {
      const msg = e.message === 'NO_CHROME'
        ? '未找到本机 Chrome,请安装 Chrome 或设置环境变量 CHROME_PATH'
        : ('渲染失败: ' + (e && e.message ? e.message : e));
      console.error('  ✗ ' + msg);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ error: msg }));
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n  🖼️  webshot 本地渲染服务已启动`);
  console.log(`  👉  打开浏览器访问:  http://localhost:${PORT}`);
  console.log(`      (用本机 Chrome 渲染,清晰度与 skill 一致;Ctrl+C 退出)\n`);
});
