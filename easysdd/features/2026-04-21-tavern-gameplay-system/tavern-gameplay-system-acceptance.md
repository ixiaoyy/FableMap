# AI 导演的酒馆玩法系统 验收报告

> 阶段：阶段 3（验收闭环）  
> 验收日期：2026-04-21  
> 关联方案 doc：`easysdd/features/2026-04-21-tavern-gameplay-system/tavern-gameplay-system-design.md`

## 1. 接口契约核对

对照方案 doc 第 2 节接口契约，逐项核查实现与契约一致：

- [x] `fablemap/gameplay.py` 模型契约：`normalize_gameplay_definition()`、`GameplaySession`、`GameplayEvent`、`AIDirector` 已落地（`fablemap/gameplay.py:167`、`:287`、`:452`）。字段包含 `draft/published/disabled`、默认节点、fallback seed、completion。
- [x] Tavern schema / Store 契约：`Tavern.gameplay_definitions` 已公开保留；`_gameplay_sessions` 只走 store 私有方法（`fablemap/tavern.py:442`、`:473`、`:875`、`:910`）。
- [x] Gameplay API 契约：`GET/PUT /gameplays` 与 `GET/POST/advance/abandon /gameplay-sessions` 已接入 router/service（`fablemap/web/router.py:270`、`:282`；`fablemap/web/service.py:755`、`:844`、`:986`、`:1030`）。
- [x] AI Director / fallback 契约：`AIDirector` 校验结构化 JSON，非法 JSON / 不存在节点 / 无 LLM 走 `fallback_result()`；fallback 事件写 seed 和 event（`fablemap/gameplay.py:430`、`:452`）。
- [x] 默认公益酒馆契约：4 个默认公益酒馆均有 published gameplay（`fablemap/default_taverns.py:277`、`:345`、`:412`、`:480`）。
- [x] 前端 service 契约：`getGameplays/saveGameplays/startGameplaySession/advanceGameplaySession/listGameplaySessions/abandonGameplaySession` 已加入 `tavernService`（`frontend/src/services/tavernService.js:269` 起）。
- [x] 店主 UI 契约：`GameplayManager` / `GameplayDefinitionEditor` 独立，OwnerPanel 只薄接入入口和弹窗状态（`frontend/src/TavernOwnerPanel.jsx:11`、`:1091`）。
- [x] 访客 UI 契约：`TavernGameplayLauncher` / `GameplaySessionPanel` 独立，`TavernChatRoom` 只做服务调用、状态和渲染接入（`frontend/src/TavernChatRoom.jsx:998`、`:1460`）。

## 2. 行为与决策核对

需求摘要逐项验证：

- [x] 店主可创建 / 编辑 / 发布 / 停用玩法：`GameplayManager` 支持增删本地草稿、编辑状态、调用 `saveGameplays` 保存。
- [x] 访客可看到 published 玩法、开始和恢复：`GET /gameplays` 非 owner 只返回 published；`start_gameplay_session_payload()` 遇到 active session 会返回 `resumed: true`。
- [x] 会话状态保存：`GameplaySession` 保存 `state/current_node_id/turn_count/events/completion/updated_at`。
- [x] 有 AI 时走 AI Director；无 AI 时 fallback：service 仅在可配置非 rules LLM 时调用 AI，否则 `fallback_result()`。
- [x] 默认公益酒馆各有专属剧情玩法：新增 4 个 `gp_pw_*`，测试覆盖主题关键词和 rules fallback 可玩。
- [x] 酒馆包导出包含玩法定义、不包含 session：`test_gameplay_sessions_survive_tavern_metadata_update_and_export_excludes_sessions` 覆盖。

明确不做逐项核对：

- [x] 未支持店主上传可执行脚本、JS、Python、表达式求值或任意代码；高级区只编辑 JSON 数据，并有“不要写脚本或表达式”提示。
- [x] 未实现战斗、等级、装备、竞技排行榜、传统 RPG 系统。
- [x] 未实现访客间聊天、组队、好友、跨酒馆玩家社交。
- [x] 未改变 ChatMessage schema；玩法进度进入 `GameplaySession` / `GameplayEvent`。
- [x] 未改 LLM API Key 存储 / 日志策略；Gameplay payload 不携带 API Key / token 信息。

关键决策落地：

- [x] 新增 Gameplay 子系统而非塞进聊天模板：`fablemap/gameplay.py` + 独立前端组件。
- [x] 店主轻配置，复杂节点折叠：`GameplayDefinitionEditor` 默认展示目标 / 氛围 / 素材 / 禁止事项 / 结算，高级节点在 `<details>`。
- [x] AI 决策落结构化事件：`AIDirector` 输出转 `GameplayEvent`，非法输出 fallback。
- [x] fallback 可回放：seed 来源是 `session_id + turn_count + node_id`。
- [x] session 不进入 Tavern 公开字段：专用 API 按权限返回。
- [x] 完成结算默认只写 session completion，不自动写长期记忆。

