# 农场仓储与出货 v1：实施清单

## 0. Start gate

- [ ] `09-04-surface-mining-v1` 取得真人确认，并在用户针对本次 commit 明确授权后独立提交/归档。
- [x] 用户完成 PRD 最终评审；手柄已确认不进入本 child，并确认 `design.md` 与本清单。
- [ ] 为本 child 配置真实 `implement.jsonl` / `check.jsonl`，执行 `task.py start`。
- [ ] 读取 `trellis-before-dev` 和当前 frontend spec；核对完整工作区与暂存区只包含预期前置基线。

## 1. Current state and inventory foundation

- [ ] 提升唯一 GameState/StoredGame current version；不增加旧开发存档迁移，IndexedDB database version 保持不变。
- [ ] 把 inventory/hotbar 改为 12/24/36，补 12 槽行轮换、槽位转移/拆分/合并、item-owned 稳定整理与两档顺序升级。
- [ ] 把工具/普通物品 stack 上限收敛到 item definition，并检查 shop、craft、gift/request、decoder 全部调用方。
- [ ] 在种子店增加独立背包陈列 interaction 及已售罄表现。

Rollback point：此阶段只包含背包、catalog、升级与 current decoder；验证新档和两档升级后再继续。

## 2. Crafting menu

- [ ] 扩展 recipe snapshot，增加箱子默认配方、缺料投影、1/5/25 数量与目标槽原子制作。
- [ ] 新增暂停式 CraftingPanel，接入桌面/触摸、分页、焦点与输入锁；预览取消不扣料。
- [ ] 验证背包满、材料跨多个 stack、重复确认、关闭/刷新时不丢物或重复扣料。

## 3. Map and occupancy foundation

- [ ] 为目标 Tiled 地图补 `Placeable`，为 Farm 补 `Buildable` 与默认出货箱 spawn；decoder 缺失默认全 false。
- [ ] 实现 `WorldOccupancySystem`，收集静态 mask、资源、农田、角色、宠物与 world object，并返回 `blocked/clear-on-place/relocate-on-place/free` 及受影响 identity。
- [ ] 将宠物位置/运动下沉到 domain snapshot，调整 Phaser 只读投影与相关宠物验收。

Rollback point：在创建任何玩家物件前验证 movement、NPC path、现有资源/农田与宠物无回归。

## 4. World objects and chest

- [ ] 增加 `worldObjects`、递增 ID、箱子 36 槽/21 色、严格 decode/reconcile 与 snapshot。
- [ ] 实现箱子摆放、打开、指定槽转移、放入已有堆叠、整理、着色和空箱回收。
- [ ] 按证据实现有界四向深度优先推箱；增加持久 world drop/拾取，分别验证玩家失败原地保留、NPC 失败箱体销毁且内容掉落。
- [ ] 新增 ChestEntity 与完整 ContainerPanel，接入鼠标、键盘、触摸、动画、声音和输入锁。

## 5. Shipping and settlement

- [ ] 按 `research/current-item-shipping-matrix.md` 为 item catalog 增加 closed `canShip`/`shippingCategory`/`inventorySortOrder`，复用售价 owner。
- [ ] 初始化默认 2x1 出货箱，实现靠近开盖、面板投入、手持直投和只撤回最后 stack。
- [ ] 在 clone candidate 日结中结算队列，持久化未确认报告；保存失败重试同一 candidate。
- [ ] 扩展 DaySettlementPanel 为分类/逐项/总收入报告，并用持久 `dismiss-day-settlement` 确认。

Rollback point：用保存失败 fixture 验证 Gold、队列与报告不会重复或丢失后再接建筑服务。

## 6. Carpenter schedule and shipping-bin service

- [ ] 把墨子西街住宅公共区补成正式木匠柜台，增加独立 building-service interaction/result。
- [ ] 统一精确分钟 NPC resolution，接通普通、周二 09:40/20:00 过柜、周五离柜和普通雨日程；服务、实际位置与 activity 不分叉判断。
- [ ] 实现额外出货箱 250g + 150 Wood 即时建设、免费移动及至少保留一个的拆除规则。
- [ ] 为四季特殊日 marker 和后续真实 construction job 留下已被实际 resolver 消费的扩展点，不创建无调用方状态或虚构坐标。

## 7. Verification

- [ ] 更新 `test/life-loop-contract.test.mjs`：新档、背包/stack、制作、容器、摆放、出货、日结成功/失败、建筑操作。
- [ ] 更新 `test/town-population-contract.test.mjs`：map layer、墨子分钟/星期/天气、服务位置、NPC 推箱与输入锁。
- [ ] 按宠物下沉影响更新 `test/home-pet-contract.test.mjs`。
- [ ] 运行上述最小相关 contract tests。
- [ ] 运行 `npm --prefix .\apps\mirror-island run typecheck`。
- [ ] 运行 `npm --prefix .\apps\mirror-island run build:client`。
- [ ] 运行 `git diff --check`，核对没有新增媒体二进制、生产依赖、数据库 migration 或旧 save migration。

## 8. Human acceptance and finish

- [ ] 新档走完 12->24->36、制作箱子、着色/存取/整理/回收/推动、双入口出货、隔夜报告和额外出货箱建设/移动/拆除。
- [ ] 覆盖桌面键盘/鼠标、移动触摸、200% zoom；不建设或验收手柄入口。
- [ ] 人工验证保存失败、刷新继续、NPC 极端推箱掉落与至少保留一个出货箱。
- [ ] 执行 `trellis-check`、同步 spec/权威文档；生产代码按规则暂存，测试/文档不自动暂存。
- [ ] 只有在用户针对本次 commit 明确授权后提交，再记录真人反馈并归档任务。
