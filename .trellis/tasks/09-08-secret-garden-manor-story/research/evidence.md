# 规划证据与待补研究

## 记录边界

- 记录日期：2026-09-08；本地检查基线：`8c23ad27`，分支 `codex/godot-engine-migration`。
- 本次使用当前对话、只读源代码、项目文档和下列官方网页；没有访问数据库、运行游戏、安装插件或上传素材。
- 代码存在只证明已有接线，文档声称的历史验收不自动视作当前运行结果。
- 后续开发基线变化时，按受影响入口更新证据，不把本文件当作永久不变的事实。

## 原著依据

主要考据入口：[Project Gutenberg 原著全文](https://www.gutenberg.org/files/113/113-h/113-h.htm) 与 [书目页](https://www.gutenberg.org/ebooks/113)。本轮核对了人物、章节目录以及花园初见、老园丁、画像、苏珊和结局相关内容。

| 证据编号 | 原著位置 | 规划用途 |
|---|---|---|
| B01 | 1–4 章 | 身世、远行、入住与玛莎，映射 C01 |
| B02 | 5–9 章 | 哭声与花园发现，映射 C02 |
| B03 | 10–12 章 | 迪肯、园艺与土地愿望，映射 C03 |
| B04 | 13–18 章 | 科林与孩子相处，映射 C04 |
| B05 | 19–22 章 | 出行、花园初见、老园丁与首次站立，映射 C05 |
| B06 | 23–24 章 | 共同活动与成长，映射 C06 |
| B07 | 25–26 章 | 画像与苏珊，映射 C07 |
| B08 | 27 章 | 信件、归来与重逢，映射 C08 |

这是一份章节覆盖索引，不声称本轮已经完成全书逐句审校。正式对白和分镜阶段需逐场复核，写明压缩与原创互动。story.md 的地图、玩家参与方式、恢复行为和结局后日常均为改编建议。

### 内容来源登记要求

- 英文原著、正式中文改编、现代译本、绘本、影视造型、音频与字体各自登记，不能以同名作品概括全部来源。
- 正式对白原则上由项目根据核对内容自写中文；不复制未知授权的现代译本。
- 这里的网页链接是考据依据，不是已经取得所有素材或所有发行地区权利的证明。最终采用对象在内容定稿前核验，不在本轮作泛化法律结论。
- 全书逐章分镜、中文名称表、具体删改理由和原文定位尚待 P01 完成；不伪造已采用许可证或素材授权记录。

## 工程证据

路径相对仓库根目录；行号对应本次检查基线。表中的建议与已有能力分别描述。

| 编号 | 文件与位置 | 已检查事实 | 对设计的影响 |
|---|---|---|---|
| E01 | `apps/mirror-island/godot/engine-lock.json:2` | 引擎锁定 `4.7.2-stable` 标准版 | 不因对话选型升级引擎或引入 C# |
| E02 | `apps/mirror-island/scripts/prepare-godot.mjs:15`、`:103` | 从 `public/map` 枚举 TMJ，生成区域包装与 catalog | 添加地图要走当前准备链，不手改 generated |
| E03 | `apps/mirror-island/godot/domain/game_session.gd:35` | 装载规则、对话、catalog、日程并组合领域服务 | 新内容须完整注册，不能只加场景 |
| E04 | `apps/mirror-island/godot/domain/game_session.gd:116`、`:179` | 单一命令入口；区域切换核对真实出口后更新位置 | 新门需要条件检查，不能绕过该入口 |
| E05 | `apps/mirror-island/godot/domain/game_session.gd:242`、`:250` | 候选先校验，保存成功后发布；失败沿用 pending 重试 | 庄园进度与消耗继续使用同一链 |
| E06 | `apps/mirror-island/godot/domain/world_rules.gd:12`、`:77`、`:83` | 区域/资源/设施索引，出口检测与碰撞 | 可增加有限动态门，但需共同服务玩家和路径 |
| E07 | `apps/mirror-island/godot/domain/resource_rules.gd:23`、`:48` | 种植与浇水使用 `farm` 和 `farm:*` ID | 固定花床单独设计，不宣称多区域耕作已存在 |
| E08 | `apps/mirror-island/godot/domain/resource_rules.gd:86`、`:122`、`:135` | 采集清理检查工具/位置；非农场树木存在再生逻辑 | 故事性修复不能直接套成会再生资源 |
| E09 | `apps/mirror-island/godot/domain/npc_motion.gd:16`、`:44`、`:72` | reset/transition 和日程选择构造当前角色活动 | 新故事人物需阶段性活动输入与恢复，不只是新名称 |
| E10 | `apps/mirror-island/godot/domain/npc_motion.gd:102` | 使用 Godot A* 与静态掩码，添加动态障碍 | 新条件门与轮椅占地必须纳入路径检查 |
| E11 | `apps/mirror-island/godot/domain/social_rules.gd:23`、`:79` | 当前交谈联动委托/好感，礼物另有固定合同 | 故事人物不默认混入现有社交循环 |
| E12 | `apps/mirror-island/godot/presentation/game_world.gd:131`、`:149`、`:300` | 按区域 ID 装载、读取区域媒体并路由互动 | 场景、图集、名称、目标与命令需一起接通 |
| E13 | `apps/mirror-island/godot/presentation/game_world.gd:397` | 室外判定列出 `farm/town/foothills/lakeshore`，其他走室内组 | 新庄园花园需明确雨风/照明属性 |
| E14 | `apps/mirror-island/godot/ui/game_ui.gd:92`、`:96`、`:505` | 已有时钟暂停、世界输入锁和对白菜单 | 沿用输入协调，扩展故事展示，不新建孤立焦点层 |
| E15 | `apps/mirror-island/godot/persistence/save_codec.gd:30`、`:78` | 封套版本 `1`、玩法版本 `13`，严格字段/资源/农田/居民集合校验 | 新初始状态与 codec 联动，禁止静默回填旧档 |
| E16 | `apps/mirror-island/godot/persistence/save_repository.gd:21`、`:35` | 独立本地读写入口 | 不需要数据库或第二套故事存档 |
| E17 | `apps/mirror-island/package.json` 的 `scripts` | `typecheck:client` 调 Godot check；Web/Windows 构建有媒体与地图前置 | 文档任务不跑产品命令；未来只选最小相关检查 |

本次读取生成 catalog 得到 12 个区域：Farm、Town、Cottage、Seed Shop、Blacksmith、Foothills、Lakeshore 与五处民宅。它是派生检查证据，不作为本任务手工维护或提交的地图来源。

## 项目规则依据

| 文件 | 与本任务直接相关的约束 |
|---|---|
| [根 AGENTS.md](../../../../AGENTS.md) | 单一产品/运行时、固定地图拓扑、独立任务、媒体和远程授权 |
| [Godot AGENTS.md](../../../../apps/mirror-island/godot/AGENTS.md) | 手工文件目录、生成物边界、方法注释和最小验证 |
| [Godot 规范](../../../spec/frontend/godot-singleplayer-migration.md) | 会话状态、当前保存、媒体与导出合同 |
| [产品简报](../../../../docs/PRODUCT_BRIEF.md) | 农场/小镇布局、生活循环和已选美术方向 |
| [当前不做](../../../../docs/WHAT_NOT_TO_BUILD.md) | 新住宅/剧情限制、永久禁区和开发档政策 |
| [小镇路线图](../../../../docs/TOWN_ROADMAP.md) | 规划与实施分离，已有任务顺序不能被默默替换 |
| [美术规范](../../../../docs/IMAGE_ASSETS_SPEC.md) | 清新田园、成套素材、来源、不可变媒体和真实视觉验收 |
| [探索设计原则](../../../../docs/EXPLORATION_DESIGN_PRINCIPLES.md) | 环境发现、现有动作、可重试条件和可见世界变化 |

部分历史文档仍保留 Phaser/旧存档版本或旧引擎限制措辞；本次按最新根规则与 Godot 专门规范理解当前运行时，没有借规划顺手清理这些文件。未来只修订本任务直接涉及的产品例外。

## 开源候选初查

本节是 O05 的研究起点。版本信息为 2026-09-08 查询快照，未下载归档、未安装、未导出，不据此宣称无安全问题或完全兼容。

### Dialogue Manager

- 官方 [仓库](https://github.com/nathanhoad/godot_dialogue_manager) 描述为无状态分支对话编辑/运行工具；[发布页](https://github.com/nathanhoad/godot_dialogue_manager/releases) 本次列出 `v4.1.0 for Godot 4.7`，短提交为 `a719088`。
- 官方 [许可证](https://github.com/nathanhoad/godot_dialogue_manager/blob/main/LICENSE) 为 MIT。正式选择时需再核对固定 tag 内许可证与文件范围，此处未取得归档哈希。
- 仓库 README 的最低版本措辞与单个发布标题不是同一层证据；以选择的固定 release 在项目 `4.7.2-stable` 的实际导入/导出结果为准。
- 适用推断：对白编辑与选择可能减少本项目文本编排工作。仍需限制 mutation，接入原生 UI 和会话保存；无状态名称不代表接入后不会出现副作用。

### Dialogic

- 官方 [固定发布 `2.0-alpha-20`](https://github.com/dialogic-godot/dialogic/releases/tag/2.0-alpha-20) 写明支持 Godot 4.5 及以上，并记录状态/存档逻辑的破坏性变化。
- 官方 [许可证](https://github.com/dialogic-godot/dialogic/blob/main/LICENSE) 为 MIT。该版本仍标记 Alpha，不能把发布日期或功能多少当成稳定性验收。
- 适用推断：时间线能力可能服务多人演出，但接管变量/保存的集成范围可能更大。当前不采用其存档体系，也不预先宣布最终淘汰。

### 进入选型前需要的证据

| 项目 | 本轮状态 | 后续完成标准 |
|---|---|---|
| 官方来源与候选发布 | 已初查 | 固定完整提交、归档 SHA-256、下载地址 |
| 许可证与分发 | 已读官方 MIT 页面 | 核对固定版本及包含的第三方文件，确定随产品许可文本 |
| 维护与升级变化 | 已查看发布记录 | 记录目标版本升级路径及已知破坏性变化 |
| 安全记录与网络行为 | 未核验 | 检查公开安全公告、相关问题和实际必要网络路径，不能以未搜索到等同安全 |
| 引擎与 GDScript 兼容 | 只有官方版本说明 | 项目锁定版本下的窄导入、中文对话与 Web/Windows 导出结果 |
| 体积与性能 | 未测量 | 对两个实际场景记录导出增量和可接受运行表现，不设空泛阈值 |
| 状态与保存归属 | 已确定项目边界 | 证明插件只读派生条件并通过固定命令结算 |
| UI 与输入 | 未核验 | 键盘、触摸、长中文、窄屏与暂停可用 |
| 退出成本 | 未量化 | 文本/ID 可保留，移除插件不需要改写所有领域事件或引入存档迁移 |

官方 `main` 页面仅作资料引用，不作为生产安装地址。选择任一依赖必须锁定，不引用漂移主分支或镜像。

## 尚未完成的研究

- 玩家视角、时间关系、篇章时长与资源数量的产品决策。
- 完整逐场剧本、中文译名统一、人物出场与原著细节审校。
- Town 新入口精确坐标、地图格数、轮椅路径占地和场景数量。
- 正式美术来源、图集尺寸、动画数量、音频与预算。
- 候选插件的完整兼容/安全/体积核验和正式选型。
- 当前实现的实际运行与真人完整验收；本任务没有开展这些工作。
