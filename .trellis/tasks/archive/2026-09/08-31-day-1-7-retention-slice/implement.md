# Day 1-7 留存纵向切片：执行计划

## Phase 0 — 收束当前基线

- [ ] 完成 `08-28-current-slice-precision-gate` 与仍活跃的交互/NPC/地图看板、NPC hit 体验判断。
- [ ] 保留并移交 `docs/CURRENT_SLICE_POLISH_GATE.md` 的十二地图、八名 NPC、功能/UI/手机/200% zoom 与刷新恢复真人验收路线；不再由 Agent 执行或阻塞开发。
- [ ] 核对当前工作区完整 diff，只归档/提交各自任务拥有的改动；不覆盖现有 46 项用户/历史改动。
- [ ] 更新 `docs/CURRENT_STATE.md` 和权威产品边界，记录用户已批准 Day 1–7 阶段。
- [ ] 形成 pre-retention 静态基线与真人 handoff checkpoint；并行任务导致工作区不干净时记录精确 commit/diff 边界，不擅自提交他人改动。

## Phase 1 — `08-31-audio-feedback-mvp`

- [ ] 逐文件试听并锁定最小 CC0 SFX/环境声子集；记录官方来源、许可、源文件/归档哈希和处理计划。
- [ ] 在仓库外裁切/归一化/转码选中素材，上传不可变 `game/media/v1` 对象。
- [ ] 更新 manifest、来源记录、媒体准备脚本和必要 notices；回读 CDN/同源代理并核对 MIME/bytes/SHA/cache。
- [ ] 实现 AudioDirector、语义 cue 映射、区域环境 crossfade 和 HMR/scene cleanup。
- [ ] 实现独立版本化音频设置存储与 SettingsPanel；Master/Music/SFX 立即生效并恢复。
- [ ] 接入脚步、工具/采集、门、买卖、对话翻页、睡觉与四类环境声；逐项实际听音。
- [ ] 运行 client typecheck/build 的最小相关检查，确认 Git 音频二进制为零。

## Phase 2 — `08-31-retention-domain-v8`

- [ ] 把现有 dialogue definitions 迁到一个 domain catalog，先保持现有可见内容等价。
- [ ] 定义并实现 GameState/StoredGame v8、v7 migration、clone/decode/reconcile 与 unknown-ID guards。
- [ ] 扩展 typed command/result contract，加入 facing-aware watering 和 NPC interaction result。
- [ ] 实现 24/32 容量、900g+15 wood 水壶升级、1,500g 背包升级和原子失败语义。
- [ ] 实现 8 条 DailyRequest catalog、Day≥2 deterministic state、睡眠刷新和一次性提交奖励。
- [ ] 实现关系阶段、对话候选优先级、三日去重/历史裁剪和一次性 event IDs。
- [ ] 移除 Spring 28 睡眠阻塞，建立临时无上限 Day N 春季内容合同。
- [ ] 更新现有窄合同测试而不扩建测试矩阵；验证 v7 round-trip、升级/请求幂等、Day29 和损坏状态失败。
- [ ] 运行一次相关测试 + typecheck；生产代码通过后按仓库规则立即暂存本子任务拥有的实现文件。

## Phase 3 — `08-31-progression-request-ui`

- [ ] 增加完整 BackpackPanel，明确显示 24/32 容量且不改变八格 Hotbar。
- [ ] 在昊天对话上下文中增加 Day-3 水壶服务动作、价格/材料/已拥有状态和购买反馈。
- [ ] 在华强 ShopPanel 增加 Day-5 背包报价、购买反馈和已扩容状态。
- [ ] 把现有 Town notice board 接到 DailyRequest snapshot：未开放、进行中、材料不足、完成四种状态。
- [ ] 对应 NPC 交谈时完成委托并显示 Gold/Friendship/感谢反馈；重复点击不领奖。
- [ ] 从正式菜单文案隐藏制作承诺，保留底层实现。
- [ ] 纳入现有 modal 输入锁、focus/Escape/触摸合同，人工检查桌面/手机/200% zoom。

## Phase 4 — `08-31-relationship-dialogue-events`

