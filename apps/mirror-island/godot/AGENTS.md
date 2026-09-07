# Godot 迁移工程

- 使用 engine-lock.json 固定的标准版 Godot 和有类型标注的 GDScript，不使用 C# 或 JS 玩法桥接。
- 保留根目录的业务、素材和远程权限约束；本目录允许原生场景/资源替代 Phaser/Vue 表现。
- generated、media、addons/YATI 和 .godot 不手工编辑，不进入 Git。重新准备只覆盖这些明确的生成路径，不删除旧客户端。
- 手工场景放 scenes；角色/世界表现放 presentation；玩法放 domain；保存放 persistence。
- 新方法用中文方法级注释说明用途、参数、返回值及关键约束。
- 迁移未完成前不改变旧客户端公开入口，不将能走地图表述为全部玩法已移植。
- 只运行必要的 Godot 解析/导入/导出检查；不连接数据库，不自动提交或发布。
