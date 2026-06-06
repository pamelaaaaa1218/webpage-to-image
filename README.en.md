# webpage-to-image

[简体中文](./README.md) | **English**

Render any **HTML page or URL** into a **full-page, high-resolution image** (PNG/JPG) — a [Claude Code](https://claude.com/claude-code) skill.

It renders with a real browser (pixel-perfect, WYSIWYG) and raises the device pixel ratio (2x/3x) to fix the "blurry when zoomed in" problem of ordinary screenshots. Great for turning a finished web page (study notes, posters, reports) into a long image for WeChat / social posts.

## ✨ Features
- 🖼️ Headless render with your **system Chrome** — **no browser download** (`puppeteer-core` drives your installed Chrome / Edge / Chromium)
- 📏 **Auto-measures the full page height** — no need to specify it
- 🔍 **2x / 3x** pixel density — stays sharp when zoomed
- 📱 Custom width: `1000` desktop (multi-column) / `700` mobile (single column, larger text)
- ⏳ Waits for **web fonts** and scrolls to trigger **lazy / reveal-on-scroll animations** — no blank blocks
- 📦 Reports output pixel size and file size when done

## 📥 Install
Use it as a personal Claude Code skill — clone into `~/.claude/skills/`, keep the folder name `webpage-to-image`:

```bash
git clone <repo-url> ~/.claude/skills/webpage-to-image
npm install --prefix ~/.claude/skills/webpage-to-image   # installs puppeteer-core only, no browser download
```

Then in Claude Code just say "turn this webpage into a high-res long image" and it triggers automatically.

## 🚀 Use from the command line
```bash
node render.js \
  --input "<HTML file path or http(s) URL>" \
  --out   "<output.png>" \
  --width 1000 \
  --scale 2
```

### Options
| Option | Description | Default |
|------|------|------|
| `--input` | Local `.html` path, or an `http(s)://` URL (use a URL if the page needs a dev server) | required |
| `--out` | Output path (`.png` / `.jpg`) | required |
| `--width` | CSS width. `1000` = desktop (multi-column); `700` = mobile (single column) | `1000` |
| `--scale` | Device pixel ratio. `2` = crisp; `3` = extra sharp | `2` |
| `--format` | `png` (lossless) / `jpeg` (smaller) | by extension |
| `--quality` | jpeg only, 1–100 | `92` |
| `--chrome` | Browser binary path (auto-detected, rarely needed) | auto |

> WeChat caps a single image at ~10MB. If the output is too large: drop to `--scale 2`, switch to `--format jpeg`, or split the page into two images.

## 🧩 Requirements
- Node.js 18+
- Chrome / Edge / Chromium installed locally

## 📂 Files
- `SKILL.md` — Claude Code skill definition & trigger description
- `render.js` — render script (puppeteer-core)
- `package.json` — dependency manifest

---
🤖 Built with [Claude Code](https://claude.com/claude-code)
