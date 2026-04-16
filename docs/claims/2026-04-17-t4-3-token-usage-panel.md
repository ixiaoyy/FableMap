# T4.3 任务认领：Token 统计面板

## 任务 ID
T4.3

## 任务名称
Token 统计面板：店主查看酒馆 LLM 使用量

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
前端功能切片 + 最小后端数据同步 + 协作记录

## 任务目标
让店主在“我的酒馆控制台”中看到当前账号下各酒馆的 LLM Token 使用情况：

1. 展示总 Token、平均 Token、已使用 / 未使用酒馆数量。
2. 展示按 Token 使用量排序的酒馆列表。
3. 标出每间酒馆的模型、后端与使用占比。
4. 保证聊天链路记录的 token 用量能回到 tavern payload 中，供前端列表展示。

## 可修改范围
- `fablemap/tavern.py`
- `fablemap/web/service.py`
- `frontend/src/TavernOwnerPanel.jsx`
- `frontend/src/styles.css`
- `docs/CURRENT_TASKS.md`
- `docs/claims/2026-04-17-t4-3-token-usage-panel.md`
- `docs/changes/2026-04-17-t4-3-token-usage-panel.md`

## 明确不改范围
- 不新增 Token 计费或充值系统。
- 不修改 LLMConfig Schema 字段语义。
- 不新增前端依赖。
- 不改变聊天 API 请求 / 响应协议。
- 不改地图发现页与角色导入流程。

## 依据文档
- `docs/CURRENT_TASKS.md`
- `docs/FABLEMAP_TAVERN_PLATFORM.md`
- `docs/WHAT_NOT_TO_BUILD.md`
- `docs/AI参与开发协议.md`

## 预期产出
- 店主控制台 Token 统计面板。
- token_used 写回到可展示的 tavern 数据。
- 当前任务状态同步。
- 本次变更记录。

## 验证方式
- `npm run build`（在 `frontend/` 目录执行）
- 相关 Python 测试或最小 smoke test

## 当前状态
done
