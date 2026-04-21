---
doc_type: feature-design
feature: 2026-04-21-ai-mini-game-templates
status: approved
summary: 为酒馆聊天内置老少皆宜的 AI 主持小游戏模板，访客点选后由当前 NPC 开局主持。
tags: [tavern, mini-games, ai-npc, play-mode, frontend]
---

# AI 主持小游戏模板库 Design

## 0. 术语约定

| 术语 | 定义 | 防冲突结论 |
|---|---|---|
| AI 主持小游戏模板 | 前端内置的轻量玩法卡片，包含标题、说明、预计时长和开局提示；点击后把开局提示发送给当前 NPC。 | grep 未发现已有同名模块；使用英文模块名 `tavernMiniGames`，避免和现有 `tavernPlayModes` 混淆。 |
| 玩法模式（Play Mode） | 现有 `inferTavernPlayMode()` 推断出的酒馆玩法类型，如 `chat`、`text_game`、`clue_game`、`guild`。 | 已存在于 `frontend/src/tavernPlayModes.js` 和 `docs/superpowers/specs/2026-04-21-play-mode-consolidation-design.md`，本 feature 只消费它，不重命名。 |
| 小游戏开局提示 | 由模板生成的一条用户消息，内容要求 NPC 以老少皆宜、安全无压力的格式主持一局小游戏。 | 不进入后端 PromptBuilder；沿用现有 `handleSend()` 发送链路和 ChatMessage 落库。 |
| 游戏状态 | 小游戏当前局面的状态。首版不新增结构化状态，只由聊天上下文承载。 | 避免和现有冒险工会 localStorage 进度、VisitorState、ChatMessage schema 冲突。 |

术语 grep 记录：

- `小游戏` / `轻文字` / `文字游戏`：README、现有前端模板、`tavernPlayModes.js` 已使用，说明方向一致。
- `play mode` / `玩法模式`：已由 `tavernPlayModes.js` 承载，本 feature 不新增平行推断系统。
- `冒险工会` / `任务板`：已有本地任务板与声望逻辑；本 feature 不改其进度规则。
- `二十问` / `故事接龙` / `抽卡占卜`：未发现现有实现，可作为新内置模板。

归档检索记录：

- `easysdd/compound`：无 `.md` 文档。
- `easysdd/features`：无已存在的 `feature-design` 命中。
- `easysdd/architecture`：无专项子系统文档命中，当前仍以 `docs/ARCHITECTURE.md` 和 `easysdd/architecture/DESIGN.md` 为架构入口。

## 1. 决策与约束

### 需求摘要

目标：为访客侧酒馆聊天增加一组内置小游戏入口。访客进入酒馆并选择 NPC 后，可以直接点选“开始一局”类按钮，由 AI NPC 主持一局 3-10 分钟的轻量小游戏。

服务对象：

- 探索者：不需要自己想第一句话，能快速进入可玩的互动。
- 店主：无需新增配置即可让自己的酒馆有更多可玩入口；角色和场景仍保持店主创作主权。

成功标准：

- 聊天区能展示 6 个老少皆宜小游戏模板：线索调查、猜谜问答、故事接龙、抽卡占卜、二十问、小委托。
- 点击任一模板会调用现有发送链路，向当前 NPC 发送带安全边界的开局提示。
- 模板逻辑可由脚本测试覆盖：唯一 id、可见文案、开局提示、安全边界、玩法模式排序。
- 不修改 Tavern / TavernCharacter / WorldInfoEntry / VisitorState / ChatMessage schema。

明确不做：

- 不做战斗、等级装备、竞技排行榜、传统 RPG 任务系统。
- 不做复杂状态机、跨设备游戏进度同步、多人访客社交。
- 不让平台自动生成酒馆内容；模板只提供通用玩法结构和开局提示。
- 不新增后端 API、不新增依赖、不引入 UI 框架或游戏引擎。
- 不改现有冒险工会声望、任务板和 localStorage 进度语义。

### 关键决策

1. **放置层级：Tavern Experience 前端层。**
   该功能属于酒馆内部体验增强，最自然落点是现有 `TavernChatRoom.jsx` 周边。模板和提示生成放入新文件 `frontend/src/tavernMiniGames.js`，UI 放入新组件 `frontend/src/TavernMiniGamePanel.jsx`。

2. **首版用纯前端内置模板，不进入 Tavern schema。**
   这样可以避免协议变更和 SillyTavern 导入/导出兼容风险。后续如果要做店主可配置玩法，再单独走 schema/API 设计。

3. **点击模板 = 发送一条用户消息。**
   不绕过 LLM，不新增后端主持逻辑。现有聊天历史、记忆写回、LLM 降级都沿用当前链路。

