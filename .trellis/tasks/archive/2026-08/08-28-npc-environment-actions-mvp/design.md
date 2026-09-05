# NPC 轻量环境动作 MVP：技术设计

## Ownership and flow

```text
minuteOfDay / schedule target
  -> NpcMotionRuntime arrives at day anchor
  -> npc-activities registry resolves semantic activity
     |- stationary: repair / observe / organize
     `- route: mountain-patrol / dock-watch
          -> dwell -> existing findNpcPath -> walk -> dwell loop
  -> NpcRuntimeSpawn { activity, activityPhase, x, y, motion }
     |- WorldScene / NpcEntity presentation
     |- click / hit target
     `- player collision
```

GameSession 继续只调用既有 `NpcMotionRuntime.advance()`。活动位置、停留计时和表现 phase 都是 runtime transient state，不进入 `GameState`、StoredGame v4 或 IndexedDB。

## Activity registry

新增 `domain/world/npc-activities.ts`，集中拥有：

```typescript
type NpcActivityKind =
  | "serve"
  | "forge"
  | "tend"
  | "repair"
  | "mountain-patrol"
  | "observe"
  | "organize"
  | "dock-watch";

interface NpcActivityDefinition {
  readonly npcId: string;
  readonly kind: NpcActivityKind;
  readonly regionId: string;
  readonly routeSpawnIds?: readonly [string, string, ...string[]];
}
```

- registry 只在 day phase 生效；其他时段返回 `null`。
- 华强、昊天、阿禾、墨子、阿澜、昊美丽为 stationary activity，不拥有 route。
- 浩南 route：当前 `npc-haonan-trail` + 两个新增 Foothills spawn。
- 祥子 route：当前 `npc-xiangzi-dock` + 两个新增 Lakeshore spawn。
- validator 要求八个 npcId 存在、day schedule region 与 activity region 一致、route 第一项等于当前 day anchor 坐标、所有 route point 不被 Collision 阻挡且相邻点存在路径。

## Motion runtime extension

`NpcRuntimeSpawn` 新增：

```typescript
readonly activity: NpcActivityKind | null;
readonly activityPhase: 0 | 1;
```

- schedule walking/leaving/arriving 时 activity 为 `null`。
- 到达 day target 后建立 idle activity state；stationary activity 只推进 400ms 两相节奏。
- patrol/watch 在每个点停留 2400ms，再复用 `findNpcPath` 前往下一个 route point；route 尾部循环回第一项。
- patrol walking 保留 activity kind，位置仍由同一个 motion state 驱动；interactionType 固定为 `dialogue`。
- phase transition 立即取消 ambient loop，从当前 runtime 位置前往新 schedule anchor。
- reset/continue/sleep 从当前 schedule target 重建：day 从 route 第一项开始，其他时段无 activity。

## Tiled anchors

- `foothills.tmj` 新增 `npc-haonan-patrol-mid`、`npc-haonan-patrol-lookout`。
- `lakeshore.tmj` 新增 `npc-xiangzi-dock-west`、`npc-xiangzi-dock-east`。
- 只修改 SpawnPoints 与 `nextobjectid`；不改 tile layer、Collision、exits、资源、图片或 stable existing IDs。

## Phaser presentation

NpcEntity 保留一个 code-drawn activity mark，并根据 activity/phase 更新 body-local offset：

- repair：短促左右敲击感 + “修”。
- serve：轻微招呼动作 + “迎”。
- forge：短促锻打感 + “锻”。
- tend：俯身照料感 + “护”。
- mountain-patrol：移动时轻微步幅，停留时显示“巡”。
- observe：轻微抬头/停顿 + “望”。
- organize：左右整理感 + “理”。
- dock-watch：移动时轻微步幅，停留时显示“守”。

所有 offset 只作用于 sprite body，不移动 container；点击、击打、depth 与碰撞继续使用 runtime container 坐标。hit reaction 完成后 `project()` 恢复最新 activity visual。

## Compatibility and rollback

- 无存档 migration、数据库、服务端、依赖或图片变化。
- route 失败在 catalog validation 阶段明确报错，不在运行时静默瞬移。
- 回滚只精确移除 activity registry/runtime fields、NpcEntity 表现、四个 Tiled spawn 与相关合同。
