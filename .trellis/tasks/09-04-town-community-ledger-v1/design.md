# 小镇共建簿 v1：技术设计

## 1. 设计目标

把当前种田、采集、钓鱼、Gold 和新地表石料汇入一条跨日社区进度，同时让 Town、Foothills、Lakeshore 各自留下永久变化。设计只服务三个 closed project，不建设可配置任务平台。

参考《星露谷物语》的抽象结构是“逐项投入、选择式槽位、项目回报、社区完成反馈”；名称、内容表、地图、美术和 UI 全部保持镜像岛原创。

## 2. 任务与版本顺序

1. 子任务 `09-04-surface-mining-v1` 已在工作区交付 current v12：基础镐/镰刀、石料/植物纤维和地表 stone/weed 循环；须先独立提交、验收和归档。
2. 本任务等待“转型前生活模拟基础盘”的其他前序 child 完成，再把届时 current save 提升到下一个完整版本；不在本规划阶段猜测版本号，也不迁移任何更早开发存档。
3. 地表资源与本任务都从清理本地试玩数据后的新游戏验证，不触及 PostgreSQL 或 SQL migration。

本任务开始时地表资源及其他前序 child 必须已完整可用。最终部署边界只有届时完整 current version，不发布缺少正常材料来源的半成品共建簿。

## 3. 现有证据与调用链

- `town-notice-board` 已是 Town 的 stable inspect interaction，`RequestBoardPanel.vue` 当前只读展示 `dailyRequest`。
- 每日委托由 `DailyRequestSystem` 按 day 替换并在 NPC 交谈时结算；长期共建不能复用或扩写该 state。
- `GameSession` 已拥有 typed command、critical save、日结 candidate 和只读 snapshot 链。
- Foothills 已有 `foothills-spring`，Lakeshore 已有 `lakeshore-dock` 与一个 fishing zone；这些 stable IDs 保留。
- NPC 已有日程、活动、关系与 contextual dialogue；仪式不需要持久 NPC 坐标或通用事件 runtime。

```text
Town board interaction
  -> RequestBoardPanel tabs
  -> contribute-community-project command
  -> GameSession -> CommunityProjectSystem
  -> Inventory/Gold + CommunityState atomic mutation
  -> current save
  -> immutable snapshot
  -> board progress + world facility projection + NPC dialogue
```

## 4. Closed definitions and state

```typescript
const COMMUNITY_PROJECT_ID = {
  springNursery: "spring-nursery",
  foothillsRestoration: "foothills-restoration",
  lakeshoreDock: "lakeshore-dock",
} as const;

type CommunityProjectId = typeof COMMUNITY_PROJECT_ID[keyof typeof COMMUNITY_PROJECT_ID];

interface CommunityProjectProgress {
  readonly projectId: CommunityProjectId;
  contributions: Record<string, number>;
  completedDay: number | null;
}

interface CommunityState {
  projects: Record<CommunityProjectId, CommunityProjectProgress>;
  nurseryClaimWeek: number | null;
  springDrinkDay: number;
  ceremonySeen: boolean;
}
```

- `domain/community/definitions.ts` 唯一拥有 project/requirement ID、资源类型、目标数量、选择组和展示用短标题的 domain-safe identity；中文长文案留在 client。
- requirement ID 包含项目命名空间，即使两个项目都需要 wood，也不能共享一条 contribution counter。
- `completedDay` 只在最后一项条件首次满足时写入 current day；它同时证明完成、支持“下一晴天”仪式，不另存重复 `completed` boolean。
- contributions 必须包含 definitions 要求的完整 closed key set、非负安全整数且不超过目标；未知/缺失 key current decode 失败。
- 届时 next-current `GameState` 新增 `community`，`cloneGameState()` 深拷贝；`createInitialGameState()` 创建全部零进度。

### 4.1 固定内容表

| 项目 | 需求 | 完成条件 |
|---|---|---|
| Spring Nursery | 六种现有 crop 各 1 | 任意四个不同 crop slot 为 1 |
| Foothills Restoration | wood 20、stone 12、Gold 500 | 三项全部达到目标 |
| Lakeshore Dock | 六种现有 fish 各 1、bamboo shoot 3、wood 10 | 任意三个不同 fish slot 为 1，且两个固定项完成 |

未被选中的 crop/fish slot 在项目完成后锁定为不再需要；不能继续吞掉物品。

## 5. Commands and domain services

