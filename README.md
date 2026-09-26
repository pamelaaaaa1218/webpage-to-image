# webpage-to-image

**简体中文** | [English](./README.en.md)

把任意 **HTML 页面 / 网址** 用本机 Chrome 渲染成**整页高清长图**(PNG/JPG)的 Claude Code 技能(Skill)。

用真实浏览器渲染、所见即所得,通过提高像素倍数(2x/3x)解决「网页截图放大发糊」的问题。特别适合把做好的网页(学习笔记、海报页、报告页)导出成长图,发到**微信公众号 / 小红书 / 朋友圈**。

## ✨ 特性
- 🖼️ 本机 Chrome 无头渲染,**不下载任何浏览器**(用 `puppeteer-core` 驱动已装的 Chrome / Edge / Chromium)
- 📏 **自动测量整页高度**,不用手动指定
- 🔍 支持 **2x / 3x** 像素倍数,放大不糊
- 📱 自定义宽度:`1000` 电脑多栏版 / `700` 手机竖版(单栏大字)
- ⏳ 自动等待**字体加载**、滚动触发**懒加载 / 渐入动画**,不会出现空白块
- 📦 输出后报告像素尺寸与文件体积(便于判断是否超过公众号 10MB 单图上限)

## 📥 安装
作为 Claude Code 个人技能使用:把本仓库克隆到 `~/.claude/skills/` 下,目录名保持 `webpage-to-image`:

```bash
git clone <repo-url> ~/.claude/skills/webpage-to-image
npm install --prefix ~/.claude/skills/webpage-to-image   # 只装 puppeteer-core,不下载浏览器
```

之后在 Claude Code 里直接说「把这个网页截成高清长图」就会自动触发。

## 🚀 命令行直接用
```bash
node render.js \
  --input "<HTML 文件路径 或 http(s) 网址>" \
  --out   "<输出.png>" \
  --width 1000 \
  --scale 2
```

### 参数
| 参数 | 说明 | 默认 |
|------|------|------|
| `--input` | 本地 `.html` 路径,或 `http(s)://` 网址(本地起了 dev server 用网址) | 必填 |
| `--out` | 输出路径(`.png` / `.jpg`) | 必填 |
| `--width` | CSS 宽度。`1000`=电脑版(多栏);`700`=手机竖版(单栏大字) | `1000` |
| `--scale` | 像素倍数(DPR)。`2`=够清晰;`3`=超清 | `2` |
| `--format` | `png`(无损)/ `jpeg`(体积更小) | 按后缀自动 |
| `--quality` | 仅 jpeg,1–100 | `92` |
| `--chrome` | 手动指定浏览器路径(一般无需,自动探测) | 自动 |

> 公众号单图上限约 10MB。结果过大时:降到 `--scale 2`、改 `--format jpeg`,或把页面拆两段分别出图。

## 🧩 依赖
- Node.js 18+
- 本机已安装 Chrome / Edge / Chromium 之一

## 📂 文件说明
- `SKILL.md` — Claude Code 技能定义与触发说明
- `render.js` — 渲染脚本(基于 puppeteer-core)
- `package.json` — 依赖声明

## 🌐 网页版
偏好用网页操作?见 [`web-app/`](./web-app/) —— 同一渲染引擎的本地网页版:粘贴链接、点选参数、一键出图(没开服务时自动降级为「复制指令发给 Claude」)。

## 项目更新与AI实践

微信搜索公众号 **「Pamela的AI笔记」** 或扫描下方二维码，获取项目更新、最新AI应用案例和实用教程。

![Uploading 扫码_搜索联合传播样式-标准色版.png…]()

## 📜 许可证
MIT — 详见 [LICENSE](./LICENSE)。

---
🤖 由 [Claude Code](https://claude.com/claude-code) 协助创建