4. **状态只放在对话里。**
   除冒险工会已有本地进度外，首版小游戏不新建 localStorage 进度。访客刷新后可从聊天历史继续，也可重新开局。

5. **被拒方案：把小游戏做成完整配置系统。**
   这会涉及店主管理 UI、数据持久化、导入导出和权限边界，超出本轮“增强可玩性”的最小闭环。

### 主流程概述

正常路径：

1. 访客进入酒馆，选择一个 NPC。
2. `TavernChatRoom` 根据当前 `playMode`、酒馆和角色读取可用小游戏模板。
3. `TavernMiniGamePanel` 显示 6 个模板按钮，优先展示与当前玩法模式更相关的模板。
4. 访客点击模板。
5. 前端用 `buildMiniGameStartPrompt()` 生成开局提示，并调用现有 `handleSend(prompt)`。
6. NPC 按提示主持本局小游戏，后续由普通聊天继续推进。

边界路径：

- 没有选中 NPC：小游戏面板不渲染或按钮禁用。
- 正在发送消息：按钮禁用，避免重复开局。
- 当前是群聊：点击模板仍走 `handleSend()`，由群聊已有逻辑决定哪些角色回应；提示文案不假设只有一个 NPC。
- LLM 不可用：沿用现有聊天降级/错误提示，不新增错误路径。

## 2. 接口契约

### 新增纯函数模块：`frontend/src/tavernMiniGames.js`

```js
export const MINI_GAME_TEMPLATES = [
  { id: 'clue-trail', title: '线索调查', icon: '🔎', duration: '5-8 分钟', summary: 'NPC 给出线索，访客选择调查行动。', tags: ['clue', 'family-friendly'] },
  { id: 'riddle-quiz', title: '猜谜问答', icon: '🧩', duration: '3-5 分钟', summary: 'NPC 出题、给提示、最后揭晓答案。', tags: ['riddle', 'family-friendly'] },
  { id: 'story-relay', title: '故事接龙', icon: '📚', duration: '5-8 分钟', summary: '访客和 NPC 轮流续写一段短故事。', tags: ['story', 'family-friendly'] },
  { id: 'card-reading', title: '抽卡占卜', icon: '🃏', duration: '3-5 分钟', summary: '抽一张象征卡，NPC 做轻松解读。', tags: ['card', 'family-friendly'] },
  { id: 'twenty-questions', title: '二十问', icon: '❓', duration: '5-10 分钟', summary: '访客通过是/否问题猜 NPC 想的东西。', tags: ['question', 'family-friendly'] },
  { id: 'tiny-quest', title: '小委托', icon: '📜', duration: '3-8 分钟', summary: '接一个安全小任务，完成后得到文字奖励。', tags: ['quest', 'family-friendly'] },
]
// 来源：新增 frontend/src/tavernMiniGames.js MINI_GAME_TEMPLATES
```

```js
getMiniGameTemplates({ playModeId: 'clue_game' }).map((item) => item.id)
// => ['clue-trail', 'riddle-quiz', 'story-relay', 'card-reading', 'twenty-questions', 'tiny-quest']
// 来源：新增 frontend/src/tavernMiniGames.js getMiniGameTemplates
```

```js
buildMiniGameStartPrompt(MINI_GAME_TEMPLATES[1], {
  tavernName: '第三中学传达室',
  characterName: '刘大爷',
})
// => "我想和你玩一局《猜谜问答》。请你以刘大爷的身份主持一局 3-5 分钟的老少皆宜小游戏。请先出一道和这间酒馆氛围相关、无需专业知识的谜题，再给出【规则】【谜题】【可选回答方式】【提示次数】。不要涉及血腥、成人、真实危险行动，不索取隐私，不给医疗、法律或金融结论。"
// 要求输出中包含：模板标题、角色称呼、老少皆宜、安全边界、2-3 个可选行动或回答方式。
// 来源：新增 frontend/src/tavernMiniGames.js buildMiniGameStartPrompt
```

错误/兜底示例：

```js
buildMiniGameStartPrompt(null, { characterName: '' })
// => ""
// 来源：新增 frontend/src/tavernMiniGames.js buildMiniGameStartPrompt
```

约束：

- 每个模板必须有唯一 `id`。
- 每个模板必须带 `family-friendly` 或等价安全标记。
- 开局提示必须显式要求“不涉及血腥、成人、真实危险行动，不索取隐私，不给医疗/法律/金融结论”。
- 不在模板对象中写酒馆专属剧情；只写通用玩法框架。

### 新增组件：`frontend/src/TavernMiniGamePanel.jsx`

```jsx
<TavernMiniGamePanel
  templates={miniGameTemplates}
  sending={false}
  disabled={false}
  onStart={(template) => handleMiniGameStart(template)}
/>
// 渲染：一个标题为“和 NPC 玩一局”的区域 + 6 个模板按钮。
// 事件：点击按钮调用 onStart(template)。
// 来源：新增 frontend/src/TavernMiniGamePanel.jsx TavernMiniGamePanel
```

