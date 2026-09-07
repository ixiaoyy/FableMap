# Godot 迁移工程

当前为 **已接入现有玩法的 Godot 客户端**，默认开发和构建入口已切换。固定 Godot 4.7.2 标准版、GDScript、Compatibility 渲染器；Web 单线程，Windows x86_64 原生导出。本次迁移按用户要求纳入 `main`；代码提交不等于真人全流程验收或线上部署成功，发布结果以流水线和线上核验为准。

## 已有能力

- 12 张原 Tiled 地图由 YATI 2.2.7 导入，保留原出生点、出口与 Collision 掩码。
- 地图包装场景提供可见碰撞体和出生点；`scenes/regions/` 为可保留人工改动的继承场景，准备脚本不会覆盖它们。
- `scenes/islander.tscn` 的头部、上装、下装分别显示；选择根节点可修改性别、部件和颜色并预览。
- WASD、方向键与屏幕方向按钮移动，接近地图出口切换区域；Web 窗口尺寸随浏览器变化。
- 已有内景代码绘图由原函数重建，不依赖本机遗留的 runtime PNG。

| 范围 | 当前实现 |
|---|---|
| 生活规则 | 六种春作、生长/再生、采集、镐与镰刀、体力、食用、水壶补水/升级 |
| 背包与制作 | 12/24/36 格、十二格行轮换、整组/单件/半组、拖放、工具原槽固定、原两张配方 |
| 仓储与出货 | 36 槽普通箱、21 色、存取/整理/已有堆叠、摆放、推箱、掉落、最后一笔撤回、隔夜分类收入 |
| 小镇 | 八名居民、日程/休息日/雨天/柜台服务、对话、送礼、委托、背包陈列和木匠建造/移动/拆除 |
| 时间与伙伴 | 06:00–02:00、午夜提示、睡眠与昏倒、确定性天气、钓鱼、猫狗领养/漫步/抚摸 |
| 表现与界面 | 原地图/素材、分层外观、昼夜/雨风/声音、原生菜单、角色预览、鸣谢与许可证 |
| 保存 | 独立 Godot v1 封套；关键候选原子保存、失败重试、浏览器事务完成确认、桌面临时文件替换 |

不读取、覆盖或迁移旧 Phaser 开发档。Web JavaScript 仅作引擎宿主、IndexedDB 和音量偏好适配，玩法不通过 JS 执行。

## 本地准备

在仓库根目录执行。第一次需下载引擎和模板，缓存只写入忽略的 `artifacts/godot-runtime/`，不修改 PATH。

```powershell
npm --prefix .\apps\mirror-island ci --ignore-scripts
npm --prefix .\apps\mirror-island run godot:setup
npm --prefix .\apps\mirror-island run prepare:media
node --experimental-strip-types .\apps\mirror-island\scripts\prepare-godot.mjs
npm --prefix .\apps\mirror-island run typecheck:client
npm --prefix .\apps\mirror-island run godot:editor
```

准备阶段保留旧客户端的纯地图 decoder 和内景绘制函数，避免重录地图和美术。`data/*.json` 是原静态内容的已迁移快照；旧 TS 规则和 EasyStar 开发依赖只供迁移对照，不打入游戏包。Phaser、Vue 及 Vue 编译插件依赖已移除。

## 导出与查看

```powershell
npm --prefix .\apps\mirror-island run dev:client
npm --prefix .\apps\mirror-island run build:windows
```

默认 Web 地址为 `http://127.0.0.1:8080/`；本轮临时验收服务使用 5183。Windows 输出为 `exports/windows/mirror-island.exe`，必须与同目录 `.pck` 一起保留。本地 Python 服务不配置压缩，不代表 CDN 或真实手机网络性能；Nginx 构建配置已包含 WASM/PCK 压缩与缓存再验证。

## 素材编辑

- 人物：打开 `scenes/islander.tscn`，检查器参数对应旧版相同的三层图集和遮罩颜色。
- 地图：打开 `scenes/regions/farm.tscn` 等继承场景做额外调整；`generated/` 是再生成结果，不直接手改。
- 当前领域碰撞以原 Tiled Collision 掩码为准，生成的碰撞节点用于检查；只改继承场景中的碰撞外观不会自动更改玩法规则。修改通行区域须同步地图掩码后重新准备。
- 原图仍从已登记 CDN 素材准备，名称、哈希与源信息在 `generated/media-provenance.json`；不要将图片二进制加入 Git。
- 中文预览字体为 Noto Sans CJK SC Sans2.004，OFL-1.1，完整许可证随导出包提供；公开发布前还须按媒体流程上传登记。不得直接发布当前本地候选引用。

## 开源依赖与局部修复

- Godot：官方 4.7.2-stable，MIT，归档 SHA-512 固定于 `engine-lock.json`。
- YATI：官方作者仓库 GDScript 2.2.7 发布归档，MIT，SHA-256 固定；仅作编辑器导入，不随运行包发布。准备脚本在匹配固定源码锚点后补充两个释放动作：释放打包后的临时 Node2D，释放从树中移除的空 ParallaxBackground。失败即停止，不自动适配未知版本。
- 未使用较旧的 Godot4-TiledImporter，也未自研通用 TMJ 导入器。YATI 可处理当前图块翻转和 TileMapLayer；后续升级必须重新验证导入结果。

## 验证边界与回滚

实际完成：Godot 解析/导入、服务端类型检查与构建、Web/Windows 导出、Windows headless 启动；34 个旧规则案例和 5 个哈希对照；32 项地图/菜单实例化及窄屏重排检查。隔离文件验证新建/日结失败重试、重复重试和继续读取。

实际 Web 路线包括新建、背包移动、刷新继续恢复、锄地、农场至小镇通行及 02:00 日结。仍未代替完整真人玩法、真机触摸、长时间存档与低端手机性能验收。本机 Docker daemon 未运行，Linux 容器构建没有实测。完整证据见 `.trellis/tasks/09-07-godot-engine-migration/implement.md`。

回滚需回到迁移前基线 `02ee7d0c` 并按其 lockfile 安装依赖；当前分支已经更换 npm 入口和依赖，不能直接运行旧 Vite 配置。迁移分支为 `codex/godot-engine-migration`；线上未改动，数据库、CDN 对象和旧存档均未触碰。任何提交、推送或部署仍需针对本次动作授权。
