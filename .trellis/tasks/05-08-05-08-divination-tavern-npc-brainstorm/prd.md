# brainstorm: 占卜类型酒馆与玄学 NPC

## Goal

参考 `H1d3rOne/xuan-deduct` 的「传统术数 + 西方占卜 + AI 解读」产品方向，为 FableMap 设计一种**占卜类型酒馆**：店主可以在真实地图坐标上开一间占卜/星象/命理主题空间，空间里的 NPC 负责以角色扮演方式提供塔罗、星象、八字、六爻、梅花易数等“乱七八糟但有氛围”的占卜式互动。

目标不是把 FableMap 变成独立算命工具或付费测算 App，而是把占卜能力转译成**单间酒馆里的 NPC 体验、玩法模板和店主可控内容包**。

## What I already know

- 用户希望使用 Trellis 记录并推进这个方向。
- 用户明确给出参考项目：<https://github.com/H1d3rOne/xuan-deduct>。
- 参考项目 README 显示其核心能力包括：
  - 传统术数：四柱八字、六爻、大六壬、奇门遁甲、梅花易数、紫微斗数。
  - 西方占卜：占星术、塔罗牌。
  - AI 智能解读：每种排盘有专属提示词模板，并支持 OpenAI Compatible、腾讯混元等 Provider。
  - 工具与商业化：农历/干支/生肖/星座/五行/吉日查询、取名、用户体系、金币/VIP、测算记录、分享。
- FableMap 的核心约束：
  - 空间必须挂接真实坐标。
  - 空间内容、NPC、氛围、规则由店主确认；平台不能自动发布内容。
  - Token/LLM 配置由店主自行承担；不做平台金币/VIP/充值/抽成系统。
  - 角色卡和世界书应保持 SillyTavern 兼容。
  - Gameplay 是空间内轻玩法，不应变成战斗、等级、装备、排行榜。

## Research Notes

### What `xuan-deduct` does that is relevant

- 将多种占卜/术数拆成明确入口：八字、六爻、大六壬、奇门、梅花、紫微、占星、塔罗。
- 将“排盘/抽牌/计算结构化结果”和“AI 解读文本”分开：先得到结构化材料，再用专属 prompt 输出解读。
- 提供免费工具与记录/分享，降低使用门槛。

### What should not be copied directly

- 不直接照搬其 Spring Boot + uni-app 技术栈；FableMap 当前是 Python/FastAPI + React/Vite。
- 不直接搬运金币、VIP、付费测算、平台计费逻辑；这违反 FableMap 的 Token 自主边界。
- 不把排盘算法作为首要目标导入；算法正确性、版权/许可证、测试与长期维护成本都较高。
- 不让平台自动生成并上线占卜 NPC、世界书或空间内容；所有模板都必须是店主确认后发布。

### FableMap 可复用的现有边界

- `TavernCharacter`：可做“占卜师 / 星象师 / 塔罗师 / 巫女 / 道长 / 观星学徒”等 NPC 角色卡。
- `WorldInfoEntry`：可做术数背景、禁忌、口癖、牌义/星象术语触发注入。
- `GameplayDefinition`：可做结构化轻玩法，例如“三牌塔罗”“每日星象问答”“六爻问事”“灵签问答”。
- `SkillPackSetting`：未来可做 owner 显式启用的 `divination-oracle` 技能包，但现有技能包系统目前只内置 `local-rumor`。
- 当前 `special_type` 已实现底层支持（v0.8），允许通过 `special_type='divination'`（待选）进行显式分类。
- `layout_style='npc-chat' | 'quest-play' | 'hybrid-room'`：占卜酒馆可以默认偏向 NPC 会话或轻玩法入口。

## Assumptions (temporary)

- 占卜酒馆首版应优先做成**体验模板/主题包**，而不是完整排盘算法平台。
- 首版可用 LLM + 店主确认的角色卡/世界书/玩法模板营造“玄学体验”，但必须明确娱乐性与安全边界。
- 访客输入生日、出生时间、出生地、感情/事业/健康等敏感问题时，系统应提醒“娱乐解读，不替代医疗、法律、金融或现实决策建议”。
- 若要保存测算记录，首版应仅作为当前酒馆内的聊天/玩法历史，不扩展为跨空间个人命理档案。

## Requirements (evolving)

- 支持一种“占卜类型酒馆”产品形态：真实坐标上的主题酒馆，不是无锚点算命页。
- 酒馆内至少有一个占卜 NPC，负责以角色方式询问问题、选择仪式、给出解读。
- MVP 选择 **主题模板优先**：先提供店主可确认的占卜酒馆模板，而不是先做技能包或完整排盘算法。
- 模板内容包括：
  - 默认占卜 NPC 角色卡草案。
  - 占卜酒馆场景/氛围文案草案。
  - 术数/塔罗/星象相关 WorldInfo 草案。
  - 轻玩法 GameplayDefinition 草案，例如“三牌塔罗”“每日星象问答”“灵签问答”。
  - 访客可见的娱乐性与安全边界提示。
- 支持多种“占卜入口”作为可选体验：
  - 塔罗：单牌 / 三牌 / 凯尔特十字可作为未来扩展，MVP 可先三牌。
  - 星象：今日星象、太阳/月亮/上升等轻解读；精确排盘可后置。
  - 八字/紫微/六爻/梅花/奇门：首版可作为 NPC 风格化解读或模板入口，精确算法后置。
