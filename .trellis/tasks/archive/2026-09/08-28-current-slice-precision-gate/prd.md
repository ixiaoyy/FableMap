# 现阶段纵向切片精细化总门禁

## Goal

在扩展送礼、天气、职业、钓鱼、采矿、新地图或新人物前，把当前镜像岛纵向切片中的每个功能、动作、地图、人物、交互、看板和 UI 表面逐项打磨到可真实游玩验收的精细程度，消除“功能存在但表现粗糙、可交互但不易理解、地图可走但细节不可信”的状态。

## Product Gate

- 本任务未完成前冻结所有新增能力、系统、地图区域、NPC 和经济扩展。
- 精细化是 refinement，不重开 Farm/Town 大构图、不更换技术栈、不替换已确认美术世界。
- Agent 交付负责代码审计、静态合同、类型/构建检查和可执行的人工验收清单；真实画面、交互手感、移动端/200% zoom 与完整路线由用户安排真人验收。
- 真人验收结果保留在清单中作为发布反馈，不再阻塞 Agent 结束当前门禁或进入后续已批准开发。
- 优先修复阻塞、误导、卡脚、输入冲突和状态错位，再修层级、节奏、色彩、文案与微动效。
- 不为维持旧测试扩建测试体系；每批最后只运行一次最小相关检查。

## Scope Inventory

- 功能：新建/继续/恢复、背包/Hotbar、采集、制作、种田、买卖、睡觉、时间/昼夜、NPC 日程/活动/避让、每日交谈/好感/Social。
- 动作：移动/idle、工具、采摘/挥拳、目标反馈、NPC walking/waiting/activity/hit、切图、睡觉和 modal。
- 地图：Farm、Town、Cottage、Seed Shop、Blacksmith、五栋住宅、Foothills、Lakeshore。
- 人物：玩家与华强、昊天、阿禾、墨子、浩南、阿澜、昊美丽、祥子。
- 交互/看板：树、农田、床、商店、NPC、房门、出口、私人内屋、公告板、店招、环境查看点。
- UI：Local menu/error、LifeHud、Hotbar、feedback、Dialogue、Shop、Sleep、Social、debug；桌面、手机、键盘、触摸、200% zoom。

## Acceptance Criteria

- [ ] `docs/CURRENT_SLICE_POLISH_GATE.md` 保留完整、可直接执行的真人验收清单，并明确未验项目不能被描述为已通过。
- [ ] 当前代码范围通过最小相关静态合同、typecheck 与 client build；发现的确定性 P0/P1 已窄修或明确记录。
- [ ] 当前实现边界、已知缺口、并行工作区改动与真人反馈回流方式形成 handoff。
- [ ] 母任务归档后可进入用户已批准的 Day 1–7 阶段；真人验收发现缺陷时回到对应窄任务修复。

## Out of Scope

- 送礼、天气、Season、职业服务、采矿、钓鱼、任务、心事件、新地图、新 NPC、Expedition 或任何新能力。
- 重画已冻结 Farm/Town 大构图、替换正式图集或引入新引擎/大型框架。
