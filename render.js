#!/usr/bin/env node
/*
 * webpage-to-image — render a local HTML file or URL to a full-page high-res image.
 * Uses puppeteer-core driving the system Chrome (no Chromium download).
 *
 * Usage:
 *   node render.js --input <file|url> --out <out.png> [--width 1000] [--scale 2] [--chrome <path>] [--format png|jpeg] [--quality 92]
 */
const fs = require('fs');
const path = require('path');

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && i + 1 < process.argv.length ? process.argv[i + 1] : def;
}

function findChrome(explicit) {
  if (explicit && fs.existsSync(explicit)) return explicit;
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  ].filter(Boolean);
  for (const c of candidates) { try { if (fs.existsSync(c)) return c; } catch (_) {} }
  return null;
}

(async () => {
  const input = arg('input');
  const out = arg('out');
  const width = parseInt(arg('width', '1000'), 10);
  const scale = parseFloat(arg('scale', '2'));
  const format = (arg('format', out && /\.jpe?g$/i.test(out) ? 'jpeg' : 'png')).toLowerCase();
  const quality = parseInt(arg('quality', '92'), 10);
  const chromePath = findChrome(arg('chrome'));

  if (!input || !out) {
    console.error('Usage: node render.js --input <file|url> --out <out.png> [--width 1000] [--scale 2] [--chrome <path>]');
    process.exit(1);
  }
  if (!chromePath) { console.error('NO_CHROME: could not locate a Chrome/Edge/Chromium binary. Pass --chrome <path> or set CHROME_PATH.'); process.exit(4); }

  let puppeteer;
  try { puppeteer = require('puppeteer-core'); }
  catch (e) { console.error('MISSING_PUPPETEER'); process.exit(2); }

  const url = /^https?:\/\//i.test(input) ? input : 'file://' + path.resolve(input);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900, deviceScaleFactor: scale });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // wait for web fonts
    try { await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; }); } catch (_) {}

    // trigger any lazy / scroll-reveal animations, then return to top
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      const h = () => document.documentElement.scrollHeight;
      const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
      for (let y = 0; y < h(); y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); }
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 400));

    const shotOpts = { path: out, fullPage: true, type: format === 'jpeg' ? 'jpeg' : 'png' };
    if (format === 'jpeg') shotOpts.quality = quality;
    await page.screenshot(shotOpts);

    const dims = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
    const bytes = fs.statSync(out).size;
    console.log(JSON.stringify({
      ok: true,
      out,
      cssWidth: dims.w,
      cssHeight: dims.h,
      pxWidth: Math.round(width * scale),
      pxHeight: Math.round(dims.h * scale),
      fileBytes: bytes,
      fileMB: +(bytes / 1048576).toFixed(2),
    }));
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error('ERROR', e && e.message ? e.message : e); process.exit(3); });
