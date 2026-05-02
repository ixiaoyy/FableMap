---
name: image-style-prompt-extractor
description: 提取参考图片的视觉风格并反推生成可复用的中文 AI 绘画提示词模板，用于 GPT-Image、Nano Banana（Gemini）、Midjourney、Flux、Stable Diffusion 等图像生成模型。当用户上传一张图片并希望「分析风格」「反推提示词」「提取美学」「保留风格替换主体」「生成通用 prompt」「做风格模板」「让 nano banana / GPT-Image / Gemini / MJ 复刻这种风格」时，必须使用此 skill。也适用于 FableMap 素材资源生成前的默认风格抽取/归一化：生成 NPC 头像、表情、海报、活动图、插画资产、风格模板或项目缺失的新风格 recipe 时，先用本 skill 或其 15 维框架确定可复用风格 Prompt，再进入实际生图/落盘流程。默认输出「风格DNA Prompt + 可选构图骨架模块 + 主体推荐」；当用户明确要求只要一段 prompt 时，输出单段 Prompt 本体。也适用于英文请求如 "extract style from this image"、"reverse-engineer prompt"、"make this style reusable"、"style transfer prompt"。
---

# Image Style Prompt Extractor

将任意参考图或文字风格说明转化为**可复用的中文风格化提示词模板**：剥离原图的具体角色、文字、特定情节，仅保留其美学灵魂（风格 DNA、构图骨架、光影、色彩科学、材质、氛围、时代感等），让用户只需替换占位符里的主体，就能在 GPT-Image、Nano Banana（Gemini）、Midjourney、Flux 等模型上稳定复现同一种风格。

在 FableMap 项目里，生成任何素材资源前也默认使用本 skill 的 15 维框架做风格抽取、风格选择或风格补全；再结合 `.trellis/spec/frontend/image-asset-guidelines.md` 把最终图片落到项目资源路径。

当用户询问“你学到的图片生成技巧”“纯图片生成方法论”“如何写可控生图 Prompt”“把图片生成经验写入项目记忆”时，读取 `references/image-generation-principles.md`；该文件是通用图片生成记忆，不绑定 FableMap 业务。

## Prompt-first generation rule（项目硬约束）

当任务要**实际生成或替换任何素材图**时，必须先产出可复制的最终 Prompt，再用该 Prompt 调用图片生成工具；禁止跳过 Prompt 阶段直接在脑内组织描述并调用 image generation。

执行顺序固定为：

1. 用本 skill 或 `generate-character-prompt` 先生成/归一化最终 Prompt：
   - 参考图/风格抽取：先输出 Style DNA Prompt + 可选 Composition Module。
   - NPC/角色素材：先输出角色视觉 Prompt 或表情组 Prompt。
   - 批量/复杂素材：先输出 Prompt-as-Code envelope，再改写成最终生图 Prompt。
2. 在任务记录、prompt artifact、回复草稿或最终报告里保留该 Prompt；不要只把 Prompt 藏在 tool call 里。
3. 只用已经产出并可审查的 Prompt 调用图片生成工具。
4. 生成后按 `.trellis/spec/frontend/image-asset-guidelines.md` 处理落盘、引用、废稿/参考图标记与验证。
5. 图片一旦成为正式项目资产，必须在同目录写入 prompt sidecar：独立单图用 `<image-stem>.prompt.md`；同一 NPC 的一组表情图优先共用 `expression-set.prompt.md`，记录 `prompt_type`、自然/neutral 单图 Prompt、负面约束、Style DNA 来源、identity locks、各表情路径、尺寸、SHA-256 和核验时间。不要在 `## Final prompt` 里写五个表情 prompt，避免生成五表情同框。

如果用户只要求“先出图看看”，仍然必须先写出 Prompt；未落盘图片必须明确标记为 reference-only / 未采用草稿。

## Reverse prompt sidecar rule（反向解析落盘）

当项目内既有正式图片找不到原始最终 Prompt 时，用本 skill 的 15 维框架反向解析并生成可落盘 sidecar：

- `prompt_type` 必须写 `reverse-engineered`，不得伪装成 `original-final`。
- `## Final prompt` 写可复用的重绘 Prompt，但必须在 `## Provenance notes` 说明“反向解析，不是原始生成 prompt”。
- NPC 表情组必须保留统一 identity locks；`expression-set.prompt.md` 的 `## Final prompt` 只放自然/neutral 单图 prompt。需要重绘其它表情时，基于这段 prompt 单独替换 expression suffix，逐张生成，避免高清重绘时换脸、换装或换物种。
- 对证据图、contact sheet、地图快照等不应由自由生图复刻的图片，使用 `reference-only` 并说明应从源资产/脚本/manifest 重建。

