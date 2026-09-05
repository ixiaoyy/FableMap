# 镜像岛当前状态

最后对账：2026-09-06。仓储 child 已获单独启动，当前工作分支为 `codex/storage-shipping-v1`，基于本地 `main` / `16e7ee1`；v13 实现位于工作区，不能据此宣称已提交、合并或部署。本次未核验远端发布流水线或生产部署。

## 本轮界面与素材优化

用户要求改善现有界面与素材后，已在当前分支完成以下表现层调整：

- HUD 统一奶油色、橄榄绿和中文无衬线字体；顶部菜单对齐，今日目标可展开，底部快捷栏保留 12 格和滚动操作，短横屏移至左下方。
- 背包采用页签、清晰格名和真实物品详情图；制作展示配方、缺料数量和产物预览。小窗口保留固定标题与独立滚动内容。
- Phaser 画布改为容器 `RESIZE`，常规镜头保持 2×；室内与建筑预览在 resize 时重排。世界中文标签为 9px / resolution 2。
- 普通箱修正为已登记 Buildings 图集的完整木箱帧；道具和掉落采用明确原始尺寸，移除箱体拉伸闪动。没有新增依赖或素材二进制，没有变更领域规则、存档结构或 v13 兼容范围。

自动检查：`typecheck`、客户端类型复核、`build:client` 和 diff 格式检查通过；构建仍保留既有单包体积提示。17 张本地 PNG 与 manifest SHA-256 一致，Buildings 的线上响应为 200 / image/png / 16502 字节 / 一年 immutable 缓存，Git 跟踪图片二进制仍为零。

浏览器已查看 1280×720 桌面、390×844 手机尺寸、844×390 横屏及 640×360 紧凑尺寸；核对背包/制作页签、选中详情、方向键/回车、拿在手上、刷新后继续现有 v13 农场、触屏方向按钮和进入小屋后的 resize。前后截图保存在本机忽略的 `artifacts/visual-polish-2026-09-06/`。尺寸模拟不等同于真机触摸或实际浏览器 200% 缩放验收；建筑预览完整操作、长时间玩法与最终美术观感仍待真人反馈。

本轮生产改动已暂存，文档和截图未自动暂存；尚未 commit、push 或部署。

## 读取优先级

1. 用户最新明确决定。
2. 本文件的当前实现、提交与验收事实。
3. [PRODUCT_BRIEF](PRODUCT_BRIEF.md)、[WHAT_NOT_TO_BUILD](WHAT_NOT_TO_BUILD.md)、[开发计划](DEVELOPMENT_PLAN.md)与 [TOWN_ROADMAP](TOWN_ROADMAP.md)。
4. 当前未归档 Trellis 任务及其 PRD；精确机制由对应 child 拥有。
5. `.trellis/spec/` 当前合同；旧版本场景只解释历史实现。
6. Checkpoint、workspace journal 和原始对话只作历史证据。

## 当前产品和代码基线

- 唯一应用为 `apps/mirror-island/`，公开入口 `/`；目标是星露谷式单人 Web 像素生活游戏。
- Phaser `4.2.1` + Vue 3 + TypeScript + Vite + Tiled；规则由本地 GameSession 处理，保存到 IndexedDB。
- 公开试玩无账号、无云存档、无实时后端依赖；同一 origin / 浏览器 profile 只有一个本地农场。
- 当前 `GameState` 与 `StoredGame` 均为 **v13**。开发期只保证 current schema 的严格校验、保存与同版本恢复，不维护旧开发档迁移。
- 地表采矿、镰刀和两批美术精修已经提交并合入本地 main；旧文档的“尚未 commit / 生产代码暂存待提交”已失效。

## 已实现与尚未闭环

