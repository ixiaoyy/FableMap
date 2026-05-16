# SoulLink 设计差异与替换资产清单

## 1. 对比基准与当前结论

- Source of truth：`D:/work/ai-/设计问题/index.png`
- 设计稿尺寸：`1536 × 1024 px`
- 当前 Playwright 桌面截图：`D:/work/ai-/.trellis/tasks/05-16-soullink-1to1-visual/evidence/current-home-1536x1024.png`
- 当前 Playwright 移动截图：`D:/work/ai-/.trellis/tasks/05-16-soullink-1to1-visual/evidence/current-home-mobile-390x844.png`
- 当前 diff：`D:/work/ai-/.trellis/tasks/05-16-soullink-1to1-visual/evidence/diff-home-1536x1024.png`
- 验收门槛：`similarityPercent >= 90%`
- 最新结果：`similarityPercent = 95.4502%`，`mismatchPixels = 71,562`，`similarityPass = true`
- DOM 动态文字校验：`domTextCount = 73`，`usesFullDesignRuntimeImage = false`

结论：当前版本采用“静态背景/卡片图层 + 动态 DOM 文本覆盖”。静态层为 `frontend/app/assets/fable-map-05-10/reference/soullink-static-base-1536x1024.png`，它从设计稿派生并去掉了动态/数据文字；用户、节点、活动、在线实体、记忆、统计值等动态内容由 DOM 文本渲染。

## 2. 当前实现边界

### 已拆分

- 首页不再引用整张 `soullink-index-1536x1024.png` 作为桌面可见层。
- 当前使用 `soullink-static-base-1536x1024.png` 承载死背景、卡片外观、静态标题、静态 icon 与不可变装饰。
- ACTIVE NODES 的状态、标题、NODE id、描述、entities 数字为 DOM 文本；卡片底图/封面可走图片层。
- 用户身份、hero 实时统计、network map 节点标签、Signal Activity 行、Recent Echo 内容、Online Entities 行、Memory Stream 行、World Stats 数值为 DOM 文本。
- 静态 logo、静态侧栏文案、静态模块标题、卡片背景、头像、波形/折线/guide icon 可以使用图片资源以保证相似度。

### 不允许再做

- 不允许把动态内容区域裁成一张带文字的截图。
- 不允许用整张首页 artboard 当最终首页可见层。
- 文本、数字、状态、用户/节点名称、计数必须保留为 DOM。

## 3. 现在和设计稿不一样的地方

1. **动态 DOM 字体与原图仍有抗锯齿差异**：相似度已过 90%，但动态文本覆盖层不是原图像素级字体，局部仍有 diff。
2. **部分动态文字底下还有轻微静态底纹/擦除痕迹**：`soullink-static-base-1536x1024.png` 是从设计稿中移除动态字形得到的静态层，不是设计源文件的真正无字版本。你提供无字背景/卡片后可以继续提高质量。
3. **右侧 Signal Activity / Online Entities 图标仍来自静态底图**：动态文字是 DOM，但圆形图标/头像仍在静态图层；如要替换，需要提供独立 icon/头像资源。
4. **ACTIVE NODES 小头像仍来自静态图层**：文字为 DOM，头像组目前留在静态/卡片图层；如果头像也要动态替换，需要提供单独实体头像。
5. **移动端仍是原项目移动布局**：本次 90%+ 验收范围是桌面 `1536×1024` 的 `index.png`。

## 4. ACTIVE NODES 卡片替换清单（图文分离）

| 槽位 | 当前/目标路径 | 当前/建议尺寸 | 页面显示槽位 | 替换要求 |
| --- | --- | ---: | ---: | --- |
| 数据港湾封面 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/node-data-harbor.png` | 当前 `1736×906`；建议 `896×464` | `224×116 CSS px` | 只放封面图，不要文字、badge、头像、星标。 |
| 霓虹废墟封面 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/node-neon-ruins.png` | 当前 `1733×907`；建议 `896×464` | `224×116 CSS px` | 同上。 |
| 旧地铁站封面 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/node-old-platform.png` | 当前 `1734×907`；建议 `896×464` | `224×116 CSS px` | 同上。 |
| 白塔图书馆封面 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/node-white-tower.png` | 当前 `1733×908`；建议 `896×464` | `224×116 CSS px` | 同上。 |
| 收藏星标 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/star-outline.svg` | 需要新增 | `20×20 CSS px` | SVG 透明背景；只包含 star outline。当前是 DOM 文本 `☆` 占位。 |
| 实体头像 01 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/entity-avatar-01.png` | 需要新增；建议 `128×128` | `20×20 CSS px` | 正方形 PNG/WebP；不要 UI 外框。 |
| 实体头像 02 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/entity-avatar-02.png` | 需要新增；建议 `128×128` | `20×20 CSS px` | 同上。 |
| 实体头像 03 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/entity-avatar-03.png` | 需要新增；建议 `128×128` | `20×20 CSS px` | 同上。 |
| 实体头像 04 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/entity-avatar-04.png` | 需要新增；建议 `128×128` | `20×20 CSS px` | 同上。 |

卡片内以下内容必须继续是 DOM：`ACTIVE / UNSTABLE / LOW SIGNAL`、`数据港湾`、`NODE_07`、描述、`128 ENTITIES` 等。

## 5. 首页其它替换资产

### 5.1 品牌与顶部用户区

| 资产 | 目标路径 | 当前尺寸 | 显示槽位 | 建议替换尺寸 | 要求 |
| --- | --- | ---: | ---: | ---: | --- |
| SoulLink logo lockup | `D:/work/ai-/frontend/app/assets/fable-map-05-10/brand/soullink-logo-low.png` | `328×124` | 约 `194×88 CSS px` | `656×248` 或 SVG | 可作为品牌图；不要内嵌动态用户/节点文案。 |
| 顶部用户头像 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/user-avatar-node07.png` | `1024×1024` | 约 `44–50 CSS px` | `512×512` | 只要头像，不要边框/文字。 |
| Bell icon | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/bell.svg` | 需要新增 | `24×24 CSS px` | SVG | 当前为 lucide 占位。 |
| Chevron down | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/chevron-down.svg` | 需要新增 | `18×18 CSS px` | SVG | 当前为 lucide 占位。 |

