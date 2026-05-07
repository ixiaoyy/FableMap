# T5.14 店主会话关键词搜索

日期：2026-04-17

## 背景

T5.9-T5.13 已经让店主可以查看会话摘要、完整历史、导出文本，并从访客回访状态跳转到最近会话。但当会话数量增加后，店主仍缺少按关键词定位访客反馈的入口。

## 变更

- 后端 `/api/chats/search`
  - 空关键词不再返回全部消息，避免误触发大范围暴露。
  - 新增 `limit` 上限裁剪，默认 50，最高 200，并返回 `truncated` 标记。
  - 时间戳生成改为 timezone-aware UTC，消除 `datetime.utcnow()` 弃用警告。
- 前端
  - `tavernService.searchChatHistory` 封装聊天搜索 API。
  - 店主控制台新增“搜索访客消息”面板：
    - 按单个空间搜索关键词。
    - 展示命中消息、访客、角色、时间。
    - 可从命中消息直接打开完整会话详情。
- 测试
  - 扩展聊天历史权限测试：店主可搜索命中，空查询返回 0，非本人访客不能搜索他人会话。

## 验证

- `py -3 -m pytest -q --tb=short` → 167 passed
- `py -3 -m compileall -q fablemap`
- `npm --prefix .\frontend run build`

