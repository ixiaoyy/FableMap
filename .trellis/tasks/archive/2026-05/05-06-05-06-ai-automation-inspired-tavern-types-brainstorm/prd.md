# brainstorm: AI 自动化启发的多种类空间设计

## Goal

参考用户提供的 AI 自动化顾问、垂直行业 Agent、内容获客、企业知识库与高端交付增强器等案例中“按人群和流程提供具体帮助”的思路，为 FableMap 设计多种类“空间”方向：既保留真实地图坐标与主人主权，又让不同空间能面向不同人、不同场景、不同需要提供可验证的体验闭环，而不是以赚钱为目的、变成通用聊天机器人、SaaS 工具或平台代创内容。

## What I already know

* 用户希望“使用 Trellis 头脑风暴”，先给出方案和理解，不要求立即实现。
* 用户素材中的商业案例只作为启发：有效的 AI 不是卖 prompt 或万能助手，而是嵌入具体流程，围绕高频、高人工、高错误成本、有数据、需要被帮助的场景做工作流改造。
* FableMap 当前项目定位是空间 UGC 平台：真实地图坐标锚点、店主配置 AI NPC、访客对话互动、记忆写回、回访反馈。
* 用户已澄清：赚钱不是目的；本 brainstorm 的核心是让不同类型的访客/店主/真实场景获得不同的帮助和体验。
* 需要把“行业 AI Agent / 自动化工作室”的思路翻译成 FableMap 内的多种空间类型，但目标不是赚钱，而是针对不同人给出不同需要；同时不能让平台替店主自动生成完整空间内容。

## Assumptions (temporary)

* 这里的“多种类空间”优先是产品/玩法/信息架构方案，不先改数据库 Schema 或代码。
* 空间类型应作为店主可选择的场景模板/服务意图/需要类型，而不是平台强制生成内容、商业化漏斗或 SaaS 行业 CRM。
* 最先适合收敛为轻量 MVP：新增一组空间类型/需求模板、适配入口文案/创建向导/发现卡片/NPC 配置建议；是否产品化垂直 Agent 是后续可选方向，不是当前目标。

## Open Questions

* 已确认：MVP 不以商业化验证为优先，核心是“针对不同人给出不同需要”。后续问题应围绕优先服务哪些人群/场景来收敛。

## Requirements (evolving)

* 方案必须遵守真实坐标锚点与主人主权。
* 方案必须避免平台级 Token 付费、访客社交网络、战斗等级装备等禁区。
* 空间类型需要能映射到具体用户意图、NPC 角色、输入输出、可验收帮助/体验价值。
* 同一真实地点可以因为服务对象不同而形成不同空间类型，例如陪伴、学习、资料整理、创作、问诊、回访等。

## Acceptance Criteria (evolving)

* [ ] 至少提出 5–8 类可区分的空间类型。
* [ ] 每类说明目标用户/场景、核心 NPC、访客动作、店主配置重点、可验证帮助或体验指标。
* [ ] 明确 MVP 范围和 out-of-scope。
* [ ] 记录与现有 FableMap 文档/约束的对齐点。

## Definition of Done (team quality bar)

* 需求和决策记录在本 PRD。
* 若后续进入实现，按改动范围补充测试/构建/文档验证。
* 不在本 brainstorm 中擅自修改 Schema 或产品主线代码。

## Out of Scope (explicit)

* 本轮不实现代码、不改数据库、不新增收费/结算系统。
* 不设计平台自动替店主生成完整空间内容的能力。
* 不把空间做成脱离真实坐标的通用 SaaS 工作台。

## Technical Notes

* Task created: `.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/`。
* 待补充：从 README、产品/架构/Schema/禁区文档和相关既有任务中提取约束。

## Repo Context Findings

