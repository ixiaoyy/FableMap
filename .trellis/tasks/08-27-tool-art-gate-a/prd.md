# Tool Art Gate A 正式工具美术验证

## Goal

先验证锄头、斧头、浇水壶和 Hotbar 物品图标的统一正式素材来源与视觉表现，替换“汉字图标 + Phaser 通用假工具”的占位方向；没有完整、同风格、许可可接受的方案前，不提前实现铁匠功能、工具规则或新经济。

## Confirmed Facts

- `ItemDefinition.hotbarMark` 当前只提供“斧/锄/水/种/萝”等文字，Hotbar 没有图片合同。
- `WorldScene.createPlayerView()` 当前用 Phaser Graphics 绘制一件通用柄+刃；砍树、锄地、播种、浇水和收获共用同一 overlay。
- 当前 `$farmer.png` 的 `attack` frame 复用 idle frame，没有正式工具动作。
- 本地 VectoRaith Farming Sim v1.08 原包包含官方 `Original/16x16/Sprites/!$farmer_plowing.png`：96×128、3467 bytes、四方向三帧锄地动作，人物与锄头已合成；当前未登记 manifest、未上传 CDN、未接入运行时。
- 本地原包的 Sprites 目录没有命名为 axe/watering/tool/item/icon 的其他人物工具文件；已采用 details sheet 也没有独立工具图标。
- 用户继续要求直接使用官方原始文件，不为现成素材裁剪、重排、合图或重编码。
- VectoRaith 官方 Farming Sim v1.08 页面与 devlog 只列出 farmer walking/plowing；没有声明 chopping、axe 或 watering 人物动作。
- 作者另售 `16x16 px RPG Farming Sim Icon Pack`（v1.00，$4，271 icons），官方明确列出 farming tools、seed bags、crops、materials 等分类；它与当前 16px 体系同作者、同分辨率，但本地尚未购买/下载。
- 用户确认当前不购买任何付费素材；`16x16 px RPG Farming Sim Icon Pack` 仅保留为研究参考，不作为 Gate A 依赖。
- 免费候选研究确认：HelloRumin `Pixel Farm Asset Pack` 可提供独立手+工具动作层；IvoryRed `GARDENS` 可提供完整 16×16 Hotbar 工具/种子图标；Cocophany `Bloomseed 1.2.0` 可单包提供工具图标和斧/锄/浇水工具层，但按其自身 64×64 人物动作模板对齐。

## Requirements

### Source study

- 先查 VectoRaith 作者官方来源与本地已购/已下载归档，不从镜像、二次打包或来源不明站点取材。
- 付费路线排除后，按项目 allowlist 优先检索 CC0、CC-BY、MIT、BSD 或 Apache-2.0 的免费原始来源；CC-BY 必须可交付署名，强 copyleft 或不明许可不进入候选。
- 对 hoe/plowing、axe/chopping、watering、Hotbar icons 分别记录：官方来源、文件名/版本、尺寸、帧布局、与当前 16×16 farmer 的兼容方式、许可/分发状态和是否已本地持有。
- 若同一 VectoRaith 体系不能覆盖全部四类，必须明确缺口；不得用名称相似但风格、视角或许可证不明的素材硬拼。

### Gate A visual scope

- 第一优先验证官方 `!$farmer_plowing.png` 原图能否在 2× NEAREST 下与当前 Farm、角色比例和 ActionTimeline 节奏协调。
- 斧头和浇水动作只有在取得同风格、许可可接受的现成原图后才进入原型；否则 Gate A 输出最小定制清单，不伪造完成。
- Hotbar 必须评审图片图标方案，至少覆盖斧头、锄头、浇水壶、萝卜种子、萝卜和木材；domain/save 继续只保存 item ID，图片 key/frame 只属于 client 表现层。
- 本阶段可以制作 ignored 本地视觉对比或静态 prototype；未经用户视觉确认，不更新生产 manifest/CDN，不替换正式运行时，不公开提交图片二进制。
- Gate A 必须提供仅 Vite development 生效的单参数无登录入口 `?toolArt=preview`，使用隔离 owner key 自动新建 Farm；生产 build、正常 URL 和正式 Keycloak 流程不得接受该旁路。

### Boundaries

- 不改变 GameSession、GameState v3、StoredGame、IndexedDB、Item ID、价格、作物成长、stable ID 或地图。
- 不实现斧头前置条件、工具耐久、体力、品质、升级、铁匠商店、第二种作物或 NPC 功能。
- 不使用 32/48px 放大素材作为 16px 底层，不重新 pack 已采用图集。

## Acceptance Criteria

- [x] 输出锄头、斧头、浇水壶和 Hotbar 图标的来源/许可/兼容矩阵，并区分“已有”“可获取”“缺失”。
- [x] 官方 `!$farmer_plowing.png` 在本地 2× NEAREST 原型中完成动作与当前 Farm 比例验证，用户确认动作方向可接受。
- [x] Hotbar 图片方案覆盖当前六类可见物品，用户确认图标视觉可接受。
- [x] 不裁剪、重排、合图或重编码官方素材，不把图片二进制加入 Git。
- [x] 不修改 domain/save/map/经济/铁匠功能；工具选择与规则转入独立 `Tool Interaction MVP`。
- [x] 修复人工验收发现的未开垦 FarmPlot 半透明土壤覆盖地图和玩家问题；未开垦实体保留点击能力但不重复绘制土壤。

## Out of Scope

- 正式 CDN 发布、manifest 登记、生产部署或在线素材分发。
- 工具规则、铁匠铺功能、工具升级、耐久、体力、音效和粒子特效。
- Town 室内、NPC 日程、好感、任务、战斗、Expedition、Tauri 或 Steam。

## Resolved Budget Decision

- Gate A 预算固定为 0；不购买 VectoRaith Farming Sim Icon Pack 或其他付费素材。若免费成熟素材无法满足同风格要求，转为最小定制：只补当前图集中无法复用的工具图标与斧头/浇水动作。

## Resolved Source Decision

- 用户允许角色动作与 Hotbar 图标采用不同免费包并按职责隔离：VectoRaith 保持世界/人物并提供官方 plowing；HelloRumin 只提供斧头/浇水透明手部动作层；GARDENS 只提供 UI 图标并按 CC-BY 4.0 署名。Bloomseed 保留为单一来源对照，不作为首选运行时候选。

## Notes

- Keep `prd.md` focused on requirements, constraints, and acceptance criteria.
- Lightweight tasks can remain PRD-only.
- For complex tasks, add `design.md` for technical design and `implement.md` for execution planning before `task.py start`.
