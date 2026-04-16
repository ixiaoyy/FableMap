# T4.4 任务认领：酒馆搜索发现

## 任务 ID
T4.4

## 任务名称
酒馆搜索发现：浏览与搜索

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
前后端功能切片

## 任务目标
在访客地图发现链路中补齐酒馆浏览与搜索能力：

1. 在地图舞台中展示附近酒馆列表。
2. 支持按名称、描述、地址、角色、状态与访问方式搜索。
3. 支持访问方式、营业状态和排序筛选。
4. 列表选择酒馆后与地图 marker / 入场面板联动。
5. 后端列表接口补充基础发现过滤参数。

## 可修改范围
- `frontend/src/App.jsx`
- `frontend/src/WorldStagePanel.jsx`
- `frontend/src/WorldStageTavernDiscoveryLane.jsx`
- `frontend/src/services/tavernService.js`
- `frontend/src/styles.css`
- `fablemap/tavern.py`
- `fablemap/web/router.py`
- `fablemap/web/service.py`
- `tests/test_tavern_discovery.py`
- `docs/CURRENT_TASKS.md`
- `docs/changes/2026-04-17-t4-4-tavern-discovery.md`

## 明确不改范围
- 不接管 T4.2 的 `TavernCreatePanel` 并行改动。
- 不修改酒馆数据 schema。
- 不实现 T4.5 的地图 marker 分类视觉。
- 不新增前端依赖。

## 验证方式
- `npm run build`
- `py -3 -m pytest tests/test_tavern_discovery.py tests/test_tavern_token_usage.py -q`

## 当前状态
done
