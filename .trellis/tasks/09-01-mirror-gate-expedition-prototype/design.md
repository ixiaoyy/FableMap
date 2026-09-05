# 镜门远征 Prototype：技术设计草案

> **已否决（2026-09-04）**：历史只读，不得作为当前设计或实现依据。

## Runtime Boundary

```text
Lakeshore waystone click
  → start-expedition command
  → GameSession captures safe-home checkpoint
  → runtime-only ExpeditionRun
      → fixed region A / extraction / optional B
      → enemies / event / cargo / captured companion candidate
  → extract-expedition command
      → validate Home Inventory capacity
      → commit cargo + closed companion ID once
      → SaveRepository save v9
  → failure / abandon / refresh
      → discard runtime run
      → reload saved Lakeshore home checkpoint
```

`GameSession` remains the only mutable aggregate. A narrow `ExpeditionSystem` owns pure transition rules over `ExpeditionRunState`; WorldScene never writes Cargo, HP, capture or rewards directly.

## Proposed Types

```typescript
type ExpeditionRegionId = "mirror-expedition-a" | "mirror-expedition-b";
type ExpeditionOutcome = "active" | "extracted" | "failed" | "abandoned";
type ExpeditionChoiceId = "secure-route" | "greed-route" | "spirit-route";

interface ExpeditionCargoStack {
  readonly itemId: ItemId;
  readonly quantity: number;
}

interface ExpeditionRunState {
  readonly runId: string;
  readonly regionId: ExpeditionRegionId;
  readonly hp: number;
  readonly cargo: readonly ExpeditionCargoStack[];
  readonly defeatedEntityIds: readonly string[];
  readonly openedRewardIds: readonly string[];
  readonly choiceId: ExpeditionChoiceId | null;
  readonly capturedCompanionId: "first-water-spirit" | null;
  readonly outcome: ExpeditionOutcome;
}

interface ExpeditionHomeProgress {
  readonly companionIds: readonly "first-water-spirit"[];
}
```

- `ExpeditionRunState` 只存在于当前浏览器内存，不进入 StoredGame。
- `ExpeditionHomeProgress` 是 v9 新 durable 字段；closed ID decoder 拒绝未知灵兽。
- `runId` 只用于当前进程的幂等命令，不写日志、URL 或浏览器持久化。

## Commands and Ownership

```typescript
type ExpeditionCommand =
  | { readonly type: "start-expedition" }
  | { readonly type: "expedition-attack"; readonly targetId: string }
  | { readonly type: "expedition-capture"; readonly targetId: string }
  | { readonly type: "choose-expedition-event"; readonly choiceId: ExpeditionChoiceId }
  | { readonly type: "discard-expedition-cargo"; readonly itemId: ItemId; readonly quantity: number }
  | { readonly type: "extract-expedition" }
  | { readonly type: "abandon-expedition" };
```

- Phaser owns input timing, animation and hit presentation; domain validates distance、target state、damage/capture/loot once per impact.
- 两种敌人只共享最小 movement/attack contract，不建设 ECS/behavior tree。
- Event 由一个 closed reducer 处理三个 choice，不建立数据驱动 DSL。

## Cargo Commit

1. Start 前立即保存 home checkpoint，region 固定 Lakeshore 镜门前。
2. 远征 loot 只写 runtime Cargo。
3. Extraction 计算 Cargo 合并后的 slot demand；不足则返回 `cargo-capacity`，由结算 UI 要求丢弃后重试。
4. Capacity 足够时 clone GameState，一次添加全部 Cargo 和 companion ID，验证后 publish/save；任一失败恢复 clone 前状态。
5. 成功后销毁 run，返回 Lakeshore；重复 extract command 不可再次结算。

## Refresh and Failure

- 未成功撤离前 StoredGame 始终停留在镜门前 safe checkpoint。
- 页面刷新/HMR/关闭不序列化 run；重新进入只看到镜门前状态，Cargo、敌人、事件选择和候选灵兽全部丢失。
- HP=0 与主动放弃走同一 discard 边界，但使用不同反馈文案。

## Map and Presentation

- 只新增一张固定 Tiled map，逻辑区划 A/B 通过稳定 object IDs/regions 表达，不用随机种子。
- 区域 A 先展示约 30g Cargo、可见撤离点和通往 B 的明确危险提示。
- 区域 B 只包含一个强化敌人、一个捕获目标、一个三选一事件和一个高价值宝箱。
- Day7 Lakeshore waystone 从纯 inspect 升级为 start 入口；Day1–6 仍保持预告语义。

## Media and Open-source Gate

- 实施前先检索官方成熟素材，逐项核对许可/商用再分发、固定版本、风格、尺寸、体积与退出成本。
- 正式二进制仍通过 `game/media/v1` manifest/CDN，同源加载，Git 跟踪媒体为零。
- 没有合适素材时只允许最小项目原创候选；不得用来源不明预览图推进实现。

## Compatibility and Rollback

- 单次 v8→v9 migration 只增加 `expeditionHomeProgress` 默认空列表；不增加 run/cargo/enemy/event durable 字段。
- 旧 v1–v8 继续沿既有迁移链进入 v9；损坏/未来/未知 companion ID 明确失败。
- 回滚入口和运行时不会损坏 v9 home progress；forward-fix 优先，不降级覆盖 v9 save。

## Human Success Gate

- 从 Day7 镜门连续完成 3～5 局，每局 5–8 分钟。
- 玩家至少一次在“已拿到普通收益”和“进入 B 争取灵兽/高价值”之间停顿。
- 至少一次成功撤离后能立即理解带回了什么，并愿意再开一局。
- 若玩家总是立即撤离、总是无脑进 B、看不懂风险或不想重开，停止扩内容并先调整核心决策。
