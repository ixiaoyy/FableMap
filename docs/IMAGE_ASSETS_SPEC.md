# FableMap 图片资源规范 v1.2

## 概述

本文档定义 FableMap 项目所需的 AI 生成图片资源的规格、存放位置和命名规范。

---

## AI 生成图片落盘总规则

- 任何用于代码、默认 seed、文档验收或前端展示的 AI 生成图片，必须复制/转换到本仓库内的规范路径后才算完成。
- `.codex/generated_images`、系统临时目录、浏览器下载目录和聊天预览只算生成来源，不算项目资源目录。
- 替换既有图片时，必须覆盖实际被代码/文档引用的项目文件；如果只是生成了新图但引用路径仍指向旧图，视为未替换。
- 允许保留废稿或参考图，但必须放入 `artifacts/` / 设计参考目录，或在交付说明里明确标记为“未采用/参考-only”。
- 图片类任务完成前，要核对本轮 `.codex/generated_images` 输出与项目目标路径的对应关系；必要时用 hash、尺寸、修改时间或源→目标映射证明已落盘。

---

## 图片分类

### 1. 角色头像（Character Portraits）

**用途**：在 TavernNpcStage / 角色展示区 / 未来聊天头部中展示当前对话角色的形象

**优先级**：🔴 高 — 直接提升聊天体验代入感

#### 规格

| 属性 | 值 |
|------|-----|
| 尺寸 | 256×256 px |
| 格式 | PNG |
| 风格 | 原创 anime / game-style tavern NPC portrait，半身或腰部以上 |
| 背景 | 酒馆内景，不是透明背景，不是纯色占位 |

#### 角色原型清单

每个原型需要生成 2 张变体（共 12 张）：

| 原型 | 命名 | 描述 Prompt | 变体 A 描述 | 变体 B 描述 |
|------|------|------------|------------|------------|
| merchant（商人） | `merchant-a.png` / `merchant-b.png` | 狡黠的中年商人，戴着羽毛帽，披着毛皮披风，手里拿着天平或钱袋，表情机敏 | 微笑正面 | 皱眉侧面 |
| guardian（守卫） | `guardian-a.png` / `guardian-b.png` | 身披重甲的魁梧守卫，手持长剑或长戟，姿态威严 | 站立正视 | 持剑侧身 |
| healer（疗愈者） | `healer-a.png` / `healer-b.png` | 身着白袍的疗愈师，戴着兜帽，手持发光的草药或法杖，周身有柔和光晕 | 低眉垂目 | 张开双臂 |
| scholar（学者） | `scholar-a.png` / `scholar-b.png` | 戴着圆框眼镜的资深学者/书记员，披着深色斗篷，手持古籍或羽毛笔 | 沉思凝视 | 执笔书写 |
| wanderer（流浪者） | `wanderer-a.png` / `wanderer-b.png` | 神秘的流浪者，披着旧斗篷，背着行囊或旅包，像刚走进酒馆歇脚的长途旅人 | 阴影角落 | 半侧蒙面 |
| spirit（精灵） | `spirit-a.png` / `spirit-b.png` | 人形酒馆灵体 / 精灵招待员，半透明发光，仍明确处于酒馆内部 | 举杯微笑 | 聚集能量 |

#### 存放位置

```
frontend/app/assets/npc-style-cast/portraits/
├── merchant-a.png
├── merchant-b.png
├── guardian-a.png
├── guardian-b.png
├── healer-a.png
├── healer-b.png
├── scholar-a.png
├── scholar-b.png
├── wanderer-a.png
├── wanderer-b.png
├── spirit-a.png
└── spirit-b.png
```

#### 默认公益 NPC 专属素材

`AI 草稿` 示例角色「眯眯喵桑」属于已批准默认 demo seed，专属头像 / 表情素材作为公开 URL 按角色目录存放在：

```
frontend/public/assets/npcs/public-welfare/char_pw_mimi_nya/
├── neutral.png
├── joy.png
├── anger.png
├── embarrassment.png
└── curiosity.png
```

这些文件由 `backend/src/fablemap_api/core/default_taverns.py` 的默认角色 `avatar` / `sprites` 引用；它们不是通用 fallback，也不会被写回其他店主角色。

#### 加载逻辑

- canonical runtime 路径：`frontend/app/assets/npc-style-cast/portraits/`
- runtime copy 为优化后的 `256×256` PNG，供 `TavernNpcStage` 直接静态导入
- `TavernNpcStage` 在无 owner 图像时，根据角色文本 / tags / appearance preset / style 偏好解析 archetype
- 变体使用稳定哈希选择（避免每次渲染随机跳变）
- 优先级保持：`sprites.neutral` → `avatar` → `image_url` → project fallback portrait

---

### 2. 地点氛围图（Place Atmosphere）

**用途**：进入地点时显示的背景氛围图

**优先级**：🟡 中 — 提升地点进入的沉浸感

#### 规格

