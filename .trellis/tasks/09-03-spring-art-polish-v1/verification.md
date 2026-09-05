# 验证记录 · 2026-09-03

## 自动检查

- `npm --prefix ./apps/mirror-island run typecheck`：最终改动后通过。脚本中的 Prisma generate 只生成本地 client，没有连接数据库。
- `npm --prefix ./apps/mirror-island run build:client`：通过，138 modules；既有 Phaser 大包仍有 chunk size 提示，未扩展打包优化范围。
- Impeccable detector：五个修改 UI 文件结果 `[]`，仅运行一次。
- 一次针对性纯数据检查：12 张地图可解码；25 个物品均有图标；10 组原创图形均为 16×16 且字符有色板；六种 seed badge 对应现有 crop identity。
- 原 Cottage 六个对象 ID 全部保留；宠物路径、床边和出口可达；受新墙体影响的旧坐标通过既有 reconcile 回到安全入口，state version 仍为 10。
- Git tracked game PNG/JPG/WebP/GIF 为零。`git diff --cached --check` 通过。16 个本批生产文件已暂存，文档、截图与诊断产物未自动暂存。

结构输出：`artifacts/spring-art-polish-v1/structure-check.json`。

## 浏览器检查

- 临时校对页直接调用真实 ItemIcon / FarmingActionPresenter：查看全部图标，抽查田野旅人与听雨、朝南浇水与朝北锄地。发现并修复水壶握点偏高，分别使用工具真实提手/握柄，镜像时同步镜像 pivot。
- 首次小屋切换发现 Collision 仍引用旧 GID 1，导致 Phaser parser 异常；已改为当前图集中的有效 GID 4007，并在结构检查覆盖所有 tile layers。
- 使用 `vite preview` 的构建产物在独立 `127.0.0.1:8084` origin 冷启动、创建农场：锄地一次体力 100→98；浇水一次体力 98→97、水量 20→19；动作结束控件恢复。
- 实际步行进入小屋，靠近新床打开原有睡觉确认；「休息并保存」进入 Day 2 06:00，体力恢复 100，位置回到 Cottage `entry` (320,400)。
- 小屋→农场→小屋往返与刷新继续已检查；手机 390×844 布局可正常显示室内、快捷栏与触摸控制。桌面校对发现门槛被 Hotbar 遮挡，最终把前墙/出口移到 y=416，并重新构建与核对入口、床边和宠物通道。
- 构建预览在上述路线的 console error/warn 为 `[]`。
- 校对页已从 public 移到 ignored `artifacts/spring-art-polish-v1/art-polish-preview.html`，确认不在构建产物中。
- 最终构建画面已保存：`cottage-preview.png`（1280×720，门槛在快捷栏上方可见）、`cottage-mobile.png`（390×844）、`item-icons.png` 与 `watering-action.png`，均位于 `artifacts/spring-art-polish-v1/`。临时 viewport 已恢复默认。
- 小屋 atlas 按源码绘图指令导出到 ignored `src/tiled/cottage-woodwork.runtime.png`，供 Tiled 编辑器使用，不是运行时媒体。

## 人工验收状态

未代签本轮真人审美/操作手感。完整播种→成长→收获、其余外观与方向的主观观感仍待用户实际游玩反馈；不重开已经通过的春季 v10 玩法验收，也未运行/建设全量测试矩阵。
