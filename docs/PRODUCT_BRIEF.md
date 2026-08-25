# 镜像岛产品简报

## 一句话定位

一个可长期扩展的单人 Web 像素农场/生活世界：玩家从自己的小屋醒来，在农场采集、制作和耕作，向右进入小镇建立生活关系，再逐步探索周边山水与未来书中世界。

## 核心合同

- 第一张正式地图结构固定：玩家农场向右连接小镇，北侧预留山地/矿区，南侧连接河流/湖泊；不再反复调整总体布局。
- 玩家、资源、背包、制作和农田由本地 GameSession 唯一处理；Phaser/Vue 发送命令并渲染 snapshot，不经过实时后端。
- 第一里程碑先证明新游戏、采集、种田和继续游戏；World Foundation 再建立农场、小镇、碰撞、实体与动作时序，商店经济和睡觉跨日后置。
- 房屋、伙伴工作和基地权限保留为后续主线能力，不进入首个纵向切片。
- 当前托管 Web 入口支持 ParallelLines 论坛账号或独立中文用户名密码；两类账号不自动合并。未来单机产品是否强制登录另行决定，玩法与存档合同不得依赖 Keycloak。
- 玩家存档、背包和世界状态由本地 GameSession 处理并写入 IndexedDB；实时玩法不经过服务端。
- 当前先交付 `One Beautiful Slice`：一张 64×48 的精美 Farm 样板核心区。Farm 截图质量未确认前，不以扩 Town、增加地图数量或继续系统开发制造进度感。
- 客户端技术栈固定为 Phaser 4 + Vue 3 + TypeScript + Vite + Tiled。未来桌面版与 Steam 目标采用 Tauri 2，但当前不引入 Tauri/Rust/Steam；GameSession 通过 SaveRepository 与当前 IndexedDB、未来 FileSystem adapter 解耦。
- Ninja Adventure 只保留 Town/室内技术占位；VectoRaith Farming Sim Gate C 已冻结并正式成为 Farm v1 美术底座，生产只加载最小派生图集。

## 登录体验

当前托管 Web 版本直接访问镜像岛时，Keycloak 像素主题同时提供“使用论坛账号”和独立用户名密码。已登录论坛玩家通过一次性票据首次建立 Keycloak federated identity，之后使用 Keycloak 会话直接进入。

独立账号不要求邮箱、验证码、密码复杂度或找回流程；密码长度 1–72，用户名 1–32 个 Unicode 字符并保留基本危险字符过滤。

## 数据原则

- Keycloak 和游戏数据库分库/分凭据，游戏库不复制密码或论坛凭据。
- 旧 `localStorage` 角色名、外观和进度全部丢弃；新版只精确删除已知 `farm-game.save.v1`–`v4` 键。
- IndexedDB 保存本地 GameSession；Keycloak、Prisma/PostgreSQL 继续保留给登录、未来云存档、成就和排行榜，不进入实时循环。

## 成功标准

- `/` 只显示镜像岛，`/mirror-island/` 跳转到 `/`，无旧界面或备用路由。
- 中文独立注册、论坛首次 SSO、再访直登和 Remember Me 可验证。
- 不启动游戏后端时，玩家仍能完成采集、背包、制作、锄地、播种、浇水、生长和收获。
- “新游戏”创建本地世界；“继续游戏”从 IndexedDB 恢复玩家、背包、资源和农田。
- World Foundation 只有在真人从农场向右进入小镇、进出种子店、返回农场并刷新恢复后才算完成；默认主视图是 16px Tiled 游戏世界，正式 TMJ 由 Tiled 手工维护。
- 在恢复上述长链验收前，先通过 Farm showcase 的整图构图和 2× 出生镜头视觉确认；美感本身计入当前里程碑进度。
- Farm Gate A v2 已通过；当前 Gate B 只把相同构图从色块提升为可读的岸线、院落、道路、田地和林缘结构，不扩地图数量或玩法系统。
- 后续完整 Stardew Core 覆盖小屋醒来、农场、小镇、3 个 NPC、商店、睡觉、第二天成长、收获和出售。
- 旧 backend、database、volume、备份和 `fablespace/` 对象前缀不存在；论坛、镜像岛两个数据库和 `game/` 媒体完整。
