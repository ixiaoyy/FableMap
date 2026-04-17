# T5.10 — 访客状态与回访关系

## 概述

继续补齐“入场 → 对话 → 写回 → 回访反馈”闭环：访客进入酒馆时现在会携带稳定 `X-User-Id`，公开酒馆也会调用 `enter_tavern`，后端会更新 `VisitorState`。店主控制台新增“访客关系与回访”面板。

## 改了什么

| 文件 | 变更 |
|------|------|
| `frontend/src/services/tavernService.js` | `enterTavern` 支持 `userId` 请求头；新增 `getTavernVisitors` |
| `frontend/src/App.jsx` | `TavernEntryPanel` 接收当前 `visitorId` |
| `frontend/src/TavernEntryPanel.jsx` | 查询详情和入场均携带 visitorId；公开/密码酒馆都会调用入场 API |
| `frontend/src/TavernDetailPanel.jsx` | 入场携带 visitorId |
| `frontend/src/TavernInterior.jsx` | 入场携带 visitorId |
| `fablemap/tavern.py` | 新增 `list_visitor_states`；入场时按 visit_count/relationship_strength 更新关系阶段 |
| `fablemap/web/router.py` | 新增 `GET /api/taverns/{tavern_id}/visitors` |
| `fablemap/web/service.py` | 新增 owner-only 访客状态 payload；聊天成功后提升 relationship_strength |
| `frontend/src/TavernOwnerPanel.jsx` | 新增 `OwnerVisitorStatePanel` |
| `frontend/src/styles.css` | 新增访客状态面板样式 |
| `tests/test_tavern_visitor_state_api.py` | 覆盖入场写入访客状态和 owner-only 访客状态读取 |

## 关系阶段

当前使用轻量规则：

- `stranger`：初访者
- `acquaintance`：访问 ≥ 2 或关系强度 ≥ 0.15
- `regular`：访问 ≥ 4 或关系强度 ≥ 0.45
- `confidant`：访问 ≥ 8 或关系强度 ≥ 0.75

聊天成功后关系强度每次 +0.05，最多 1.0。

