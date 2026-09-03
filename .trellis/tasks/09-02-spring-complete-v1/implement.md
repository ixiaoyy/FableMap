# 春季基础玩法 v1：实施计划

状态：in_progress。用户于 2026-09-02 批准实施；2026-09-03 恢复并完成代码及相关自动检查，随后要求提交推送 main。真人验收待完成，发布结果以流水线为准；详见 verification.md。

## 0. 实施前门禁

- [x] 核对当前完整 git diff，保留工作区已有 57 项未提交改动，不撤销或覆盖他人文件。
- [x] 将用户最新决定同步到 docs/PRODUCT_BRIEF.md、docs/WHAT_NOT_TO_BUILD.md、docs/TOWN_ROADMAP.md、docs/CURRENT_STATE.md 与 frontend spec；历史 checkpoint 不修改。
- [x] 核对现有 VectoRaith、IvoryRed 与音频清单能否覆盖六作物、鱼、树桩、枯枝、天气和鱼竿表现；缺失项先提交官方来源/许可/固定版本/字节方案评审，不直接加入二进制。
- [x] 冻结 StoredGame/GameState v10 字段与唯一 v9 migration；同一版本后续步骤不得继续 bump schema。

## 1. v10 状态与迁移骨架

- [x] 在 game-state.ts 与 SaveRepository.ts 增加 v10、显式 v9 migration、worldSeed、时钟范围、体力、水壶水量、天气、动态农田、资源阶段和送礼计数。
- [x] 将旧 8 个 plot ID 按发布坐标迁移为 farm:column:row；加入当前 farm.tmj 坐标断言。
- [x] 迁移 v9 resource available 为 standing/stump，并移除无表现的 day-7-mirror-teaser。
- [x] 在 IndexedDbSaveRepository.ts 增加一次性 v9 原始备份和失败不覆盖规则；备份不参与继续游戏枚举。
- [x] 更新 clone/decode/reconcile，使未知、损坏和未来状态明确失败。

回滚点：在任何玩法接入前，用隔离内存/fixture 证明 v9→v10 输出稳定；失败则只撤销本任务新增迁移代码和任务生成的测试改动。

## 2. 06:00–02:00 与基础体力

- [x] 扩展 game-time.ts 到 1560，完成午夜后显示、night schedule 和 24:00 crossing 检测。
- [x] 新增 StaminaSystem 与固定成本/恢复定义；成功生产动作才扣体力，食用与睡眠恢复原子处理。
- [x] 抽出 GameSession 唯一 settleDay，供床铺睡觉和 02:00 昏倒共用；加入 settlement lock、Gold 处罚和次日体力表。
- [x] 让 tick 返回统一 ActionFeedback；客户端消费 24:00 提醒与 02:00 昏倒，不在 Vue/Phaser计算处罚。
- [x] 扩展 LifeHud、game-store 与醒来反馈，覆盖 24:00–02:00、体力不足和晚睡恢复。

回滚点：主动睡觉、01:50 睡觉、02:00 昏倒和刷新恢复均只推进一天后，再进入地图/农作重构。

## 3. Tiled 世界能力与自由农田

- [x] 在 farm.tmj 增加隐藏 Tillable mask，在 farm/lakeshore 等地图确认补水边界，在 lakeshore.tmj 增加 FishingZones。
- [x] 扩展 RegionDefinition、tiled-region-decoder.ts 与 WorldCatalog，校验 mask 尺寸、tile 坐标、合法区域和水源/钓鱼点。
- [x] 新增按面向解析相邻瓦片的 typed command；domain 二次验证 region、距离、mask、占用和坐标范围。
- [x] 将 FarmingSystem 从 interaction entity ID 改为 sparse coordinate key；保留旧状态迁移，不把整张 Farm 网格写入 save。
- [x] 调整 WorldEntities/WorldScene，从 snapshot 动态创建、更新和移除土壤/作物表现。
- [x] 为水壶加入容量、补水与 Lv1/Lv2 实际生效格结算。

回滚点：新游戏与迁移存档都能在原 8 格位置操作，并能在新增可耕区域创建/恢复农田；非法地图坐标不产生状态。

## 4. 天气、资源与六种作物

