# 农场仓储与出货 v1：实施清单

## 0. Start gate

- [x] 前置地表资源已在 `15a7b61` 独立提交并进入本地 main（2026-09-06 对账），不重复提交。
- [ ] `09-04-surface-mining-v1` 完整真人确认与归档。
- [x] 按 lockfile 执行 `npm ci` 恢复依赖，lockfile 不变；缺少 Prisma 可执行文件的问题已解除，正式类型检查与构建已通过。
- [x] 推箱/占用参考固定为 `5225ef409e42a6159a82cf81200bf6eb315c9961`，核实实际程序集为 1.6.8.24119；保留对 1.6.15 的推断标记。
- [x] 用户完成 PRD 最终评审；手柄已确认不进入本 child，并确认 `design.md` 与本清单。
- [x] 配置真实 `implement.jsonl` / `check.jsonl`，执行 `task.py start`，当前分支 `codex/storage-shipping-v1`，状态 `in_progress`。
- [x] 已读取仓库 AGENTS 与当前 frontend spec，并核对初始工作区和暂存区。本会话未提供独立 `trellis-before-dev` / `trellis-check` 技能，使用相同权威文件合同完成检查，不记录虚构的技能执行结果。

用户于 2026-09-06 确认继续实施本 child；前置真人确认仍保留待验收，不因本任务启动而自动通过。

## 1. Current state and inventory foundation

- [x] 提升唯一 GameState/StoredGame current version 至 v13；不增加旧开发存档迁移，IndexedDB database version 保持不变。已完成内存 current round-trip；浏览器恢复仍待验收。
- [x] 把 inventory/hotbar 改为 12/24/36，补 12 槽行轮换、槽位转移/拆分/合并、item-owned 稳定整理与两档顺序升级。
- [x] 把工具/普通物品 stack 上限收敛到 item definition，并检查 shop、craft、gift/request、decoder 全部调用方；工具 1，其余当前物品 999。
- [x] 在种子店增加独立背包陈列 interaction 及两档买完后陈列标识消失的表现。

Rollback point：此阶段只包含背包、catalog、升级与 current decoder；验证新档和两档升级后再继续。

## 2. Crafting menu

- [x] 扩展 recipe snapshot，增加箱子默认配方、缺料投影、1/5/25 数量与目标槽原子制作。箱子批量完整落入目标槽；工具批量从指定空槽起完整分配其余空槽，仍先预检后扣料。
- [x] 新增暂停式 CraftingPanel，接入桌面/触摸、分页、焦点与输入锁；预览取消不扣料。
- [ ] 验证背包满、材料跨多个 stack、重复确认、关闭/刷新时不丢物或重复扣料。

## 3. Map and occupancy foundation

- [x] 为目标 Tiled 地图补 `Placeable`，为 Farm 补 `Buildable` 与默认出货箱 spawn；decoder 缺失默认全 false。
- [x] 实现 `WorldOccupancySystem`，收集静态 mask、资源、农田、角色、宠物与 world object，并返回 `blocked/clear-on-place/relocate-on-place/free` 及受影响 identity。
- [x] 将宠物位置/运动下沉到 domain snapshot，Phaser 改为只读投影；切区和建筑避让域检查通过，完整宠物体验待人工验收。
- [x] 记录资源占用恢复参考依据并接入树、石块、杂草和野采刷新；保持原数量/周期与确定性，域检查通过，完整跨日玩法待人工验收。

Rollback point：在创建任何玩家物件前验证 movement、NPC path、现有资源/农田与宠物无回归。

## 4. World objects and chest

- [x] 增加 `worldObjects`、递增 ID、箱子 36 槽/21 色、严格 decode/reconcile 与 snapshot。
- [x] 实现箱子摆放、打开、指定槽转移、放入已有堆叠、整理、着色和空箱回收。
- [x] 按证据实现有界四向深度优先推箱及持久掉落/拾取；内存验证玩家失败原地保留、NPC 失败箱体销毁且内容掉落。
- [x] 新增 `StorageWorldView` 与完整 ContainerPanel，接入鼠标/键盘/触摸、颜色投影、敲击反馈与输入锁。世界用任意工具回收空箱、Space 连续空手敲击回收、斧/镐/锄连续敲击移动非空箱；实际完整路线待人工验收。

## 5. Shipping and settlement

