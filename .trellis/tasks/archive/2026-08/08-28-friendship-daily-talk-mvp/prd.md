# 基础好感与每日交谈 MVP

## Goal

让玩家与镜像岛八名 NPC 的日常交谈形成可积累、可查看、可恢复的关系进度，为后续送礼、关系对话、心事件和私人内屋解锁建立单一 domain 合同，同时保持当前点击交互和本地单人节奏。

## Background

- 八名 NPC 已有稳定 npcId、姓名/对话、四段日程、动态位置和家庭住址，但交谈目前只打开 transient Dialogue/Shop，不产生持久关系进度。
- GameState/StoredGame 当前为 v4；睡觉原子结算 day，最适合作为每日交谈与衰减边界。
- 《星露谷》使用 250 点/心、十心 Social meter、每日首次交谈 +20，并对未满心且当天未交谈的普通居民执行 -2/日轻微衰减；私人卧室在两心时开放。[官方 Friendship Wiki](https://stardewvalleywiki.com/Friendship)
- 本轮只参考数值尺度、每日节奏与 Social 信息结构，不复制角色、文本、肖像、图标或 UI 布局。

## Confirmed Requirements

- 八名 NPC 各有持久 friendship，使用 250 点/心、0–10 心、最大 2500 点的清晰整数尺度；不采用原作超出十心的内部溢出区间。
- 每名 NPC 每游戏日只有第一次有效近距离交谈增加 20 点；重复点击、重复推进同一对话或反复开商店不增加。
- 当天未交谈且 friendship 在 1–2499 点时，睡觉日结减少 2 点；0 点不继续下降，满 2500 点停止衰减。
- 华强的 Shop 点击也算当天交谈；活动中、巡逻中或等待中的 NPC 均使用同一 +20，不因动画状态减半。
- `lastTalkedDay` 直接记录在每名 friendship 中，不增加可漂移的“今日已聊”全局列表。
- 新增 `talk-to-npc` GameCommand；GameSession 重新验证 active npcId、同区域和 42px 距离后才结算。
- Social 面板显示八人姓名、关系阶段、十心进度和“今日已聊”状态，不显示内部 raw points。
- 姓名继续从现有 catalog/dialogue speaker 投影，不在 Social UI 复制第二份角色名表。
- 打开 Social 面板统一锁定并暂停世界；关闭后恢复，不写入存档。
- GameState/StoredGame 升级为 v5；v4→v5 只补 friendship defaults，旧 v1–v3 继续沿显式迁移链进入 v5。
- 不新增数据库、migration、服务端、图片或外部依赖；每个新增方法/helper 添加方法级注释。

## Acceptance Criteria

- [x] 新游戏八人均为 0 心；每天首次有效交谈 +20，重复交谈不变，第二天可再次 +20。
- [x] 华强 Shop 与普通 Dialogue 使用同一个 talk command；远距离、未知或非当前 active NPC 不增加。
- [x] Social 面板按稳定居民顺序显示姓名、0–10 心进度、关系阶段和今日交谈状态，打开时世界时间暂停。
- [x] v4 存档迁移为 v5 且原有 day/time/gold/inventory/resources/farmTiles 不变；v5 decode 幂等，非法 friendship 明确失败。
- [x] 睡觉在同一原子 mutation 中完成 friendship 日结、作物结算、Day+1 和 06:00。
- [x] StoredGame 不包含 Social 面板状态、角色名、肖像或素材 frame。
- [x] Life Loop/Town 窄合同、类型检查和客户端构建通过。

## Out of Scope

- 送礼、每日/每周礼物限制、喜好/厌恶、生日、任务奖励、邮件礼物和节日倍率。
- 私人内屋解锁、关系对话分支、心事件、婚恋、同居或家庭状态。
- NPC 肖像、照片、人物详情页、Gift Log 或精确 raw points 显示。
