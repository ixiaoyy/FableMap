# NPC Hit Reaction MVP 空手击打反馈

## Goal

把 NPC 输入拆成直观且不冲突的两条路径：鼠标点击邻近 NPC 直接对话/开店，Space 在空手时向当前朝向挥拳；命中当前三名 NPC 只产生非致命闪白、击退与短硬直，不引入生命、死亡、仇恨、反击或持久状态。

## Confirmed Decisions

- `Space` 是独立攻击键；鼠标点击不承担攻击。
- 只有空手时 Space 才攻击；手持工具、种子或其他物品时 Space 不触发。
- 攻击只检查玩家当前朝向前方约 24px 的最近 NPC；挥空仍播放玩家动作。
- 华强、昊天、阿禾都可被命中，但不掉血、不死亡、不反击、不记仇、不改变好感或存档，短暂击退后回到 Tiled 原位置。
- 鼠标点击 42px 内 NPC 直接交互：华强打开现有 Shop，昊天/阿禾打开线性 Dialogue；太远点击无反应，不自动寻路。
- 当前世界交互全部使用鼠标：NPC 对话/商店、床睡觉、Tree/FarmPlot 物品使用；E 从当前游戏输入中移除。

## Requirements

### Click interaction

- NpcEntity 提供可点击脚底/身体命中区域和 hand cursor，但地图 stable ID、interactionType 与位置仍由 Tiled 拥有。
- 点击回调必须复用现有 Shop/Dialogue 能力，不复制 NPC identity、台词或商店逻辑。
- Shop/Dialogue/ActionTimeline/transition 锁期间忽略 NPC 点击；重复点击不能叠 modal。
- 玩家与 NPC 超过 42px 时静默无效，不显示错误，不自动移动。
- BedEntity 同样提供鼠标点击回调；42px 内点击自己的床先打开“是否休息？”确认框，太远点击静默无效。
- 休息确认框只提供“是 / 否”：选择“是”后复用现有 fade → atomic sleep settlement → Day+1 → save，选择“否”只关闭确认框并恢复世界输入。
- 休息确认框打开期间必须与 Shop/Dialogue 一样锁定移动、世界点击、攻击和 region transition；重复点击床不得叠加多个确认框。

### Space attack

- Phaser 捕获 Space，避免浏览器滚动；攻击与数字键、世界鼠标使用互不复用。当前不注册 E world-interaction key。
- `selectedItemId === ""`、world input unlocked、ActionTimeline idle 时才允许开始 punch。
- 玩家按当前 facing 产生固定前方命中区域，选择范围内最近 NPC；不使用鼠标目标或全图最近 NPC。
- 玩家挥拳使用现有 farmer 帧的短突进/压缩动作；mutation 不进入 GameSession，因为第一版没有 NPC gameplay state。
- 命中 NPC 时只播放 presentation reaction：闪白、沿攻击方向击退约 6px、短暂硬直，再回到 Tiled spawn 坐标。
- 未命中仍完整播放挥拳；NPC 不播放 target reaction。

### Safety and scope

- Dialogue/Shop 打开、工具动作、采摘、睡觉或 region transition 中不能攻击。
- NPC reaction 期间再次 Space 不叠加；Scene teardown/切图必须取消 tween 并恢复原坐标/tint。
- 不新增 NPC HP、死亡、掉落、仇恨、阵营、反击、警卫、犯罪、好感、任务、存档字段或战斗 domain。

## Acceptance Criteria

- [ ] 42px 内点击华强打开现有 Shop，点击昊天/阿禾打开现有 Dialogue；点击自己的床弹出“是否休息？”，选择“是”执行现有睡觉日结，选择“否”关闭并恢复输入；E 不再承担任何当前世界交互。
- [ ] 默认空手按 Space 播放前向挥拳；手持任何物品时 Space 无动作。
- [ ] 仅前方约 24px 最近 NPC 被命中，背后/过远 NPC 不反应；挥空仍有玩家动画。
- [ ] 命中 NPC 闪白、击退、硬直后回到原 Tiled 坐标，不产生永久状态或路线阻塞。
- [ ] modal/action/transition 锁、重复 Space 和 Scene teardown 不产生叠加 tween、重复命中或残留 tint/坐标。
- [ ] Tool Interaction、Life Loop、Town Population、typecheck 和 client build 不回退。
- [ ] 无 GameState/save/migration/TMJ/图片二进制/经济/好感/战斗框架改动。

## Out of Scope

- NPC 血量、死亡、反击、仇恨、好感、犯罪、掉落、武器或工具攻击。
- 敌人、完整战斗系统、技能、体力、伤害数字、音效、屏幕震动或手柄映射。
- NPC 日程、自动寻路、任务、剧情、Expedition、塔防。

## Notes

- Keep `prd.md` focused on requirements, constraints, and acceptance criteria.
- Lightweight tasks can remain PRD-only.
- For complex tasks, add `design.md` for technical design and `implement.md` for execution planning before `task.py start`.
