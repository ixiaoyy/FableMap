# T4.5 任务认领：标记分类显示

## 任务 ID
T4.5

## 任务名称
标记分类显示：公开 / 密码 / 私人分类

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
前端功能切片

## 任务目标
让地图发现链路中的酒馆访问类型一眼可辨：

1. 地图酒馆 marker 按 `public` / `password` / `private` 使用不同视觉样式。
2. 地图叠加层展示当前可见酒馆分类图例与数量。
3. 酒馆发现列表使用同一套访问类型 chip。
4. 搜索发现筛选保留私人分类入口，便于 owner/future scope 复用。

## 可修改范围
- `frontend/src/mapAdapter/AMapAdapter.js`
- `frontend/src/WorldMap.jsx`
- `frontend/src/WorldStageTavernDiscoveryLane.jsx`
- `frontend/src/services/tavernService.js`
- `frontend/src/styles.css`
- `docs/CURRENT_TASKS.md`
- `docs/changes/2026-04-17-t4-5-tavern-marker-categories.md`

## 明确不改范围
- 不接管 T4.2 的 `TavernCreatePanel` 并行改动。
- 不修改酒馆数据 schema。
- 不新增地图 Provider。
- 不新增前端依赖。

## 验证方式
- `npm run build`
- `git diff --check`

## 当前状态
done
