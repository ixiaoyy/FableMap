# FableMap

> Turn real places into cyber taverns.

## 项目简介

FableMap 是一个**赛博酒馆 UGC 平台**。

地图上的每个区域都可以成为一个虚拟酒馆，用户可以开店、配置 AI NPC、接待访客。

**一句话定位**：每个人都可以在真实地图上开一间自己的赛博酒馆。

## 核心理念

- **真实地图是空间锚点**：酒馆必须坐落在真实地图上，访客可以在现实中回访虚拟酒馆所在的位置
- **主人主权**：酒馆的内容、角色、氛围、访问规则完全由店主决定
- **AI 即灵魂**：酒馆内的 NPC 由 AI 驱动，能和访客自然对话
- **Token 即燃料**：酒馆的运营燃料是 LLM token，由店主自行承担
- **开源可移植**：角色卡格式兼容 SillyTavern，数据可导出，不锁定用户

## 当前产品方向

当前唯一主链路：

> **坐标输入 / 定位 → 真实底图 → 浏览酒馆 → 进入酒馆 → 配置 AI NPC → 对话互动 → 写回记忆 → 回访反馈**

两种用户角色：

- **探索者 (Explorer)**：打开地图 → 浏览酒馆 → 进入感兴趣的酒馆 → 和 AI NPC 聊天 / 调查线索 / 接委托做轻文字任务
- **店主 (Tavernkeeper)**：打开地图 → 选择地点 → 创建酒馆 → 添加角色 → 配置 LLM → 开门迎客

## 核心概念映射

FableMap 赛博酒馆版使用全新的概念体系：

| 旧概念 | 新概念（赛博酒馆） |
|--------|------------------|
| Place / POI | Tavern（酒馆） |
| Faction | TavernCharacter（酒馆角色） |
| World Info | WorldInfoEntry（世界知识条目） |
| World | TavernScene（酒馆场景） |
| Player State | VisitorState（访客状态） |
| Fantasy Name | Tavern Name（自定义） |

## 当前原型状态

仓库当前已具备赛博酒馆平台的最小可运行闭环：

- 可通过设置 `PYTHONPATH=backend/src` 后执行 `py -3 -m fablemap_api api` 启动后端
- 地图展示酒馆标记（基于现有 WorldMap.jsx）
- 酒馆详情面板 + ChatPanel 对话界面
- `/api/taverns/*` 酒馆管理（已实现基于网格的 CRUD）
- `/api/chat` 基础对话端点
- 写回机制（chat history writeback）
- 角色引擎（characterEngine.js）基础结构
- 创建向导支持一键套用酒馆模板、系统预设 NPC、开门检查清单；角色编辑器内提供可补空/覆盖的 NPC 性格模板、推荐筛选与访客第一印象预览
- 访客侧提供“不会说什么就点一下”的快捷句、玩法提示和轻文字游戏模板（线索调查 / 社区小任务 / 冒险工会），让聊天酒馆也能扩展为选择式文字互动
- 冒险工会玩法支持本地任务板、发委托、接委托、提交完成、声望身份奖励和酒馆差异化待遇
- 店主可用轻配置表单添加结构化酒馆玩法；访客可开始 / 继续 / 选择 / 自由输入 / 完成 / 放弃一局玩法，AI 可用时由 AI Director 主持，无 AI 时使用可回放随机事件 fallback
- 4 个默认公益酒馆已内置贴合各自主题的 published 玩法，无需外部 API Key 也可体验

当前已存在但**不再作为主线继续扩写**的部分：

- [`frontend/app/product/WorldMap.jsx`](frontend/app/product/WorldMap.jsx) — 地图渲染（待整合酒馆标记）
- [`frontend/app/product/worldMap/renderers.js`](frontend/app/product/worldMap/renderers.js)
- [`frontend/app/product/worldMap/geometry.js`](frontend/app/product/worldMap/geometry.js)
- [`frontend/app/product/mapAssets/manifest.js`](frontend/app/product/mapAssets/manifest.js)
- [`frontend/app/product/mapAssets/iconMapping.js`](frontend/app/product/mapAssets/iconMapping.js)

## 快速开始

```
# 安装依赖
pip install -r requirements.txt
cd frontend && npm install && npm run build

# 启动后端（PowerShell）
$env:PYTHONPATH = "$PWD\backend\src"
py -3 -m fablemap_api api

# 访问
http://127.0.0.1:8950/
```