- [x] 按 `research/current-item-shipping-matrix.md` 为 30 项 item catalog 增加 closed `canShip`/`shippingCategory`/`inventorySortOrder`，复用售价 owner。
- [x] 初始化默认 2x1 出货箱，实现靠近开盖、面板投入、手持直投、投入动画/声音/数量反馈和只撤回最后 stack。
- [x] 在 clone candidate 日结中结算队列，持久化未确认报告；保存失败重试同一 candidate。内存 repository 失败注入与新 session 恢复报告已验证；真实 IndexedDB 仍待验收。
- [x] 扩展 DaySettlementPanel 为分类/逐项/总收入报告，并用持久 `dismiss-day-settlement` 确认。

Rollback point：用保存失败 fixture 验证 Gold、队列与报告不会重复或丢失后再接建筑服务。

## 6. Carpenter schedule and shipping-bin service

- [x] 把墨子西街住宅公共区补成正式木匠柜台，增加独立 building-service interaction/result。
- [x] 统一精确分钟 NPC resolution，接通普通、周二 09:40/20:00 过柜、周五离柜和普通雨日程；服务、实际位置与 activity 使用同一 resolver。真实地图内存路径验证通过，表现与操作手感仍待人工验收。
- [x] 实现额外出货箱 250g + 150 Wood 即时建设、免费移动及至少保留一个的拆除规则；共享出货队列不随建筑移动/拆除改变。域内原子性已验证。
- [x] 日程由实际 resolver 统一消费；特殊日/施工日明确交给四季、鸡舍/筒仓和农舍升级后续 child，在真实 marker/job 出现时接入。本阶段不新增空扩展字段，不声称这些未来分支已可玩。

## 7. Verification

- 默认不扩展或全跑 life-loop / town / pet 历史 contract tests；允许按改动删除、合并或降级重复测试。
- 只有出现稳定复现的真实高风险缺陷且能低成本防复发时，才补一个针对性检查；不建设测试矩阵。
- [x] 运行 `npm --prefix .\apps\mirror-island run typecheck`；包含本地 Prisma codegen、客户端与服务端 TypeScript，通过；没有连接数据库。
- [x] 运行 `npm --prefix .\apps\mirror-island run build:client`，通过；保留 Vite 大 chunk 提示，未在本 child 扩展拆包工作。
- [x] `git diff --check` 与暂存区检查通过；Git 跟踪图片/音频二进制为零，没有新增依赖、数据库 migration 或旧 save migration。

## 8. Human acceptance and finish

- [ ] 新档走完 12->24->36、制作箱子、着色/存取/整理/回收/推动、双入口出货、隔夜报告和额外出货箱建设/移动/拆除。
- [ ] 覆盖桌面键盘/鼠标、移动触摸、200% zoom；不建设或验收手柄入口。
- [ ] 人工验证保存失败、刷新继续、跨日资源再生与箱子/建筑不重叠、NPC 极端推箱掉落与至少保留一个出货箱。
- [x] 对照 AGENTS/spec/PRD 完成代码自检并同步权威文档；生产代码通过最小验证后精确暂存，文档/研究/任务记录不暂存。未提供独立 `trellis-check` 技能，不伪记调用。
- [ ] 只有在用户针对本次 commit 明确授权后提交，再记录真人反馈并归档任务。

## 9. Domain verification evidence（2026-09-06）

以下是直接导入生产 TypeScript 的一次性内存 fixture 检查；未新增测试文件、测试框架、依赖或数据库连接。它们证明域规则和保存调用链，不代表浏览器、真实 IndexedDB、移动端、200% zoom 或真人体验验收通过。

