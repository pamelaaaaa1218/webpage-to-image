---
name: webpage-to-image
description: 把本地 HTML 网页或网址渲染成高清整页长图(PNG/JPG)。当用户想把网页/页面「截成长图」「生成高清图片」「导出整页截图」,用于分享到公众号、小红书、朋友圈,或提到「网页转图片」「截长图」「整页截图」「高清长图」「webpage to image」「full page screenshot」时使用。基于本机 Chrome 无头渲染,所见即所得;支持自定义宽度(电脑多栏版 / 手机竖版)与像素倍数(2x/3x 超清),自动测量整页高度、等待字体与滚动动画加载,输出后报告像素尺寸与文件体积。
---

# 网页转高清长图 (webpage-to-image)

把一个 HTML 文件或网址,用本机 Chrome 渲染成**整页高清长图**。和肉眼在 Chrome 里看到的一模一样,通过提高像素倍数解决「截图放大发糊」的问题。

技能目录:`/Users/pamela/.claude/skills/webpage-to-image/`

## 何时用
- 用户想把做好的网页 / 学习笔记页 / 海报页**截成一张长图**去发公众号、小红书、朋友圈。
- 用户抱怨自己截的图**像素低、放大模糊**。
- 任何「网页 → 图片 / 整页截图 / full page screenshot」的需求。

## 怎么用(标准流程)

1. **确认依赖**:若 `node_modules/` 不存在,先安装一次(只装 puppeteer-core,**不会**下载浏览器):
   ```bash
   npm install --prefix /Users/pamela/.claude/skills/webpage-to-image --no-audit --no-fund
   ```

2. **渲染**:
   ```bash
   node /Users/pamela/.claude/skills/webpage-to-image/render.js \
     --input "<HTML文件路径 或 http(s) 网址>" \
     --out "<输出.png>" \
     --width 1000 --scale 2
   ```
   脚本会自动:定位 Chrome → 加载页面 → 等字体就绪 → 滚动触发懒加载/渐入动画 → 整页截图 → 打印 JSON 结果。

3. **回报结果**:解析 stdout 的 JSON(`pxWidth`/`pxHeight`/`fileMB`),把**像素尺寸**和**文件体积**告诉用户。

## 参数与预设

| 参数 | 说明 | 默认 / 预设 |
|------|------|------|
| `--input` | 本地 `.html` 路径,或 `http(s)://` 网址(本地起了 dev server 时用网址) | 必填 |
| `--out` | 输出路径,`.png` 或 `.jpg`(默认放到 input 同目录或 `~/Downloads`) | 必填 |
| `--width` | CSS 宽度(px)。**`1000` = 电脑版**(保留多栏布局);**`700` = 手机竖版**(触发响应式单栏、字更大,最适合公众号手机阅读) | `1000` |
| `--scale` | 像素倍数(DPR)。**`2` = 够清晰**;**`3` = 超清**(可大幅放大看细节)。越大越锐、文件越大 | `2` |
| `--format` | `png`(默认,无损)或 `jpeg`(体积小很多) | 按后缀自动 |
| `--quality` | 仅 jpeg,1–100 | `92` |
| `--chrome` | 手动指定 Chrome/Edge/Chromium 路径(一般不用,会自动找) | 自动探测 |

**选型建议**:发公众号默认 `--width 1000 --scale 2`;用户要更清晰用 `--scale 3`;主要在手机上看就 `--width 700`(可再配 `--scale 3`)。

## 重要提醒
- **公众号单图上限约 10MB**。若结果 `fileMB > 10`,提示用户:降到 `--scale 2`、改 `--format jpeg`,或把页面拆成两段分别出图。
- **纯单文件 HTML**(内联 CSS/JS)直接用 `file://` 即可。若页面依赖需要服务器才能加载的外部资源,先起一个本地静态服务器(如 `npx serve`),再把 `--input` 换成那个 URL。
- 脚本已处理「字体未加载完」和「滚动渐入动画导致空白」两个常见坑,正常不会出现空白块。

## 兜底方案(没有 node/npm,或离线无法安装)
直接用系统 Chrome 命令行(old headless 会自动整页截图,已弃用但目前可用):
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=old --hide-scrollbars --force-device-scale-factor=3 \
  --screenshot="<输出.png>" "file://<HTML绝对路径>"
```

## 排错
- `NO_CHROME`:没找到浏览器 → 加 `--chrome "<路径>"` 或设环境变量 `CHROME_PATH`。
- `MISSING_PUPPETEER`:依赖没装 → 执行上面第 1 步的 `npm install --prefix ...`。
- 图片底部被截断 / 内容缺失:多半是外部资源没加载完 —— 改用本地服务器 URL 作为 `--input` 重试。
