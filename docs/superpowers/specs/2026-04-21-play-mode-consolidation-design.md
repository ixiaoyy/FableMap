# Play Mode Consolidation Design

**Date:** 2026-04-21
**Scope:** 收敛当前未提交的前端体验迭代：玩法识别、快捷开始、NPC 性格模板、开店向导模板化与冒险工会轻文字玩法。

## Context

当前工作区已有一轮未提交的体验迭代，覆盖 `frontend/src/tavernPlayModes.js`、`frontend/src/personalityTemplates.js`、`TavernChatRoom.jsx`、`TavernCreatePanel.jsx`、`CharacterEditor.jsx`、`tavernTemplates.js`、发现/详情/入场面板和 README。基线验证已通过：Python 编译、`pytest`、前端 build、前端脚本测试均为绿色。下一步不扩新大功能，而是把这批改动收敛为可维护、可验证、可交付的小切片。

## Goal

让“不会说什么就点一下”“NPC 模板一键补齐”“轻文字任务/冒险工会”这批体验能力具备明确边界、可回归测试和文档记录，降低后续继续迭代时的回归风险。

## Approved Approach

采用 **方案 A：收敛当前未提交迭代**。

- 不新增大型产品能力。
- 不重构地图主舞台或后端主链路。
- 优先补测试、抽小的纯函数、修明确边界问题、记录变更。
- 每轮最多聚焦一个切片，每轮完成后运行验证。

## Architecture

### 1. Play Mode / Guild Utilities

`frontend/src/tavernPlayModes.js` 继续作为玩法识别和冒险工会本地状态的唯一来源：

- `inferTavernPlayMode()`：根据空间/角色/书签文本推断聊天、帮助、文字游戏、线索调查、冒险工会。
- `getTavernPlayBadges()`：为发现、详情、入场 UI 提供简短玩法标签。
- `getGuildQuestBoard()` / `updateGuildProgress()` / `getGuildTier()`：维护本地任务板、声望和身份。

本轮重点补齐边界测试，并修正自定义委托与默认委托同 ID 时奖励来源优先级：界面传入的实际 quest 应优先于内置默认 quest。

### 2. NPC Personality Templates

`frontend/src/personalityTemplates.js` 保持为纯前端模板库：

- 模板可“补空字段”或“覆盖应用”。
- 标签和备用开场白去重合并。
- 推荐逻辑基于名称、标签、描述、性格、场景、系统指令和开场白。

本轮补脚本级单元测试，确保模板合并/覆盖和推荐不会在 UI 变更时悄悄退化。

### 3. Tavern Create Readiness

开店向导当前在 `TavernCreatePanel.jsx` 内计算“开门检查”。为降低组件复杂度并便于回归测试，本轮抽出小型纯函数模块：

- 新增 `frontend/src/tavernCreateReadiness.js`
- 导出 `getWizardReadiness(form, hasLlmConfig)`
- `TavernCreatePanel.jsx` 只负责渲染结果

该模块只评估坐标、名称、简介、场景、NPC、开场白、AI 配置，不发请求、不读写浏览器状态。

### 4. Documentation

新增变更记录，说明本次收敛包含的用户价值、验证命令和仍未解决的风险。README 保持当前轻量描述，不扩展为长文档。

## Data Flow

1. 店主在创建向导选择模板或添加系统 NPC。
2. `TavernCreatePanel` 调用模板数据生成表单内容，并通过 `getWizardReadiness()` 展示开门检查。
3. 访客在发现页、详情页、入场页看到 `inferTavernPlayMode()` 推断出的玩法说明。
4. 进入空间后，`TavernChatRoom` 展示快捷句；冒险工会模式显示任务板。
5. 冒险工会状态通过 `saveGuildProgress()` 存入 localStorage；发送给 LLM 的内容通过 `buildGuildActionPrompt()` 保持老少皆宜的任务格式。

## Error Handling

- localStorage 不可用时，冒险工会进度降级为内存默认状态。
- 无效或缺失 form 字段时，开门检查返回未完成状态，而不是抛异常。
- 未匹配到玩法关键词时，默认退回“轻松聊天”。
- 模板搜索无结果时 UI 显示空态，不改变草稿。

## Testing Strategy

本轮新增/扩展前端脚本测试，和现有验证组合一起跑：

- `frontend/scripts/play-modes-test.mjs`：玩法推断、任务板、声望、localStorage 读写、自定义委托奖励。
- `frontend/scripts/personality-templates-test.mjs`：模板补空、覆盖、去重、推荐。
- `frontend/scripts/tavern-create-readiness-test.mjs`：开门检查纯函数。
- `npm --prefix .\frontend test` 串起所有前端脚本测试。
- 保持 `py -3 -m compileall -q fablemap`、`py -3 -m pytest -q --tb=short`、`npm --prefix .\frontend run build` 作为每轮或最终验证。

## Out of Scope

- 不实现远端市场/发布/审核。
- 不把冒险工会进度同步到后端。
- 不新增复杂剧情状态机。
- 不修改 LLM 后端、PromptBuilder 或群聊 API 协议。
- 不解决 Vite 当前 chunk size 警告，只在风险中记录。

## Self-review

- Placeholder scan: 无 TBD/TODO/稍后补。
- Consistency: 设计中的模块路径和现有前端结构一致。
- Scope: 单一目标为收敛当前未提交体验迭代，未引入独立新系统。
- Ambiguity: 明确本轮只做测试、纯函数抽取、边界修复和文档，不做新大功能。
