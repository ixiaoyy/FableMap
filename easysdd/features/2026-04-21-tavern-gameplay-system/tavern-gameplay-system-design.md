---
doc_type: feature-design
feature: 2026-04-21-tavern-gameplay-system
status: approved
summary: 支持店主轻配置完整酒馆玩法，AI 导演推进结构化会话，并为默认公益酒馆预置专属剧情玩法。
tags: [tavern, gameplay, ai-director, session, public-welfare]
---

# AI 导演的酒馆玩法系统 Design

## 0. 术语约定

| 术语 | 定义 | 防冲突结论 |
|---|---|---|
| GameplayDefinition（玩法定义） | 店主发布在某间酒馆内的可玩体验定义，包含标题、目标、氛围、安全边界、节点、随机事件和结算规则。 | 新术语。不要复用现有 `chat_templates`，后者是聊天模板；不要和 `tavernMiniGames` 的固定小游戏模板混用。 |
| GameplayNode（玩法节点） | 玩法内部的结构化步骤，包含一段局面说明、可选选项、完成条件和 fallback 事件池。 | 新术语。节点是内部表达，不要求店主手动画复杂流程图。 |
| GameplayChoice（玩法选项） | 某个节点下访客可选的推进动作，可指向下一节点或触发完成。 | 新术语。不是战斗指令、装备或传统 RPG 行动。 |
| GameplaySession（玩法会话） | 某个访客在某间酒馆开启的一局玩法进度，保存当前节点、状态、事件日志和结算。 | 新术语。区别于群聊 session、ChatMessage 历史和 VisitorState。 |
| GameplayEvent（玩法事件） | 玩法会话中的一次状态变化，如开始、选择、AI 推进、fallback 随机事件、完成、放弃。 | 新术语。区别于旧 world writeback event；本 feature 不改旧写回协议。 |
| AI Director（AI 导演） | 后端根据玩法定义、当前节点、访客输入、酒馆/NPC 设定决定下一步的服务。 | 新术语。AI 只在店主定义的范围内主持，不替平台自动发布酒馆内容。 |
| Public Welfare Gameplay（公益玩法） | 默认公益酒馆内置的 GameplayDefinition，跟各自酒馆主题和角色贴合。 | 新术语。只用于平台自带公益样例，不泛化成平台替所有店主生成内容。 |
| Play Mode（玩法模式） | 现有 `tavernPlayModes.js` 根据酒馆文本推断出的聊天提示模式。 | 既有术语。保留用于推荐/入口提示，不承担结构化玩法状态。 |

术语 grep 结果：

- `tavernMiniGames.js` / `TavernMiniGamePanel.jsx` 已有“AI 主持小游戏模板库”，但没有结构化会话；本 feature 是上层完整玩法系统。
- `tavernPlayModes.js` 已有 Play Mode、冒险工会本地进度和 `guild_quests` 兼容逻辑；本 feature 不把它扩成通用玩法引擎。
- `Tavern` 已有 `chat_templates` 元数据桶；本 feature 新增 `gameplay_definitions`，避免聊天模板语义污染。
- `easysdd/compound/` 无相关沉淀；已有 feature-design 检索未命中完整 gameplay 系统。

## 1. 决策与约束

### 需求摘要

本 feature 要做一个 **AI 导演的轻配置完整酒馆玩法系统**。

服务对象：

- 店主：可以用简单表单添加任意文本型玩法，而不是被迫编辑复杂节点图。
- 访客：可以在酒馆内开始、继续、完成一局玩法，并看到结构化进度和结算。
- 平台默认公益酒馆：各自预置贴合主题的玩法和专属剧情，让新安装也能直接体验。

成功标准：

- 店主能创建 / 编辑 / 发布 / 停用至少一个 GameplayDefinition。
- 访客能看到当前酒馆已发布玩法，开始一局 GameplaySession，并在刷新后恢复进度。
- 每局玩法保存 `started / in_progress / completed / abandoned` 状态、当前节点、事件日志和结算文本。
- 有可用 AI 时，AI Director 返回结构化推进结果；无 AI 或 AI 失败时，系统按节点默认选项 / 随机事件池兜底。
- 4 个默认公益酒馆各有至少 1 个专属玩法，且不用外部 API Key 也可运行。
- 酒馆包导出包含玩法定义，但不包含访客 GameplaySession / GameplayEvent 数据。