错误/禁用示例：

```jsx
<TavernMiniGamePanel
  templates={[]}
  sending={false}
  disabled={false}
  onStart={() => {}}
/>
// 渲染：null，不显示空面板。
// 来源：新增 frontend/src/TavernMiniGamePanel.jsx TavernMiniGamePanel
```

状态归属：

- 模板列表：由 `TavernChatRoom` 计算后通过 props 传入。
- 按钮禁用状态：由 `sending` / `selectedChar` 决定，组件内部不维护发送状态。
- 是否展开/收起：首版不做折叠状态，减少交互复杂度；如移动端太占空间，后续单独迭代。

### 变更组件：`frontend/src/TavernChatRoom.jsx`

新增接入示例：

```jsx
const miniGameTemplates = useMemo(
  () => getMiniGameTemplates({ playModeId: playMode.id, tavern, character: selectedChar }),
  [playMode.id, tavern, selectedChar],
)

function handleMiniGameStart(template) {
  const prompt = buildMiniGameStartPrompt(template, {
    tavernName: roomName,
    characterName: selectedChar?.name,
    playModeLabel: playMode.label,
  })
  if (prompt) handleSend(prompt)
}
// 来源：frontend/src/TavernChatRoom.jsx playMode/useMemo/handleSend 现有结构
```

渲染位置：

```jsx
<TavernMiniGamePanel
  templates={miniGameTemplates}
  sending={sending}
  disabled={!selectedChar}
  onStart={handleMiniGameStart}
/>
<ChatInputArea
  onSend={handleSend}
  sending={sending}
  character={selectedChar}
  placeholder={groupChatEnabled ? '对群聊里的所有角色说话' : undefined}
  voiceConfig={voiceConfig}
  tavernId={roomId}
  quickPrompts={quickPrompts}
/>
// 来源：frontend/src/TavernChatRoom.jsx ChatInputArea 渲染位置
```

放在输入区上方，原因：

- 现有快捷句已经在输入区内，小游戏入口属于“更明确的开局方式”，应靠近发送动作。
- 不放入 `TavernEntryPanel` 首版按钮，避免入场页需要提前知道当前角色和发送上下文。

### 样式契约

新增 `frontend/src/tavernMiniGames.css` 并由 `TavernMiniGamePanel.jsx` 引入，避免继续膨胀当前 12k+ 行的 `styles.css`。

```css
.tavern-mini-game-panel { margin: 12px 0; padding: 12px; border-radius: 16px; }
.tavern-mini-game-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; }
.tavern-mini-game-card { text-align: left; border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 12px; }
/* 来源：新增 frontend/src/tavernMiniGames.css */
```

移动端约束：

- 小屏下模板按钮单列或横向可换行。
- 按钮文本不能依赖 hover 才可读。
- 不遮挡聊天输入框和发送按钮。

## 3. 实现提示

### 目标文件状况评估结论

- `frontend/src/tavernPlayModes.js` 当前约 365 行，职责已包括玩法推断、快捷句、冒险工会进度、任务板与 prompt 生成。继续把 6 个小游戏模板塞入该文件会让“玩法推断”和“模板库”职责混在一起。
- `frontend/src/TavernChatRoom.jsx` 当前约 1432 行，已承担角色列表、聊天消息、语音、表情、群聊、记忆、上下文、冒险工会面板等职责。新增 UI 应通过独立组件接入，避免继续扩充大组件。
- `frontend/src/styles.css` 当前超过 12k 行；小游戏样式建议新建 CSS 文件并由新组件导入。

结论：本 feature 需要新建内聚文件，只在 `TavernChatRoom.jsx` 做薄接入，不做大范围重构。

### 改动计划

允许修改范围：

- `frontend/src/tavernMiniGames.js`（新建）
- `frontend/src/TavernMiniGamePanel.jsx`（新建）
- `frontend/src/tavernMiniGames.css`（新建）
- `frontend/src/TavernChatRoom.jsx`（薄接入）
- `frontend/scripts/mini-games-test.mjs`（新建）
- `frontend/package.json`（追加测试脚本）
- `README.md` 或 `docs/changes/YYYY-MM-DD-*.md`（实现完成后记录用户可见变化）

不允许修改范围：

- 后端 API、`fablemap/tavern.py`、`fablemap/web/router.py`
- `docs/WORLD_SCHEMA.md` 的数据结构
- 现有冒险工会声望/任务板语义
- LLM 配置、API Key、Token 统计相关逻辑

### 推进顺序

