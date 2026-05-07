# T5.13 回访面板会话联动

日期：2026-04-17

## 背景

店主控制台已经有两块相关反馈：

- “最近对话会话”：按聊天会话展示最近互动。
- “访客关系与回访”：按访客聚合展示到访次数、关系阶段和消息数。

但二者之间还缺少直接跳转。店主看到某个高回访访客后，需要手动回到会话摘要区寻找对应会话。

## 变更

- `OwnerVisitorStatePanel` 新增“查看会话”操作。
- `TavernOwnerPanel` 新增 `openVisitorLatestSession`：
  - 优先从当前已加载的 `chatSessions` 中找到该访客最新会话。
  - 如果本地摘要缺失，则以店主身份调用 `/api/chats?tavern_id=...&visitor_id=...` 按需拉取。
  - 找到后复用 T5.11 的会话详情弹窗。
- 扩展 `/api/chats` owner 显式 visitor 过滤测试，保证店主可从访客状态跳转到指定访客会话，同时非本人访客仍被拒绝。
- 顺手收紧 `/api/chats?visitor_id=...` 无 `tavern_id` 的全局扫描：店主只扫描自己拥有的空间，避免公开但非自有空间触发错误权限判断。

## 验证

- `py -3 -m compileall -q fablemap`
- `npm --prefix .\frontend run build`
- `py -3 -m pytest -q --tb=short` 仍受当前 Python 环境缺少 pytest 阻塞。