| 范围 | 当前代码事实 | 证据入口 |
|---|---|---|
| 世界 | Farm / Town / Cottage / Seed Shop / Blacksmith、五栋民宅、Foothills / Lakeshore，共 12 个区域 | `client/src/game/world/world-catalog.ts`、`public/map/` |
| 日常 | 06:00–次日 02:00、午夜提醒、体力 / 食用 / 睡眠、晴雨风、预报和日结候选保存 | `domain/session/GameSession.ts`、`domain/session/day-settlement.ts` |
| 农场资源 | 六种春作、自由耕地、水壶补水、采集 / 树桩 / 再生、地表石块 / 杂草和五件开局工具 | `domain/farming/`、`domain/gathering/`、`domain/mining/`、`domain/state/game-state.ts` |
| 生活关系 | 基础钓鱼、八名 NPC 日程 / 对话 / 好感 / 送礼、每日委托、家园猫狗 | `domain/fishing/`、`domain/social/`、`domain/world/npc-schedules.ts`、`domain/requests/`、`domain/pets/` |
| 经济与成长 | 即时商店买卖、水壶 Lv2、独立背包升级陈列、Day 1–7 目标 | `domain/shop/`、`domain/progression/`、`domain/retention/` |
| 背包 / 制作 | 12/24/36 格背包、12 格活动行、999 普通堆叠、槽位转移与整理；暂停式制作入口、1/5/25 批量与普通箱配方 | `domain/inventory/InventorySystem.ts`、`domain/recipes/definitions.ts`、`client/src/ui/inventory/`、`client/src/ui/crafting/` |
| 仓储 / 出货 | 36 槽/21 色普通箱、回收与玩家/NPC 推动、持久掉落；共享出货队列、最后一笔撤回、分类隔夜报告与确认恢复 | `domain/storage/`、`domain/world/`、`domain/shipping/`、`client/src/ui/storage/`、`client/src/ui/shipping/` |
| 摆放 / 木匠 | 12 图 Placeable、Farm Buildable、统一占用与资源恢复避让、domain 宠物位置；墨子真实柜台服务与出货箱建造/移动/拆除 | `domain/world/WorldOccupancySystem.ts`、`domain/pets/`、`domain/building/`、`public/map/` |
| 季节 / 矿洞 | 日历纯函数存在四季计算，`playableCalendarAt()` 仍使用 spring-content；无矿洞、技能经验或战斗系统 | `domain/calendar/game-calendar.ts`、`domain/mining/MiningSystem.ts` |
| 表现 / 入口 | 九种角色预设、桌面 / 触摸入口、声音、东方田园首页、小屋与两处商店精修 | `client/src/App.vue`、`client/src/game/presentation/`、`client/src/ui/`、`client/src/audio/` |

表中代码路径相对于 `apps/mirror-island/`。v13 的领域规则和客户端入口已接入工作区，浏览器、真人玩法与 IndexedDB 完整恢复路线仍待验收；代码存在不等于闭环已通过。真实四季、技能、矿洞、自动化、家畜、加工、烹饪与小镇共建仍未实现。

## 提交、验收和部署分别记录

| 批次 | 本地 Git 状态 | 验收证据 / 待办 |
|---|---|---|
| 春季 v10 | 后续提交已包含该基线 | 仓库记录用户于 2026-09-03 确认完整真人验收；属于历史结果，本次未重测 |
| 小屋 / 图标 / 种田动作 | `fd5457e` 已进入本地 main | 任务记录类型 / 构建 / 相关检查通过；真人美术与手感待反馈 |
| 种子店 / 铁匠铺 | 同属 `fd5457e` 的美术提交 | 任务记录交易 / 查看 / 往返和店门黑屏窄修验证；真人观感待反馈 |
| 地表采矿 / 镰刀 v12 | `15a7b61` 已进入本地 main | 任务记录自动检查和 Farm 手机视口路线通过；完整三图、真实触摸与再生节奏真人反馈待补 |
| 后续整合 / 首页 | `c914a65`、`16e7ee1` 为本地 main 合并记录 | 合并记录不代表本次已查证部署或首页真人验收 |
| 仓储 / 出货 / 摆放 v13 | `codex/storage-shipping-v1` 工作区实现，生产变更按最小验证暂存 | 当前 child 为 in_progress；最终静态检查证据见实施清单，完整浏览器/真人路线待验收；尚未宣称提交、合并或部署 |

