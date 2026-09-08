# 转型前生活模拟基础盘：实施计划

2026-09-08 范围更新：本任务只管理第一阶段的十个先行批次，不再代表全部复刻范围或第二阶段切换门禁。完整目标见 [两阶段计划](../../../docs/PHASE_PLAN.md)。旧版本背景不代表当前 Godot 实现状态。

## Planning gates

- [x] 用户确认转型前采用生活模拟基础盘，矿洞首版可无战斗但后续完整矿洞与战斗必须交付。
- [x] 创建父任务与十个独立子阶段，现有共建簿/地表资源任务纳入同一树。
- [x] 按参考资料确认小型物件合法格摆放、农场建筑自由 footprint 摆放/移动；删除固定 authored 插槽假设。
- [x] 对父 PRD 执行最终 convergence pass，并同步 PRODUCT_BRIEF、CURRENT_STATE、TOWN_ROADMAP 与 WHAT_NOT_TO_BUILD。
- [x] 用户评审并确认父任务最终范围；父任务保持 planning，不作为生产实现 target。

## Ordered delivery

1. **Close the current slice**
   - [x] `surface-mining-v1` 独立 commit `15a7b61` 已进入本地 main（2026-09-06 对账）。
   - [ ] `surface-mining-v1` 完整真人验收和归档。

2. **Foundation state and economy**
   - [ ] `storage-shipping-placement-v1`：2026-09-06 已单独确认启动，v13 代码与最小检查完成，完整真人验收/提交/归档待办；不将子项打勾为完成。
   - [ ] `skills-recipe-unlocks-v1`

3. **Materials and calendar**
   - [ ] `shallow-mine-smelting-tools-v1`
   - [ ] `full-mine-combat-v1`
   - [ ] `four-seasons-minimum-v1`

4. **Farm production depth**
   - [ ] `farm-automation-v1`
   - [ ] `chicken-hay-loop-v1`
   - [ ] `basic-processing-v1`
   - [ ] `kitchen-cooking-v1`

5. **Long-term integration**
   - [ ] `town-community-ledger-v1`

6. **先行批次验收与完整对照**
   - [ ] 完成先行批次集成验收，对照完整原作范围登记剩余缺口和后续任务；不自动进入原创阶段。

## Per-child execution rule

每个 child 依次完成 brainstorm → PRD convergence → complex design/implement → 用户启动确认 → `trellis-before-dev` → implementation → `trellis-check` → code-spec → explicit commit → human acceptance/archive。不得并行修改同一 GameState/current version，也不得用父任务授权替代 child 的实施批准。

## Verification and rollback

- 自动检查采用每个 child 的最小相关子集；父任务只做跨阶段清单与最后一次整体验收，不建立新测试平台。
- 每次启动前检查完整工作区和暂存区，确保上一个 child 已独立提交，保留其他并行工作。
- 任一 child 失败时只回滚该 child 的 production paths/current version；不对仓库根目录或已有验收阶段执行整树 restore。
