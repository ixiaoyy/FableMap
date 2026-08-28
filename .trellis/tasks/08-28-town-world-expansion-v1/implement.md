# Town 世界元素扩展 v1：实施计划

## 1. Catalog and inspect contract

1. 将 `InteractionDefinition` 扩展为带 `dialogueId` 的 `inspect` 判别联合。
2. 更新 Tiled decoder 验证 inspect properties，并保持 farm-plot/door/bed 合同不变。
3. 在 WorldEntities 增加透明 hover/click InspectEntity；在 WorldScene 增加 active-region 投影、48px 距离和现有 modal 锁。
4. 增加环境对话定义，不增加新 UI 面板。

## 2. Region registration and profiles

1. 在 `world-catalog.ts` 登记 blacksmith、五栋 town-house、foothills、lakeshore 地图。
2. 将 foothills/lakeshore 纳入现有 VectoRaith outdoor tileset 与 entity profile；室内继续走 Ninja profile。
3. 在地图格式化脚本登记新增 TMJ 名称。

## 3. Author maps

1. 修改 Town Object Layer：新增工坊、民宅、北山、南湖入口与安全 spawn；只打开对应门槛和边界 Collision。
2. 新增 blacksmith.tmj：炉子、工作台、工具架、返回出口与 inspect hotspots。
3. 新增并重构五栋 town-house TMJ：公共生活空间、私人内屋碰撞、返回出口与 inspect hotspots；不添加 functional bed。
4. 新增 foothills.tmj：48×36 山道、岩壁/石群、水池、矿洞口、树林、树木资源与 inspect hotspots。
5. 新增 lakeshore.tmj：48×36 湖面、岸线、码头、道路、树木与 inspect hotspots。

## 3.1 Residential availability extension

1. 在 Town 为其余四栋民宅增加 door interaction、双向 exit、安全 spawn，并打开精确门槛 Collision。
2. 新增 `town-house-west`、`town-house-north`、`town-house-southwest` 与 `town-house-east`，分别调整家具、显示名、inspect IDs 和返回目标。
3. 重构全部五栋住宅室内：公共起居区可行走，私人内屋通过内部墙、固定碰撞和 inspect 门口阻挡。
4. 将现有 `town-blacksmith-entry` / `blacksmith-door` 坐标迁到红色工坊侧院，释放西南小棕屋外门供住宅使用。
5. 更新 catalog、mixed interior profile、地图格式化登记、环境对话、地图 ID 文档和单一 Town 合同。

## 4. Focused integration

1. 扩展现有 Town 窄合同一次性加载十二张正式地图，断言出口闭合、stable ID 唯一和 inspect dialogue 完整。
2. 不扩建大规模测试矩阵，不重复运行每张地图的独立门禁。
3. 核对 Git diff 不含图片、migration、数据库或新依赖。

## 5. Minimal validation

整批完成后只运行：

```powershell
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
```

人工主路线仅需：Farm → Town → 工坊 → 民宅 → 山麓矿洞口 → 湖岸码头 → Town。

住宅补充路线：依次进入五栋民宅公共区并返回，再点击每栋内屋门确认私人区域保持阻挡。

## Rollback points

- 修改前保留 Town 目标 layer/object 完整 diff；不使用整文件 restore。
- WorldScene/WorldEntities 与其他活动任务重叠，回滚时只删除本任务新增的 inspect 与 region 投影。
- 新 TMJ 是独立文件；若单一区域失败，可先移除其 catalog source 与 Town 双向出口，不影响现有四区。
