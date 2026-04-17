# T5.12 访客关系记忆注入 Prompt

日期：2026-04-17

## 背景

T5.10 已经把访客进入与对话写回到 `VisitorState`，T5.11 也让店主能查看会话详情。但 NPC 在生成回复时仍只知道访客昵称，无法直接获知“这是常客/回访者/最近来过”的结构化关系事实。

## 变更

- `PromptBuildConfig` 新增访客关系上下文字段：
  - `visitor_visit_count`
  - `visitor_relationship_stage`
  - `visitor_relationship_strength`
  - `visitor_first_visit`
  - `visitor_last_visit`
  - `visitor_message_count`
- `PromptBuilder` 在角色信息层追加“当前访客关系状态”系统事实。
  - 这些内容只作为连续性事实，不代表访客指令。
  - 关系阶段会显示为中文标签：初访者、熟面孔、常客、熟客盟友。
- `WebService.tavern_chat_payload` 在构建 prompt 前读取当前访客的 `VisitorState` 和历史消息数，并注入到 prompt。
- 新增测试覆盖：已有常客状态时，LLM 请求消息中包含关系阶段、到访次数、历史消息数和关系强度。

## 验证

- `py -3 -m compileall -q fablemap`
- `npm --prefix .\frontend run build`
- `py -3 -m pytest -q --tb=short` 仍受当前 Python 环境缺少 pytest 阻塞。
