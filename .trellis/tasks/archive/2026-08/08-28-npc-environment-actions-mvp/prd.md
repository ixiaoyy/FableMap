# NPC 轻量环境动作 MVP

## Goal

让现有八名 NPC 在白天工作地点呈现与身份相符的环境行为，使玩家不依赖对话也能看懂居民正在营业、锻造、照料、修缮、巡视、观察或整理，同时复用刚完成的 GameSession NPC runtime，不增加持久 NPC 状态。

## Background

- 八名 NPC 已有 day schedule anchors；华强在 Seed Shop 柜台、昊天在 Town 铁匠工作点、阿禾在粉花树旁，其余五人的工作地点分布在 Town、Foothills、Lakeshore 与 Blacksmith。
- `NpcMotionRuntime` 已处理 schedule walking/transfer 和首批五人环境动作，本次只扩展同一 activity registry 与表现映射。
- 当前 NPC 图集每人只有已登记静态 frame；可复用 Phaser 容器内的轻量位移/标记，不新增图片素材。
- `docs/TOWN_ROADMAP.md` 已登记“工作、休息、观察、修缮等轻量环境动作”；用户先批准五名新增居民，后续明确确认补齐华强、昊天和阿禾的 day 工作动作。

## Confirmed Requirements

- 华强：白天在 Seed Shop 柜台做招呼营业动作，仍保持既有 `shop` interaction。
- 昊天：白天在 Town 铁匠工作点做锻造检修动作。
- 阿禾：白天在 Town 粉花树旁做照料动作。
- 墨子：白天在 Town 修缮点做修缮动作。
- 浩南：白天在 Foothills 的三个 Tiled 行动点间真实巡山，到点短暂停留后继续。
- 阿澜：白天在 Lakeshore 做观湖动作。
- 昊美丽：白天在 Blacksmith 做整理动作。
- 祥子：白天在 Lakeshore 码头的三个 Tiled 行动点间真实巡视，到点短暂停留后继续。
- 活动语义由 domain runtime 统一投影；Phaser 只把语义转成表现，不按 npcId 复制业务判断。
- 活动仅在 day schedule 到岗后生效；walking/leaving/arriving、morning/evening/night 不显示工作动作。
- 对话或击打可暂时覆盖表现，但不得改变日程、碰撞、身份或存档。
- StoredGame 继续为 v4；不新增数据库、migration、服务端、图片、经济、任务或职业功能面板。
- 每个新增方法/helper 添加方法级注释。

## Acceptance Criteria

- [x] 八名 NPC 在 day 工作 anchor 呈现各自可辨识的轻量动作，其他时段不显示工作动作。
- [x] 巡逻若包含位置移动，渲染、点击、击打和玩家碰撞继续读取同一个 GameSession runtime projection。
- [x] 对话、商店、动作和区域过渡暂停期间，domain-owned 活动移动不推进、不追赶。
- [x] 刷新、继续游戏和睡觉只按当前 schedule 重建活动，不保存中途动作进度。
- [x] 路线图、Trellis code-spec、一个窄 Town 合同、类型检查和客户端构建同步完成。

## Out of Scope

- 动态避让、天气/星期特殊动作、休息日、工作产出、任务、职业商店或新对话树。
- 新序列帧、图片下载、音效、粒子素材或地图装饰重绘。
