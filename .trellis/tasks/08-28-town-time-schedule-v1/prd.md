# Town 时间与 NPC 日程 v1

## Goal

让 Town 八名固定 NPC 按可见游戏时间在住宅、工作地点和公共空间之间切换，使住宅、工坊、山麓与湖岸形成一条日常生活网络，同时保持本地单人 GameSession、Tiled 位置所有权和可恢复存档边界。

## Confirmed Decisions

- HUD 时间范围 `06:00–24:00`，每 8 秒现实时间推进 10 游戏分钟。
- 对话、商店、休息确认、工具/攻击动作和区域淡入淡出期间暂停时间；页面未处于 playing/Scene 未运行时自然不推进。
- 24:00 后时间停止，等待玩家主动睡觉；不实现强制昏倒、体力或处罚。
- 睡觉原子日结后进入次日 `06:00`。
- NPC 使用四段日程：morning `06:00–09:00`、day `09:00–17:00`、evening `17:00–21:00`、night `21:00–24:00`。
- 时段切换时 NPC 直接切换到 Tiled anchor；不播放跨地图行走动画或路径回放。
- 时间进入 GameState/StoredGame v4；v3 存档迁移到 `06:00`，v1/v2 继续经既有迁移链进入 v4。

## Requirements

### Clock

- `minuteOfDay` 是 10 分钟粒度的安全整数，闭区间 `360..1440`；新游戏和睡觉后固定 `360`。
- GameSession 使用显式 wall-clock `now` 与有界 delta 推进时间，页面卡顿/后台恢复不得一次跳过大段日程。
- 每次 10 分钟推进发布一个 snapshot 并排队本地保存；pause 时刷新 tick 基线但不累积时间。
- Vue HUD 显示零补齐 `HH:MM`，GameState/save 只保存整数，不保存格式化文本。

### Schedule anchors

- Tiled `SpawnPoints` 拥有日程坐标；代码日程表只引用 `regionId + spawnId`，不得硬编码像素坐标。
- NpcSpawns 继续唯一拥有 npcId、默认 dialogueId 与外观身份；同一 NPC 不复制多个实体。
- 每个已登记 NPC 都有 morning/day/evening/night anchor：华强、昊天、阿禾、墨子、浩南、阿澜、昊美丽、祥子。
- 活跃 NPC resolver 返回同一 entityId/npcId 在当前 anchor 的只读投影；WorldScene、移动碰撞与 ShopSystem 必须消费同一 resolver。
- 华强只有 day 时段保持 `shop` interaction；其他时段使用普通 dialogue，防止离柜台仍可交易。
- 日程 anchor 避开 exits、关键道路、家具 Collision、私人内屋和其他同时活跃 NPC；时段切换不得封死玩家。

### Boundaries

- 不新增天气、Season、星期、节日、体力、昏倒、好感、送礼、任务或卧室解锁。
- 不新增 NPC 寻路、跨地图行走动画、动态避障或持久 NPC 坐标。
- 不连接数据库，不新增数据库 migration、图片二进制、依赖或服务端逻辑。
- 每个新增方法/helper 添加方法级注释。

## Acceptance Criteria

- [x] 新游戏从 Day 1 06:00 开始，时钟按 8 秒/10 分钟推进，24:00 停止，睡觉后 Day+1 且回到 06:00。
- [x] modal/action/transition 暂停时间，恢复后不补算暂停或后台经过的时间。
- [x] v3 存档迁移为 v4 06:00；v4 重复 decode 幂等，未来/损坏 minute 明确失败。
- [x] 八名 NPC 在四个时段分别出现在合同位置，身份、对话与外观不变，同一时刻只出现一次。
- [x] 玩家碰撞、点击、Space hit target 与 ShopSystem 都只使用当前活跃 NPC；华强非 day 时段不能交易。
- [x] HUD 显示 Day、HH:MM、Gold；不出现 Season、天气、体力或好感 UI。
- [x] Life Loop、Town 合同、IndexedDB v2 backup、typecheck 与 client build 通过。

## Out of Scope

- 完整星露谷式日历、天气、节日、商店营业日与特殊日程优先级。
- NPC 实际走路、跨区寻路、门动画、动态避让或传送演出。
- 好感、送礼、生日、心事件、婚恋、家庭状态或卧室解锁。
- 夜间强制昏倒、能量、健康、惩罚或第二天恢复公式。
