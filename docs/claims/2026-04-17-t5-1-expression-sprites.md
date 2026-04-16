# T5.1 任务认领：情绪精灵图

## 任务 ID
T5.1

## 任务名称
情绪精灵图：角色表情切换

## 认领时间
2026-04-17

## 负责人
Codex

## 改动类型
前端体验切片

## 任务目标
完善聊天中的角色表情反馈：

1. AI 回复后调用现有表情推断接口。
2. 消息记录携带本次回复的 expression，并用对应 sprite 展示头像。
3. 当前角色栏展示当前表情、推断来源与可选表情。
4. 没有配置 sprite 时仍展示情绪标签，不阻断聊天。
5. 修正聊天历史时间戳解析，避免 ISO 时间显示异常。

## 可修改范围
- `frontend/src/TavernChatRoom.jsx`
- `frontend/src/styles.css`
- `docs/CURRENT_TASKS.md`
- `docs/changes/2026-04-17-t5-1-expression-sprites.md`

## 明确不改范围
- 不修改酒馆/角色数据 schema。
- 不新增图片资源或生成角色立绘。
- 不接管 T4.2 的并行改动。
- 不新增前端依赖。

## 验证方式
- `npm run build`
- `git diff --check`

## 当前状态
done
