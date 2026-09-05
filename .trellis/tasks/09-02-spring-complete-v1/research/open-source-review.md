# Spring v1 开源方案评估

核对日期：2026-09-02

## 结论

本任务不新增运行时依赖。继续使用现有 Phaser 4.2.1、Vue 3、纯 TypeScript domain、Tiled 与原生 IndexedDB；天气、多产、资源刷新和钓鱼使用小型显式规则与现有确定性 hash 模式。

## 候选

| 候选 | 固定核对 | 可解决问题 | 评估 |
|---|---|---|---|
| [XState](https://github.com/statelyai/xstate) | npm 5.32.6，MIT，2026-08-27 更新，unpacked 约 2.29 MB | 日结/钓鱼状态机 | 不采用。当前只有一个 GameSession aggregate 和少量 closed state；actor/runtime/序列化模型明显超过需求，并扩大客户端包与边界 |
| [pure-rand](https://github.com/dubzzz/pure-rand) | npm 8.4.2，MIT，2026-07-10 更新，unpacked 约 64 KB | 可复现天气、鱼获与多产 PRNG | 暂不直接采用。仓库已有 absoluteDay + stable ID 的确定性 hash 模式，当前不需要保存复杂 PRNG 游标；若未来随机系统互相依赖再重评 |
| [seedrandom](https://github.com/davidbau/seedrandom) | npm 3.0.5，MIT，2022-06-26 最后发布，unpacked 约 374 KB | seeded random | 不采用。维护节奏和体积均不优于 pure-rand，且当前需求不需要外部随机库 |

## 自研薄层边界

- 只增加项目专用的小型 domain owners：日结/体力、天气、动态农田、资源再生、送礼、钓鱼。
- 不建立通用事件 DSL、ECS、actor framework、随机数平台或可配置状态机。
- 所有确定性结果由 stable save identity、absolute day、entity/tile ID 和动作序号派生；刷新不得 reroll。
- 若实现阶段发现同一状态编排跨三个以上系统重复，暂停并重新评估 XState 或更窄的开源方案。

## 升级与退出成本

- 不新增依赖，因此没有新增供应链、bundle、许可证或迁移成本。
- 项目专用规则保持纯函数/小类，可由未来实现替换而不改变 SaveRepository、GameCommand 或 Phaser/Vue 只读投影边界。
