# 地表采矿与镰刀 v1：实施计划

## 前置门禁

- [x] 用户评审本子任务 PRD/design/implement，并明确批准实施。
- [x] 运行 `trellis-before-dev`，重新读取 frontend spec、当前任务文档和目标文件完整 diff。
- [x] 确认父任务仍为 planning，地表采矿只交付石料依赖，不提前实现共建面板或设施奖励。

## 实施步骤

1. **建立已完成的 current v11 采矿基线**
   - [x] 增加 `pickaxe`、`stone` 定义、售价/堆叠与开局第四槽。
   - [x] current decoder 只接受完整 v11；移除本地玩法旧 migration/backup 活跃路径和仅服务旧版本的检查。
   - [x] 更新 resource decoder，使 stone 只允许 standing/cleared 且无 regrow timer。

2. **实现 MiningSystem**
   - [x] 新增带方法级注释的 `use()` 与 `settleDay()`。
   - [x] 复用 Inventory/Stamina/WorldCatalog/stableHash，覆盖 42px、2 体力、1 石料和所有原子失败。
   - [x] 在 GameSession target-kind 与日结 candidate 中接入一次，成功 mutation 只保存一次。

3. **接入客户端动作与表现**
   - [x] RockEntity 投影 cleared，并提供成功碎裂和错误轻敲两类表现。
   - [x] WorldScene 的鼠标、面对方向键和触摸 action 共用一次 ActionTimeline impact。
   - [x] 为九种外观复用现有动作 presenter 的 pickaxe pose/grip；切图和 teardown 清理 tween。
   - [x] 复用 stone SFX；补齐 Hotbar、背包、手持的镐/石料图标，不增加图片二进制。

4. **窄验证与文档**
   - [x] 扩展现有相关 contract test，不建立新测试平台或全量 E2E。
   - [x] 更新 frontend code-spec 的 current mining contract、当前状态和必要采用记录。
   - [x] 记录真人验收路线；Agent 不代签操作手感与画面结果。

5. **补齐基础镰刀与 current v12**
   - [x] 增加 `scythe`、`fiber` 定义与第五起始槽；把 current GameState/StoredGame 提升到 v12，不增加 v11 migration/backup。
   - [x] 给 ResourceSpawn/ResourceState decoder 增加只允许 standing/cleared、无 regrow timer 的 weed kind，以及独立日结 marker。
   - [x] 在三张正式地表地图登记 6/5/4 个不碰撞门口、出口、水体与 NPC 路径的 weed stable ID。

6. **实现确定性除草规则**
   - [x] 新增带方法级注释的 `WeedCuttingSystem.use()` / `settleDay()`，复用 Inventory、Facing、WorldCatalog 与 stableHash。
   - [x] 实现 42px 前方扇区、稳定排序、最多三株、零体力、逐株固定 50% fiber 和背包失败全原子。
   - [x] 日结按 Farm/Foothills/Lakeshore 1/2/1 恢复，跳过已耕种格并保证同日幂等；GameSession 只提交一次保存。

7. **接入镰刀输入与表现**
   - [x] 新增 WeedEntity、镰刀 pose/grip、源码图标、成功弧线/叶片与既有植被 cue；不新增媒体二进制。
   - [x] 鼠标/触摸点击和 Facing action 共用 ActionTimeline impact；错误工具、连续输入、切图与 teardown 不残留表现或重复 mutation。
   - [x] Hotbar、完整背包、商店出售和反馈文案可区分 scythe/fiber。

8. **扩展验证与合同**
   - [x] 更新相关现有 contract，不建立新测试平台；覆盖正式点数量、v12、AoE 原子性、50% 固定掉落与日结。
   - [x] 更新 frontend code-spec、任务 verification 与开源采用说明，明确无新依赖/媒体/数据库。
   - [x] 执行最小自动门禁和隔离浏览器 Farm 镰刀路线；完整三图、键鼠/真实触摸/200% 仍由真人签署。

## 最小验证

```powershell
npm --prefix .\apps\mirror-island run test:life-loop
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
```

另外执行一条只读结构检查，断言 formal maps 恰有 Farm 1、Foothills 4、Lakeshore 2 个 stone stable ID 和 6/5/4 个 weed stable ID，Git 游戏图片二进制增量为零。

## 人工路线

1. 清理本地试玩站点数据并新建游戏，确认第四槽为基础镐。
   同时确认第五槽为基础镰刀且初始为 100 体力。
2. 分别在 Farm、Foothills、Lakeshore 采一块石头，核对 2 体力、1 石料、一次声音/碎裂。
3. 验证错误工具、背包满、0/1 体力、连续输入和远距离均不改变状态。
4. 刷新确认 cleared；睡眠后 Farm/Lakeshore 不恢复、Foothills 最多恢复两个。
5. 再次刷新确认同一日结果不重抽；检查键盘、鼠标、触摸和 200% zoom。
6. 在三张地图分别挥割杂草，确认前方最多三株、体力不变、植物纤维结果刷新不重抽；睡眠后检查 1/2/1 恢复且不覆盖农田。

## 收尾与回滚点

- 生产代码/配置通过最小验证后按项目规则立即暂存；测试、任务文档、截图和诊断产物不自动暂存。
- 若新增除草 domain 原子性失败，只回滚步骤 5–7，不保留只会显示但不能安全掉落的镰刀或杂草表现。
- 若素材 frame 不清晰，回退为源码像素小图形，不引入未经评审的新素材包。