明确不做：

- 不支持店主上传可执行脚本、JS、Python、表达式求值或任意代码。
- 不做战斗、等级装备、竞技排行榜、传统 RPG 任务系统。
- 不做访客间聊天、组队、好友、跨酒馆玩家社交。
- 不做路线规划、实地打卡、导航任务或传统地图 App 功能。
- 不让平台自动替普通店主发布酒馆剧情；AI 辅助生成如后续加入，也必须是店主确认后的草稿。
- 不改 ChatMessage schema；玩法进度进入 GameplaySession / GameplayEvent。

### 关键决策

1. **新增 Gameplay 子系统，而不是继续塞进聊天模板。**
   玩法定义是酒馆内容的一部分，玩法会话是访客运行时数据；它们和 `chat_templates` / `tavernMiniGames` 语义不同。后端新增 `fablemap/gameplay.py` 承载模型、归一化和 AI Director，`fablemap/tavern.py` 只做最小字段接入。

2. **店主侧轻配置，底层节点分支。**
   店主默认只填写玩法目标、素材、氛围、禁止事项、结局/奖励文案；系统生成基础节点。高级区允许编辑节点和随机事件，但折叠隐藏，避免配置负担。

3. **AI 决策必须落到结构化事件。**
   AI 可以决定下一步、生成叙事和结算，但必须返回可校验的结构化结果：`action`、`next_node_id`、`narration`、`event_type`、`completed`。解析失败时降级到 fallback。

4. **无 AI 时用可回放的随机事件。**
   fallback 看起来像随机，但用 `session_id + turn_count + node_id` 生成可复现 seed；事件结果写入 GameplayEvent，便于测试和回放。

5. **玩法会话不写入 Tavern 公开字段。**
   `gameplay_definitions` 属于 Tavern schema；`_gameplay_sessions` 是 TavernStore 私有扩展桶，类似 `_visitors` / `_memory_atoms`，只按权限返回给访客本人或店主。

6. **默认公益酒馆只预置安全、低风险、主题贴合玩法。**
   - 新手旅人服务站：开店路线演练 / 隐私选择模拟。
   - 深夜树洞电台：匿名留言整理 / 给未来自己的短讯。
   - 社区修补铺：今日一件小修补 / 工具箱随机事件。
   - 城市失物档案亭：三步线索登记 / 失物档案调查。

7. **完成结算默认只进玩法会话，不自动进长期记忆。**
   为避免隐私和语义过重，首版完成后生成 `completion.summary` 和 `reward_text`。是否额外创建 MemoryAtom 作为玩法定义里的显式选项，默认关闭。

### 被拒方案

- **只做玩法卡 / 快捷句**：实现轻，但没有结构化进度和结算，不满足“完整可用”。
- **纯 AI 自由主持**：店主配置最少，但不可验证、不可回放，AI 失败时体验不可控。
- **完整脚本引擎**：表达力强，但安全和复杂度过高，容易偏向传统游戏系统。
- **把玩法进度写入 VisitorState**：会污染访客关系模型；GameplaySession 更适合表达局内状态。

### 主流程概述

正常路径：

1. 店主打开某酒馆的“玩法”管理入口。
2. 填写玩法名称、目标、简介、素材、禁止事项和结局文案。
3. 系统归一化为 GameplayDefinition，必要时补默认 `start / middle / complete` 节点和 fallback 事件。
4. 访客进入酒馆，在聊天区上方或上下文区看到“可玩的内容”。
5. 访客点击开始，后端创建 GameplaySession，并返回首个节点叙事和选项。
6. 访客选择选项或输入自由文本。
7. 有 AI 时，AI Director 决定下一步；无 AI 时 fallback 抽取事件或按默认选项推进。
8. 玩法完成后保存结算，访客可在本酒馆继续查看或回访。

关键边界：

- AI 返回非法 JSON / 指向不存在节点：记录 `fallback` 事件，按当前节点 fallback 推进。
- 访客刷新页面：按 `visitor_id + tavern_id` 拉取 active sessions，恢复当前节点。
- 店主停用玩法：已开始 session 可继续到完成；新访客不再看到入口。
- 店主删除玩法：若有 active sessions，接口默认拒绝并提示先停用；强制删除不在首版做。
- 私人 / 密码酒馆：沿用现有 enter/access 权限；玩法 API 不绕过入场权限。