```typescript
type CommunityGameCommand =
  | {
      readonly type: "contribute-community-project";
      readonly boardId: "town-notice-board";
      readonly projectId: CommunityProjectId;
      readonly requirementId: CommunityRequirementId;
      readonly quantity: number;
    }
  | {
      readonly type: "claim-community-seeds";
      readonly siteId: "town-community-nursery";
      readonly seedItemId: SeedItemId;
    }
  | {
      readonly type: "drink-restored-spring";
      readonly siteId: "foothills-spring";
    }
  | {
      readonly type: "refill-at-restored-spring";
      readonly siteId: "foothills-spring";
    }
  | { readonly type: "acknowledge-community-ceremony" };

class CommunityProjectSystem {
  contribute(state: GameState, command: ContributeCommunityProjectCommand): CommunityContributionResult;
  claimSeeds(state: GameState, siteId: string, seedItemId: ItemId): CommunityRewardResult;
  drinkSpring(state: GameState, siteId: string): CommunityRewardResult;
  refillAtSpring(state: GameState, siteId: string): CommunityRewardResult;
  acknowledgeCeremony(state: GameState): CommunityCeremonyResult;
}
```

- 所有新增方法必须有方法级注释，说明用途、关键参数、返回结果及非显而易见的原子/位置约束。
- `CommunityProjectSystem` 依赖 `InventorySystem`、`StaminaSystem` 和 `WorldCatalog`；它编排现有 owner，不复制背包堆叠、体力上限、浇水壶容量或地图距离算法。
- 所有 board/site command 必须验证 stable ID、当前 region 和 42px 距离。仅隐藏按钮不是授权边界。
- GameSession 只在成功 contribution/claim/drink/refill/ceremony acknowledgement 时 publish 并排队一次 critical save。

## 6. Contribution semantics

1. Day < 8、项目已完成、definition/requirement 不匹配、位置不合法或 quantity 非正安全整数：拒绝且零 mutation。
2. quantity 不能超过 remaining；超额请求整体拒绝，不截断、不吞掉多余物品。
3. item requirement 先检查完整库存；Gold requirement 先检查余额。
4. choice slot 每个只接受 1；达到所需不同槽位数后同一 mutation 设置 `completedDay`。
5. item/Gold 扣除、counter 增加和 completedDay 必须在同一 GameState mutation 内完成。
6. 正式投入不可撤回；没有 refund、swap 或项目重置命令。

面板每一行提供显式“投入可用数量”按钮，数量为 `min(owned, remaining)`；这是 client intent 建议，domain 仍重新验证。Gold 行提供固定 100g 与“补齐剩余”两个明确动作，避免通用数值输入器。

## 7. Weekly and daily rewards

### 7.1 Public nursery

- Town 新增 stable inspect interaction `town-community-nursery`，位置靠近公告板但不改变 Town 主路与 Collision。
- Spring Nursery 完成后，玩家每个 island calendar week 可选择一种现有 seed item 并领取 3 粒。
- 把现有 Sunday-based week 计算提升为 calendar owner 的共享 helper，GiftSystem 与 CommunityProjectSystem 共用；禁止复制一套不同周界线。
- `nurseryClaimWeek` 保存最近成功领取的 week index。背包不能完整加入 3 粒或 seed ID 非法时不更新。

### 7.2 Restored spring

- 保留 `foothills-spring` stable ID；完成前沿用普通 inspect 文案，完成后空手可饮用、选中水壶可补水。
- `drink-restored-spring` 仅在 stamina < max 时恢复 15，封顶 max，并写 `springDrinkDay=current day`；满体力或当天已饮用零 mutation。
- `refill-at-restored-spring` 可不限次数把水壶设为当前等级容量；已经满水时零 mutation。
- 体力恢复复用 `StaminaSystem` 的窄 restore 方法，水量复用 progression 的 `wateringCanCapacity()`。

### 7.3 Deep-water dock

- 保留 `lakeshore-dock`，在 formal TMJ 增加 gated zone `lakeshore-deep-water-fishing`；未完成 Lakeshore Dock 时 FishingSystem 返回 locked。
- 深水区仍使用现有一键钓鱼、体力、时间、天气和 castPower 规则；只在原本 eligible 时给 `dusk-perch` 与 `jade-bream` 各增加一份 pool weight。
- 不降低 minCast、不绕过 dusk/weather 条件、不新增鱼、鱼饵、钓具或隐藏掉落表。码头 inspect 文案明确提示深水区偏向晚间/远投鱼，避免不可理解的概率奖励。

## 8. World presentation and resident reactions

- project completion 只保存 semantic state；苗圃、修复山泉、完整码头和纪念牌由 client 按 snapshot 渲染，不把 texture/frame/tile GID 写入 save。
- 优先复用当前 VectoRaith 原图和已有 runtime pixel-art 方案；若新增源码绘制图形，仍不得生成或提交静态图片二进制。
- 不重排 Farm v1 或 Town 大构图。Town 只增加公共苗圃/纪念牌的小范围功能点，Foothills/Lakeshore 只在既有 spring/dock 周边做状态表现。
- 完成反应映射：Spring Nursery → 阿禾/华强；Foothills Restoration → 浩南/墨子；Lakeshore Dock → 祥子/阿澜。相关 dialogue ID 进入现有 domain selection 与 client text catalog，不保存中文文本。