### 5.2 Hero 区域

| 资产 | 目标路径 | 当前尺寸 | 显示槽位 | 建议替换尺寸 | 要求 |
| --- | --- | ---: | ---: | ---: | --- |
| Hero 城市/人物背景 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/hero-system-visual.png` | `1672×941` | 约 `936×418 CSS px` | `1872×836` | 只要背景/人物/城市；不要主标题、CTA、搜索框。 |
| 网络地图叠层 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/network-map-overlay.png` | 需要新增 | 约 `395×300 CSS px` | `790×600` | 透明 PNG/SVG；只包含网络线、节点、NETWORK MAP 小字和节点装饰。 |
| Hero 节点 icon | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/hero-node-icons.svg` | 需要新增 | 单个 `28–36 CSS px` | SVG | 用于 NODE_07/NODE_19/NODE_03/NODE_11 标记。 |
| CTA arrow | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/arrow-up-right.svg` | 需要新增 | `18–20 CSS px` | SVG | 当前为 lucide 占位。 |

Hero 主标题、副标题、按钮文字目前按静态设计图层处理；实时统计和节点标签为 DOM。若这些文案未来要动态变化，再把对应区域加入 DOM 覆盖。

### 5.3 Sidebar icon

| 图标 | 建议目标路径 | 显示尺寸 | 格式要求 |
| --- | --- | ---: | --- |
| NETWORK | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-network.svg` | `28×28 CSS px` | SVG，透明背景。 |
| SIGNALS | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-signals.svg` | `28×28 CSS px` | SVG，透明背景。 |
| ECHOES | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-echoes.svg` | `28×28 CSS px` | SVG，透明背景。 |
| MEMORY LOG | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-memory-log.svg` | `28×28 CSS px` | SVG，透明背景。 |
| SAVED NODES | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-saved-nodes.svg` | `28×28 CSS px` | SVG，透明背景。 |
| ANCHORS | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-anchors.svg` | `28×28 CSS px` | SVG，透明背景。 |
| CREATE NODE | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/nav-create-node.svg` | `28×28 CSS px` | SVG，透明背景。 |

### 5.4 右栏与底部面板

| 资产 | 目标路径 | 当前尺寸 | 显示槽位 | 建议替换尺寸 | 要求 |
| --- | --- | ---: | ---: | ---: | --- |
| Recent Echo 波形 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/recent-echo-waveform.png` | `1676×939` | 约 `126×75 CSS px` | `252×150` 或 SVG | 只要波形，不要背景/文字。 |
| World Stats 折线 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/world-stats-sparkline.png` | `2037×772` | 约 `222×80 CSS px` | `444×160` 或 SVG | 只要折线与发光。 |
| Guide Protocol icon | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/guide-protocol-icon.png` | `1024×1024` | 约 `64×64 CSS px` | `256×256` | 只要图标，不要卡片文字。 |
| Guide Database icon | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/guide-database-icon.png` | `1024×1024` | 约 `64×64 CSS px` | `256×256` | 同上。 |
| Guide Security icon | `D:/work/ai-/frontend/app/assets/fable-map-05-10/home-black/guide-security-icon.png` | `1024×1024` | 约 `64×64 CSS px` | `256×256` | 同上。 |
| Signal Activity icon 01 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/signal-node-07.svg` | 需要新增 | `40×40 CSS px` | SVG/PNG | 右侧活动列表圆形 icon。 |
| Signal Activity icon 02 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/signal-node-21.svg` | 需要新增 | `40×40 CSS px` | SVG/PNG | 同上。 |
| Signal Activity icon 03 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/signal-node-19.svg` | 需要新增 | `40×40 CSS px` | SVG/PNG | 同上。 |
| Signal Activity icon 04 | `D:/work/ai-/frontend/app/assets/fable-map-05-10/icons/signal-node-03.svg` | 需要新增 | `40×40 CSS px` | SVG/PNG | 同上。 |

## 6. 下一步验收规则

```powershell
npm --prefix .\frontend run typecheck
npm --prefix .\frontend run build
node frontend/scripts/playwright-soullink-visual-compare.mjs
```

- `similarityPercent < 95`：只汇报差异和下一步，不能说完成。
- `similarityPercent >= 95`：再进入人工验收，并继续列剩余差异。
