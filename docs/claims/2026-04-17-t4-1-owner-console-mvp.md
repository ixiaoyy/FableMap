# T4.1 任务认领：我的酒馆控制台 MVP 收口

## 任务 ID
T4.1

## 任务名称
我的酒馆面板：店主控制台列表、筛选、摘要与基础管理入口

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
前端功能切片 + 协作记录

## 任务目标
把现有 `TavernOwnerPanel` 从基础列表推进为可用的店主控制台 MVP：

1. 店主能看到自己酒馆的总览指标。
2. 店主能按名称、状态、访问权限筛选自己的酒馆。
3. 店主能手动刷新列表，并清楚看到读取、错误、空结果状态。
4. 保留已有创建、编辑、AI 配置、开关店、删除入口。

## 可修改范围
- `frontend/src/TavernOwnerPanel.jsx`
- `frontend/src/styles.css`
- `docs/CURRENT_TASKS.md`
- `docs/claims/2026-04-17-t4-1-owner-console-mvp.md`
- `docs/changes/2026-04-17-t4-1-owner-console-mvp.md`

## 明确不改范围
- 不修改 Tavern / Character / LLMConfig 数据 Schema。
- 不新增后端 API。
- 不调整地图发现页、聊天房间、角色导入协议。
- 不引入新的前端依赖。

## 依据文档
- `docs/CURRENT_TASKS.md`
- `docs/FABLEMAP_TAVERN_PLATFORM.md`
- `docs/ARCHITECTURE.md`
- `docs/AI参与开发协议.md`

## 预期产出
- 店主控制台 MVP 前端实现。
- 当前任务状态同步。
- 本次变更记录。

## 验证方式
- `npm run build`（在 `frontend/` 目录执行）

## 当前状态
done