- 所有默认 NPC、世界书、玩法定义必须是店主可查看、可编辑、可丢弃、确认后才发布。
- 不引入平台金币/VIP/付费测算。
- 不把占卜结果表述为确定命运或专业建议。

## Acceptance Criteria (evolving)

- [x] PRD 明确占卜酒馆与参考项目的可借鉴点、不可照搬点。
- [x] 选择一种 MVP 技术路径：模板优先 / 技能包优先 / 算法引擎优先。
- [ ] 明确是否需要新增 `place_type`，或仅用现有 tavern + metadata/模板表达。
- [ ] 明确首版支持哪些占卜模式，哪些后置。
- [ ] 明确安全提示、敏感输入、娱乐性边界。
- [ ] 若后续实现涉及 Schema/API，必须同步 `docs/WORLD_SCHEMA.md`、测试和前端服务。

## Definition of Done (team quality bar)

- Trellis PRD 记录完整需求、取舍和验收标准。
- 需要实现时，先完成 Phase 2 research/init-context/start，再编码。
- 后续若改后端：至少运行 `py -3 -m compileall -q backend/src`，行为变更补相关 pytest。
- 后续若改前端：至少运行 `npm --prefix .\frontend run build`，视觉/交互改动做桌面 + 窄屏自验收。
- 若新增图片/NPC 资产：遵守项目图片资源规范与 prompt sidecar 规则。

## Feasible approaches

### Approach A: 主题模板优先（Recommended for MVP）

把“占卜酒馆”做成可创建/可导入的店主确认模板：默认 NPC 角色卡、世界书、三牌塔罗/每日星象等轻玩法定义、明亮神秘的 UI 文案。

- Pros:
  - 最符合 FableMap 的“店主主权 + 空间 UGC”边界。
  - 不需要先做复杂算法，也不引入新计费系统。
  - 可快速验证占卜酒馆是否有吸引力。
- Cons:
  - 术数准确性弱，更偏角色扮演和娱乐体验。
  - 八字、紫微、奇门等只能先做“风格化问答”，不能承诺专业排盘。
  - **Decision**: 用户已选择该路线作为 MVP。

### Approach B: `divination-oracle` 技能包优先

新增 owner 显式启用的占卜技能包，为 NPC 注入统一能力边界、占卜模式列表、免责声明、输入收集规则和输出格式。玩法模板仍可存在，但核心能力挂在 skill pack 上。

- Pros:
  - 适合未来多个酒馆复用；边界更清晰。
  - 可在运行时统一控制“不得给医疗/金融/法律建议”等约束。
- Cons:
  - 需要扩展现有 skill pack 定义、配置、测试和 UI。
  - 如果没有配套模板，店主仍要自己搭很多内容。

### Approach C: 排盘/抽牌引擎优先

参考 `xuan-deduct` 的结构，先实现塔罗抽牌、八字/星盘/六爻等确定性计算，再让 NPC 基于结构化结果解读。

- Pros:
  - 更像完整测算产品，结果可回放、可测试。
  - 未来可形成强差异化工具能力。
- Cons:
  - 范围最大，算法正确性与测试成本高。
  - 容易偏离 FableMap 当前主链路，变成传统测算 App。
  - 需要非常谨慎处理用户生日、出生地等敏感信息。

## Out of Scope

- 平台金币、VIP、充值、抽成。
- 把占卜结果作为医疗、法律、金融、心理治疗或人生重大决策建议。
- 精确八字/紫微/奇门/占星排盘算法的一次性完整实现。
- 跨空间个人命理档案、用户画像或匹配推荐。
- 平台自动生成并公开发布 NPC、世界书、空间内容。

## Decision (ADR-lite)

**Context**: `xuan-deduct` 展示了多种术数/占卜入口与 AI 解读结合的完整测算 App 形态，但 FableMap 的核心是真实坐标上的店主空间和 NPC 体验，不宜首版就复制完整排盘、金币/VIP 或平台计费系统。

**Decision**: MVP 采用 **Approach A：主题模板优先**。先做一个可由店主确认的占卜酒馆模板包，包括默认占卜 NPC、场景氛围、WorldInfo、轻玩法入口和安全提示；暂不做独立排盘算法引擎，也不新增平台计费。

**Consequences**:

- 可以快速验证“占卜酒馆 + NPC 主持体验”的吸引力。
- 实现范围主要落在模板、创建/导入体验、前端展示与 Gameplay 轻玩法上。
- 八字、紫微、奇门、精确星盘等专业计算先作为后续独立任务，不在本 MVP 承诺准确排盘。
- 后续若多个特殊酒馆都需要类似能力，可再抽象为 `divination-oracle` skill pack 或 special tavern type layer。

## Open Questions

1. 首版占卜模板将使用已实现的 `special_type='divination'` 进行显式分类。
2. 首版默认提供几个占卜玩法入口？

## Technical Notes

- Reference repo: <https://github.com/H1d3rOne/xuan-deduct>
- Local docs inspected:
  - `docs/WHAT_NOT_TO_BUILD.md`
  - `docs/WORLD_SCHEMA.md`
  - `.trellis/tasks/05-06-special-tavern-type-thin-layer/prd.md`
- Local code inspected:
  - `backend/src/fablemap_api/core/tavern.py`
  - `backend/src/fablemap_api/core/skill_packs.py`
  - search results for `place_type`, `skill_packs`, `gameplay_definitions`, `layout_style`