- [ ] 为八名 NPC 各写至少三条性格候选和一组一心熟悉台词，使用稳定 variant IDs。
- [ ] 接入 activity/request/stage/place/personality 候选优先级，验证同一 NPC 最近三日不重复 ID。
- [ ] 完成委托当天优先感谢语；新关系阶段首次交谈优先新台词。
- [ ] 实现华强、昊天各一个非分支、一次性的 2 心短事件。
- [ ] SocialPanel 改为“陌生/熟悉/友好”与前两颗内容心，不改变内部十心上限。
- [ ] 用新游戏/迁移存档分别刷新验证 history、stage acknowledgement 和 event IDs。

## Phase 5 — `08-31-first-week-teaser`

- [ ] 增加 compact TodayHint 和睡眠后单次提示，不建立 journal/quest engine。
- [ ] Day 2/3/5/6 的委托板、昊天升级、背包目标、高承诺委托按日期可发现。
- [ ] 校准 Day-2 华强请求与每日交谈，使积极路线在 Day 4 首次达到 familiar 并得到明确反馈。
- [ ] Day 7 为 Lakeshore waystone 增加 code-drawn mirror shimmer、异域传闻文本与 inspect 提示。
- [ ] 证明 Day-7 表现没有 exit、战斗、Cargo、敌人、捕获或 Expedition 状态。

## Phase 6 — `08-31-day7-acceptance-checkpoint`

- [ ] 交付可从全新存档按真人速度完成 Day 1→7 的验收脚本，由真人记录每天的新目标/反馈、收入、支出、请求和关系变化。
- [ ] 至少选择并完成水壶/背包中的一个，确认另一个仍是有意义的储蓄目标。
- [ ] 把 Farm、Town、Lakeshore、至少一个室内逐层听音，以及静音、三滑杆、刷新与 autoplay retry 列入真人验收清单。
- [ ] 验证请求不 reroll/不重复领奖，升级/容量/关系/对话历史/事件/设置全部恢复。
- [ ] 验证 NPC 三日不重复、感谢与新阶段优先级、两心事件 once-only。
- [ ] 验证 Day 28→29 继续、作物/商店/关系/委托不重置，UI 不承诺 Summer。
- [ ] 交付桌面、手机、200% zoom、键盘、触摸、错误状态与 console 检查清单；真人结果不阻塞代码批次归档。
- [ ] 只修完整路线发现的 P0/P1；P2 记录是否阻塞。
- [ ] 运行最后一次最小 `typecheck` + `build:client`，必要时运行一次相关窄合同；不重复跑全量。
- [ ] 完成最终 checkpoint、权威文档/规格更新、完整 diff 核对和任务归档。

## Planned file ownership

| Area | Likely owners |
|---|---|
| Save/domain | `domain/state/game-state.ts`, `domain/persistence/SaveRepository.ts`, `domain/session/*`, new narrow domain catalogs/systems |
| Existing systems | `domain/farming/*`, `domain/inventory/*`, `domain/social/*`, `domain/calendar/*`, `domain/world/movement.ts` |
| Client runtime | `client/src/session/local-game-session.ts`, `client/src/game/scenes/WorldScene.ts`, audio modules/assets catalog |
| Vue UI | `client/src/App.vue`, `client/src/stores/game-store.ts`, existing Shop/Social/Dialogue/HUD panels plus narrow new panels |
| Content/world | domain dialogue/request definitions; existing Town notice board and Lakeshore waystone anchors; no new map/region |
| Media/docs | `deploy/cdn/game-media-manifest.json`, `scripts/prepare-media.mjs`, asset source record, notices and authoritative product/checkpoint docs |

## Validation commands

Choose the smallest relevant subset once per completed batch:

```powershell
npm --prefix .\apps\mirror-island run test:life-loop
npm --prefix .\apps\mirror-island run test:town-population
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
```

No Prisma validation, server build, Compose probe or database connection is planned because this stage does not change those boundaries.

## Risk and rollback points

- Save v8 is the highest-risk boundary. Do not publish runtime references or activate downstream UI until v7 migration and corrupt/future failure paths pass.
- Audio publication is external and immutable. Verify exact object keys/hashes before manifest changes; never overwrite a different remote object.
- Existing dirty files require exact diff ownership before staging/reverting. Do not use whole-file restore on overlapping docs or Trellis metadata.
- Balance values are centralized constants. If Day-7 play shows the first goal is unreachable or both are trivial, adjust only the shared catalog after replaying the same evidence route.
- Day-7 mirror presentation must remain removable without a save migration; only its seen-event ID is persisted.
