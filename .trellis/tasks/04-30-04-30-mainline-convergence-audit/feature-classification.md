# Feature Classification — Mainline Convergence Audit

Classification date: 2026-04-30

This is a **triage recommendation**, not a deletion patch. No code or task directory is deleted by this document.

## Criteria

- **真闭环**：可实际使用，写入真实数据，可回访/复查，有基础测试或构建验证。
- **半闭环**：有真实 API/UI/storage 的一部分，但缺少主链路关键一环、集中入口、验收脚本或产品解释。
- **纯展示**：主要是 UI card、preview、mock、研究/brainstorm，尚不改变真实闭环。
- **应冻结 / 删除**：偏离主链路或当前收益低；冻结表示“不继续加功能”，不是马上删代码。

## Summary Counts

| Bucket | Count | Default action |
|---|---:|---|
| 真闭环 / 可保留 | 10 | 保留；只做 bugfix / 验收补证 |
| 半闭环 / 只允许收敛 | 16 | 不扩功能；只能补主链路缺口 |
| 纯展示 / 研究 / preview | 19 | 冻结；等主链路验收后再排序 |
| 应冻结 / 候选删除或重框定 | 18 | 冻结；需要用户明确重新开闸 |

## 真闭环 / 可保留

| Task | Status | Recommendation | Reason |
|---|---|---|---|
| `04-30-create-tavern-step-wizard-mvp` | review | 保留，纳入主链路验收 | 直接覆盖创建酒馆 + NPC + LLM 配置入口。 |
| `04-28-tavern-interior-ui` | completed | 保留 | 支撑访客进入后的主要空间体验。 |
| `04-29-tavern-guestbook` | completed | 保留但不扩展成社交 | 店主可见访客反馈，符合“回访反馈”边界。 |
| `04-29-ai-assisted-tavern-drafts` | completed | 保留 | Owner-confirmed draft，辅助创建，不绕过主人确认。 |
| `04-29-state-cards-for-tavern-continuity` | review | 保留，收敛为记忆/正史核心 | 直接支撑长期连续性，但只保留候选/确认边界。 |
| `04-30-state-card-prompt-injection-sc-03` | review | 可继续验收 | 只要限定 confirmed/fixed-canon 注入，不扩成自动写正史。 |
| `04-28-test-coverage` | review | 保留 | 支撑主链路验收。 |
| `04-28-docker-deployment` | review | 保留 | 支撑可运行/交付，但不应绑进产品功能扩张。 |
| `04-28-mobile-adaptation` | completed | 保留 | 主链路需要移动可用。 |
| `04-29-npc-role-prompt-safety-brainstorm` | review | 保留为规范输入 | 约束 NPC 角色卡安全，防止后续 prompt 越界。 |

## 半闭环 / 只允许收敛

