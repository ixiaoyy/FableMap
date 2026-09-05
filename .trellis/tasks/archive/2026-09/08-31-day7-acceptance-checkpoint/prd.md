# Day 7 完整体验验收与 checkpoint

Parent: `08-31-day-1-7-retention-slice`

## Goal

交付新游戏到 Day 7、声音、经济、委托、关系、对话、恢复与 Day 29 的真人验收脚本，收口代码/静态检查并记录 checkpoint；实际浏览器执行由真人负责。

## Requirements

- 不再新增范围能力；Agent 只做静态集成、记录证据和可确定的窄修，真人负责真实游玩并回填结果。
- 提供从新游戏按正常操作完成 Day1→7 的逐日脚本，供真人记录目标、声音、收入/支出、委托、关系和镜门体验。
- 在代表性日刷新/继续，核对 Day、Gold、委托、升级、容量、关系、对话历史、事件和音量。
- 把 Farm/Town/Lakeshore/室内与所有核心 SFX、静音、滑杆和 autoplay retry 纳入真人听音清单。
- 单独验证 Day28→29；允许使用现有 debug 加速时间，但不改变生产规则或直接篡改存档。
- 交付桌面、手机、200% zoom、键盘/触摸与错误状态、console 的检查步骤；Agent 不操作真实浏览器。
- 更新权威文档、规格和 checkpoint；只运行最后一次最小相关检查。

## Evidence Policy

- 自动检查可以标记 passed；浏览器、听音、视觉、手感、console、手机与 200% zoom 项一律保持 pending，直到真人提供结果。
- checkpoint 必须记录精确 commit、命令、通过数量、构建警告和未执行原因，不把“交付清单”写成“验收通过”。
- 不连接数据库、不启动身份服务、不部署、不推送；本阶段没有这些边界的改动。

## Out of Scope

- 代替真人操作浏览器、伪造截图/听音/console 证据，或为了让清单好看而勾选未执行项。
- 新玩法、平衡调整、文案扩写、视觉重做、服务端/数据库/部署变更。

## Acceptance Criteria

- [ ] Day1→7 每一两天有新目标/反馈，至少完成水壶或背包之一，另一个仍值得储蓄。
- [ ] 现有物品通过委托产生用途，奖励/关系恰好结算一次；首次关系提升有明确内容反馈。
- [ ] 同一 NPC 不机械两日重复，三日窗口、感谢、新阶段和活动优先级全部成立。
- [ ] Farm/Town/Lakeshore/室内声音层次与所有核心 SFX 实际听音通过。
- [ ] 代表性刷新恢复全部 durable gameplay 与 audio settings。
- [ ] Day28→29 连续且 UI 不承诺未实现 Summer。
- [ ] Day7 镜门预告引发清晰兴趣但不存在 Expedition 玩法。
- [ ] 全路线无 P0/P1、console error 或不可恢复状态；P2 有明确记录。
- [ ] typecheck/build 和必要窄合同最后一次通过，checkpoint 可追溯到精确 commit。
