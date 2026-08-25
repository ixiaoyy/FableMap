# Life Loop 开源方案评估

评估日期：2026-08-25。结论：本轮不新增依赖。

| 候选 | 官方来源 | 许可/维护证据 | 适配判断 |
|---|---|---|---|
| XState | https://github.com/statelyai/xstate | MIT；官方仓库持续维护，检索时最新 release 为 5.31.1 | 能处理复杂 statechart/actor，但本轮只有既有 4 阶作物状态和 3 个原子命令；引入第二个状态 owner 会扩大 GameSession 边界，拒绝。 |
| date-fns | https://datefns.com/ 与 https://github.com/date-fns/date-fns | MIT；官方仓库 2026 年仍有提交 | 面向真实 `Date` 的解析、格式与运算；本轮只保存 1-based 整数 `day`，且明确不做 Season/Clock，拒绝。 |
| Dinero.js | https://github.com/dinerojs/dinero.js | MIT；官方 release 2.0.2 发布于 2026-03-13 | 适合多货币、精度和格式化；本轮只有非负整数 gold 与 20/35 两个固定价格，接入成本和退出面大于两个窄原子操作，拒绝。 |

采用方案：在现有 domain 内增加最小纯 TypeScript 日结与商店服务。所有 mutation 继续由 `GameSession` 单一拥有，Vue/Phaser 只发 typed command 和渲染 snapshot；若未来出现多币种、复杂定价或并行状态编排，再独立重评这些候选。