历史生产验收记录为 `7b33bd5b` / Deploy Mirror Island run `33473240482`；这里只保留追溯线索，不宣称它是当前线上版本。春季 v10 的旧迁移链与双账号 checkpoint 属于当时条件，不能覆盖当前 v13 / 无账号 / 不迁移开发档合同。

已有 Farm Showcase、World Foundation、Life Loop v1、Town Gate A/B/C 与 Town Population MVP 的历史验收保留。仓库记录 2026-09-01 精细化门禁与 Day 1–7 真人通过；后续缺陷按复现路径窄修，不重开冻结构图。

## 当前任务队列

- **当前唯一实施项**：`09-04-storage-shipping-placement-v1` 已按用户最新决定单独启动，状态为 `in_progress`，在 `codex/storage-shipping-v1` 接入 v13；当前推进最终验证与完整路线验收。
- **已有验收尾项**：`09-04-surface-mining-v1` 保持 `in_progress`，代码已提交，只剩记录中未完成的真人验收 / 归档；两批美术任务同样保持验收待反馈。仓储启动不代表这些验收已通过。
- **下一阶段规划**：`09-04-skills-recipe-unlocks-v1`；待当前 child 收尾后按已确认依赖顺序推进，不随本次启动批量实施。
- **总路线**：`09-04-pre-pivot-life-sim-foundation` 为规划父任务，十个 child 顺序见[开发计划](DEVELOPMENT_PLAN.md)。父任务不承载生产实现，也不授权批量启动。
- **最终集成**：`09-04-town-community-ledger-v1` 是第十个 child，当前无共建玩法代码。
- **历史 / 独立尾项**：春季 v10 任务为 `completed`；宠物任务按已有验收记录收尾；`08-21-forum-sso-compose-network` 只保留独立论坛登录人工验收。
- **被否决**：两个 `09-01` 镜门 / 远征任务带 `meta.rejected=true`，即使历史状态字段为 `planning`，也不是可执行候选。本次保留原目录与引用。

`task.py current --source` 返回当前任务 `.trellis/tasks/09-04-storage-shipping-placement-v1`，来源为本 Codex session；父任务继续只管理规划。

## 本次验证与实施边界

- 已检查代码入口、任务文档、Git 历史与本轮实现；未代签真人验收。v13 的检查和缺口以[实施清单](../.trellis/tasks/09-04-storage-shipping-placement-v1/implement.md)本轮记录为准。
- 本轮 `typecheck`（本地 Prisma codegen 与 client/server TypeScript）及 `build:client` 均 exit 0，工作区/暂存区 `git diff --check` 通过；package/lockfile 未变化，Git 跟踪媒体二进制为零。Prisma codegen 不连接数据库。
- 本轮浏览器已走通空 profile 新建、12 槽背包、锄头由第 1 槽移至第 6 槽保存、刷新继续保持槽位，并检查制作缺料与 1/5/25 数量入口；桌面 1280×720 与手机 390×844 截图无横向溢出。完整建造/出货/NPC 推箱、200% zoom、真实触摸与真人路线尚未完成。
- 早期规划盘点曾因依赖缺失而无法执行 TypeScript 检查；本轮已恢复现有 lockfile 对应依赖，`prisma`、`tsx` 和 `vue-tsc` 命令可用。该早期失败不再作为当前阻塞，也不替代最终集成检查结果。
- 本轮新增范围限于已批准 child 的本地 domain、client 与地图合同；没有引入新数据库结构、依赖包或媒体对象，不连接数据库，不提交 / 推送 / 部署。
- 继续保持纯本地路线、单一 GameSession / current save；普通 120 层矿洞与战斗属于已选基础盘，镜门远征 / Cargo / 撤离 / 抓宠 / 肉鸽 / 塔防已否决。
- 新阶段默认只做相关类型 / 构建与必要静态检查，业务 / 存档 / 视觉正确性依靠真实路线反馈，不建立大规模测试矩阵。
