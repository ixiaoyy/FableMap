# 交互、NPC、地图入口与看板精细化 v1

## Goal

让玩家靠近任何人物、入口、私人空间、公告板或环境查看点时，都能自然理解“能否互动、如何互动、会发生什么”，同时让 NPC 移动与活动表现摆脱占位感。

## Requirements

- 先用当前页面完成桌面与手机证据采集，再根据真实问题窄修。
- NPC “点击”提示不再全时段常驻；桌面 hover/靠近、手机可触达状态必须明确。
- NPC walking/waiting/activity/hit 的 body-local 表现、朝向、标签与碰撞位置一致。
- 每日首次交谈允许克制关系反馈，但不显示 raw points、不重复提示。
- 房门、出口、私人内屋、公告板、店招和 inspect 使用一致提示语言。
- 装饰看板与可交互看板必须可辨；文案不误导未实现能力。
- 检查 Farm/Town/五住宅/Blacksmith/Foothills/Lakeshore 的入口、看板与交互点。
- 不新增玩法、存档字段、地图区域、NPC、图片或经济规则。

## Acceptance Criteria

- [x] 桌面无满屏常驻“点击”，靠近/hover 时提示及时且不遮挡人物。
- [ ] 手机上所有 NPC/看板/入口仍可发现和触发，不依赖 hover-only。
- [ ] 八名 NPC walking/waiting/activity/hit 无姿态残留、位置错位或标签冲突。
- [x] Shop/Dialogue/首次交谈关系反馈只触发一次且不打断对话。
- [ ] 每个房门、出口、私人内屋、公告板、店招与 inspect 点提示一致准确。
- [ ] 最深夜色下人物、入口和提示仍可辨；HUD/modal 不被遮挡。
- [ ] 桌面、手机和200% zoom 的入口/提示/Social 不重叠。
- [ ] 真实路线与最小类型/构建检查通过。

## Out of Scope

- 新增送礼、关系对话、天气、职业服务、地图或 NPC。
- 重画主地图或替换素材图集。
