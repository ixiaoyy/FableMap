# NPC 动态避让 MVP：实施计划

## 1. Shared collision contract

1. 在 `regions.ts` 导出玩家/NPC 脚底常量与 overlap helper。
2. WorldCatalog 和 movement 改用共享常量，保持既有玩家碰撞行为不变。

## 2. Dynamic path input

1. 扩展 `findNpcPath` 的可选 avoided world points。
2. 将 avoided points 转为当前 EasyStar 实例的临时 tile exclusions；不修改原 Collision grid。

## 3. Runtime avoidance

1. WalkingNpcMotion 增加 blockedMs，NpcMotionKind 增加 waiting。
2. `advance` 拆为 50ms substeps，按 stable entityId 推进并维护本步最新 projections。
3. 候选位置与玩家/其他 NPC overlap 时等待；600ms 后限频重规划，无路径继续等待。
4. GameSession tick 传入 `state.player`；其他 runtime lifecycle 和 persistence 不变。

## 4. Focused contract and docs

1. Town 合同增加玩家挡路立即停止、600ms 后旁路、目标清空恢复和动态 path tile exclusion。
2. 更新 code-spec、产品边界和路线图动态避让条目。

## 5. Minimal validation

```powershell
npm --prefix .\apps\mirror-island run test:town-population
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
```

最终改动后只运行一次；不连接数据库、不运行身份、Life Loop 全套或 E2E。

## Risk points

- 必须使用 substeps，不能只检查长 delta 的终点，否则仍可能穿透。
- 重规划必须限频，不能每帧同步 A*。
- 稳定排序不得依赖 Map 临时插入顺序或 Phaser view 顺序。
- 不能通过修改玩家坐标、隐藏 NPC 或忽略 destination 占位解决死锁。
