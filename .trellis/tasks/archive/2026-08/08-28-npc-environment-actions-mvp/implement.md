# NPC 轻量环境动作 MVP：实施计划

## 1. Tiled action anchors

1. 在 Foothills 增加浩南两个可通行巡逻点并更新 `nextobjectid`。
2. 在 Lakeshore 码头增加祥子东西两个巡逻点并更新 `nextobjectid`。
3. 保持 Collision、tile layers、existing object IDs 与地图尺寸不变。

## 2. Domain activity owner

1. 新增八人 day activity registry、resolver 和 startup validator。
2. 将 validator 接入现有 `loadWorldCatalog` 启动链。
3. 扩展 NpcMotionRuntime state/projection：stationary cadence、2400ms dwell、patrol route loop、schedule transition cancellation。
4. 复用既有 EasyStar adapter，不新增依赖或第二套寻路。

## 3. Phaser presentation

1. NpcEntity 增加一个 activity mark 与 body-local 两相表现映射。
2. 每帧 `project()` 根据 activity 更新表现，同时保持 container 坐标、点击和 hit reaction runtime-owned。
3. teardown 清理现有对象即可，不新增独立 timer/tween owner。

## 4. Contracts and roadmap

1. Town 合同覆盖八人 day activity、非 day 清除、浩南/祥子 route movement、dwell 与 route anchor validation。
2. 更新 code-spec 和 `docs/TOWN_ROADMAP.md`，完成“每名 NPC 白天轻量环境动作”条目；休息动作仍保持后续范围。

## 5. Minimal validation

```powershell
npm --prefix .\apps\mirror-island run test:town-population
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
```

最终改动后只运行一次；不连接数据库、不运行身份、Life Loop 全套或 E2E。

## Risk points

- 活动 route 不能绕过 GameSession motion owner；禁止 Phaser tween container 伪造巡逻。
- stationary visual 只能偏移 body，不能改变碰撞位置。
- 新 Tiled spawn 必须使用全局稳定命名且不覆盖 existing ID。