## Image quality and diversity rule（项目硬约束）

Prompt-first 只保证可追踪，不保证好看。任何实际素材生成还必须先通过质量/多样性自检：

- 不要默认复用“暖木酒馆 + 青色终端光 + 居中头像/门面 + 普通 anime game concept art”的同一套视觉模板。
- 每张新图都要有明确的视觉 thesis：构图装置、材质系统、色彩策略、光影哲学、时代/媒介语境至少有一项明显区别于上一批图。
- 批量素材生成前必须有 diversity matrix 或等价说明，避免装修风格、灯光、配色、镜头、主体姿态全部雷同。
- 如果 Prompt 看不出它为什么会比上一张图更新鲜、更强、更适合用途，先重写 Prompt，不要生成。

## 角色设定

把自己当作**一名顶级的 AI 绘画提示词专家**。任务是分析用户提供的参考图，反推其视觉风格，并产出一段高度通用的中文 Prompt。这段 Prompt 必须剥离原图中的具体角色、文字内容、特定情节，**只保留美学灵魂**。

## 必须内部覆盖的两层分析

内部完成完整分析后再撰写最终 Prompt。**不要输出分析过程**，除非用户显式要求解释。

### Layer 1：风格 DNA（Style DNA）——美学恒量

无论主体如何替换，都必须保留：

1. 画面风格与流派归属：精确到可辨识的品位分支，不停留在“复古”“二次元”等大词。
2. 色调与色彩科学：主色、辅色、点缀色比例，冷暖策略、互补/类似色/限色印刷感、饱和度策略。
3. 光影特质：光源方向、硬/柔光、明暗对比、阴影形态；若是装饰性或材质自发光，也要说清楚。
4. 媒介、材质与物理质感：区分“借鉴某媒介纹理技法”与“画面就是该媒介载体”；描述纸张、油墨、颗粒、线稿、反光和触感。
5. 情绪与氛围：锁定表层与深层情绪，用“是……而非……”避免宽泛词误读。
6. 渲染参数与后期痕迹：景深、镜头感、胶片颗粒、半色调、套色偏移、扫描线、色差、噪点等。
7. 时代感与文化品位语境：不只说年代，还说明该年代里的文化圈层和品位段位。
8. 信息密度与细节梯度：哪些区域极精细，哪些区域概括、平涂或留白。
9. 动态状态与瞬时感：静止、运动或凝固瞬间，以及这种状态怎样服务情绪。
10. 符号化视觉语言：以功能类别描述视觉符号，如几何装饰、植物蔓藤、有机碎片、UI 图形、档案纸片等，不写死具体叙事物件。

### Layer 2：构图骨架（Composition Skeleton）——空间变量

构图必须用抽象空间术语表达，不写具体场景内容：

- 构图方式：中心、三分、对角线、不对称平衡、框中框、放射、垂直层叠、负空间等。
- 分镜类型与视角：特写/中景/远景、俯视/仰视/平视、广角/长焦/轴测等。
- 空间逻辑与透视关系：一点/两点/三点透视、平面化压缩、图层拼贴、轴测、错位窗口等。
- 空间角色分配：前景负责遮挡/引导，中景承载主体，背景提供色块/纹理/节奏/氛围。

## 抽象化规则

- 不保留原图具体角色、具体文字、品牌、地名、IP、名人肖像或特定叙事情节。
- 不把具体物件写死；改写成视觉功能类型，例如“小型生活痕迹道具群落”“仪式性陈列物”“抽象坐标/档案碎片”。
- 主体占位符周围只描述气质、存在感、姿态神韵；不要写外貌、服饰、具体动作。
- 严格区分媒介纹理与媒介载体：借鉴印刷网点不等于要求生成一张带标题、价格、条形码的商业海报，除非原图本身就是完整出版物/海报设计。

## 输出模式

### A. 结构化风格模板模式（默认）

当用户要求“做风格模板 / 优化图片生成模板 / 项目素材风格归一化 / FableMap 素材生成前置模板”时，输出三个部分：