## 2. 接口契约

### 2.1 后端模型：`fablemap/gameplay.py`

玩法定义示例：

```python
normalize_gameplay_definition({
    "id": "gp_archive_lost_object",
    "title": "三步线索登记",
    "status": "published",
    "summary": "和闻笺一起把失物线索整理成时间、地点、细节三列。",
    "entry_label": "开始登记",
    "mode": "ai_directed_branch",
    "owner_brief": {
        "goal": "帮助访客整理公开线索，不承诺找回。",
        "tone": "安静、条理清楚、温柔悬疑",
        "materials": ["登记册", "空白标签", "台灯"],
        "forbidden": ["索取身份证件", "索取住址或手机号", "承诺一定找回"]
    },
    "nodes": [
        {
            "id": "start",
            "kind": "scene",
            "narration": "闻笺推来一张三列表格：时间、地点、最后一个确定细节。",
            "choices": [
                {"id": "time", "label": "先写时间", "next_node_id": "time"},
                {"id": "place", "label": "先写地点", "next_node_id": "place"}
            ],
            "fallback_events": [
                {"id": "tag_weather", "text": "闻笺抽到一张天气标签，请你补一个天气或光线细节。", "next_node_id": "detail"}
            ]
        }
    ],
    "completion": {
        "complete_node_ids": ["complete"],
        "reward_text": "你得到一张‘线索整理者’纸质标签。",
        "memory_atom": {"enabled": False}
    }
})
# 来源：新增 fablemap/gameplay.py normalize_gameplay_definition
```

归一化规则：

- `id` 缺失时生成 `gp_{uuid}`；`status` 只允许 `draft / published / disabled`。
- `title` 最长 48 字；`summary` 最长 180 字；`owner_brief` 文本字段裁剪，避免 prompt 注入过长。
- `nodes` 为空时自动生成 `start / progress / complete` 三个默认节点。
- 每个 `choice.next_node_id` 必须指向现有节点或为空；无效指向保存前报错。
- `fallback_events` 至少保留 1 条；没有时由 `owner_brief` 生成通用安全 fallback。

会话示例：

```python
GameplaySession(
    id="gps_8f4a",
    tavern_id="pw_lost_found_archive",
    gameplay_id="gp_archive_lost_object",
    visitor_id="visitor_123",
    character_id="char_pw_wenjian",
    state="in_progress",
    current_node_id="time",
    turn_count=2,
    variables={"last_choice_id": "time"},
    events=[...],
    completion=None,
)
# 来源：新增 fablemap/gameplay.py GameplaySession
```

### 2.2 Tavern schema / store

Tavern 新增公开内容字段：

```json
{
  "id": "pw_lost_found_archive",
  "gameplay_definitions": [
    { "id": "gp_archive_lost_object", "title": "三步线索登记", "status": "published" }
  ],
  "_gameplay_sessions": {
    "gps_8f4a": { "visitor_id": "visitor_123", "state": "in_progress" }
  }
}
// 来源：变更 fablemap/tavern.py Tavern.to_dict / Tavern.from_dict；TavernStore 私有扩展桶
```

约束：

- `gameplay_definitions` 进入 `docs/WORLD_SCHEMA.md` 的 Tavern 扩展字段。
- `_gameplay_sessions` 不进入 Tavern 公开 payload，只有专用 API 根据权限返回。
- `TavernStore.update_tavern()` 必须保留 `_gameplay_sessions`，不能被普通酒馆更新擦掉。

### 2.3 后端 API

获取玩法列表：

```http
GET /api/taverns/pw_lost_found_archive/gameplays
X-User-Id: visitor_123
```

```json
{
  "tavern_id": "pw_lost_found_archive",
  "gameplays": [
    {
      "id": "gp_archive_lost_object",
      "title": "三步线索登记",
      "summary": "把失物线索整理成三列。",
      "entry_label": "开始登记",
      "status": "published"
    }
  ]
}
// 来源：新增 fablemap/web/router.py GET /api/taverns/{tavern_id}/gameplays
```

店主保存玩法定义：

```http
PUT /api/taverns/pw_lost_found_archive/gameplays
X-User-Id: system_public_welfare
Content-Type: application/json
```

