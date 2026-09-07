# 完整迁移进行中

## 最新状态

完整玩法代码与默认开发/构建入口已接入 Godot，早期预览入口已删除。34 项规则和 5 个哈希对照、32 项地图/界面/重排检查通过；Web/Windows 导出与服务端检查通过。实际 Web 新建、库存移动/刷新恢复、锄地、跨区和 02:00 日结已执行。下方为过程记录，不再代表所有待办；当前剩余范围以 implement.md 为准。任务等待真人/真机及发布验收，不自动提交、归档或部署。

用户于本轮明确要求完整迁移，不允许再次仅交付能走动的预览。保持本任务 in_progress，未 commit/push/部署。

## 已实现但仍需联调

- Godot domain：inventory、world_rules、resource_rules、storage_rules、social_rules、fishing_rules、npc_motion、game_session。
- Godot persistence：独立版本 codec、Windows 原子文件、Web IndexedDB 事务完成回调。JS 仅作存储与音量偏好适配，玩法全部为 GDScript。
- data/*.json 为原静态物品/配方/鱼种/对话/日程/素材/昼夜数据快照；snapshot-godot-content.mjs 为迁移取证工具，当前产品构建不执行它。
- scenes/game.tscn 是当前 Godot 主场景；presentation/game_world.gd 接入工具、交互、地图、动态实体、天气与音效；ui/game_ui.gd / slot_button.gd 提供原生菜单、背包、制作、箱子、出货、商店、领养、外观等。
- npm 默认开发/构建已指向 Godot，删除 Phaser/Vue/Vue 插件/vue-tsc/EasyStar 依赖；Node 后端保持原样。
- 新 scripts/godot.mjs 支持 Windows 和 Linux setup/check/web/windows/run/editor/serve；Linux 稳定版归档和 Node 构建镜像 digest 已锁定。Dockerfile.web、nginx.conf、deploy.yml 构建参数已适配，尚未部署。

## 已得到的证据

- 23 个旧 TS 规则案例与 5 个哈希在 GDScript 对照通过。
- tools/validate_migration.gd 使用 artifacts/godot-migration-2026-09-07/native-test-save.json，不触碰玩家槽；新建失败重试、日结失败重试、重复重试和文件读回通过，坏库存拒绝。
- Godot JSON 会把整数读成 float，Array 枚举成员比较导致初始容量验证失败；已通过有界数值语义规范化修复（深度/规模边界仍需完善）。
- Web 新建成功，背包 E 可打开，在实际界面将锄头从第 1 格移动到第 12 格并保存。当前浏览器仍暂停在背包，尚待刷新/继续核对恢复。
- 最近 npm build:client 与 npm typecheck 退出码 0。typecheck 发现 UI 根控件全锚点+手动设置 size 的警告，已改为手动尺寸管理，需在下一次相关检查验证。
- 本机 Docker context 为 local Docker Desktop pipe，daemon 未启动；不要为此启动可能自动拉起其他数据库容器的 Docker Desktop。Linux 容器构建尚不能实测，可做静态检查并如实报告。
- Web 当前未压缩 WASM 39,514,754 bytes，PCK 29,064,460 bytes（后续界面改动会变）。Python 5183 服务仍在，服务的是 godot/exports/web；这是实际本地游戏预览。

## 下一步必须完成

1. Web 刷新/继续验证第 12 格锄头恢复，执行真实种田/制作/箱子/商店/跨日路线；补 UI 边界、键盘/手机布局问题。
2. 完善未覆盖的行为：首周事件确认、拆除二次确认、天气与音效、库存完整详情等；检查 NPC 柜台和跨区路径、钓鱼存档。
3. 对高风险剩余规则做必要窄对照（箱子、摆放/推箱、钓鱼、日结资源恢复），避免大规模测试矩阵。
4. 检查 codec 的深度限制、数值校验和世界占用一致性。
5. 删除本轮之前的 Godot 预览 world.gd/main.tscn 残留；旧 client/domain TS 仅保留为地图/素材准备与取证来源，不再是运行入口，需明确文档。
6. 简化旧 godot.ps1 为新 CLI 包装，检查 setup/Node scripts 在删除旧依赖后仍可准备素材。
7. 最终执行最小解析/构建/Windows 导出与启动、现有服务端类型/构建检查；修复错误再暂存生产代码配置。
8. 更新 README、CURRENT_STATE、PRODUCT_BRIEF、AGENTS、spec、任务清单，区分代码完成与真人/部署未验证。

新测试脚本 godot-parity.mjs、tools/validate_migration.gd 及诊断产物不要自动 git add。新的中文字体有 OFL 许可与固定哈希，目前仍是本地采用项；公开发布前需按媒体流程上传登记，不能自动上传或部署。