## 3. 测试约束核对

- [x] 功能点 A：玩法定义模型
  - 验证方式：`py -3 -m pytest -q --tb=short tests/test_tavern_gameplay_models.py`；后续全量 pytest 也覆盖。
  - 结果：覆盖默认节点、非法节点引用、fallback seed、AI Director 合法 / 非法输出。
- [x] 功能点 B：会话持久化与权限
  - 验证方式：`py -3 -m pytest -q --tb=short tests/test_tavern_gameplay_api.py`；后续全量 pytest 也覆盖。
  - 结果：覆盖 owner 保存、访客只看 published、跨访客 403、更新 Tavern 不擦 session、导出排除 session。
- [x] 功能点 C：AI Director / fallback
  - 验证方式：模型测试 + API 测试。
  - 结果：合法 AI JSON 推进，非法 JSON / 无 LLM fallback，完成结算写入。
- [x] 功能点 D：默认公益酒馆玩法
  - 验证方式：`tests/test_default_public_welfare_gameplays.py`；后续全量 pytest 覆盖。
  - 结果：4 个公益酒馆各至少 1 个 published 玩法，rules 后端可 start/advance。
- [x] 功能点 E：店主 UI 契约
  - 验证方式：`npm --prefix .\frontend test` 中 `gameplay-test.mjs`。
  - 结果：检查 service API、GameplayManager、GameplayDefinitionEditor、OwnerPanel 接入。
- [x] 功能点 F：访客 UI 契约
  - 验证方式：`npm --prefix .\frontend test` + `npm --prefix .\frontend run build`。
  - 结果：检查 launcher/session panel/TavernChatRoom 接入，Vite build 通过。

本轮最终验证输出：

- `npm --prefix .\frontend test`：service / play-modes / mini-games / gameplay / personality / readiness 脚本全部输出 `ok`，exit 0。
- `npm --prefix .\frontend run build`：Vite build exit 0；保留既有 chunk size warning。
- `py -3 -m compileall -q fablemap`：exit 0。
- `py -3 -m pytest -q --tb=short`：`228 passed in 9.59s`。
- `py -3 easysdd/tools/validate-yaml.py --file ... --yaml-only`：`1 passed, 0 failed`。

前端人工浏览器验证：本轮执行环境没有可操作浏览器目标；已用 Vite production build 与脚本契约测试覆盖编译和关键 UI 接入。后续真实浏览器可重点点验：店主“玩法”按钮、访客“可玩的内容”、选择 / 自由输入 / 完成 / 放弃。

## 4. 术语一致性

grep 结果（代码 / 测试 / 文档）：

- `GameplayDefinition`：17 处，均指玩法定义。
- `GameplayNode`：2 处，均指玩法节点。
- `GameplayChoice`：2 处，均指玩法选项。
- `GameplaySession`：71 处，均指玩法会话。
- `GameplayEvent`：13 处，均指玩法事件。
- `AI Director`：18 处，均指玩法主持服务。
- `gameplay_definitions`：34 处，均指 Tavern 公开玩法定义字段。
- `_gameplay_sessions`：21 处，均指 Store 私有会话桶。

防冲突结论：未把 Gameplay 与 `chat_templates`、`tavernMiniGames`、`tavernPlayModes` 混用；文档中已区分轻量聊天模板、本地冒险工会与持久化 Gameplay System。

## 5. 架构归并

已实际更新：

- [x] `docs/ARCHITECTURE.md`：补 Gameplay Definition / Session API、Gameplay UI、AI Director / fallback、API 端点、数据持久化和安全边界。
- [x] `docs/WORLD_SCHEMA.md`：补 `gameplay_definitions`、`GameplayDefinition`、`GameplayNode`、`GameplaySession`、`GameplayEvent`，并更新版本历史。
- [x] `README.md`：补当前原型状态、后端 / 前端模块和 Gameplay API 端点。
- [x] `docs/INDEX.md`：更新 WORLD_SCHEMA 对 Gameplay 数据模型的索引说明。
- [x] `easysdd/architecture/DESIGN.md`：补 Gameplay 术语、模块索引、架构决定和约束。
- [x] `easysdd/architecture/gameplay-system.md`：新增 Gameplay System 子系统架构说明，记录模块边界、数据流、持久化、权限和验证入口。

## 6. 遗留

- 已知限制：未做浏览器人工点击验证；需要在真实前端环境重点检查店主弹窗和访客会话面板交互手感。
- 后续优化：如需要 AI 辅助生成玩法草稿，应另起 feature，并必须保持“店主确认后发布”的边界。
- 顺手发现：进入本轮前已有未提交前端改动（`TavernEntryPanel.jsx`、`WorldStageTavernDiscoveryLane.jsx`、`styles.css` 等）；本 feature 未主动改这些文件，仅保持工作区现状。
