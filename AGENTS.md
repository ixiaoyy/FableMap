# AGENTS.md

本文件是 FableMap 项目的 AI 协作硬约束入口。所有 AI / Codex / Claude / 其他 agent 在本仓库内工作时，必须先遵守本文件，再按任务读取相关文档。

## 适用范围

- 本文件适用于整个仓库。
- 若子目录未来出现更近层级的 `AGENTS.md`，该子目录内以更近层级文件为准。
- 不要把局部任务里的临时规则提升为全局规则，除非用户明确要求更新本文件。

## 项目定位

FableMap 是一个赛博酒馆 UGC 平台：每个人都可以在真实地图上开一间自己的赛博酒馆，配置 AI NPC，接待访客。

当前主链路：坐标输入 / 定位 → 真实底图 → 浏览酒馆 → 进入酒馆 → 配置 AI NPC → 对话互动 → 写回记忆 → 回访反馈。

核心原则：

- 真实地图是空间锚点，酒馆必须挂接真实坐标。
- 主人主权优先：酒馆内容、角色、氛围、访问规则由店主决定。
- AI 是 NPC 对话与体验引擎，不替平台自动创作酒馆内容。
- Token 由店主自行承担，平台不做充值、结算或抽成系统。
- 角色卡与数据格式应优先保持 SillyTavern 兼容和可导出。

## 权威文档读取顺序

开始任何中高风险工作前，至少按需读取：

1. `README.md`：项目总览、启动方式、核心模块。
2. `docs/INDEX.md`：既有文档导航。
3. `docs/PRODUCT_BRIEF.md`：产品定义与目标体验。
4. `docs/FABLEMAP_TAVERN_PLATFORM.md`：赛博酒馆平台主线设计。
5. `docs/ARCHITECTURE.md`：系统分层、模块边界、API 端点。
6. `docs/WORLD_SCHEMA.md`：数据模型与 Schema 约束。
7. `docs/WHAT_NOT_TO_BUILD.md`：明确不做清单。
8. `docs/AI参与开发协议.md`：AI 协作、认领、验证和变更说明规则。
9. `easysdd/architecture/DESIGN.md`：easysdd 架构总入口。
10. `easysdd/reference/shared-conventions.md`：easysdd 目录与元数据约定。

如果文档与聊天中的临时说法冲突，除非用户明确改口，否则以仓库内权威文档为准。

## 工作流要求

- 新功能：优先走 easysdd feature 流程；小改动可按用户要求快速处理，但仍需明确范围和验收。
- Bug 修复：先复现 / 定位根因，再改代码；不要凭猜测大范围重构。
- 中高风险任务开始前，需要明确：目标、允许修改范围、不可修改范围、依据文档、验证方式。
- 一个改动尽量只做一类事情：协议变更、功能变更、内容变更不要混在一起。
- 不要未经用户确认移动、删除或重命名既有 `docs/` 文档；easysdd 初始化后，旧文档仍是有效资料。
- 每次功能/bug 级改动都要留下可追踪说明：优先使用 easysdd 文档；沿用旧流程时放入 `docs/changes/YYYY-MM-DD-slug.md`。

## 禁止事项

- 不要让 AI 自由生成后原样提交；所有 AI 产出都是候选草稿。
- 不要擅自新增 Schema 字段、改变字段类型、枚举语义、必填/可选含义。
- 不要自创项目术语、缩写或中英文混用的新概念。
- 不要引用不存在的模块、接口、包、脚本或数据文件。
- 不要把局部区域 / 局部功能的规则污染成全局规则。
- 不要夹带无关格式化、重构或依赖升级。
- 不要实现 `docs/WHAT_NOT_TO_BUILD.md` 明确排除的方向，包括平台生成酒馆内容、平台级 Token 付费、无锚点自由空间、访客间社交、传统地图 App 功能、战斗/等级装备系统等。
- 不要执行破坏性 git / 文件操作（如 reset、clean、删除大目录），除非用户明确要求并已确认范围。

## 代码规范

### Python 后端

- 主要代码位于 `fablemap/`，测试位于 `tests/`。
- 优先保持标准库 + `requirements.txt` 中已有依赖；新增依赖必须先说明理由并获得确认。
- API / Schema 改动必须同步相关测试与文档。
- 持久化、对话历史、记忆写回相关逻辑要保持可落库、可回放、可测试。

### React / Vite 前端

- 前端位于 `frontend/`，使用 React 18 + Vite + ESM。
- 不要无批准引入大型 UI 框架、状态管理库或地图渲染依赖。
- 组件改动应保持现有服务层边界：API 调用优先放在 `frontend/src/services/`，可复用逻辑优先放在 hooks / utility 模块。
- 前端 UI 改动要考虑移动端和窄屏体验；涉及视觉/交互的改动应至少做 build，并在可行时浏览器人工验证。

### 数据与兼容

- Tavern / TavernCharacter / WorldInfoEntry / VisitorState 等核心数据结构必须与 `docs/WORLD_SCHEMA.md` 保持一致。
- SillyTavern 角色卡导入/导出兼容性不能被无意破坏。
- 店主 API Key、LLM 配置、Token 统计相关改动必须默认按敏感数据处理，不得写入日志或暴露给访客。

## 验证要求

按改动范围选择最小但真实的验证，不允许声称完成但未运行验证。

常用命令：

```powershell
# Python 语法检查
py -3 -m compileall -q fablemap

# 后端测试
py -3 -m pytest -q --tb=short

# 前端构建
npm --prefix .\frontend run build

# 前端脚本测试
npm --prefix .\frontend test
```

验证选择规则：

- 只改文档：检查目标文件内容与链接路径，通常无需跑全量测试。
- 改 Python：至少运行 `py -3 -m compileall -q fablemap`；涉及行为时运行相关 pytest 或全量 pytest。
- 改前端：至少运行 `npm --prefix .\frontend run build`；涉及服务/规则脚本时运行 `npm --prefix .\frontend test`。
- 改 API / 数据模型 / 协议：必须同步或补充测试，并更新对应文档。
- 验证失败要如实报告失败命令、失败原因和下一步，不要包装成成功。

## 变更汇报格式

完成任务时，简明列出：

- 改了哪些文件。
- 为什么改。
- 验证命令与结果。
- 未做事项 / 风险 / 需要用户确认的点。

不要声称“完成”“通过”“没问题”，除非已经有本轮新鲜验证输出支撑。
