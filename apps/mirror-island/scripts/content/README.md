# Godot 内容准备

这里仅存放构建期的 Tiled 解析和地图校验，不是游戏运行时。

- `tiled-region-decoder.ts` 解析 `public/map/*.tmj`。
- `regions.ts` 校验身份、掩码、出生点和跨区域出口。已移除原玩法查询接口。
- `camera-anchors.json` 定义三处室内的固定视角出生点。

玩法、移动和碰撞执行由 `godot/domain/` 拥有。物品、对话、日程及美术元数据直接维护 `godot/data/`，不再从另一套玩法实现生成。室内绘图指令维护在 `godot/tools/interior-atlases.json`，由原生 `build_atlases.gd` 重建；这份源内容不随游戏导出。

修改地图后执行 `npm run godot:prepare`；`npm run typecheck:client` 同时检查此处类型及 Godot 脚本。