| Task | Status | Recommendation | Missing closure |
|---|---|---|---|
| `04-30-04-30-mainline-convergence-audit` | in_progress | 当前 P0 | 本任务产出收敛口径和验收清单。 |
| `04-30-revisit-memory-feedback-surface` | planning | 暂缓，之后可作为 F3 修复 | 方向正确，但必须先证明现有记忆/回访可见，再决定是否加 UI。 |
| `04-30-tavern-entry-surface-polish` | planning | 暂缓 | 属于入口体验，但应等 golden path 定稿后只打磨关键入口。 |
| `04-30-tavern-discovery-experience-polish-mvp` | planning | 暂缓 | 发现页是主链路前段，但不能先于创建/进入/回访验收。 |
| `04-30-mobile-critical-flow-first-screen-polish` | planning | 暂缓 | 可服务主链路，但需绑定具体验收步骤。 |
| `04-30-mobile-single-mainline-experience` | planning | 暂缓 | 方向符合“收敛”，但应作为 audit 后修复任务而不是新功能。 |
| `04-30-owner-token-usage-reference-status` | planning | 冻结到主链路后 | 有 token 统计基础，但容易滑向账单/计费；只允许 owner reference。 |
| `04-30-ai-draft-lifecycle-status-ui` | planning | 暂缓但保留 | 能减少 AI 草稿误解，但先保证创建/确认主线稳定。 |
| `04-30-owner-ai-dialogue-preview-simulator` | planning | 暂缓 | 对店主配置有帮助，但必须确保不写访客历史。 |
| `04-30-worldinfo-visual-editor-modern-mvp` | planning | 暂缓 | WorldInfo 是 NPC 上下文的一部分，但 UI 现代化不是 P0。 |
| `04-30-prompt-composer-style-dials-mvp` | planning | 暂缓 | 需要先确认现有 LLM/prompt 配置闭环。 |
| `04-30-character-editor-prompt-risk-linter` | planning | 暂缓 | 安全有价值，但先沉淀最小规则，不扩复杂 linter。 |
| `04-30-safe-npc-character-card-template-guidelines` | planning | 可转文档，不写代码 | 有助角色配置安全；不应变成新功能面。 |
| `04-30-npc-batch-import-background-cast-mvp` | planning | 暂缓 | 可降低配置成本，但会扩大 NPC 管理面。 |
| `04-30-home-real-coordinate-governance-review | planning | 保留为治理审计 | 用于判断 Home 是否偏离真实坐标主线。 |
| `04-28-notification-system` | completed | 冻结扩展，只保留已实现通知基础 | 有真实 WebSocket/通知基础，但不是主链路核心；只允许用于入场/留言等现有事件。 |

## 纯展示 / 研究 / Preview

| Task | Status | Recommendation | Reason |
|---|---|---|---|
| `04-29-04-29-owner-dashboard-presentational-mvp` | review | 冻结为展示，不扩展 | presentational aggregation，不直接证明核心闭环。 |
| `04-30-notification-center-presentational-followup` | planning | 冻结 | 表现层后续，不是核心闭环。 |
| `04-29-ai-creation-sites-research` | in_progress | 冻结研究 | 外部参考会继续带来发散。 |
| `04-30-public-site-reference-matrix-research` | planning | 冻结研究 | 同上。 |
| `04-29-new-feature-ideation` | planning | 冻结 | 新点子池在收敛期应停止追加。 |
| `04-28-new-features-brainstorm` | in_progress | 冻结 | 父级 feature backlog 应停止增长。 |
| `04-28-next-feature-brainstorm` | completed | 归档即可 | 已完成，不再作为 active 输入扩张。 |
| `04-30-ai-video-story-mini-game-brainstorm` | planning | 冻结 | 短剧/视频方向强发散。 |
| `04-30-serial-novel-export-episode-builder` | review | 冻结为导出工具 | 确定性导出有边界，但不是创建→对话→回访主链路。 |
| `04-30-map-anchor-emotional-copy-polish` | planning | 冻结 | 文案有价值，但不是当前验收阻塞。 |
| `04-30-discovery-liveliness-signals-rumor-guestbook` | planning | 冻结 | 发现页活性信号先不扩。 |
| `04-30-tavern-activity-signals-without-social-network` | planning | 冻结 | 防社交网络方向正确，但非 P0。 |
| `04-30-visual-souvenir-shared-moment-preview` | review | 冻结为 preview | 仅 prompt preview，不进入主链路。 |
| `04-30-voice-greeting-tts-pack-preview` | review | 冻结为 preview | no-audio preview，不进入主链路。 |
| `04-30-tavern-gm-layer-structured-conflict-candidates` | review | 冻结为 preview | 候选生成有边界，但不是 P0。 |
| `04-30-preset-import-preview-safe-converter` | review | 冻结为 preview | 安全 preview，不应用、不保存，不是核心闭环。 |
| `04-30-confirmed-short-video-asset-pipeline-research` | planning | 冻结研究 | 媒体管线过早。 |
| `04-30-external-channel-companion-integration-research | planning | 冻结研究 | 外部渠道不是 FableMap MVP 中心。 |
| `04-29-04-29-npc-expression-art-quality-rebuild` | review | 冻结为资产质量任务 | 视觉资产可保留，但不要继续扩大美术管线。 |

