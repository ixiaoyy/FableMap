# NPC 早晚生活动作 v1

## Goal

让八名现有 NPC 在早晨准备、傍晚收工和夜间居家时拥有与地点、职业和家庭关系一致的轻量动作，使刚完成的四时段生活对话在画面中得到对应表现；不增加新地图、NPC、经济或持久 AI。

## Background

- 当前 `npcActivityAt()` 只在 day phase 返回活动；morning/evening/night 一律为 null。
- `NpcMotionRuntime` 已拥有 pause-aware 两相 cadence、日程抵达后开始 activity、walking/transfer 时停止 activity 的完整机制。
- `NpcEntity` 已根据语义 activity kind 显示小幅 body-local 动作和邻近时的单字标记。
- 八名 NPC 已有四段 Tiled anchor，不需要新增地图点位；阿禾/阿澜与昊天/昊美丽夜间分别位于同一住宅。

## Requirements

- 保留八名 NPC 已有 day activity 和浩南/祥子的 day patrol，不改变路线、速度、避让或营业规则。
- 八名 NPC 均补齐 morning、evening、night 三段 stationary activity；动作必须符合现有 schedule region 和动态生活对话。
- 华强：早晨理货、傍晚收店、夜间对账；抵达 day 柜台前仍不得显示营业活动或开放商店。
- 昊天：早晨备工具、傍晚清炉、夜间与昊美丽居家收尾；昊美丽对应准备护具、收纳和针线。
- 阿禾/阿澜：早晨分别照料植物/整理画具，傍晚在湖岸/桥边观察，夜间同屋喝茶并采用同步两相节奏。
- 墨子：早晨备工具、傍晚复查修缮、夜间整理木料。
- 浩南：早晨整备巡山、傍晚回镇记录、夜间整理山路笔记。
- 祥子：早晨查绳结、傍晚收码头、夜间整理值守记录。
- activity 只在 NPC 已抵达当前 phase anchor 且 idle 时出现；walking、waiting、leaving、arriving 不伪装为居家/收工动作。
- 所有活动仍是 transient runtime，不进入 GameState、StoredGame v6、IndexedDB 或 Tiled。
- 活动标记继续只在 NPC 可交互且玩家靠近/悬停时显示，避免地图常驻文字噪声。

## Acceptance Criteria

- [x] 八名 NPC 在 morning/evening/night 均有与人物和地点一致的动作，day 行为无回退。
- [x] 阿禾/阿澜、昊天/昊美丽夜间同屋动作同步但不新增多角色协调状态。
- [x] phase 切换后旧 activity 立即取消，抵达新 anchor 后才开始新动作。
- [x] 华强只有 day 柜台 idle 时恢复 `serve`/shop，开店途中、收店和夜间均不可交易。
- [x] modal、切图和 pause 期间 activity cadence 不推进，恢复后无追赶。
- [x] 不升级存档，不新增地图点、图片、数据库、migration 或大规模测试矩阵。

## Out of Scope

- 星期/休息日、天气/节日特殊动作、随机事件和跨日活动记忆。
- 新动画素材、复杂骨骼动画、手持道具实体、多人同步或通用行为树。