* `README.md` / `docs/PRODUCT_BRIEF.md` / `docs/FABLEMAP_TAVERN_PLATFORM.md` all confirm the product center is “真实地图上的空间 UGC 平台”，不是通用 AI SaaS 或平台生成内容。
* 空间已有核心承载物：`Tavern.characters`、`world_info`、`gameplay_definitions`、`skill_packs`、`scene_prompt`、`layout_style`、`place_type`。
* 当前 `place_type` 更像现实地点类型：`tavern/cafe/milk-tea-shop/restaurant/convenience-store/bookstore/school/hospital/home`；已有 `05-06-special-tavern-type-thin-layer` 任务在讨论“特殊空间类型薄层”，提醒不要把类型层做成插件市场或跨空间游戏框架。
* 现有创建向导已有 `TAVERN_TEMPLATES`，包括“第三中学传达室 / 雨夜便利店 / 旧书店后室 / 街角探索清单台 / 雨夜失物调查局 / 社区探索小清单”。后续多种类空间可优先扩展模板/主题包，而不是立即扩展持久 Schema enum。
* 现有 `ownerGameplayTemplates.js` 已有安全模板约束：不做战斗、等级、装备、排行榜或可交易奖励；不索取身份证件、住址、手机号、银行卡等敏感信息；不替代医疗、法律、投资等专业结论；不绕过店主确认自动发布剧情、NPC 或空间内容。
* `docs/WHAT_NOT_TO_BUILD.md` 明确禁止：平台绕过店主确认发布内容、平台级 Token 充值/结算、无锚点空间、无边界访客社交、端到端无结构化生成、传统地图/App/游戏化功能。

## Initial Interpretation

用户提供的“AI 自动化赚钱路径”在本任务中只作为案例来源，抽象成 5 个可迁移原则；FableMap 不把赚钱作为设计目标：

1. **不是泛泛聊天，而是回应具体需要**：每类空间都要有“输入 → NPC/玩法处理 → 输出/回访”的闭环。
2. **不要万能助手，要垂直场景**：空间应按行业/任务分型，NPC 是“某类超级员工”，不是泛泛陪聊。
3. **先理解需要，再沉淀模板**：在 FableMap 里对应“店主先用模板配置自己的空间，再把重复有效的帮助方式沉淀为模板/玩法包”。
4. **接入私有资料但不越权**：对应 `world_info`、prompt blocks、owner-confirmed presets；访客只能看到公开/授权内容。
5. **可感知帮助优先**：每类空间都应定义是否让访客更清楚、更被陪伴、更容易完成整理/学习/创作/回访等可观测体验指标。

这意味着“多种类空间”不应只是换皮（咖啡店/书店/便利店），而应成为 **人群需要 + 店主服务意图 + NPC 职能 + 结构化玩法 + 权限边界** 的组合。

## User Clarification / Decision Update

**用户确认**：赚钱不是目的。前文商业案例只用于启发“AI 如何针对具体场景产生帮助”，不能把 FableMap 的空间设计导向获客、付费转化或 SaaS 商业闭环。

**设计重心调整为**：

* 面向不同人：学生、创作者、社区居民、店主、疲惫的夜归人、求助者、资料整理者、学习者、经营者等。
* 回应不同需要：陪伴、学习、整理、创作、问答、诊断、回访、纪念、轻任务、现实求助边界。
* 输出不同体验：不是“多赚多少钱”，而是“这个人来到这间空间后，得到的帮助是否更贴合 TA 当前处境”。

## Candidate Tavern Type Matrix (Draft)

