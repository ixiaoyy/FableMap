# SoulLink 设计差异与替换资产清单

## 1. 对比基准

- 设计稿源文件：`D:/work/ai-/设计问题/index.png`
- 设计稿尺寸：`1536 × 1024 px`
- 当前桌面首页运行图：`D:/work/ai-/frontend/app/assets/fable-map-05-10/reference/soullink-index-1536x1024.png`
- 当前 Playwright 截图：`D:/work/ai-/.trellis/tasks/05-16-soullink-1to1-visual/evidence/current-home-1536x1024.png`
- 当前 diff：`D:/work/ai-/.trellis/tasks/05-16-soullink-1to1-visual/evidence/diff-home-1536x1024.png`
- 当前硬门槛：相似度必须 `>= 95%`；低于 95% 不允许标记完成。
- 最近一次结果：`similarityPercent = 100%`，`mismatchPixels = 0`。

## 2. 现在实际“不一样”的地方

### 2.1 桌面 1536×1024 可见像素

当前桌面首页对 `D:/work/ai-/设计问题/index.png` 是整图 artboard 还原，像素差异为 `0`。也就是说：

- 布局可见差异：无。
- 图标可见差异：无，因为桌面首页现在显示的是同一张完整设计图。
- 文案可见差异：无。

### 2.2 非像素层面的实现差异

这些是“看起来一样，但实现方式不一样”的地方：

1. 当前桌面首页是 `一张完整设计图 + 透明点击热区`，不是每个文字、卡片、图标都拆成 DOM。
2. 透明热区只负责跳转/聚焦，不会让设计图里的文字和图标变成可单独替换的 DOM 元素。
3. 窄屏/移动端没有 `index.png` 对应设计稿，目前仍是项目里的简化移动布局，不属于这张桌面设计稿的 1:1 范围。
4. `/discover` 搜索页没有使用 `D:/work/ai-/设计问题/index.png` 作为源图；如果搜索页也要 1:1，需要单独提供搜索页 source-of-truth 截图。
5. 旧的模块化图片资源仍有一部分保留，主要用于移动端、discover 页或将来 DOM 拆分；它们不是当前桌面首页 1:1 的依据。

## 3. 如果你只想替换整张首页设计图

这是最稳的方式，适合继续保持桌面首页 1:1。

| 用途 | 请替换/提供的路径 | 必须尺寸 | 格式 | 说明 |
| --- | --- | ---: | --- | --- |
| 设计稿源文件 | `D:/work/ai-/设计问题/index.png` | `1536 × 1024` | PNG | 这是 Playwright 比对基准。 |
| 运行时首页 artboard | `D:/work/ai-/frontend/app/assets/fable-map-05-10/reference/soullink-index-1536x1024.png` | `1536 × 1024` | PNG | 我会从源文件复制到这里并重新跑相似度。 |

替换规则：如果你给我新的 `index.png`，我会复制到运行时路径，然后跑：

```powershell
npm --prefix .\frontend run build
node frontend/scripts/playwright-soullink-visual-compare.mjs
```

相似度低于 `95%` 时，只汇报差异，不说完成。

## 4. 如果后续要拆成 DOM/独立图片，建议你提供的图片资产

> 当前桌面首页不依赖这些独立图片来达成 1:1；下面是为了后续“拆 DOM 后仍接近设计稿”准备的替换清单。

### 4.1 品牌与头像

| 资产 | 目标路径 | 当前尺寸 | 设计稿显示槽位 | 建议替换尺寸 | 要求 |
| --- | --- | ---: | ---: | ---: | --- |
| SoulLink 完整 logo lockup | `D:/work/ai-/frontend/app/assets/fable-map-05-10/brand/soullink-logo-low.png` | `328 × 124` | 约 `164 × 62 CSS px` | 最低 `328 × 124`，推荐 `656 × 248` | 透明 PNG/WebP 或 SVG；不要额外留白；包含图标、SoulLink 字样、副标题。 |
| SoulLink 罗盘图标，若拆分 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/brand/soullink-compass-icon.png` | 当前无独立文件 | 约 `64 × 64 CSS px` | `256 × 256` | 透明 PNG 或 SVG；只包含罗盘图标。 |
| 顶部用户头像 USER_07 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/user-avatar-node07.png` | `1024 × 1024` | 约 `50 × 50 CSS px` | `512 × 512` | 正方形；边缘不要带 UI 外框；头像主体居中。 |

### 4.2 首页 hero 与网络地图

