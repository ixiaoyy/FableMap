# 实施计划

1. 增加 player appearance 领域合同，升级 GameState/StoredGame v6，并补 v5→v6 默认迁移。
2. 让 GameSession 新游戏接收已验证的 appearance ID，Vue store 投影当前 ID。
3. 在 visual profile 中登记现有 farmer + 8 个 NPC demo 动画预设，让 WorldScene 按存档选择玩家图集。
4. 新建精修 CharacterCreator Vue 页面，接入菜单、覆盖保护和键盘/触屏交互。
5. 运行一次 `typecheck` 和一次 `build:client`，随后暂存新增/修改的生产代码，不暂存任务文档。