## 9. Completion ceremony

```typescript
function communityCeremonyAvailable(state: GameState): boolean;
```

可用条件同时满足：三个 `completedDay` 非 null、`state.day` 大于最后完成日、当前天气 sunny、玩家当前 region 是 Town、`ceremonySeen=false`。

- Town `SpawnPoints` 增加八个 `community-ceremony-*` anchor；只用于仪式 presentation，不改变保存坐标或普通日程。
- client 在可用时打开 `CommunityCeremonyPanel`、锁定世界输入/时间，隐藏普通 NPC view，并在 anchors 投影八名居民。
- 线性对白总长目标 30～45 秒。最终一页关闭前 dispatch acknowledgement；中途刷新/退出不写 seen，重新进入符合条件的 Town 时从头播放。
- acknowledgement 只写 `ceremonySeen=true`。之后公告板附近显示 `town-community-plaque`，六名项目相关居民及另外两名居民各拥有一条完成对白。
- 不创建通用 cutscene timeline、camera DSL、event queue、festival schedule 或 NPC 持久仪式状态。

## 10. UI and accessibility

- `RequestBoardPanel.vue` 保留现有 modal owner，增加“今日委托 / 小镇共建”两个 tab；每日委托组件和状态保持原合同。
- 共建 tab 显示三个项目卡、候选槽位、固定需求、已投入/所需/持有、地点、完成日和明确按钮状态。
- tab、项目卡和投入按钮支持 Tab/Shift+Tab、Enter/Space、Escape；手机和 200% zoom 下正文区域滚动，关闭按钮保持可见。
- 成功 contribution 后焦点留在对应 requirement 行；项目完成时使用文字、图形和声音多通道反馈，不只依赖颜色。
- Nursery seed choice 与 ceremony 各自纳入共享 modal lock；关闭后恢复 world focus 且 `preventScroll`。

## 11. Validation and error matrix

| 条件 | 结果 |
|---|---|
| Day < 8 或不在公告板附近 | contribution 拒绝，inventory/Gold/progress 不变 |
| quantity > remaining、物品/Gold 不足 | 整体拒绝，不做部分扣除 |
| 第四种 crop / 第三种 fish 完成 | 同次写 completedDay，立即开放对应设施 |
| 项目已完成后投入未选候选 | 拒绝，不吞物品 |
| 苗圃背包满 / 本周已领 | 不加种子，不更新 week marker |
| 山泉满体力 / 今日已饮 | 不恢复、不更新 day；水壶补水仍可独立使用 |
| 深水区未修复 | fishing start 返回 locked，不扣体力 |
| 三项同日完成且当日 sunny | 当日不触发；下一 sunny day 进入 Town 才可用 |
| 仪式中断 | ceremonySeen 仍 false，下次符合条件重播 |
| 任何早于届时 current version 的开发 local save | 明确 unsupported，不迁移、不覆盖 |

## 12. Affected files

主要生产范围：

- `domain/community/definitions.ts`、`CommunityProjectSystem.ts`（新增）
- `domain/state/game-state.ts`、`domain/persistence/SaveRepository.ts`
- `domain/session/commands.ts`、`GameSession.ts`
- `domain/calendar/game-calendar.ts` 与现有 gift week caller
- `domain/stamina/StaminaSystem.ts`、`domain/fishing/definitions.ts`、`FishingSystem.ts`
- `client/src/stores/game-store.ts`、`App.vue`
- `client/src/ui/requests/RequestBoardPanel.vue` 与新增共建/种子/仪式子组件
- `client/src/game/scenes/WorldScene.ts`、必要的 world presentation helper
- `client/src/game/dialogue/definitions.ts`、domain dialogue definitions/system
- `public/map/town.tmj`、`foothills.tmj`、`lakeshore.tmj`

不修改 server、Prisma、SQL migration、Keycloak、论坛 SSO 或 Docker 拓扑。

## 13. Risks, rollout and rollback

- **项目内容失衡**：用正常 Day 1–14 路线核对 20 wood、12 stone、500g、鱼/作物候选，不靠 debug-only 物品注入代替真人节奏。
- **日结重复**：completedDay、Foothills stone refill、week/day reward markers 都进入同一日结/critical save 体系，保存失败不得重抽或双领。
- **UI 变成任务平台**：definitions 保持 closed，组件不解析任意条件 DSL；第四个项目出现前不抽象插件系统。
- **地图回退**：所有新功能点使用 stable IDs 和窄局部表现，不改主路、门、出口或已冻结构图。
- **回滚**：父任务可整体移除 community state/commands/UI/sites，保留已独立验收的地表采矿；开发存档不承诺回滚兼容。
