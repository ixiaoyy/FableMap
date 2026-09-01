# 关系对话与两心事件：技术设计

- `NpcDialogueSystem` 继续作为 request/event/stage/activity/personality 优先级与 history mutation 的唯一 owner。
- Seed Keeper 两心事件仅在 `seed-shop`；昊天仅在 `town` 工作点或 `blacksmith`，避免住宅闲聊错误触发工作事件。
- Client dialogue catalog 只把 stable ID 映射为中文 speaker/lines；不重新决定优先级或写 save。
- SocialPanel 用 `relationshipStageAt(points)` 显示陌生/熟悉/友好；只渲染两颗内容心，进度限制在 0..500，隐藏 raw 0..2500 数值。
- 委托感谢和新阶段已由 v8 result/history 持久化；本任务不增加送礼/生日/婚恋。
