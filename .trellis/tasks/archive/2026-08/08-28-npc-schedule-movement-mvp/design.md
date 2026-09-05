# NPC 日程移动 MVP：技术设计

## Ownership and data flow

```text
GameSession.tick(now, paused)
  -> minuteOfDay phase boundary
  -> NpcMotionRuntime.setScheduleTarget(minuteOfDay)
  -> EasyStar Collision-grid route or transfer fallback
  -> NpcMotionRuntime.advance(elapsedMs)
  -> active NPC runtime projections
     |- WorldScene render/click/hit
     |- movePlayer collision
     `- ShopSystem keeper range/type
```

`GameState` 仍只保存 `minuteOfDay`。`NpcMotionRuntime` 由 GameSession 构造并在 new/continue/sleep 时从当前 schedule 重置，不进入 `cloneGameState` 或 `createStoredGame`。

## Runtime projection

新增 `NpcRuntimeSpawn`，保留 `NpcSpawnDefinition` 的稳定身份、region、position 与 interactionType，并附加：

- `opacity: number`：闭区间 `0..1`，供跨区/兜底转场表现。
- `motion: "idle" | "walking" | "leaving" | "arriving"`：只读表现状态。

内部 motion 分为 idle、walking 和 transfer。walking 逐段消费像素距离；transfer 前半段投影旧区域并淡出，后半段投影新区域并淡入。跨过中点时才切换 region，避免同一 NPC 同时出现在两张地图。

移动和 transfer 状态统一把 interactionType 投影为 `dialogue`；只有 idle 终点恢复 schedule 的 interactionType，从而保证华强到柜后才营业。

## Path adapter

`domain/world/npc-pathfinding.ts` 是 EasyStar.js 的唯一集成点：

1. 通过 CommonJS 默认导入实例化 `.js`；不使用 Node ESM 不支持的具名 `js` 导入。
2. 把 `CollisionGrid.blocked` 转为 `0/1` grid。
3. 只允许 `0`，使用四方向移动，不穿越对角墙角。
4. 把起终点像素转换为 tile 索引。
5. 把结果转换为 world points：保留精确起点和终点，中间节点使用 tile center。
6. 删除连续共线的冗余节点；无路径返回 `null`。

路径不把玩家或其他 NPC 写入静态 grid；动态避让仍是 T1 后续独立任务。

## GameSession integration

- 初始化/载入后调用 runtime reset。
- tick 复用现有有界、pause-aware elapsed；先推进已有 motion，再在游戏分钟跨 phase 时创建新 motion。
- `activeNpcSpawns()`、`activeNpcSpawnsInRegion()` 和 `activeNpcById()` 暴露防御性只读投影。
- move command 显式接收当前 region projections，删除 movement 对静态 schedule resolver 的直接依赖。
- buy/sell 由 GameSession 把当前 seed keeper projection 传给 ShopSystem，ShopSystem 不再自行按 minute 解析终点。
- sleep 成功后直接 reset 到次日 06:00，不播放从旧时段回家的路线。

## Phaser projection

- WorldScene 每帧 tick 后读取当前 region runtime projections；普通 GameState subscription 仍负责玩家、资源和 UI。
- NpcEntity 保留同一个 container 并通过 `project` 更新 position、alpha、depth 和当前 spawn 元数据，不因每个像素变化销毁重建。
- hit reaction 期间记录最新 runtime spawn；表现结束后回到最新位置，避免回退到路线起点。
- 区域切换销毁 region views 的既有边界保持不变。

## Compatibility and fallback

- StoredGame v4、IndexedDB backup 合同和 Tiled map 格式均不变化。
- EasyStar 返回空路径或异常结果时使用 transfer 淡出/淡入；NPC 最终仍到 schedule anchor。
- 运行时状态丢失只会使 NPC 重置到当前时段终点，不会损坏存档。

## Rollback

回滚仅涉及依赖/锁文件、开源记录、两个 domain runtime 文件及 GameSession/movement/shop/WorldScene/WorldEntities 的窄接线。无需迁移或数据回滚。