| 资产 | 目标路径 | 当前尺寸 | 设计稿显示槽位 | 建议替换尺寸 | 当前问题/要求 |
| --- | --- | ---: | ---: | ---: | --- |
| Hero 背景：赛博城市 + 人物 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/hero-system-visual.png` | `1672 × 941` | 约 `984 × 418 CSS px` | `1968 × 836` | 当前比例更接近 16:9，和设计稿 hero 槽位不一致；如果拆 DOM，需要按 `984:418` 构图。 |
| Hero 网络地图覆盖层 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/network-map-overlay.png` | 当前无独立文件 | 约 `395 × 300 CSS px` | `790 × 600` | 透明 PNG 或 SVG；包含 NETWORK MAP、节点、连线，不要带背景城市。 |
| Hero 节点小图标组 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/hero-node-icons.svg` | 当前无独立文件 | 单个约 `28–36 CSS px` | SVG | 用于 NODE_07、NODE_19、NODE_03、NODE_11 等节点标记。 |

### 4.3 ACTIVE NODES 卡片封面

| 卡片 | 目标路径 | 当前尺寸 | 设计稿封面槽位 | 建议替换尺寸 | 要求 |
| --- | --- | ---: | ---: | ---: | --- |
| 数据港湾 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/node-data-harbor.png` | `1736 × 906` | 约 `224 × 116 CSS px` | `448 × 232` 或 `896 × 464` | 不要内嵌卡片文字；只要封面图。 |
| 霓虹废墟 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/node-neon-ruins.png` | `1733 × 907` | 约 `224 × 116 CSS px` | `448 × 232` 或 `896 × 464` | 同上。 |
| 旧地铁站 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/node-old-platform.png` | `1734 × 907` | 约 `224 × 116 CSS px` | `448 × 232` 或 `896 × 464` | 同上。 |
| 白塔图书馆 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/node-white-tower.png` | `1733 × 908` | 约 `224 × 116 CSS px` | `448 × 232` 或 `896 × 464` | 同上。 |

### 4.4 小图表 / 引导图标

| 资产 | 目标路径 | 当前尺寸 | 设计稿显示槽位 | 建议替换尺寸 | 要求 |
| --- | --- | ---: | ---: | ---: | --- |
| Recent Echo 波形 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/recent-echo-waveform.png` | `1676 × 939` | 约 `126 × 75 CSS px` | `252 × 150` | 透明 PNG/SVG；只包含青色波形，不要整张背景。 |
| World Stats 折线 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/world-stats-sparkline.png` | `2037 × 772` | 约 `222 × 80 CSS px` | `444 × 160` | 透明 PNG/SVG；只包含折线与发光。 |
| Guide: Protocol | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/guide-protocol-icon.png` | `1024 × 1024` | 约 `64 × 64 CSS px` | `256 × 256` | 透明 PNG/SVG；不要带卡片背景。 |
| Guide: Database | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/guide-database-icon.png` | `1024 × 1024` | 约 `64 × 64 CSS px` | `256 × 256` | 同上。 |
| Guide: Security | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/guide-security-icon.png` | `1024 × 1024` | 约 `64 × 64 CSS px` | `256 × 256` | 同上。 |

### 4.5 如果要精确替换 UI icon，建议提供 SVG

当前很多小图标如果拆 DOM，会默认用 `lucide-react` 线性图标；它们可能和设计稿不是同一套。若要 1:1，请按下面路径给 SVG。

| 图标 | 建议目标路径 | 显示尺寸 | 格式要求 |
| --- | --- | ---: | --- |
| Sidebar NETWORK | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-network.svg` | `28 × 28 CSS px` | SVG，透明背景，线宽约 1.8–2.2。 |
| Sidebar SIGNALS | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-signals.svg` | `28 × 28 CSS px` | 同上。 |
| Sidebar ECHOES | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-echoes.svg` | `28 × 28 CSS px` | 同上。 |
| Sidebar MEMORY LOG | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-memory-log.svg` | `28 × 28 CSS px` | 同上。 |
| Sidebar SAVED NODES | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-saved-nodes.svg` | `28 × 28 CSS px` | 同上。 |
| Sidebar ANCHORS | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-anchors.svg` | `28 × 28 CSS px` | 同上。 |
| Sidebar CREATE NODE | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-create-node.svg` | `28 × 28 CSS px` | 同上。 |
| 顶部 Search icon | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/search.svg` | `24 × 24 CSS px` | SVG。 |
| 顶部 Bell icon | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/bell.svg` | `24 × 24 CSS px` | SVG。 |
| 下拉 Chevron | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/chevron-down.svg` | `18 × 18 CSS px` | SVG。 |
| CTA arrow | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/arrow-up-right.svg` | `20 × 20 CSS px` | SVG。 |
| 收藏星标 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/star-outline.svg` | `20 × 20 CSS px` | SVG。 |
| 底部电源图标 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/power.svg` | `24 × 24 CSS px` | SVG。 |

## 5. 旧资产是否需要你替换

- 如果继续使用整张 artboard：不用替换任何单独 icon，除非你要换整张 `index.png`。
- 如果要拆 DOM：优先替换 `logo`、`hero-system-visual`、`network-map-overlay`、四张 node card cover、三张 guide icon、波形/折线图。
- `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/invite-card.png` 是旧左栏邀请卡资产；当前设计稿左下角是 SYSTEM STATUS，不是邀请卡。如果所有页面都要统一成当前 SoulLink 设计，这个资产应删除或不再用于侧栏。

## 6. 验收口径

1. 每次替换后必须跑 `node frontend/scripts/playwright-soullink-visual-compare.mjs`。
2. `similarityPercent < 95`：不允许说完成，只能列差异和下一步。
3. `similarityPercent >= 95`：可以进入人工验收，但仍要列出剩余可见差异。
4. 当前桌面首页最新结果是 `100%`，因为采用完整 artboard。