```json
{
  "gameplays": [
    {
      "id": "gp_archive_lost_object",
      "title": "三步线索登记",
      "status": "published",
      "summary": "把失物线索整理成三列。",
      "owner_brief": {"goal": "整理公开线索"},
      "nodes": []
    }
  ]
}
```

```json
{
  "ok": true,
  "tavern_id": "pw_lost_found_archive",
  "gameplays": [
    {"id": "gp_archive_lost_object", "title": "三步线索登记", "status": "published", "nodes": ["start", "progress", "complete"]}
  ]
}
// 来源：新增 fablemap/web/router.py PUT /api/taverns/{tavern_id}/gameplays
```

错误路径：

```json
{"detail": "只有酒馆主人可以编辑玩法"}
// HTTP 403，来源：新增 fablemap/web/service.py save_gameplays_payload
```

开始或恢复玩法会话：

```http
POST /api/taverns/pw_lost_found_archive/gameplay-sessions
X-User-Id: visitor_123
Content-Type: application/json
```

```json
{"gameplay_id": "gp_archive_lost_object", "character_id": "char_pw_wenjian"}
```

```json
{
  "ok": true,
  "resumed": false,
  "session": {
    "id": "gps_8f4a",
    "state": "in_progress",
    "current_node_id": "start",
    "turn_count": 0
  },
  "scene": {
    "narration": "闻笺推来一张三列表格：时间、地点、最后一个确定细节。",
    "choices": [
      {"id": "time", "label": "先写时间"},
      {"id": "place", "label": "先写地点"}
    ]
  }
}
// 来源：新增 fablemap/web/router.py POST /api/taverns/{tavern_id}/gameplay-sessions
```

推进玩法会话：

```http
POST /api/taverns/pw_lost_found_archive/gameplay-sessions/gps_8f4a/advance
X-User-Id: visitor_123
Content-Type: application/json
```

```json
{"choice_id": "time", "message": "大概是昨天傍晚。"}
```

```json
{
  "ok": true,
  "source": "ai",
  "event": {
    "id": "gpe_33c1",
    "type": "node_changed",
    "from_node_id": "start",
    "to_node_id": "time",
    "narration": "闻笺在时间栏写下‘昨天傍晚’，又把台灯往你这边推近一点。"
  },
  "session": {"id": "gps_8f4a", "state": "in_progress", "current_node_id": "time", "turn_count": 1},
  "scene": {"narration": "接下来补一个地点或光线细节。", "choices": [...]}
}
// 来源：新增 fablemap/web/router.py POST /api/taverns/{tavern_id}/gameplay-sessions/{session_id}/advance
```

AI 不可用 fallback：

```json
{
  "ok": true,
  "source": "fallback",
  "event": {
    "type": "random_event",
    "seed": "gps_8f4a:2:time",
    "narration": "闻笺抽到一张天气标签，请你补一个天气或光线细节。"
  },
  "session": {"state": "in_progress", "current_node_id": "detail"}
}
// 来源：新增 fablemap/gameplay.py FallbackDirector.advance
```

列出访客会话：

```http
GET /api/taverns/pw_lost_found_archive/gameplay-sessions?state=active
X-User-Id: visitor_123
```

```json
{"sessions": [{"id": "gps_8f4a", "gameplay_id": "gp_archive_lost_object", "state": "in_progress"}]}
// 来源：新增 fablemap/web/router.py GET /api/taverns/{tavern_id}/gameplay-sessions
```

放弃会话：

```http
POST /api/taverns/pw_lost_found_archive/gameplay-sessions/gps_8f4a/abandon
X-User-Id: visitor_123
```

```json
{"ok": true, "session": {"id": "gps_8f4a", "state": "abandoned"}}
// 来源：新增 fablemap/web/router.py POST /api/taverns/{tavern_id}/gameplay-sessions/{session_id}/abandon
```

### 2.4 AI Director 结构化返回

AI Director prompt 要求模型只返回 JSON：

```json
{
  "action": "move",
  "next_node_id": "detail",
  "event_type": "node_changed",
  "narration": "闻笺把‘昨天傍晚’贴到登记册左上角。现在还差地点和一个细节。",
  "choices": [
    {"id": "place", "label": "补地点"},
    {"id": "detail", "label": "补细节"}
  ],
  "completed": false
}
// 来源：新增 fablemap/gameplay.py AIDirector.advance
```

