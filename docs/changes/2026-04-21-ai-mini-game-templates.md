# 2026-04-21 AI Mini Game Templates

## Summary

为空间聊天新增 AI 主持小游戏模板库：访客可以在聊天区点选 6 种老少皆宜的轻量小游戏，由当前 NPC 通过现有聊天链路开局主持。

## Changes

- 新增前端内置小游戏模板：线索调查、猜谜问答、故事接龙、抽卡占卜、二十问、小委托。
- 新增小游戏开局提示生成逻辑，提示默认包含老少皆宜和安全边界。
- 在 `TavernChatRoom` 输入区上方接入“和 NPC 玩一局”面板。
- 新增前端脚本测试并接入 `npm --prefix .\frontend test`。

## Scope Boundaries

- 不改 Tavern / Character / WorldInfo / VisitorState / ChatMessage schema。
- 不新增后端 API，不新增依赖。
- 不改冒险工会声望、任务板和 localStorage 进度语义。
- 不做战斗、等级装备、排行榜或传统 RPG 系统。

## Verification

- `node .\frontend\scripts\mini-games-test.mjs`
- `npm --prefix .\frontend test`
- `npm --prefix .\frontend run build`
