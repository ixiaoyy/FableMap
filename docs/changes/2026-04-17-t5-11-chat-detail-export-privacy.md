# T5.11 会话详情、导出与隐私边界

日期：2026-04-17

## 背景

T5.9 已让店主看到最近访客会话摘要，但还缺少“点开看完整历史/导出反馈”的闭环。同时，聊天历史接口只按 `visitor_id` 查询，缺少请求者身份校验，存在读取其他访客会话的风险。

## 变更

- 后端
  - `GET /api/taverns/{id}/chat` 增加 `X-User-Id` 校验和 `limit` 参数。
  - 只有会话访客本人或酒馆主人可以读取指定访客历史。
  - `/api/chats` 显式 `visitor_id` 过滤时同样校验访客本人/店主身份。
  - `/api/chats/export`、`/api/chats/search`、`/api/bulkedit` 增加同样的会话范围校验。
  - `/api/chats` 保存/导入时阻止带身份请求写入其他访客会话；匿名兼容路径只允许请求体自带 visitor_id 的旧集成继续写入。
  - 匿名进入酒馆不再创建空 visitor_id 的 VisitorState，避免店主回访面板出现空访客。

- 前端
  - `tavernService.getChatHistory`、`sendChat`、`exportChatHistory` 统一携带 `X-User-Id`。
  - 店主控制台“最近对话会话”增加“查看历史”入口。
  - 新增会话详情弹窗：展示完整消息列表、刷新历史、生成导出文本、复制导出。
  - 访客昵称弹窗文案调整为“角色会用这个称呼与你对话”，避免暗示访客间社交。

- 测试
  - 新增聊天历史/导出权限测试：访客本人和店主可读，其他访客与匿名请求被拒绝。
  - 扩展会话列表测试：非本人不能用 `visitor_id` 过滤读取其他访客摘要。
  - 扩展 VisitorState 测试：匿名入场不会生成空访客状态。

## 验证

- `py -3 -m compileall -q fablemap`
- `npm --prefix .\frontend run build`
- `py -3 -m pytest -q --tb=short`（当前本地 Python 环境缺少 pytest，命令无法实际执行测试）
