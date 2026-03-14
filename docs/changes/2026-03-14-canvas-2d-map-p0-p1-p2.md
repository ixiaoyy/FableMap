# Canvas 2D World Map — P0 + P1 + P2

**Date**: 2026-03-14
**Type**: 功能变更
**Risk**: B 类（中风险，模块内逻辑新增，跨前端文件）
**AI 参与**: 实现草稿、代码变更，人工确认

## 为什么改

项目缺少可感知的世界地图视图。Step 3 原来是一个 `<iframe>` 嵌入静态 bundle HTML，玩家无法直接和地图交互，行为→反馈回路断裂。此次改动补上核心爽点：可见地图 + 即时视觉反馈 + 写回后节点变化。

## 改了什么

### 新建 `frontend/src/WorldMap.jsx`

- Canvas 2D 渲染器，读取 `world.map2d` 数据
- 6 种 `vibe_profile` 配色方案（ghibli_town / quiet_rain / neon_nostalgia / amber_evening / iron_blue / chalk_dawn）
- 15 种 `fantasy_type` 对应 emoji 图标
- 鼠标悬停：节点发光 + tooltip 显示 fantasy_name 和 satire_hook
- 点击节点：涟漪扩散动画 + 触发父组件 onPoiClick
- secret_slot 节点：虚线脉冲环
- 支持 `familiarityMap` prop，节点透明度随写回次数累积提升（P2）

### 修改 `frontend/src/App.jsx`

- 新增 import WorldMap
- Step 3 区域从 `<iframe>` 替换为 `<WorldMap>` 组件
- 新增 `activePoiId`、`activePoi`、`familiarityMap` 状态
- 点击地图节点自动同步写回表单 targetId
- 选中节点后底部显示 POI 详情栏 + 「驻足观察」一键写回按钮
- 写回成功后从 `player_state.poi_familiarity` 提取数据更新 `familiarityMap`
- 新生成世界时 `familiarityMap` 清零

### 修改 `fablemap/api_service.py`

- `build_nearby_payload()` 新增 `world` 字段，内联完整 world.json 内容
- 前端无需二次 fetch，地图数据随 `/api/nearby` 响应直接可用

### 修改 `fablemap/world_builder.py`

- `_pick_vibe()` 改为统计切片内所有 POI 的 vibe 频率取最高频（P1）
- `_pick_palette()` 同上
- 修复原来直接取第一个 POI 导致区域风格不稳定的问题

### 修改 `frontend/src/styles.css`

- 新增 `.world-map-wrap`、`.world-canvas`、`.map-tooltip`、`.map-legend`、`.map-empty`、`.poi-detail-bar` 等样式

## 没改什么

- World Schema 未变更
- writeback.py 未变更
- 后端 API 路由未变更
- Admin/debug panel 未变更

## 影响文件

- `frontend/src/WorldMap.jsx`（新建）
- `frontend/src/App.jsx`
- `frontend/src/styles.css`
- `fablemap/api_service.py`
- `fablemap/world_builder.py`

## 是否涉及协议/Schema/命名变更

否。`world` 字段作为 API 响应的额外字段新增，不影响现有字段，不改变 Schema。

## 验证

- 前端 `npm run build` 成功
- 生成世界切片后地图可见
- 点击节点触发涟漪动画
- 写回后节点亮度随 poi_familiarity 累积变化

## 风险点

- `/api/nearby` 响应体增大（内联完整 world JSON）。当前 world 数据通常 < 200KB，可接受。如未来超出限制需改为单独 endpoint。
