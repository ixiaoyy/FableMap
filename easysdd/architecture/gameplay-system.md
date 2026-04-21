# Gameplay System 架构说明

> 状态：已落地  
> 创建日期：2026-04-21  
> 来源 feature：[`2026-04-21-tavern-gameplay-system`](../features/2026-04-21-tavern-gameplay-system/tavern-gameplay-system-design.md)

## 1. 模块边界

Gameplay System 是酒馆体验层和 AI 对话层之间的结构化玩法子系统：

- 店主维护 `GameplayDefinition`，它属于 Tavern 内容，可随酒馆包导出。
- 访客运行时产生 `GameplaySession` / `GameplayEvent`，它们属于运行时私有数据，不进入公开 Tavern payload。
- AI Director 只在店主定义的目标、素材和禁止事项内主持下一步；无 AI 或非法输出时使用可回放 fallback。

代码落点：

- 后端模型、归一化、fallback、AI Director：`fablemap/gameplay.py:167`、`fablemap/gameplay.py:287`、`fablemap/gameplay.py:430`、`fablemap/gameplay.py:452`
- Tavern schema / store 私有桶：`fablemap/tavern.py:442`、`fablemap/tavern.py:875`、`fablemap/tavern.py:910`
- API service：`fablemap/web/service.py:755`、`fablemap/web/service.py:844`、`fablemap/web/service.py:986`
- API router：`fablemap/web/router.py:270`、`fablemap/web/router.py:282`
- 默认公益酒馆玩法：`fablemap/default_taverns.py:146`、`fablemap/default_taverns.py:277`、`fablemap/default_taverns.py:345`、`fablemap/default_taverns.py:412`、`fablemap/default_taverns.py:480`
- 前端服务与 UI：`frontend/src/services/tavernService.js:269`、`frontend/src/GameplayManager.jsx`、`frontend/src/GameplayDefinitionEditor.jsx`、`frontend/src/TavernGameplayLauncher.jsx`、`frontend/src/GameplaySessionPanel.jsx`、`frontend/src/TavernChatRoom.jsx:1460`

## 2. 数据流

```text
店主
  └─ GameplayManager / GameplayDefinitionEditor
      └─ PUT /api/taverns/{id}/gameplays
          └─ normalize_gameplay_definitions → Tavern.gameplay_definitions

访客
  └─ TavernGameplayLauncher
      └─ POST /api/taverns/{id}/gameplay-sessions
          └─ GameplaySession.new + started event
              └─ GameplaySessionPanel
                  └─ POST /advance
                      ├─ choice 推进
                      ├─ AI Director 推进
                      └─ fallback_events 推进
```

## 3. 持久化与导出边界

- `gameplay_definitions` 在 `Tavern.to_dict()` 中作为公开内容字段保留（`fablemap/tavern.py:473`）。
- `_gameplay_sessions` 只通过 `TavernStore.list_gameplay_sessions()` / `save_gameplay_session()` 访问（`fablemap/tavern.py:875`、`fablemap/tavern.py:910`）。
- `TavernStore.update_tavern()` 保留 `gameplay_definitions` 元数据桶，不让普通 Tavern 更新擦掉玩法定义（`fablemap/tavern.py:1244`）。
- 酒馆包导出包含玩法定义，不包含 `_gameplay_sessions`；由 `tests/test_tavern_gameplay_api.py` 覆盖。

## 4. 权限与安全

- `GET /gameplays`：owner 看全部；访客只看 `published`。
- `PUT /gameplays`：仅 owner。
- `GET /gameplay-sessions`：owner 可看本酒馆摘要；访客只看自己的 session。
- `advance / abandon`：访客本人或 owner 才可操作对应 session。
- AI Director prompt 必须保持安全边界：不索取敏感身份信息，不给医疗 / 法律 / 金融结论，不要求真实危险行动。
- 不支持店主上传脚本、表达式或任意代码；高级节点只是 JSON 数据。

## 5. 与既有玩法能力的关系

- `tavernMiniGames` 是前端“把模板转成普通聊天消息”的轻量入口，不保存结构化进度。
- 冒险工会本地任务板走 `tavernPlayModes` / localStorage，不改变后端 schema。
- Gameplay System 是后端持久化的结构化玩法层，适合需要恢复进度、记录事件和结算的酒馆体验。

## 6. 验证入口

- 后端模型：`tests/test_tavern_gameplay_models.py`
- 后端 API / 权限 / 持久化：`tests/test_tavern_gameplay_api.py`
- 默认公益酒馆玩法：`tests/test_default_public_welfare_gameplays.py`
- 前端服务与组件契约：`frontend/scripts/gameplay-test.mjs`
