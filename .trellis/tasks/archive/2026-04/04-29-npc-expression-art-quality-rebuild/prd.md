# PRD: NPC Expression Art Quality Rebuild

## 背景

公益空间 NPC 表情资源中存在大量“同一张底图换色 + 贴奇怪图标”的假表情：放大镜、红叉、粉色贴片、菱形亮点等 UI 符号覆盖在角色图上。它们虽然满足了旧测试的“PNG 存在且 hash 不同”，但不满足 FableMap NPC 美术规范：NPC art 必须是真实 tavern-themed character art，表情变化应由人物面部/姿态表达，而不是滤镜或符号占位。

## 目标

1. 标记当前不合格 public-welfare NPC 表情资源，保留 hash / 路径 / 原因，防止同一批素材再次通过验收。
2. 清理最明显的 tint/icon-only 与 flat placeholder 资源。
3. 重新生成项目内可运行的 256×256 PNG：`neutral / joy / anger / embarrassment / curiosity`。
4. 补充回归测试：旧的坏 hash 不能继续作为运行时资源；表情图不能只是同底图换色/贴图标。

## 范围

- 目标目录：`frontend/public/assets/npcs/public-welfare/<char_id>/<expression>.png`
- 第一批强制修复：用户截图对应的 `char_pw_aheng`，以及 10 个明显 flat placeholder 角色：`char_pw_dengxin`, `char_pw_huoyan`, `char_pw_luming`, `char_pw_qiaoqiao`, `char_pw_qiaoshou`, `char_pw_shiyi`, `char_pw_suoyin`, `char_pw_tongling`, `char_pw_xingdai`, `char_pw_yeyu`。
- 其余 overlay/tint-only 表情先标记为 rejected，后续可继续批量重生成。

## 非目标

- 不改 Tavern / TavernCharacter schema。
- 不改角色文字设定。
- 不用图标、滤镜或颜色覆盖伪装表情。
- 不把生成源留在 `.codex/generated_images` 里当作交付物；最终资源必须落到项目目录。

## 验收标准

- 每个已修复角色有 5 个项目内 PNG，尺寸为 256×256。
- 表情变化来自真实面部/姿态：开心、皱眉、生气/严肃、害羞、好奇；不得出现 UI 图标、红叉、放大镜、贴纸腮红等符号覆盖。
- 测试记录并拒绝本轮标记的旧坏图 hash。
- `tests/test_default_public_welfare_taverns.py` 通过。
- 如前端会加载这些资源，运行 `npm --prefix .\frontend run build`。

## 验证计划

- `py -3 -m pytest -q tests/test_default_public_welfare_taverns.py --tb=short`
- `py -3 -m compileall -q backend/src`
- `npm --prefix .\frontend run build`
- 生成 contact sheet 供人工查看。

## 2026-04-29 视觉验收返工追加

### 触发原因

视觉验收指出：角色头像与 UI 布局基本达标，但“环境沉浸感”严重缺失。`docs/IMAGE_ASSETS_SPEC.md` 明确要求的地点氛围图与势力徽章未落盘，`TavernInterior.jsx` 仍以 CSS 渐变作为主视觉替代真实氛围图。该问题纳入本 P1 视觉资源修复任务一起收尾。

### 新增目标

1. 生成并落盘 10 张地点氛围图到 `frontend/public/place-atmosphere/`：
   - `atmosphere-healing.png`
   - `atmosphere-supply.png`
   - `atmosphere-judgement.png`
   - `atmosphere-ember.png`
   - `atmosphere-lore.png`
   - `atmosphere-grove.png`
   - `atmosphere-spirit.png`
   - `atmosphere-shrine.png`
   - `atmosphere-market.png`
   - `atmosphere-transit.png`
2. 每张地点氛围图必须符合 `docs/IMAGE_ASSETS_SPEC.md`：512×288、PNG、Fantasy 水彩/数字绘、半鸟瞰或略抬高视角、真实地点场景叠加幻想元素。
3. 修改 `frontend/app/product/TavernInterior.jsx`，让空间内部主视觉优先使用上述项目内图片资源；CSS 渐变只可作为图片加载失败或未知类型的 fallback，不可作为验收替代品。
4. 补齐低优先级但已被验收点名的势力徽章资源到 `frontend/public/faction-emblems/`：
   - `emblem-trade.svg`
   - `emblem-order.svg`
   - `emblem-clinic.svg`
   - `emblem-memory.svg`
   - `emblem-night.svg`
5. 继续完成原 NPC 表情修复任务：坏 hash 标记、强制角色 5 表情重生成、contact sheet 与回归测试。

### 新增范围

- `frontend/public/place-atmosphere/`
- `frontend/public/faction-emblems/`
- `frontend/app/product/TavernInterior.jsx`
- 必要时补充前端资源映射/样式文件，但不得改 Tavern / TavernCharacter schema。

### 新增非目标

- 不新增地点、势力、Tavern 或 TavernCharacter schema 字段。
- 不把 CSS 渐变、emoji、抽象色块当成地点氛围图交付。
- 不把 `.codex/generated_images`、临时目录或聊天预览中的图片当作完成品。
- 不为了接入图片重构 TavernInterior 的聊天、记忆、角色或权限逻辑。

### 新增验收标准

- `frontend/public/place-atmosphere/` 存在且包含 10 张规范命名图片。
- 10 张地点氛围图尺寸均为 512×288，格式为 PNG，文件 hash/mtime 可证明已落盘到项目目录。
- `TavernInterior.jsx` 运行时可根据 tavern/place 的类型选择对应 `/place-atmosphere/atmosphere-*.png`；未知类型降级到安全 fallback。
- `frontend/public/faction-emblems/` 存在且包含 5 个规范命名 SVG。
- 完成前审计本轮 AI 生成图片来源，明确源文件到项目路径的映射；未采用图片需标记为废稿/参考。

### 新增验证计划

- 检查地点氛围图目录、文件名、尺寸、格式、hash。
- 检查势力徽章目录、文件名、SVG 可读性。
- `npm --prefix .\frontend run build`
- 原 NPC 表情任务验证仍需执行：
  - `py -3 -m pytest -q tests/test_default_public_welfare_taverns.py --tb=short`
  - `py -3 -m compileall -q backend/src`