| 属性 | 值 |
|------|-----|
| 尺寸 | 512×288 px（16:9）|
| 格式 | WebP（优先）/ PNG |
| 风格 | Fantasy 风格的水彩或数字绘画，半鸟瞰视角，带有神秘氛围 |
| 内容 | 模糊的真实地点场景 + 幻想元素叠加 |

#### 地点氛围清单

按地点类型生成：

| fantasy_type | 命名 | 描述 Prompt |
|-------------|------|-----------|
| healing_sanctum | `atmosphere-healing.png` | A mystical healing sanctuary bathed in soft golden light, arcane symbols on the walls, warm and inviting atmosphere, fantasy watercolor style |
| supply_outpost | `atmosphere-supply.png` | A bustling supply outpost at dusk, lanterns glowing, crates stacked, merchant stalls, warm amber tones, cozy yet active atmosphere |
| judgement_tower | `atmosphere-judgement.png` | An imposing stone tower under stormy skies, ominous atmosphere, dramatic lighting, imposing columns, fantasy dark style |
| ember_parlor | `atmosphere-ember.png` | A warm cozy tavern interior, firelight dancing, wooden interior, steam rising from cups, inviting red and orange tones |
| lore_academy | `atmosphere-lore.png` | An ancient academy hall with towering bookshelves, floating candles, mystical inscriptions, scholarly and serene atmosphere |
| whispering_grove | `atmosphere-grove.png` | An enchanted forest grove at twilight, bioluminescent plants, ancient trees, magical particles floating, ethereal green and purple tones |
| spirit_anchor | `atmosphere-spirit.png` | A glowing spiritual nexus, energy swirling around ancient stones, blue and white ethereal light, mysterious and calming |
| forgotten_shrine | `atmosphere-shrine.png` | An overgrown abandoned shrine, nature reclaiming ancient stones, moss and vines, melancholic yet beautiful, muted green tones |
| market_hall | `atmosphere-market.png` | A grand indoor market hall, colorful stalls, bustling crowds, warm lighting, vibrant and lively atmosphere |
| transit_node | `atmosphere-transit.png` | A mysterious transit hub, glowing pathways, floating platforms, futuristic yet ancient, blue and silver tones |

#### 存放位置

```
frontend/public/place-atmosphere/
├── atmosphere-healing.png
├── atmosphere-supply.png
├── atmosphere-judgement.png
├── atmosphere-ember.png
├── atmosphere-lore.png
├── atmosphere-grove.png
├── atmosphere-spirit.png
├── atmosphere-shrine.png
├── atmosphere-market.png
└── atmosphere-transit.png
```

---

### 3. 势力徽章（Faction Emblems）

**用途**：势力关联展示时的徽章图标

**优先级**：🟢 低 — 可用 emoji 或 SVG 代替

#### 规格

| 属性 | 值 |
|------|-----|
| 尺寸 | 64×64 px |
| 格式 | SVG（优先）或 PNG |

#### 势力清单

| faction_id | 命名 | 描述 |
|-----------|------|------|
| trade_guild | `emblem-trade.svg` | 天平 + 麦穗，金色 |
| order_bureau | `emblem-order.svg` | 齿轮 + 羽毛笔，银色 |
| clinic_circle | `emblem-clinic.svg` | 十字 + 藤蔓，绿色 |
| memory_collective | `emblem-memory.svg` | 书本 + 烛火，蓝色 |
| night_bloom | `emblem-night.svg` | 月亮 + 花瓣，深紫色 |

#### 存放位置

```
frontend/public/faction-emblems/
├── emblem-trade.svg
├── emblem-order.svg
├── emblem-clinic.svg
├── emblem-memory.svg
└── emblem-night.svg
```

---

## 图片生成提示词模板

### 角色头像通用模板

```
A finished original anime / game-style tavern NPC portrait of [character description],
clean lineart with soft cel shading, [lighting: warm / neon / dramatic tavern light],
waist-up or bust framing, visible tavern interior background with at least two cues
(bar counter, mugs, shelves, lanterns, menu board, bottles, map-table, terminal glow),
no transparent background, no logo, no watermark, no existing IP,
[intentional imperfections, hand-crafted feel]
```

### 地点氛围图通用模板

```
[scene description], fantasy watercolor or digital painting style,
[viewing angle: slightly elevated bird's-eye / eye-level],
[lighting: golden-hour / moonlight / firelight / mystical glow],
[composition: centered / rule of thirds],
[atmosphere keywords],
[dramatic sky / atmospheric fog / magical particles]
```

---

## 实现检查清单

### 角色头像
- [ ] 生成 12 张角色头像 PNG（256×256）
- [ ] 存入 `frontend/app/assets/npc-style-cast/portraits/`
- [ ] 验证文件名和命名规范
- [ ] `TavernNpcStage` 在无 owner 图像时加载并显示头像

### 地点氛围图
- [ ] 生成 10 张地点氛围图（512×288）
- [ ] 存入 `frontend/public/place-atmosphere/`
- [ ] 验证文件名和命名规范
- [ ] 前端在进入地点时显示氛围图

### 势力徽章
- [ ] 可选：SVG 势力徽章
- [ ] 或使用 emoji 替代（简单方案）