## 应冻结 / 候选删除或重框定

| Task | Status | Recommendation | Reason |
|---|---|---|---|
| `04-28-quest-system` | review | 冻结并重框为探索清单 | “任务系统”容易滑向传统 RPG；必须收敛为酒馆委托/探索清单。 |
| `04-30-quest-exploration-checklist-reframe` | planning | 只保留为重框定文档 | 不继续做新 quest 功能。 |
| `04-30-tavern-short-drama-gameplay-template-mvp` | review | 冻结，不继续扩短剧 | 已有实现可留待验收，但不继续叠模板。 |
| `04-30-gameplay-template-library-for-owners` | planning | 冻结 | 在主链路未稳前，模板库会继续扩大功能面。 |
| `04-30-discovery-short-drama-teaser-cards` | planning | 冻结 | 为短剧导流，不是核心链路。 |
| `04-30-owner-ai-short-drama-draft-assistant` | planning | 冻结 | AI 生成短剧草稿会拉大内容生成边界。 |
| `04-30-visual-souvenir-full-image-asset-pipeline` | planning | 冻结 | 真图像生成/资产管线过早且高风险。 |
| `04-30-voice-greeting-tts-synthesis-playback` | planning | 冻结 | 真 TTS 合成/存储过早且涉及隐私/成本。 |
| `04-30-worldinfo-trigger-pack-cat-empire-quest-draft` | planning | 冻结 | 局部设定包/任务草稿不应污染全局主线。 |
| `04-30-adult-content-governance-design` | planning | 冻结 | 成人治理重要但不是当前 MVP；必须单独高风险评审。 |
| `04-30-persistent-preset-library-import-model-design` | planning | 冻结 | 持久 preset library 会引入新模型/治理面。 |
| `04-30-model-profile-preset-compatibility-report` | planning | 冻结 | 兼容性报告不是 P0；先保证基础 LLM 配置可用。 |
| `04-30-multi-npc-tavern-room-full-ux` | planning | 冻结 | group-chat 已足够；完整多人房间 UX 会扩范围。 |
| `04-29-tavern-skill-packs-mvp` | review | 冻结扩展，只保留已实现边界 | Skill pack 容易成为能力市场；当前只允许已验证本地传闻等小能力。 |
| `04-29-neighborhood-rumor-system` | completed | 冻结扩展 | 活性信号有价值，但不能转成社交/推荐网络。 |
| `04-28-place-type-expansion` | completed | 冻结扩展 | 已扩展地点类型；不要继续稀释“酒馆”主线。 |
| `04-28-home-system | completed | 冻结扩展，等待治理审计 | Home 容易演化成无锚点个人主页，必须复盘真实坐标边界。 |
| `04-30-revisit-care-proactive-notification-design` | planning | 冻结 | 主动通知需要 opt-in/quiet hours/频控，当前不应在主链路验收前展开。 |

## Notes on Duplicates / Backlog Hygiene

- `04-30-public-site-reference-matrix-research` appears once as a task but belongs conceptually under both public-site research and AI-creation research; do not spawn more research children until convergence completes.
- Short-drama has at least four linked tasks (`brainstorm`, `template`, `teaser`, `draft assistant`, plus video asset research). Treat the whole cluster as frozen.
- Preview cluster (`GM Layer`, `Episode Builder`, `Voice Greeting`, `Visual Souvenir`, `Preset Import`) should not be expanded into real generation/storage pipelines until mainline smoke is green.

## Thaw Rule

A frozen task may be reopened only if it satisfies all of the following:

1. It directly improves one of the ten Mainline Acceptance Gate steps in `mainline-audit.md`.
2. It does not add Schema fields or new provider/storage systems without explicit approval.
3. It includes a focused verification command and updates this task’s classification if its closure status changes.
4. It does not introduce platform-published content, platform token billing, visitor social networking, unanchored spaces, or RPG combat/levels/rankings.