## 核心模块

### 后端 (`backend/src/fablemap_api/core/`)

| 模块 | 用途 |
|------|------|
| `tavern.py` | 酒馆核心: Tavern CRUD, 状态管理 |
| `gameplay.py` | 酒馆玩法模型、AI Director 与 fallback 推进 |
| `llm_clients.py` | LLM 客户端工厂: OpenAI / Claude / Ollama |
| `char_card_parser.py` | SillyTavern 角色卡解析 (JSON / PNG tEXt) |
| `world_info_injector.py` | 世界知识注入器 (关键词匹配) |
| `api_service.py` | API 逻辑 |
| `writeback.py` | 状态持久化 |
| `web/router.py` | API 路由: `/api/taverns/*`, `/api/chat` |

### 前端 (`frontend/app/product/`)

| 模块 | 用途 |
|------|------|
| `services/tavernService.js` | 酒馆 CRUD, LLM 调用 |
| `GameplayManager.jsx` | 店主玩法管理 |
| `TavernGameplayLauncher.jsx` | 访客玩法入口 |
| `GameplaySessionPanel.jsx` | 访客玩法会话面板 |
| `services/characterEngine.js` | 角色数据结构 |
| `services/placeProtocol.js` | Place 协议 |
| `services/apiClient.js` | API 客户端 |
| `WorldMap.jsx` | 酒馆地图面板 |
| `TavernEntryPanel.jsx` | 酒馆入场（密码验证等） |
| `TavernInterior.jsx` | 酒馆内部（角色列表 + ChatPanel） |
| `ChatPanel.jsx` | 对话面板 |
| `TavernOwnerPanel.jsx` | 店主管理面板 |
| `hooks/useTavernSession.js` | 酒馆会话管理 |
| `hooks/useTavernChat.js` | 酒馆对话 |

## 核心 API 端点

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/taverns` | 列出附近/全部酒馆 |
| POST | `/api/taverns` | 创建酒馆 |
| GET | `/api/taverns/{id}` | 获取酒馆详情 |
| PUT | `/api/taverns/{id}` | 更新酒馆 |
| DELETE | `/api/taverns/{id}` | 删除酒馆 |
| GET | `/api/taverns/{id}/characters` | 列出酒馆角色 |
| POST | `/api/taverns/{id}/characters` | 添加角色 |
| PUT | `/api/taverns/{id}/characters/{cid}` | 更新角色 |
| DELETE | `/api/taverns/{id}/characters/{cid}` | 删除角色 |
| POST | `/api/taverns/{id}/chat` | 发送消息并获取 AI 回复 |
| GET | `/api/taverns/{id}/chat` | 获取对话历史 |
| POST | `/api/taverns/{id}/enter` | 进入酒馆（验证密码） |
| GET | `/api/taverns/{id}/gameplays` | 获取当前用户可见玩法 |
| PUT | `/api/taverns/{id}/gameplays` | 店主保存玩法定义 |
| GET | `/api/taverns/{id}/gameplay-sessions` | 列出玩法会话 |
| POST | `/api/taverns/{id}/gameplay-sessions` | 开始或恢复玩法 |
| POST | `/api/taverns/{id}/gameplay-sessions/{sid}/advance` | 推进玩法 |
| POST | `/api/taverns/{id}/gameplay-sessions/{sid}/abandon` | 放弃玩法 |

## 文档导航

- [产品概述](docs/PRODUCT_BRIEF.md) — 一句话定位、用户角色、核心场景
- [赛博酒馆平台设计](docs/FABLEMAP_TAVERN_PLATFORM.md) — 完整产品设计文档（主线）
- [系统架构](docs/ARCHITECTURE.md) — 系统分层、模块边界、API 端点
- [当前任务清单](docs/CURRENT_TASKS.md) — 实施阶段与优先级
- [共享任务清单](docs/AI_SHARED_TASKLIST.md) — 轻量酒馆体验壳、记忆系统与后续可认领待办
- [明确不做清单](docs/WHAT_NOT_TO_BUILD.md) — 边界约束
- [文档索引](docs/INDEX.md) — 文档总览

## 一句话总结

FableMap 是一个**赛博酒馆 UGC 平台**：每个人都可以在真实地图上开一间自己的赛博酒馆，配置 AI NPC，接待访客。