| 类型 | 启发来源 | FableMap 形态 | 核心 NPC | 典型访客输入 | 输出 / 帮助 | 建议 MVP 承载 |
|---|---|---|---|---|---|---|
| 流程诊所空间 | AI 自动化顾问 / 实施工作室 | 老板把一个重复流程带来“问诊” | 流程诊断师、自动化技师、成本会计 | “现在谁处理、用什么表、哪里卡住” | 流程图、可自动化点、节省估算、下一步清单 | `gameplay_definitions`：三步流程诊断；不实际接 CRM |
| 行业工位空间 | 垂直行业 AI Agent | 每间空间代表一个行业工位：房产、教培、跨境、招聘、律所等 | 行业助理、资料整理员、跟进秘书 | 房源/简历/listing/案件材料/课程信息 | 标准话术、风险清单、跟进建议、材料目录 | 模板包 + WorldInfo；高风险行业只做资料整理/初筛 |
| 线索吧台空间 | AI 内容 + 获客机器 | 店主用空间接待有明确需要的人，访客提交需求 | 迎宾顾问、需求采集员、内容策划师 | 需求表、目标、背景、希望获得的帮助 | 需求摘要、下一步建议、可交给店主/人工继续处理的记录 | 私有/店主可见的访客记录；不做骚扰营销/爬取 |
| 档案书房空间 | 企业知识库 / 私有助手 | 真实办公室/团队空间的私有知识吧 | 档案管理员、SOP 教练、客服质检员 | “这个 SOP 怎么做”“合同条款在哪” | 引用式回答、资料位置、待人工复核项 | `world_info`/RAG 未来接口；MVP 用 owner-confirmed knowledge |
| 交付工坊空间 | 高端交付增强器 | 咨询/设计/投放/研究者的交付工作台 | 研究员、方案架构师、审稿人 | 客户 brief、会议纪要、素材 | 提案大纲、竞品分析框架、检查清单 | 店主管理视角优先，访客侧只提交 brief |
| 训练营空间 | 教育/培训机构 | 学习陪伴、作业反馈、家长沟通 | 助教、班主任、练习教练 | 作业文本、薄弱点、自评 | 学习报告草稿、练习建议、家长反馈草稿 | 未成年人高隐私边界；店主确认后使用 |
| 招聘驿站空间 | 招聘公司/HR | 候选人初筛和面试准备 | 简历筛选官、面试教练、跟进秘书 | 简历、岗位 JD、自我介绍 | 匹配摘要、面试题、跟进邮件草稿 | 不做自动拒绝/歧视决策；只做辅助草稿 |
| 本地服务问诊空间 | 本地商家/医美/房产/法律/财税 | 真实门店的前台问答与需求分流 | 前台、材料清单员、预约助手 | 需求、时间、预算、材料情况 | 预约前清单、服务范围说明、人工转接摘要 | 明确非医疗/法律/投资结论；不收敏感证件 |
| 公益/陪伴灯塔空间 | 公益站/医院陪伴/社区帮助 | 非商业、低风险陪伴和现实求助边界 | 值班护士、社区志愿者、夜间接线员 | 压力、求助意向、回访便签 | 善意清单、现实求助边界、回访提示 | 复用现有公益空间与陪伴玩法模板 |
| 创作者制片空间 | AI 内容生产但面向作品 | 短剧、角色、世界书、素材策划 | 剧本统筹、角色导演、发布日历员 | 主题、角色、目标平台 | 脚本草稿、分镜清单、发布日历 | AI 草稿必须店主确认，不自动发布 |

## Feasible Product Approaches

**Approach A: 经营意图模板层（Recommended for MVP）**

* 不立即新增 `place_type` enum；把“流程诊所 / 行业工位 / 档案书房”等作为创建向导中的 `tavern template` / `play-pack` / 标签组合。
* 优点：最快验证；不碰 Schema；符合已有 `TAVERN_TEMPLATES` 和 `GameplayDefinition` 模式；可以先给店主选择“我想让这间空间帮访客完成什么”。
* 缺点：发现页筛选和类型统计较弱，后续若类型稳定可能需要正式类型层。

**Approach B: 特殊空间类型薄层**

* 在既有 `place_type` 之外或之内新增轻量特殊类型标记，例如 `workflow-clinic`、`knowledge-room`、`industry-desk`，并复用 `05-06-special-tavern-type-thin-layer` 的边界。
* 优点：发现页、创建页、空间页能明确展示“这是什么类型”；利于长期平台信息架构。
* 缺点：涉及 Schema/API/frontend contracts；要避免类型爆炸和插件化。

**Approach C: 人群需要解决方案包 / 店主服务包**

* 把空间当成真实帮助入口：每个包包含 NPC、WorldInfo、玩法、访客表单、店主管理字段与输出模板。
* 优点：最能体现“不同人得到不同帮助”，能覆盖学习、陪伴、创作、资料整理、问答、回访等具体需要。
* 缺点：范围最大，可能滑向 SaaS/CRM/商业获客或外部工具集成；必须用边界约束防止偏离 FableMap 主线。

## Expansion Sweep

### Future evolution

* 若某类模板被多次使用，可从“经营意图模板”升级为“特殊空间类型薄层”。
* 行业工位类空间未来可接入 owner-confirmed 外部资料 / RAG / 表格，但 MVP 不接真实客户系统。

### Related scenarios

* 创建向导：从“选地点类型”后增加“这间空间主要帮访客完成什么”。
* 发现页：可以用“流程诊断 / 知识问答 / 陪伴回访 / 创作工坊”等标签，而不一定改变物理 `place_type`。
* 店主管理页：不同类型推荐不同 NPC 模板、玩法模板、WorldInfo 清单和禁区提示。

### Failure & edge cases

