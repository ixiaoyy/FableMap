# 现阶段纵向切片精细化总门禁：实施顺序

## 已完成基线

1. 已建立 `docs/CURRENT_SLICE_POLISH_GATE.md` 全量验收矩阵和能力冻结合同。
2. 工具选择、昼夜、好感、NPC 日程移动/避让/生活动作、Town 扩展、角色创建、动态对话与春季日历已进入代码基线；各实施任务已归档，不再作为活跃工作重复推进。

## 当前执行顺序

1. 对活跃子任务 `interaction-npc-map-signage-polish-v1` 与 `npc-hit-reaction-mvp` 核对已实现代码、静态合同和剩余真人验收项，形成 handoff 后归档。
2. 运行当前范围的一次最小相关静态合同、typecheck 与 client build；只修可稳定复现的确定性 P0/P1。
3. 保留 `CURRENT_SLICE_POLISH_GATE.md` 的十二地图、八名 NPC、UI、手机和 200% zoom 真人验收矩阵，未验条目不伪造通过。
4. 记录当前并行首页任务和工作区重叠文件，禁止整文件 restore 或把他人改动纳入本任务提交。
5. 完成基线 handoff/checkpoint 记录并归档总门禁，进入用户已批准的 Day 1–7 阶段。
6. 真人后续反馈按可复现缺陷回到对应窄任务，不以历史总门禁阻塞新阶段。

## 门禁后的规划规则

- 总门禁归档前不创建下一阶段功能 PRD。
- 总门禁归档后先重新评审玩家问题，再只选择一个最小可玩闭环；送礼、灵兽、Expedition 或其他历史候选均不自动继承。
- 下一阶段需要新的用户明确批准，不能由本实施计划提前命名或预设系统。

每个子批默认验证：一次最小相关静态合同 + 类型/构建；真实浏览器路径由真人按 handoff 清单执行。

## Static closeout — 2026-09-01

- 用户确认 Agent 不执行真实浏览器验收；`docs/CURRENT_SLICE_POLISH_GATE.md` 已改为真人 handoff，所有未获证据项目保持未勾选。
- `test:life-loop`：11/11；`test:town-population`：6/6；`typecheck`：通过；`build:client`：通过。
- 静态 checkpoint 记录在 `docs/checkpoints/pre-retention-v1/README.md`，权威 commit 为 `5984ed67498c468ca09a2235ce9a301fa34ffdc5`。
- 当前工作区包含并行首页重设计，未由本任务暂存、提交、恢复或归属；后续按文件完整 diff 精确合并。
- 当前门禁至此完成 Agent 责任；真人反馈按窄缺陷回流，不阻塞已批准 Day 1–7 阶段。