校验规则：

- `action` 只允许 `stay / move / complete`。
- `next_node_id` 必须存在；不存在则 fallback。
- `narration` 裁剪到 1200 字，不允许要求隐私、危险行动、医疗/法律/金融结论。
- `completed=true` 时必须生成 `completion.summary` 和 `reward_text`。

### 2.5 前端服务层

```js
const service = getDefaultTavernService()
await service.getGameplays(tavernId, visitorId)
await service.saveGameplays(tavernId, gameplays, ownerId)
await service.startGameplaySession(tavernId, { gameplayId, characterId }, visitorId)
await service.advanceGameplaySession(tavernId, sessionId, { choiceId, message }, visitorId)
await service.listGameplaySessions(tavernId, { state: 'active' }, visitorId)
await service.abandonGameplaySession(tavernId, sessionId, visitorId)
// 来源：变更 frontend/src/services/tavernService.js
```

### 2.6 前端组件

组件拆分：

- `GameplayManager.jsx`：店主后台玩法管理，独立组件，避免继续膨胀 `TavernOwnerPanel.jsx`。
- `GameplayDefinitionEditor.jsx`：轻配置表单 + 折叠高级节点编辑。
- `TavernGameplayLauncher.jsx`：访客侧玩法入口列表。
- `GameplaySessionPanel.jsx`：展示当前节点、选项、自由输入和结算。
- `tavernGameplay.css`：独立样式文件，不追加到超大 `styles.css`。

店主入口示例：

```jsx
<GameplayManager
  tavern={selectedTavern}
  ownerId={ownerId}
  onUpdated={(updatedTavern) => handleGameplayUpdated(updatedTavern)}
/>
// 渲染：玩法列表、创建按钮、发布/停用状态、轻配置编辑表单。
// 来源：新增 frontend/src/GameplayManager.jsx GameplayManager
```

访客入口示例：

```jsx
<TavernGameplayLauncher
  gameplays={publishedGameplays}
  activeSessions={activeGameplaySessions}
  sending={sending}
  onStart={(gameplay) => startGameplay(gameplay)}
  onResume={(session) => resumeGameplay(session)}
/>
// 渲染：贴合当前酒馆的玩法卡；有未完成 session 时显示“继续”。
// 来源：新增 frontend/src/TavernGameplayLauncher.jsx TavernGameplayLauncher
```

会话面板示例：

```jsx
<GameplaySessionPanel
  session={activeSession}
  scene={currentScene}
  busy={gameplayBusy}
  onChoice={(choice) => advanceGameplay({ choiceId: choice.id })}
  onSubmit={(message) => advanceGameplay({ message })}
  onAbandon={() => abandonGameplay(activeSession.id)}
/>
// 渲染：当前叙事、2-4 个选项、自由输入、完成奖励或放弃按钮。
// 来源：新增 frontend/src/GameplaySessionPanel.jsx GameplaySessionPanel
```

状态归属：

- `gameplays`：从后端 Tavern payload / `GET /gameplays` 获取，归 `TavernChatRoom` 或 `TavernInterior` 上层。
- `activeGameplaySessions`：访客态，由 `TavernChatRoom` 拉取并传给 launcher/session panel。
- `gameplayBusy`：组件本地发送状态，不复用聊天 `sending`，避免玩法推进和普通聊天互相锁死。
- 店主编辑草稿：`GameplayManager` 内部 state；保存后刷新 `myTaverns`。

## 3. 实现提示

### 目标文件状况评估结论

- `fablemap/tavern.py` 当前约 65k 字符，已承担 Tavern / Character / WorldInfo / VisitorState / ChatMessage / Store / Service 等职责。Gameplay 模型和推进逻辑必须新建 `fablemap/gameplay.py`，只在 `tavern.py` 做字段、存储和薄服务接入。
- `frontend/src/TavernChatRoom.jsx` 当前约 51k 字符，已承载聊天、群聊、记忆、冒险工会、小游戏入口等逻辑。玩法 UI 必须拆到新组件，只做薄接入。
- `frontend/src/TavernOwnerPanel.jsx` 当前约 82k 字符，店主玩法管理必须独立为 `GameplayManager.jsx`，OwnerPanel 只增加入口和弹窗状态。
- 工作区已有未提交的前端改动：`TavernChatRoom.jsx`、`TavernEntryPanel.jsx`、`WorldStageTavernDiscoveryLane.jsx`、`styles.css`。实现阶段必须先确认这些改动来源，避免覆盖他人工作。

