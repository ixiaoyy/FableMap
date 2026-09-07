# Godot 单人引擎迁移

用户于 2026-09-07 明确要求完整迁移。当前本地客户端为 Godot/GDScript，原玩法已接入，npm 默认入口已切换；真人完整验收和公开部署仍需分别完成。真实城市、改名和新玩法不属于本轮范围。

## 工程合同

- apps/mirror-island/godot 为新工程；版本、官方来源与校验值由 engine-lock.json 固定。
- GDScript 使用类型标注和方法级中文注释。Compatibility、单线程 Web；Windows 产物为原生引擎和 pck。
- generated/、media/、addons/YATI/、exports/ 和 .godot/ 由限定脚本重建，不进入 Git。
- scenes/regions 是人工覆盖入口，生成脚本只在文件不存在时创建，不覆盖编辑器保存的修改。
- YATI 输入不包含碰撞掩码的可见图层；碰撞体由当前 decoder 的 blocked 数组按连续横段生成。出口与出生点稳定 ID 不重命名。
- 角色保持 48×64 原帧、脚底 60、0.5 世界缩放；遮罩 R 指定材质，换色保留原 alpha，不合成新轮廓。
- 中文必须绑定明确 Font/Theme，不能依赖 Web 导出不可用的系统字体。原浏览器 UI 字体不是 Godot Web 字体来源。
- 窗口尺寸变化时保持可读 UI 和原游戏像素比例，不把固定横屏画布整体缩成手机中间小图。
- 已打开背包切换宽窄屏时也必须重算列数，并在最小尺寸更新后应用弹窗目标宽度；不能只在初次打开时决定十二列/六列。Godot 元数据键使用合法标识符，例如 `slot_grid`。
- `game_session.gd` 为唯一可变状态所有者；关键命令在隔离候选里执行并保存成功后发布。普通移动检查点不冻结输入，关键保存等其完成后再写，失败重试使用同一候选。
- `data/*.json` 为物品、配方、鱼种、对话、日程和美术元数据。旧 TypeScript 仅作内容准备/对照，不得在游戏运行时桥接规则。
- Godot JSON 整数会读成 float；规范化安全整数后再做封闭枚举校验。规范化前限制未知输入嵌套和节点数，保存字段仍逐层严格验证。
- Web 存储桥只访问 `mirror-island-godot-v1/saves/main`，成功来自事务 `oncomplete`；Windows 只使用当前独立目录原子替换。禁止枚举、迁移或清除旧客户端存档。
- 工具、交互、菜单、数量选择和拖放由原生控件发送明确意图；界面不得自行扣材料、加金币或结算日期。
- 删除阶段一的预览 `world.gd/main.tscn`，唯一主场景为 `scenes/game.tscn`。

## 验证

最小相关命令为 npm 的 typecheck:client、build:client、build:windows；脚本统一使用跨平台 godot.mjs。Godot 部分错误仍返回零状态，必须检查 SCRIPT ERROR/ERROR 日志。test:godot 是针对迁移的窄规则对照；不要据此扩建大规模测试矩阵。

生产代码和配置通过最小检查后暂存；文档与诊断截图不自动暂存。远端、数据、身份、媒体上传和部署保护继续按根规则执行。