* 高风险行业（法律、医美、财税、招聘）必须只做资料整理、初筛、清单和人工转接，不给最终专业结论。
* 线索/需求接待不能变成访客骚扰、爬取、群发或无同意营销；其目标应是帮访客表达需要、帮店主理解请求。
* 知识库不能把 owner 私有资料泄露到公开分享 payload。
* AI 自动化不能绕过店主确认直接改写空间内容、NPC、世界书或运行预设。

## Draft Recommendation

先采用 **Approach A：经营意图模板层**。

第一批推荐不是按行业铺满，也不是按赚钱能力排序，而是按“可复用的人群需要/帮助方式”做 6 个顶层类：

1. 流程诊所：帮人把混乱流程理清。
2. 行业工位：给特定场景的人一个熟悉业务的 NPC 助手。
3. 需求吧台：帮访客表达需求，帮店主理解请求。
4. 档案书房：帮人找到、理解和复用资料。
5. 创作/交付工坊：把模糊想法整理成草稿、清单或方案。
6. 陪伴灯塔：面向公益、社区、夜归、压力和回访场景提供低风险陪伴。

然后每个顶层类再挂 2–3 个行业示例，而不是一开始创建几十个枚举类型。

## Phase 2 Research Pass (2026-05-06)

### Relevant Specs / Authority

* `AGENTS.md`: 本轮必须保持真实坐标、主人主权、SillyTavern 兼容、Token 自担，不做平台代创、平台结算、访客社交网络或传统游戏化系统。
* `docs/PRODUCT_BRIEF.md` / `docs/FABLEMAP_TAVERN_PLATFORM.md`: 多种类空间必须仍是“真实地图上的空间 UGC 平台”，不是通用 AI SaaS、CRM、行业工具站。
* `docs/WORLD_SCHEMA.md`: MVP 可复用 `Tavern.characters`、`world_info`、`gameplay_definitions`、`skill_packs`、`scene_prompt`、`layout_style`、`place_type`；不应在 brainstorm 中直接新增持久字段。
* `docs/WHAT_NOT_TO_BUILD.md`: 所有类型都要避开平台绕过店主确认发布内容、平台级 Token 充值/结算、无锚点空间、访客社交墙、战斗/等级/装备/排行。
* `.trellis/spec/frontend/map-anchor-copy.md`: 创建/发现页面即使展示“经营意图”，仍要露出地址或坐标门牌，不能让类型标签遮蔽真实锚点。
* `.trellis/spec/frontend/discovery-liveliness-signals.md`: 发现页标签若后续实现，应优先用既有安全 payload 字段和静态 owner-confirmed 模板信息，不引入未授权活动/社交信号。
* `.trellis/spec/frontend/mobile-single-mainline.md`: 移动端主线仍是进店聊天与 NPC 互动；多种类空间不能把第一屏改成复杂 SaaS 工作台。

### Code Patterns Found

* `frontend/app/product/tavernTemplates.js`: 现有 `TAVERN_TEMPLATES` 通过 owner-confirmed package 承载 tavern、characters、world_info、prompt preset；适合作为“经营意图模板层”的最小落点。
* `frontend/app/product/ownerGameplayTemplates.js`: 现有玩法模板明确写入 forbidden guardrails，可复用为“流程诊断 / 回访信笺 / 陪伴清单 / 资料整理”等结构化轻玩法。
* `frontend/app/routes/create.tsx`: 创建向导已有地点类型卡片和右侧 live preview；如果进入实现，最小 UI 是在地点类型之后加“这间空间主要帮助谁/完成什么”的模板选择，不改变 `place_type` 提交。
* `frontend/app/routes/discover.tsx`: 发现页可后续显示模板/意图 tag，但应保持真实坐标、地址、NPC、到访等既有信息为主，不做行业市场或排行榜。
* `.trellis/tasks/05-06-special-tavern-type-thin-layer/prd.md`: 若以后从模板升级为正式特殊类型，应单独定义 thin-layer，不在本 brainstorm 中提前扩 Schema。

### Likely Follow-up Modification Scope (not in this brainstorm)

