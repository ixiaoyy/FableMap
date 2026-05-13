# brainstorm: agent tank tavern

> Compact pending-task summary. Verbose planning detail was removed to reduce AI context noise; re-expand from git history only if this task is resumed.

- Status: planning
- Task dir: `05-13-agent-tank-tavern`
- Scope: 待重新确认

## Preserved hints
- brainstorm: agent tank tavern
- Goal
- 评估并收敛一个“AgentTank 类 AI 坦克大战”如何作为 FableMap 的游戏工坊类酒馆补充体验：玩家不直接操控坦克，而是观察战斗表现、向 Agent 提出策略方向、由 Agent 修改战斗逻辑，再回战场迭代。
- What I already know
- * 用户提供的参考产品是浏览器中的 Agent 驱动坦克对战：坦克有出生技能和独特外观，战场公开参数/函数，玩家通过 Agent 改写坦克战斗逻辑，并基于胜负复盘迭代。
- * FableMap 当前主线是：坐标/定位 → 真实底图 → 浏览空间 → 进入空间 → 配置 AI NPC → 对话互动 → 写回记忆 → 回访反馈。
- * FableMap 核心约束：真实地图锚点、主人主权、平台不绕过店主自动发布内容、Token 由店主承担、数据尽量可导出/兼容。
- * `docs/WHAT_NOT_TO_BUILD.md` 明确排除平台级战斗系统、等级装备、竞技排行榜、传统 RPG 游戏化，以及无锚点自由空间。

## Resume policy
- Before implementing, re-confirm scope with current product docs/code.
- Do not treat this old planning note as a current approved contract.