- **局部静态检查**：使用本地 `tsc --noEmit`，启用 strict、noUncheckedIndexedAccess、ES2022 与 Bundler resolution，检查 inventory、crafting、progression、state、building 和 NPC motion 的实际依赖；通过。对应生产文件 `git diff --check` 通过并按仓库规则精确暂存；本清单不自动暂存。全应用正式 typecheck/client build 由第 7 节单独记录。
- **背包与制作**：验证 30 项物品排序键唯一、工具上限 1/其余上限 999；满目标转移失败不改任一槽；1,250 Wood 跨两个 stack 制作 25 个箱子时，错误工具目标槽不扣料，合法目标一次得到 25 箱；取半组与合并整理后总数不变，原锄头槽保持不动；24 格快捷行正反轮换还原原槽序；升级 offer 为 12→24/2,000g、24→36/10,000g，36 格不再提供升级。
- **批量工具与闭集输入补查**：5 把木斧从所选目标起分占 5 个槽且每槽为 1；12 槽背包制作 25 把因完整容量不足而失败，材料/原槽完全不变。item/recipe 查询明确拒绝 `constructor`、`toString` 和 `__proto__`，避免原型属性被误认作 catalog 成员。
- **current state 与地图**：从全部 12 张实际 `.tmj` 解码 catalog，运行 NPC schedule/activity 校验；新游戏 v13、12 槽及唯一默认出货箱成立；`createStoredGame → decodeStoredGame` round-trip 保持 current state。
- **木匠路径**：在实际西街住宅锚点上从周二 09:30 推进到 09:40 离家、从 19:50 推进到 20:00 归家，均观察到人物实际经过柜台通路时短暂提供服务；周五 16:00 晴天为离柜窗口、雨天继续营业。每 10 分钟同步目标不重置其他居民正在执行的路线。NPC 世界阻挡 callback 只同步返回阻挡/收集 intent，后续物件写入仍由 GameSession candidate 保存。
- **建筑规则**：在正式柜台附近用实际 NPC runtime 验证服务；非法 footprint 建造失败后整个 candidate 不变；成功建设只扣 250g 与 150 Wood，免费移动保持 identity；拆除额外箱不改出货队列，最后一个普通出货箱不能拆除；结果仍能 current round-trip。
- **保存失败与报告**：向内存 repository 投入 7 萝卜并注入写入失败，live 背包仍保留 7/queue 为空，重复投入被保存锁拒绝；重试写入相同 candidate。日结失败仍 Day 1、100g、原队列；重试一次得到 Day 2、345g、空队列与未确认报告。新建 GameSession 从 repository 恢复报告后世界操作被锁；确认报告写入失败时报告保留，重试后报告消失、Gold 仍 345、恢复可操作状态。
- **审查收敛**：报告保留结算时单价并验证算术，避免未来调价破坏历史报告恢复；NPC 未传 facing 的默认方向按新固定源码快照证据解释，不能把“无参数”误读为“无默认方向”；world current reconcile 补齐资源、农田、宠物和玩家与对象 footprint 的关联校验。浏览器连续敲击回收/推动、容器触摸操作与跨日重叠仍留在人工路线，不在这里标记完成。
- **客户端类型补查**：修正 TodayHint 的旧 `24 | 32` 参数及首周背包提示后，单独执行完整 `vue-tsc --noEmit -p apps/mirror-island/tsconfig.client.json` 通过；该结果不替代含 pretypecheck/server 的正式 `npm run typecheck` 记录。
- **农田占用窄修复**：实际 Farm `(26,17)` 曾可在箱子覆盖格上开垦、播种，并产生 current reconcile 拒绝的重叠存档；`FarmingSystem.use()` 现先读取共享 world object footprint，Lv2 连续浇水也在箱体/建筑前截止。相同实际地图 fixture 验证操作不扣料、不造重叠；全部入口/默认出生点的玩家 feet 与 Placeable/Buildable 合法 footprint 风险为零，宠物切换 Cottage/Farm 后位置通过共享阻挡检查。未新增测试文件。

## 10. Browser and final handoff evidence（2026-09-06）

- 使用无已有农场的 Codex 内置浏览器 profile，在本地开发入口实际新建 v13 农场；12 格快捷栏、五件工具和默认空手可见。
- 在完整背包把锄头从第 1 格移动到第 6 格；保存后刷新并选择继续，仍在第 6 格，金币与日期正常。该子路线直接经过真实 IndexedDB adapter，不把它扩大为全部存档场景通过。
- 制作页实际显示 1/5/25 数量选择与箱子 50 Wood 缺料信息；打开背包/制作时世界时间暂停。检查 1280×720 桌面与 390×844 手机宽度截图，当前内容与返回按钮可达、无横向溢出；viewport 随后恢复默认。
- 开发过程中热更新曾触发 session 尚未建立和 HUD day=0 的重载错误；重新加载后继续入口及本地存档正常。最终交付使用 `build:client` 产物的 `http://127.0.0.1:4173/` 本地 preview，避免把开发期 HMR 中间状态作为交付运行环境。
- 最后一次 typecheck（含 client/server TS）与 build:client 均通过；没有连接 PostgreSQL、Keycloak 或论坛数据库。使用已登记素材原图，未新增媒体对象或 Git 二进制。
- 完整升级、箱子操作、出货隔夜报告、木匠建造/移动/拆除、NPC 终局掉落、故障存档与 200% zoom 仍按第 8 节留待人工验收。自动化浏览器键盘“plus”输入不被工具接受，因此没有把窄屏检查冒充实际 200% 缩放通过。
- 保持任务 `in_progress`，生产代码暂存；文档、研究、任务 JSON/JSONL 不暂存，未提交、推送或部署。下一 child 仍为技能系统，先收集本版完整试玩反馈。
- 构建版 preview 已实际新建并进入农场、打开完整背包；该 4173 页面没有观察到浏览器 error/warn。已停止本次创建的 5173 开发服务，保留 4173 试玩入口。