### 改动计划

允许修改范围：

- 后端新增：`fablemap/gameplay.py`
- 后端薄接入：`fablemap/tavern.py`、`fablemap/web/service.py`、`fablemap/web/router.py`
- 默认数据：`fablemap/default_taverns.py`
- 前端新增：`frontend/src/GameplayManager.jsx`、`frontend/src/GameplayDefinitionEditor.jsx`、`frontend/src/TavernGameplayLauncher.jsx`、`frontend/src/GameplaySessionPanel.jsx`、`frontend/src/tavernGameplay.css`
- 前端薄接入：`frontend/src/TavernOwnerPanel.jsx`、`frontend/src/TavernChatRoom.jsx`、`frontend/src/services/tavernService.js`
- 测试新增：`tests/test_tavern_gameplay_models.py`、`tests/test_tavern_gameplay_api.py`、`tests/test_default_public_welfare_gameplays.py`、`frontend/scripts/gameplay-test.mjs`
- 文档同步：`docs/WORLD_SCHEMA.md`、`docs/ARCHITECTURE.md`、`README.md` 或 `docs/changes/YYYY-MM-DD-*.md`、`easysdd/architecture/DESIGN.md`，必要时新增 `easysdd/architecture/gameplay-system.md`

不允许修改范围：

- 不改 ChatMessage 字段结构。
- 不改 SillyTavern 角色卡导入/导出字段映射。
- 不改 LLM API Key 存储和日志策略。
- 不引入新依赖、UI 框架或游戏引擎。
- 不改现有冒险工会 localStorage 语义，除非迁移方案另走 feature。

### 推进顺序

1. **后端玩法模型与归一化测试**
   - 改动：新增 `fablemap/gameplay.py` 和 `tests/test_tavern_gameplay_models.py`，先覆盖 definition/session/event 归一化、非法节点引用、默认节点生成、fallback seed。
   - 退出信号：模型测试通过；无 API 和 UI 变更。

2. **Tavern schema / Store 持久化**
   - 改动：`Tavern` 增加 `gameplay_definitions`；`TavernStore` 增加 `_gameplay_sessions` 读写；更新 `docs/WORLD_SCHEMA.md`。
   - 退出信号：创建 / 更新 Tavern 不擦除 `_gameplay_sessions`；酒馆导出不包含 sessions。

3. **Gameplay API 与权限**
   - 改动：新增 gameplays / gameplay-sessions API、service 封装和权限检查。
   - 退出信号：owner 可保存定义；访客只能看 published；访客本人可 start/advance/abandon 自己的 session；跨访客访问被拒。

4. **AI Director 与 fallback 推进**
   - 改动：实现 `AIDirector`、结构化 JSON 校验、AI 失败 fallback、可复现随机事件。
   - 退出信号：测试覆盖 AI 合法推进、非法 JSON fallback、无 LLM fallback、完成结算。

5. **默认公益酒馆玩法预置**
   - 改动：为 4 个默认公益酒馆加入 `gameplay_definitions`，并补测试。
   - 退出信号：`test_default_public_welfare_gameplays.py` 验证每个公益酒馆至少 1 个 published 玩法，且无外部 API Key 也可 start/advance。

6. **前端 service 与纯脚本测试**
   - 改动：`tavernService.js` 增加 gameplay API 封装；新增 `frontend/scripts/gameplay-test.mjs` 校验前端 helper/契约常量。
   - 退出信号：`npm --prefix .\frontend test` 包含 gameplay 脚本并通过。

7. **店主玩法管理 UI**
   - 改动：新增 `GameplayManager` / `GameplayDefinitionEditor`，OwnerPanel 薄接入。
   - 退出信号：店主能创建、编辑、发布、停用玩法；普通访客看不到 draft/disabled。

8. **访客玩法入口与会话 UI 收口**
   - 改动：新增 launcher/session panel，TavernChatRoom 薄接入，样式独立文件，文档/架构更新。
   - 退出信号：访客能开始、选择、自由输入、刷新恢复、完成/放弃；`npm --prefix .\frontend run build` 通过。

