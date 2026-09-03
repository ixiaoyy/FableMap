# 实施顺序

- [x] 核对当前状态、历史零预算、素材登记和原图。
- [x] 共享图标与四处 UI 消费面。
- [x] 四方向种田动作、清理与 ActionTimeline 接入。
- [x] Cottage 纹理、陈设和床铺；调整碰撞，保留稳定对象和宠物路径。
- [x] 最终最小类型检查、client build 和针对性结构检查。
- [x] 浏览器检查图标与动作；构建产物完成锄地、浇水、进屋与睡觉。证据保留在 ignored artifacts。
- [x] 更新合同，核对 diff，暂存本批生产代码/配置；文档/截图不自动暂存。

真人审美、九种外观的完整手感与完整种植/收获路线仍由用户验收，不代签。

## Validation

`npm --prefix ./apps/mirror-island run typecheck`、`npm --prefix ./apps/mirror-island run build:client`。
修改 UI 完成后运行一次 Impeccable detector，不扩建测试矩阵、不连接数据库。浏览器使用独立本地端口。
