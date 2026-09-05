# 基础好感与每日交谈 MVP：技术设计

## Ownership and flow

```text
NpcEntity click
  -> GameCommand { type: "talk-to-npc", npcId }
  -> GameSession validates current runtime NPC + region + 42px
  -> FriendshipSystem.talk(state, npcId)
     |- first today: +20 / lastTalkedDay=day / publish+save
     `- repeated: no mutation
  -> immutable GameState v5 snapshot
  -> game-store friendship projection
  -> SocialPanel town ledger

sleep
  -> FriendshipSystem.settleDay
  -> FarmingSystem.settleDay
  -> day + 1 / 06:00 / reset position
  -> one critical save
```

FriendshipSystem 是关系点数和日结唯一 owner；WorldScene 只发命令，Vue 只显示 snapshot 并管理 Social modal open/closed。

## State and save v5

```typescript
interface FriendshipState {
  readonly npcId: string;
  points: number;          // 0..2500
  lastTalkedDay: number;   // 0..state.day
}

interface GameStateV5 {
  readonly version: 5;
  // existing fields unchanged
  friendships: Record<string, FriendshipState>;
}
```

- `GAME_STATE_VERSION` / `SAVE_FORMAT_VERSION` 升至 5。
- createInitialGameState 先给空 record，catalog reconcile 为每个唯一 base npcId 补 `{points:0,lastTalkedDay:0}`。
- reconcile 拒绝未知 friendship key、key/npcId 不一致或已从 catalog 消失的身份；缺失已知 NPC 自动补零并触发 save。
- v5 decoder 完整验证 points、lastTalkedDay 与 stable ID；lastTalkedDay 不得大于 state.day。
- v4 decoder 完整验证旧字段后补空 friendships，随后 continueGame reconcile 八名 defaults；v1–v3 既有迁移直接生成 v5 empty friendships。
- clone/createStoredGame 深拷贝 friendship；Social open/labels/names/hearts 不进入 save。

## Friendship rules

```typescript
const FRIENDSHIP_POINTS_PER_HEART = 250;
const FRIENDSHIP_MAX_POINTS = 2500;
const DAILY_TALK_POINTS = 20;
const DAILY_MISSED_TALK_DECAY = 2;
```

- `talk` 只接受 state.friendships 已登记 npcId；`lastTalkedDay===state.day` 返回 already-counted。
- 首次 talk 把 points clamp 到 2500，并总是记录 lastTalkedDay；满心交谈仍写今日状态但不溢出。
- `settleDay` 在 day 递增前遍历：lastTalkedDay !== current day 且 points 1..2499 时减 2；0/2500 不变。
- 不因 NPC activity/motion 降低 talk gain；不实现 gifts/events/quests multipliers。

## GameSession command boundary

- GameCommand 新增 `talk-to-npc`。
- GameSession 从 `NpcMotionRuntime.activeByNpcId` 取当前位置，要求同 region 且 42px 内，再交给 FriendshipSystem。
- 首次/满心首次 talk 是 critical mutation；重复、未知、远距离或当前不可达 NPC quiet no-op，不弹反馈。
- WorldScene 在通过既有 client distance/dialogue 检查后，先 dispatch talk，再打开 Shop 或 Dialogue；推进对话行不重复 dispatch。

## Social panel design

概念方向：东方农事册中的“乡镇人际名册”，延续现有羊皮纸、木色、Georgia 正文和硬像素阴影；不是通用头像卡片墙。

- 一个紧凑“人际”按钮位于左上，不与右上 LifeHud 争抢。
- modal 使用单列八行：姓名/关系称谓、十心刻度、连续细进度、今日已聊印记。
- 关系称谓 client-only：0–1 初识、2–3 熟面、4–5 亲近、6–7 信赖、8–9 知心、10 挚友。
- 姓名从 WorldCatalog base npc dialogueId → dialogue definition speaker 解析；不新增角色名常量。
- hearts 显示完整心数和部分进度，不显示 raw 0..2500 points；文字提供 `x.x / 10 心` 非颜色提示。
- openSocial/closeSocial 属于 game-store transient state；isWorldInputLocked 包含 socialOpen，打开后 GameSession clock 自动暂停。
- dialog 使用 aria-modal、显式标题、Escape、关闭按钮、打开聚焦和关闭后焦点返回；手机使用可滚动全高名册。

## Compatibility and rollback

- 无 PostgreSQL/migration/服务端/图片/依赖改动；只是本地 StoredGame 格式 v5。
- v2 backup key/原子 transaction 合同不变，只把 current main payload 从 v4 改为 v5。
- 回滚只能 forward-fix v5；不得用旧客户端覆盖含 friendships 的 v5 save。