### 实现风险与约束

- 这是协议变更：实现时必须同步 `docs/WORLD_SCHEMA.md`、测试和相关架构文档。
- Gameplay API 不得返回其他访客 session，也不得把 API Key / Token 信息混入 payload。
- AI Director prompt 必须包含安全边界：不索取隐私，不给医疗/法律/金融结论，不要求真实危险行动。
- fallback 随机事件必须记录 seed 和事件 id，避免“随机导致无法验收”。
- 店主轻配置不能变成“复杂流程图必填”；高级节点编辑只能作为折叠选项。
- 默认公益酒馆剧情是平台样例，不代表平台可以自动生成普通店主内容。

### 测试设计

功能点 A：玩法定义模型

- 测试约束：归一化后字段稳定，非法节点引用报错，空节点自动生成安全默认节点。
- 关键用例：`normalize_gameplay_definition({title:'今日小修补'})` 生成 `start/progress/complete`。
- 验证方式：`py -3 -m pytest -q --tb=short tests/test_tavern_gameplay_models.py`

功能点 B：会话持久化与权限

- 测试约束：访客只能读取/推进自己的 session；店主可查看本酒馆 session 摘要；更新 Tavern 不擦除 `_gameplay_sessions`。
- 关键用例：visitor A 访问 visitor B session 返回 403。
- 验证方式：`py -3 -m pytest -q --tb=short tests/test_tavern_gameplay_api.py`

功能点 C：AI Director / fallback

- 测试约束：合法 AI JSON 能推进节点；非法 JSON、未知节点、无 LLM 都进入 fallback；fallback seed 可复现。
- 关键用例：同一 `session_id + turn_count + node_id` 抽到同一 fallback event。
- 验证方式：`py -3 -m pytest -q --tb=short tests/test_tavern_gameplay_api.py`

功能点 D：默认公益酒馆玩法

- 测试约束：4 个默认公益酒馆各有至少 1 个 published 玩法；主题关键词与酒馆设定匹配；无需外部 API Key。
- 关键用例：`pw_lost_found_archive` 返回“失物/线索/档案”相关玩法。
- 验证方式：`py -3 -m pytest -q --tb=short tests/test_default_public_welfare_gameplays.py`

功能点 E：店主 UI 契约

- 测试约束：玩法编辑器有轻配置字段，保存调用 `saveGameplays`，draft/disabled 不展示给访客。
- 关键用例：组件源码/脚本检查 `GameplayManager` 使用独立组件，不在 OwnerPanel 写大段编辑逻辑。
- 验证方式：`npm --prefix .\frontend test`

功能点 F：访客 UI 契约

- 测试约束：launcher 展示 published 玩法；session panel 支持选择、自由输入、完成、放弃和恢复。
- 关键用例：active session 存在时显示“继续”，不是新开一局。
- 验证方式：`npm --prefix .\frontend test` + `npm --prefix .\frontend run build`

全量验证建议：

- `py -3 -m compileall -q fablemap`
- `py -3 -m pytest -q --tb=short`
- `npm --prefix .\frontend test`
- `npm --prefix .\frontend run build`

## 4. 与项目级架构文档的关系

关联架构：

- `docs/ARCHITECTURE.md`：新增 Gameplay System 横跨 Tavern Platform Core、Tavern Experience、AI Dialogue Layer、Data Persistence。实现后需要补接口和数据流。
- `docs/WORLD_SCHEMA.md`：必须新增 `GameplayDefinition`、`GameplayNode`、`GameplaySession`、`GameplayEvent`，并在 Tavern 中加入 `gameplay_definitions`。
- `docs/WHAT_NOT_TO_BUILD.md`：不需要修改，但验收时要反向核对没有战斗/等级/装备/排行榜/访客社交/平台自动生成普通店主内容。
- `easysdd/architecture/DESIGN.md`：实现验收时要加入本 feature 链接和关键架构决定。
- 建议新增 `easysdd/architecture/gameplay-system.md`：记录 Gameplay 子系统边界、API、持久化、AI Director/fallback 决策。

是否需要更新 README：

- 实现完成后需要在“当前原型状态”增加“店主可配置玩法系统 / 公益酒馆专属玩法”，并说明不需要外部 API Key 的 fallback 能力。

