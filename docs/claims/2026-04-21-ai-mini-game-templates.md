# AI Mini Game Templates 任务认领

## 任务 ID
T-AI-MINI-GAME-TEMPLATES

## 任务名称
AI Mini Game Templates

## 认领时间
2026-04-21

## 负责人
Codex

## 改动类型
前端功能

## 任务目标
为空间聊天新增 AI 主持小游戏模板库

## 具体实现
- 新增 6 个小游戏模板：线索调查、猜谜问答、故事接龙、抽卡占卜、二十问、小委托
- 新增小游戏开局提示生成逻辑
- 在 TavernChatRoom 输入区上方接入「和 NPC 玩一局」面板

## 可修改范围
- `frontend/src/tavernMiniGames.js`
- `frontend/src/TavernChatRoom.jsx`
- `frontend/scripts/mini-games-test.mjs`

## 验证方式
- `npm --prefix frontend test`
- `npm --prefix frontend run build`

## 当前状态
done