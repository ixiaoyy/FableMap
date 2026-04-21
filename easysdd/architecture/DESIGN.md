# FableMap 架构总入口

> 状态：骨架（已链接既有 docs/ 文档，待后续确认是否迁移）
> 创建日期：2026-04-21

## 1. 项目简介

FableMap 是一个赛博酒馆 UGC 平台：每个人都可以在真实地图上开一间自己的赛博酒馆，配置 AI NPC，接待访客。

当前主链路：坐标输入 / 定位 → 真实底图 → 浏览酒馆 → 进入酒馆 → 配置 AI NPC → 对话互动 → 写回记忆 → 回访反馈。

## 2. 现有权威文档入口

本仓库在接入 easysdd 前已经有完整 docs/ 文档体系。为了避免未经确认移动既有资料，本文件先作为 easysdd 架构总入口，桥接到现有文档：

- [README.md](../../README.md)：项目总览、当前原型状态、快速开始
- [docs/INDEX.md](../../docs/INDEX.md)：既有文档索引与阅读顺序
- [docs/PRODUCT_BRIEF.md](../../docs/PRODUCT_BRIEF.md)：产品定义与目标体验
- [docs/FABLEMAP_TAVERN_PLATFORM.md](../../docs/FABLEMAP_TAVERN_PLATFORM.md)：赛博酒馆平台完整设计主线
- [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)：系统分层、模块边界、API 端点
- [docs/CURRENT_TASKS.md](../../docs/CURRENT_TASKS.md)：当前实施阶段与优先级
- [docs/WHAT_NOT_TO_BUILD.md](../../docs/WHAT_NOT_TO_BUILD.md)：明确不做清单与约束边界
- [docs/WORLD_SCHEMA.md](../../docs/WORLD_SCHEMA.md)：世界/酒馆数据结构

## 3. 核心概念 / 术语表

以既有 README.md 和 docs/ARCHITECTURE.md 为准：

- Tavern：地图上的虚拟酒馆
- TavernCharacter：酒馆 NPC / 角色
- WorldInfoEntry：世界知识条目
- TavernScene：酒馆场景
- VisitorState：访客状态
- GameplayDefinition：店主发布在某间酒馆内的结构化轻玩法定义
- GameplaySession：访客在某间酒馆开启的一局玩法进度
- AI Director：在店主玩法边界内主持下一步的结构化推进服务
- Tavernkeeper：店主
- Explorer：探索者 / 访客

## 4. 子系统 / 模块索引

当前架构细节暂由 [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) 承载，后续可按 easysdd-architecture-gen 流程逐步拆分/补齐：

- Reality Kernel（现实内核）
- Tavern Platform Core（酒馆平台核心）
- Map Display（地图展示层）
- Tavern Experience（酒馆体验层）
  - [AI 主持小游戏模板库](../features/2026-04-21-ai-mini-game-templates/ai-mini-game-templates-design.md)：聊天输入区上方的前端局部增强，内置 6 个老少皆宜玩法模板，不改变 Tavern / TavernCharacter / VisitorState / ChatMessage schema。
  - [AI 导演的酒馆玩法系统](gameplay-system.md)：店主轻配置 `GameplayDefinition`，访客通过 `GameplaySession` 开始、继续、选择、自由输入、完成或放弃玩法。
- AI Dialogue / Prompt / Memory（AI 对话、提示词与记忆）
  - AI 主持小游戏通过现有 `handleSend()` 普通用户消息触发当前 NPC / 群聊回复，不新增后端 PromptBuilder、LLM 配置或记忆写回分支。
  - Gameplay AI Director 使用店主玩法定义、当前节点和访客输入生成结构化事件；无 AI 或非法结果时使用可回放 fallback。
- Data Persistence（数据持久层）
  - `gameplay_definitions` 属于 Tavern 公开内容；`_gameplay_sessions` 是 TavernStore 私有运行时桶。

## 5. 关键架构决定

接入 easysdd 时暂不重写既有决定；已知主线与边界见：

- [docs/FABLEMAP_TAVERN_PLATFORM.md](../../docs/FABLEMAP_TAVERN_PLATFORM.md)
- [docs/WHAT_NOT_TO_BUILD.md](../../docs/WHAT_NOT_TO_BUILD.md)
- [docs/AI参与开发协议.md](../../docs/AI参与开发协议.md)
- AI 主持小游戏模板库采用“前端模板 + 普通聊天消息”方案；平台只提供通用玩法结构，不替店主生成酒馆专属剧情，详见 [feature design](../features/2026-04-21-ai-mini-game-templates/ai-mini-game-templates-design.md)。
- AI 导演的酒馆玩法系统采用“店主轻配置 + 后端 GameplaySession + AI Director / fallback”方案；默认公益酒馆可以预置样例玩法，普通店主内容仍由店主发布确认，详见 [feature design](../features/2026-04-21-tavern-gameplay-system/tavern-gameplay-system-design.md)。

## 6. 已知约束 / 硬边界

- onboarding 阶段不移动、不删除既有 docs/ 文档。
- `easysdd/tools/` 与 `easysdd/reference/` 是技能包维护的共享资产，可由 onboarding 覆盖刷新。
- 根目录 `AGENTS.md` 是本仓库 AI 协作硬约束入口；后续工作流仍需同时按需参考 `docs/AI参与开发协议.md`。
- Gameplay 不引入可执行脚本、战斗等级装备、访客社交或平台级 Token 计费；完成结算默认只写玩法会话，不自动写长期记忆。
