# web-app · 网页转高清长图(本地网页版)

这是 `webpage-to-image` skill 的**网页版**:粘贴任意网页链接 → 整页渲染成**高清长图**。和 skill **同一引擎**(本机 Chrome + puppeteer-core),清晰度逐像素一致;渲染在本地 Node/Chrome 里跑(不在浏览器页面里),所以**不受跨域限制,任意外部链接都能截**。

一个页面,两种用法:
- **本地服务开着** → 点「生成图片」直接出图、下载(自助)
- **没开服务 / 部署成静态站** → 自动降级成「复制指令发给 Claude」

## 🚀 本地一键出图
```bash
cd web-app
npm install      # 只装 puppeteer-core,不下载浏览器(若仓库根目录已装,可跳过)
npm start        # 启动后打开 http://localhost:7654
```
粘贴链接 → 选 版式 / 清晰度 / 格式 → 点「生成图片」→ 预览并下载。

直接拼 URL 也能出图(可收藏为书签):
```
http://localhost:7654/render?url=https://example.com&width=1440&scale=2&format=png
```

## 参数
| 参数 | 说明 | 默认 |
|------|------|------|
| `url` | 目标网址(http/https) | 必填 |
| `width` | CSS 宽度。`1440` 电脑版 / `700` 手机版 / 自定义 | `1440` |
| `scale` | 像素倍数 `2`(高清)/ `3`(超清) | `2` |
| `format` | `png` / `jpeg` | `png` |
| `quality` | 仅 jpeg,50–100 | `92` |

## 🌐 部署成静态页
把本文件夹部署到任意静态托管(Cloudflare Pages / GitHub Pages 等)即可——**静态站没有后端**,所以部署版只提供「复制指令发给 Claude」功能;自助一键出图需在本地 `npm start`。

## 🧩 依赖
- Node.js 18+
- 本机已装 Chrome / Edge / Chromium(自动探测,或设 `CHROME_PATH`)

---
🤖 由 [Claude Code](https://claude.com/claude-code) 协助创建
