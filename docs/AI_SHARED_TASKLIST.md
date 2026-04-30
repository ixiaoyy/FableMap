# FableMap AI 全局共享任务记忆（Trellis 迁移版）

> 创建日期：2026-04-17
> 迁移日期：2026-04-30
> 当前状态：旧共享任务清单已迁入 Trellis；本文件只保留全局记忆、旧任务状态快照和未完成任务指针。
> 权威任务入口：`.trellis/tasks/`

---

## 0. 当前规则

1. **新任务、认领、开发状态、验收记录一律进入 Trellis**：`.trellis/tasks/<task>/`。
2. 本文件不再作为活跃任务领取入口，只作为旧 AI 共享任务的全局记忆索引。
3. `docs/claims/` 只保留历史认领记录；新的“认领中 / 开发中 / review / completed”状态不得再只写在 `docs/claims/`。
4. 完成的旧共享任务不再保留长篇实现细节；需要细节时查 git 历史、旧 claim、对应 Trellis 任务或变更记录。
5. 旧共享任务里仍未闭环的项，必须有对应 Trellis 任务；当前 SC-03 已迁入 Trellis 并进入 review，状态以 `.trellis/tasks/04-30-state-card-prompt-injection-sc-03/` 为准。

---

## 1. 旧共享任务状态总览

### P0：立即实现任务

| 旧任务 ID | 名称 | 当前状态 | 说明 |
|---|---|---|---|
| FM-VT-P0-01 | 首页信息架构瘦身 | done | 旧共享任务完成，详细实现记录已从本文件移除 |
| FM-VT-P0-02 | 首次使用分流向导 | done | 旧共享任务完成，详细实现记录已从本文件移除 |
| FM-VT-P0-03 | 3 分钟开店向导 | done | 旧共享任务完成，详细实现记录已从本文件移除 |
| FM-VT-P0-04 | LLM 预设卡 | done | 旧共享任务完成，详细实现记录已从本文件移除 |
| FM-VT-P0-05 | 记忆面板 MVP | done | 旧共享任务完成，详细实现记录已从本文件移除 |
| FM-VT-P0-06 | 小白文案与高级模式折叠 | done | 旧共享任务完成，详细实现记录已从本文件移除 |

### P1：第二阶段任务

| 旧任务 ID | 名称 | 当前状态 | 说明 |
|---|---|---|---|
| FM-VT-P1-01 | 酒馆内三栏工作台 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-P1-02 | 上下文可视化面板 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-P1-03 | 世界书编辑器 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-P1-04 | 世界书命中测试器 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-P1-05 | 酒馆包 Tavern Package 导入 / 导出 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-P1-06 | 酒馆模板卡片 UI | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-P1-07 | 输出修正 / 风格护栏 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-P1-08 | 店主控制台重新分组 | done | 已实现，旧文档不再作为任务入口 |

### P2：高级系统任务

| 旧任务 ID | 名称 | 当前状态 | 说明 |
|---|---|---|---|
| FM-VT-P2-01 | 结构化记忆模型 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-P2-02 | 记忆自动提炼流水线 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-P2-03 | 记忆注入预算与优先级 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-P2-04 | Prompt Block 段落引擎 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-P2-05 | 预设管理器 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-P2-06 | 高级记忆图 / RAG 预研 | done | 已实现，旧文档不再作为任务入口 |

### UX / QA

| 旧任务 ID | 名称 | 当前状态 | 说明 |
|---|---|---|---|
| FM-VT-UX-01 | 轻量浅色 / 暗色主题切换 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-UX-02 | 卡片化酒馆发现列表 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-UX-03 | 移动端酒馆体验 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-QA-01 | 开店向导回归测试 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-QA-02 | 记忆权限测试 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-QA-03 | 世界书注入测试 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-QA-04 | Prompt / 输出修正测试 | done | 旧记录标记已完成；不保留 active Trellis planning 任务 |

### Group Chat

| 旧任务 ID | 名称 | 当前状态 | 说明 |
|---|---|---|---|
| FM-VT-GC-05 | Tavern 模型群聊字段 + service 层 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-GC-06 | 群聊 API 路由 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-GC-07 | 前端群聊 API 封装 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-GC-08 | TavernGroupChatRoom 界面 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-GC-09 | 店主群聊配置界面 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-GC-10 | 群聊测试 | done | 已实现，旧文档不再作为任务入口 |
| FM-VT-GC-11 | 群聊记忆与回访联动 | done | 已实现，旧文档不再作为任务入口 |

### StateCard / Canon Ledger

| 旧任务 ID | 名称 | 当前状态 | Trellis 任务 |
|---|---|---|---|
| SC-01 | 访客侧状态卡生成 | done | `.trellis/tasks/04-29-state-cards-for-tavern-continuity/` |
| SC-02 | 店主侧状态卡管理面板 | done | `.trellis/tasks/04-29-state-cards-for-tavern-continuity/` |
| SC-03 | 状态卡 Prompt 注入 | review | `.trellis/tasks/04-30-state-card-prompt-injection-sc-03/`；runtime chat / prompt preview 接线已补，等待 review/commit |

---

## 2. 当前旧共享未完成项

SC-03 已迁移到 Trellis 并进入 `review`：runtime chat / prompt preview 接线已补，验证记录见对应任务 PRD。

---

## 3. 历史 claim 处理

- `docs/claims/` 中的旧文件只作为历史证据，不再代表当前活跃任务状态。
- 如果历史 claim 与 Trellis 任务状态冲突，以 `.trellis/tasks/<task>/task.json` 为准。
- 新任务不得只创建 `docs/claims/*.md`；必须创建或更新 Trellis 任务。

---

## 4. 后续新增规划

2026-04-30 已把后续 brainstorm / deferred 规划拆入 Trellis，汇总见：

- `.trellis/workspace/lijin/backlog-decomposition-2026-04-30.md`
- `.trellis/tasks/04-28-new-features-brainstorm/`
- `.trellis/tasks/04-29-ai-creation-sites-research/`
- `.trellis/tasks/04-29-npc-role-prompt-safety-brainstorm/`
- `.trellis/tasks/04-30-ai-video-story-mini-game-brainstorm/`

本文件不再复制这些新规划列表，避免 Trellis 与 docs 双写漂移。