* `frontend/app/product/tavernTemplates.js`: 增加 6 个“经营意图”模板或给现有模板补 `needType` / tags（若不改 Schema，可只在模板常量内存在）。
* `frontend/app/product/ownerGameplayTemplates.js`: 增加与 6 类空间对应的轻量 GameplayDefinition 草稿模板。
* `frontend/app/routes/create.tsx`: 增加“帮助意图”选择/预览；提交仍由店主确认，不自动发布内容。
* `frontend/app/routes/discover.tsx`: 可选展示 owner-confirmed 意图标签；不新增社交、排行、商业转化面板。
* 若选择 Approach B 才需要：`docs/WORLD_SCHEMA.md`、backend Tavern schema/API、frontend typed service 与测试同步更新。

### Context Configuration

* 已运行 `python ./.trellis/scripts/task.py init-context ".trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm" docs`。
* 已补充 `implement.jsonl` / `check.jsonl` / `debug.jsonl`，并将默认缺失的 `.claude/commands/trellis/*` context 替换为本仓库存在的 `.agents/skills/finish-work/SKILL.md` 与 `.agents/skills/check/SKILL.md`。
* 已运行 `python ./.trellis/scripts/task.py validate ".trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm"`，context 校验通过。
* 已运行 `python ./.trellis/scripts/task.py start ".trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm"`，当前 Trellis task 已激活。

## Converged MVP Proposal v1

### Recommended MVP shape

采用 **经营意图模板层**：真实 `place_type` 仍表示现实地点；“流程诊所 / 档案书房 / 陪伴灯塔”等作为 owner-confirmed 的创建模板、玩法模板、NPC 配置建议和发现标签存在。这样可以先验证“不同人得到不同帮助”，而不把类型层做成 schema enum、行业 SaaS 或插件市场。

### First 6 top-level tavern intents

| 顶层类型 | 目标用户 / 场景 | 核心 NPC | 访客动作 | 店主配置重点 | 可验证帮助 / 体验指标 | MVP 承载 |
|---|---|---|---|---|---|---|
| 流程诊所 | 被重复流程困住的店主、团队成员、自由职业者 | 流程诊断师、自动化技师 | 描述当前流程、卡点、材料流转 | 流程提问脚本、禁区、输出格式 | 访客得到“现状流程 + 卡点 + 下一步清单” | GameplayDefinition 草稿 + NPC 模板 |
| 行业工位 | 有垂直任务的人：招聘、教培、房产、跨境等 | 行业助理、资料整理员 | 提供 JD、房源、课程、材料片段 | 行业 WorldInfo、风险提示、人工转接话术 | 访客得到材料目录、风险清单或跟进草稿 | Tavern template + WorldInfo |
| 需求吧台 | 不知道如何表达需求的访客、本地服务咨询者 | 迎宾顾问、需求采集员 | 填写/对话说明目标、时间、预算、限制 | 需求表单、店主可见摘要、隐私边界 | 访客得到清晰需求摘要，店主得到可处理记录 | 轻玩法 + 私密/店主可见记录边界 |
| 档案书房 | 团队成员、社群成员、资料查找者 | 档案管理员、SOP 教练 | 提问“某资料在哪里/怎么做” | owner-confirmed knowledge、引用规则、不可见资料边界 | 访客得到引用式回答、资料位置、待复核项 | WorldInfo 先行；未来 RAG |
| 创作/交付工坊 | 创作者、咨询/设计/研究交付者 | 剧本统筹、方案架构师、审稿人 | 提交 brief、素材、草稿目标 | 输出模板、审稿清单、发布前确认 | 访客得到草稿大纲/检查清单，不自动发布 | Tavern template + Gameplay template |
| 陪伴灯塔 | 夜归人、社区居民、公益/医院陪伴场景 | 值班志愿者、护士、夜间接线员 | 说出压力、写回访便签、拆一件小事 | 现实求助边界、低风险语气、回访规则 | 访客得到善意清单、边界提醒、回访提示 | 复用陪伴/回访玩法模板 |

### MVP in scope

* 在产品方案层定义上述 6 类“经营意图”，每类都有 NPC 职能、访客输入、输出物、店主配置重点和禁区。
* 后续若进入实现，优先作为创建向导模板 / tavern template / owner gameplay template / 发现标签，而不是持久 `place_type` enum。
* 每类都必须保留真实坐标展示、店主确认发布、owner API key / token 边界和高风险专业免责声明。

### MVP out of scope

* 不接 CRM、企微、飞书、表格、RAG、支付、预约、营销群发等外部系统。
* 不把访客记录变成公开墙、社交 feed、排行榜或线索买卖。
* 不做医疗、法律、投资、招聘录拒等最终专业判断。
* 不让平台自动生成并发布 NPC、世界书、剧情、图片或玩法。

