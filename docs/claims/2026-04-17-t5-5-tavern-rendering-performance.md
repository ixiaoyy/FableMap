# T5.5 任务认领：性能优化

## 任务 ID
T5.5

## 任务名称
性能优化：大量空间时渲染优化

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
前端性能切片

## 任务目标
降低大量空间同时出现时的地图与列表渲染压力：

1. 为空间发现搜索建立 memoized search index，减少筛选时重复拼接搜索文本。
2. 地图 marker 设置上限，优先显示排序后的前 N 间，并保留当前选中空间。
3. 空间发现列表从固定 12 条改为逐步加载，避免一次性渲染大量卡片。
4. UI 显示地图当前 marker 数与匹配总数，让截断行为可见。

## 可修改范围
- `frontend/src/App.jsx`
- `frontend/src/WorldStagePanel.jsx`
- `frontend/src/WorldStageMapFrame.jsx`
- `frontend/src/WorldMap.jsx`
- `frontend/src/WorldStageTavernDiscoveryLane.jsx`
- `frontend/src/styles.css`
- `docs/CURRENT_TASKS.md`
- `docs/changes/2026-04-17-t5-5-tavern-rendering-performance.md`

## 明确不改范围
- 不新增前端依赖。
- 不修改后端分页协议。
- 不接管 T5.2 / T5.4 的并行改动。

## 验证方式
- `npm run build`
- `git diff --check`

## 当前状态
done