- [x] 新增 WeatherSystem、closed definitions 和 worldSeed/day 稳定选择；保存 today/next 并接入日结。
- [x] 接入雨天自动浇水、风天枯枝/鱼池与天气 NPC schedule override。
- [x] 把树扩展为 standing→stump→cleared；Farm 外清桩后写入固定再生日，Farm 树保持 cleared。
- [x] 在 Tiled 增加固定枯枝候选点，复用 ForageSystem 的 day + stable ID 确定性选择和领取记录。
- [x] 扩展 item/crop/shop 定义，加入青豌豆、春土豆、油菜花及种子；实现再生与多产，不使用 Math.random。
- [x] 增加少量可食用作物/采集物和 consume command；本步骤不引入品质、肥料、烹饪或 Buff。
- [x] 接入天气粒子、天气图标、环境声和水壶水量表现；所有 URL 必须来自已登记媒体。

回滚点：晴/雨/风、树再生、枯枝、六作物与刷新结果确定后再进入钓鱼。

## 5. Lakeshore 钓鱼

- [x] 定义至少六类原创春季鱼的地点/时段/天气/距离/难度/售价与体力成本，不复制参考游戏名称或数值表。
- [x] 新增 FishingSystem runtime 和 start/hold/release/cancel commands；域内维护 casting/waiting/reeling/result 与鱼获保存状态。
- [x] 开始合法抛竿即扣体力并保存；离区/刷新取消当前 run，成功才向 Inventory 原子加入鱼。
- [x] 新增 FishingPanel 和 WorldScene 浮漂表现，统一支持鼠标、键盘和单指触摸；断线、脱钩、超时和背包满均有明确结果。
- [x] 将 Day 7 TodayHint 与祥子/旧码头说明改为普通钓鱼引导。

回滚点：桌面和触摸各完成一次成功、断线、脱钩、背包满与刷新取消，不影响永久背包之外的状态。

## 6. 日常送礼、营业日程与镜门清退

- [x] 新增 GiftSystem、三档偏好 catalog 和 per-NPC gift counters；实现无全镇总限制、每人每天一份/每周两份。
- [x] 当前手持可送物点击 NPC 进入确认；工具/空手继续原交谈或商店路径，超限/无效不吞物品。
- [x] 将工作/休息日与天气 override 合并到现有 schedule resolver；ShopSystem 继续只消费 active NPC projection。
- [x] 删除 MirrorTeaserView、镜门 dialogue、day-7 milestone、TodayHint 文案和当前 spec 声明；Lakeshore waystone 固定普通说明。
- [x] 保留历史 checkpoint 与存档兼容证据，不删除归档任务或伪改历史验收。

回滚点：八名 NPC 的交谈、委托交付、商店、好感和移动保持可用，送礼与营业规则只由 domain owner 决定。

## 7. 文档、验证与暂存

- [x] 对照最终代码收敛 PRD/design/implement 与 frontend spec，记录实际数值、媒体来源和被拒绝的扩展项。
- [x] 只更新现有窄合同测试或增加一个聚焦 v10 的合同文件；不建设大规模单元、集成或 E2E 矩阵。
- [x] 运行最小相关自动检查：
  - npm --prefix ./apps/mirror-island run test:life-loop
  - npm --prefix ./apps/mirror-island run test:town-population
  - npm --prefix ./apps/mirror-island run typecheck
  - npm --prefix ./apps/mirror-island run build:client
- [x] 不运行 prisma:validate、build:server、数据库、Keycloak 或 Docker 检查，除非实现意外触及这些边界；正常计划不得触及。
- [ ] 人工验证新游戏、真实 v9 形状迁移、Day 1–7、24:00/02:00、三天气、自由农田、六作物、树再生、钓鱼、送礼、Day 28→29、刷新恢复、手机、键盘和 200% zoom。
- [x] 核对 Git 跟踪新增游戏图片/音频二进制为零；本批没有发布新媒体，复用登记图集帧与代码绘制/合成。
- [x] 生产代码、配置和 TMJ 通过最小验证后立即 git add；测试、文档、截图、研究和诊断产物不自动暂存。
- [x] 最终对账从任务实施基线到工作区的完整变更范围与保存调用链，确认唯一 v10 save migration、数据库 migration 未变、镜门仅剩旧存档清理分支。

## 发布门禁

- v10 所有步骤作为一个发布单元，不允许把只有 schema、只有天气或只有动态农田的中间提交部署到公开入口。
- 用户完成真人路线并明确确认前，任务保持 in_progress；发现 P0/P1 时只做证据驱动窄修。
- v10 已写入生产浏览器后不回滚到不识别 v10 的旧客户端；使用 forward-fix，必要时从保留的 v9 原始备份人工恢复。