## Decision (ADR-lite Draft)

**Context**: 用户希望从 AI 自动化 / 垂直 Agent / 知识库案例中抽取“按人群和流程提供具体帮助”的产品启发，但已确认赚钱不是目的；FableMap 的主线仍是真实地图、主人主权、AI NPC、记忆和回访。

**Decision**: 推荐先采用 **Approach A：经营意图模板层**。`place_type` 继续表达真实地点；“流程诊所、行业工位、需求吧台、档案书房、创作/交付工坊、陪伴灯塔”作为 owner-confirmed 模板与玩法包进入产品，而不是立刻新增 schema/type 层。

**Consequences**: MVP 最快、风险最低、符合现有 `TAVERN_TEMPLATES` / `ownerGameplayTemplates` 模式；短期发现页筛选和统计能力较弱。若某类模板被反复使用，再通过单独任务升级为“特殊空间类型薄层”，届时同步 schema/API/docs/tests。

## Open Decision Before Implementation

当前 brainstorm 已收敛到推荐方案，但进入实现前仍需用户确认：第一步是否按 **经营意图模板层** 做，还是改为正式“特殊空间类型薄层”。
## User Decision (2026-05-06)

用户已选择 **A：经营意图模板层**。

后续开发方向锁定为：不新增 `place_type` / backend schema / API 字段，先用 frontend owner-confirmed 模板、玩法模板和发现标签验证 6 类空间经营意图。

## Implementation Plan

* Plan saved: `.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/implementation-plan.md`。
* Plan scope: frontend-only Approach A, with source tests, build verification, and Playwright desktop/mobile self-acceptance.
## Implementation Evidence (2026-05-06)

Implemented **Approach A: 经营意图模板层** as a frontend-only slice. No backend/API/schema or `place_type` values were changed.

### Files changed

* `frontend/app/product/tavernIntentTemplates.js`: added 6 owner-confirmed tavern intent templates and lookup/search helpers.
* `frontend/app/routes/create.tsx`: added the create-wizard “经营意图” selector and live preview copy while preserving hidden `place_type` submission.
* `frontend/app/product/ownerGameplayTemplates.js`: added 6 draft GameplayDefinition templates aligned to the approved intents.
* `frontend/app/lib/tavern-intent-tags.js`: added public-safe discovery intent tag derivation from existing tavern payload fields only.
* `frontend/app/routes/discover.tsx`: added intent search text and safe card chips.
* `frontend/scripts/tavern-intent-templates-test.mjs`: added intent catalog contract test.
* `frontend/scripts/tavern-intent-tags-test.mjs`: added discovery intent tag contract test.
* `frontend/scripts/create-wizard-route-test.mjs`: added create route contract assertions.
* `frontend/scripts/gameplay-test.mjs`: updated owner gameplay template expectations.
* `frontend/package.json`: wired the new tests into `npm --prefix .\frontend test`.

### Verification

* `node .\frontend\scripts\tavern-intent-templates-test.mjs` — passed (`tavern-intent-templates-test: ok`).
* `node .\frontend\scripts\create-wizard-route-test.mjs` — passed (`create-wizard-route-test: ok`).
* `node .\frontend\scripts\gameplay-test.mjs` — passed (`gameplay-test: ok`).
* `node .\frontend\scripts\tavern-intent-tags-test.mjs` — passed (`tavern-intent-tags-test: ok`).
* `npm --prefix .\frontend test` — passed.
* `npm --prefix .\frontend run typecheck` — passed.
* `npm --prefix .\frontend run build` — passed.
* Playwright self-acceptance — passed via `.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/artifacts/playwright-check.mjs` against `http://127.0.0.1:5173/create`.
  * Desktop screenshot: `.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/artifacts/create-intent-desktop.png`.
  * Mobile screenshot: `.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/artifacts/create-intent-mobile.png`.
  * Report: `.trellis/tasks/05-06-05-06-ai-automation-inspired-tavern-types-brainstorm/artifacts/playwright-report.json` with `ok: true`.

### Notes / risk

* The Playwright run loaded `/create` without the FastAPI backend running; Vite logged expected proxy errors for `/api/v1/owners/me/default-llm`, but the create page degraded correctly and the intent selector checks passed.
* No commits were created during inline execution; user can run `$finish-work` / commit after review.
