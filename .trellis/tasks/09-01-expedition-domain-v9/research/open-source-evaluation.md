# 开源方案评估

- Phaser Arcade Physics：官方内建、适合简单 top-down 矩形/圆形碰撞；后续 client 子任务可按现有 Phaser 4 边界窄用，无新增依赖。
- Miniplex：MIT、TypeScript、维护活跃，但引入 ECS 会扩大 GameSession 单一 owner 边界；两种敌人不成立接入收益，拒绝。
- ROT.js：成熟 roguelike 工具集，但本原型明确固定地图、禁止程序生成，且已有 EasyStar 路径能力；拒绝。
- 结论：domain 子任务使用零新增依赖的 closed reducers；client 后续只考虑 Phaser 内建能力和现有 EasyStar。

官方来源：

- https://docs.phaser.io/phaser/concepts/physics/arcade
- https://github.com/hmans/miniplex
- https://github.com/ondras/rot.js
- https://github.com/preverell/EasyStarJS
