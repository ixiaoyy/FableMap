# 05-07-garden-tavern-farm-basics

## Goal
实现菜园酒馆（Garden Tavern）的基础农场功能，包括种植、浇水和收获。这是“菜园酒馆”玩法的第一阶段（Phase 1）。

## Requirements
- 访客在进入菜园酒馆后，拥有一个基础的作物种植面板（或交互卡片）。
- 提供种植、浇水、收获的基础流程。
- NPC 管家能够引导这些基础流程。
- 访客的数据需要可以存储在私有状态中（如 `VisitorState` 或 `_farm_progress`）。
- 简单的库存展示，用于查看已收获未出售的作物。

## Acceptance Criteria
- [x] 能在前端UI上看到菜园面板或入口。
- [x] 用户可以进行“种植”操作，作物进入生长期。
- [x] 用户可以进行“浇水”操作。
- [x] 到了收获期可以“收获”，并在简单库存中看到。
- [x] 以上状态能够被保存（前端模拟或使用现有访客状态结构）。

## Technical Notes
- 作为特殊酒馆类型的一环，不需要复杂的独立数据库表，复用现有的 VisitorState 或 WorldInfo 系统。
- UI 实现尽量复用现有的卡片或组件风格。
- NPC 引导可以通过 `sendTavernChat` 注入系统消息或事件机制来实现。
