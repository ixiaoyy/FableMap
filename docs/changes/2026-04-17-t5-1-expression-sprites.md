# T5.1 情绪精灵图

## 背景

后端已经提供标准 SillyTavern 表情列表、角色 sprite 查询以及 `/api/expression/infer`。聊天页也有初步表情选择器，但 AI 回复后没有真正驱动表情切换。

## 改动

- AI 回复显示后调用现有表情推断接口。
- 每条 assistant 消息携带 `expression` 与 `expressionSource`，头像按该消息表情选择 sprite。
- 当前角色栏展示当前表情、推断来源和手动表情选择。
- 角色没有配置 sprite 时仍展示情绪标签，聊天流程不受影响。
- 修正聊天历史 ISO 时间戳解析，避免历史消息时间显示为无效日期。

## 验证

- `npm run build`
- `git diff --check`
