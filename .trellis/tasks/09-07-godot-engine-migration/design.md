# 迁移设计

## 结构

Godot 工程位于 apps/mirror-island/godot。GDScript 规则放 domain，场景和表现放 scenes、presentation，平台保存放 persistence。依旧只有一个规则状态所有者；表现层不另写价格、生长和结算规则。

编辑器必须能检查生成的 TileMapLayer/TileSet 和碰撞，不能只在运行时手写 draw 调用。原 Tiled 文件暂作迁移来源，转换输出放可重复生成目录；生成覆盖范围明确，手工场景放独立目录。

## 素材

从当前 public/game-media 与 CDN manifest 按精确路径和 SHA-256 准备工程资源。保持原图，不重编码。素材和 .godot 缓存忽略，生成前校验，缺失明确失败；不下载来源不明资源。

## 平台

采用非 .NET Godot 稳定版本和 Compatibility 渲染，Web 使用单线程导出。引擎、模板均取官方固定版本并校验，保存在忽略的 artifacts 下。Windows 为原生导出，Web 由同工程导出。

## 地图转换

优先评估 Tiled 官方导出及 YATI，不自行建设通用地理转换框架。固定地图集可使用有严格输入限制的一次性离线转换；若选择薄层须记录成熟方案不适合本次边界的证据。碰撞、区域出口、出生点和实体稳定 ID 均来自原始地图。

## 保存与迁移

新引擎采用独立 current schema；旧 TS save 不解析、不删除。Windows 使用 user://；Web 持久化落到浏览器，需要核查实际同步完成语义，不能仅将 FileAccess.close 当作浏览器落盘成功。

## 发布和回滚

用户追加完整迁移要求后，本地 npm 入口与 Docker 构建配置已切换为 Godot，线上发布需单独核验。2026-09-08 已删除旧客户端与 TS 玩法，必要地图校验迁入 scripts/content，室内绘图内容由 Godot 原生工具读取；对照结果冻结为测试数据。回退依据 Git 历史和本轮 diff，不维护备用运行时。没有归档其他任务或执行远程副作用。