```text
## 一、风格DNA Prompt（Style DNA Prompt）
<一段完整、可直接复制的中英混合绘画 Prompt。必须包含且只包含一次占位符：[在此处替换为您想要生成的主体内容 / Replace with your subject here]。这一段只写 Layer 1 风格 DNA，脱离构图模块也能单独使用。>

## 二、构图骨架模块（Composition Module）—— 可选拼接
将此模块拼接至风格DNA Prompt末尾，可还原原图的空间结构；也可根据您的创作需求自行替换为其他构图方案。
<只用构图原理术语写 Layer 2，不描述具体场景内容。>

## 三、主体内容推荐（Subject Recommendations）
- 高契合（High Affinity）：...
- 跨风格（Cross-Genre）：...
- 反差混搭（Contrast Mashup）：...
```

### B. 严格单段 Prompt 模式

当用户明确说“只输出 Prompt 本体 / 不要标题 / 给我一段可复制 prompt”时，只输出一段中文或中英混合散文式 Prompt，不加标题、不加解释、不加推荐。占位符使用：

```text
[在此处替换为您想要生成的主体内容]
```

## 工作流程

### A. 参考图反推模式

1. 如果用户**没有附上参考图**，先礼貌地请用户上传一张图片再继续。不要凭空捏造。
2. 仔细查看图片，在心里完成 Layer 1 + Layer 2 分析（不要把分析写出来）。
3. 默认按“结构化风格模板模式”输出；若用户明确要求只要单段 prompt，则按“严格单段 Prompt 模式”输出。
4. 自检：
   - 占位符是否存在且只出现一次？
   - 是否还残留任何原图特有的具体角色 / 文字 / 情节？如有，删除或泛化。
   - 替换占位符后，是否依然语句通顺？
5. 不输出分析过程，不加寒暄。

### B. FableMap 素材资源生成模式（项目默认）

当用户要生成或更新项目素材资源（NPC 头像/表情、海报、活动图、插画资产、风格模板等），但没有要求“只输出反推 Prompt”时：

1. 先用本 skill 的 Layer 1 + Layer 2 框架确定一个可复用风格 Prompt：
   - 有参考图：按 A 模式抽取风格；
   - 没有参考图但给了风格名/文本模板：优先查 `.agents/skills/generate-character-prompt/references/style-recipes.md`；
   - 项目没有该风格：补写一个完整 recipe 到 `style-recipes.md`，不要只写短关键词。
2. 再把风格 Prompt 与 FableMap 主体需求合并：真实坐标/酒馆锚点、店主主权、NPC 职责、tavern cues、IP/Logo/隐私约束。
3. 如果实际生成图片，最终 deliverable 必须进入仓库路径（如 `frontend/public/...`、`frontend/app/assets/...`、`artifacts/...`），不能只留在 `.codex/generated_images` 或聊天预览。
4. accepted/project-landed 图片必须同步写入同目录 prompt sidecar；反推补档时明确标注 `reverse-engineered`。
5. 此模式下最终答复遵守项目变更汇报格式；“严格单段 Prompt 模式”仅适用于用户明确要求只要 Prompt 本体时。

## 输出形态示意（仅作格式参考，实际内容须根据图片或用户素材重写）

结构化模式：

```text
## 一、风格DNA Prompt（Style DNA Prompt）
[在此处替换为您想要生成的主体内容 / Replace with your subject here]，以……的气质呈现；整体视觉……

## 二、构图骨架模块（Composition Module）—— 可选拼接
将此模块拼接至风格DNA Prompt末尾，可还原原图的空间结构；也可根据您的创作需求自行替换为其他构图方案。
采用……

## 三、主体内容推荐（Subject Recommendations）
- 高契合（High Affinity）：……
- 跨风格（Cross-Genre）：……
- 反差混搭（Contrast Mashup）：……
```

单段模式：

```text
[在此处替换为您想要生成的主体内容]，以……的气质呈现；整体视觉……
```

## 常见错误（请避免）

- ❌ 输出“分析过程”而不是可复制模板。
- ❌ 在要求单段 Prompt 时加"好的，以下是为您分析的结果："之类前言。
- ❌ 用列表 / 编号 / 加粗罗列分析维度——必须融合成自然的中文散文。
- ❌ 把原图里的具体角色名、台词、品牌、地标写进 Prompt——只保留风格。
- ❌ 把占位符写成"[主体]""{主体}""[YOUR SUBJECT]"等变体——必须使用当前输出模式指定的完整占位符。
- ❌ 在末尾加"祝您创作愉快""如需调整请告诉我"等寒暄——直接结束。
- ❌ 把“半调/杂志/海报质感”误写成一定要生成完整出版物、条形码、真实标题、价格标签。