1. **先写失败的小游戏纯函数脚本测试。**
   新建 `frontend/scripts/mini-games-test.mjs`，先覆盖模板数量、id 唯一、排序、兜底、prompt 安全约束，并确认在实现前因缺少模块或导出而失败。
   退出信号：`node frontend/scripts/mini-games-test.mjs` 在实现前失败，失败原因指向缺少 `tavernMiniGames.js` 模块或相关导出。

2. **新建小游戏模板纯函数模块。**
   新建 `frontend/src/tavernMiniGames.js`，定义 6 个模板、排序函数、开局提示生成函数。
   退出信号：`node frontend/scripts/mini-games-test.mjs` 输出 `mini-games-test: ok`，且模板 id 唯一、开局提示包含模板标题和安全边界。

3. **新建小游戏面板组件与样式。**
   新建 `TavernMiniGamePanel.jsx` 和 `tavernMiniGames.css`，组件只接收 props，不发请求、不读写 localStorage。
   退出信号：组件能在无模板时返回 null，在有模板时渲染按钮并调用 `onStart(template)`。

4. **薄接入 TavernChatRoom。**
   在 `TavernChatRoom.jsx` 中计算模板、处理点击、放到输入区上方；不改 `handleSend()` 的语义。
   退出信号：点击模板后走现有单聊/群聊发送链路；`ChatInputArea` 快捷句仍保留。

5. **接入前端测试脚本与文档记录。**
   更新 `frontend/package.json` 的 `test`，实现完成后补充 README 或 change 文档。
   退出信号：`npm --prefix .\frontend test` 包含 mini-games 测试；文档说明不涉及 schema/API 变更。

6. **构建与移动端样式收口。**
   检查样式在窄屏下不遮挡输入区，运行前端 build。
   退出信号：`npm --prefix .\frontend run build` 成功；如存在既有 chunk size warning，只记录不在本 feature 解决。

### 实现风险与约束

- 不要把小游戏模板写成酒馆剧情内容；模板只定义玩法框架。
- 不要在 `tavernPlayModes.js` 里继续堆大量新常量；该文件保留玩法推断和冒险工会现有职责。
- 不要为了“本局进行中”新增 localStorage 或 VisitorState 字段；首版用聊天上下文承载。
- 开局提示必须对高风险内容有负面约束，尤其是抽卡占卜不能变成命运断言或医疗/法律/金融建议。
- 群聊情况下不特殊分叉，让现有群聊发送链路处理角色回应。

### 测试设计

功能点 A：模板库完整性

- 测试约束：`MINI_GAME_TEMPLATES` 恰好包含 6 个首批模板。
- 关键用例：id 唯一；title/summary/icon/duration 存在；每个模板有安全标签。

功能点 B：玩法模式排序

- 测试约束：线索调查酒馆优先展示 `clue-trail`；冒险/任务语境优先展示 `tiny-quest`；普通聊天仍展示全部模板。
- 关键用例：`getMiniGameTemplates({ playModeId: 'clue_game' })[0].id === 'clue-trail'`。

功能点 C：开局提示安全边界

- 测试约束：每个模板生成 prompt 时包含模板标题、角色名或默认称呼、老少皆宜约束和禁止高风险内容约束。
- 关键用例：抽卡占卜 prompt 包含“不做命运断言 / 不给医疗法律金融结论”。

功能点 D：面板交互

- 测试约束：组件无模板返回 null；有模板时按钮传回对应模板；sending 或 disabled 时按钮禁用。
  首版可通过纯函数/轻量组件结构检查覆盖，若项目后续引入 React 测试框架再补 DOM 测试。

功能点 E：现有玩法不回归

- 测试约束：`frontend/scripts/play-modes-test.mjs` 继续通过；冒险工会声望、任务板、自定义委托奖励不变。

验证命令：

- `npm --prefix .\frontend test`
- `npm --prefix .\frontend run build`

## 4. 与项目级架构文档的关系

关联架构：

- `docs/ARCHITECTURE.md` 第四层 Tavern Experience：本 feature 增强酒馆内部互动，属于 Tavern Experience / Chat Panel 周边能力。
- `docs/ARCHITECTURE.md` 第五层 AI Dialogue Layer：小游戏通过普通用户消息触发 AI NPC 回复，不新增 PromptBuilder 后端层。
- `docs/WORLD_SCHEMA.md`：本 feature 不改 Tavern / Character / WorldInfo / VisitorState / ChatMessage schema。
- `docs/WHAT_NOT_TO_BUILD.md`：本 feature 避免战斗、等级装备、排行榜、传统 RPG 和平台生成酒馆内容。

是否需要更新架构总入口：

- 首版不需要新增 `easysdd/architecture/*` 子系统文档；它是现有 Tavern Experience 的前端局部增强。
- 实现完成后建议在 README 当前原型状态或 `docs/changes/` 中补一条“AI 主持小游戏模板库”，作为用户可见变化记录。
