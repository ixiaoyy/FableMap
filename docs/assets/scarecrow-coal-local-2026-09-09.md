# 稻草人与煤炭本地像素占位

制作者：Codex；日期：2026-09-09；版本：local-v1。来源为本轮代码中定义的像素矩阵，煤炭沿用项目现有 `stone` 像素轮廓并调整深灰配色，稻草人为新写的草帽、衣服和木杆矩阵。未从原作复制图像，未调用图像生成服务。真实指令上下文见 [prompt 记录](scarecrow-coal-local-2026-09-09.prompt.md)。

源位于 `apps/mirror-island/godot/data/media.json` 的 `items.coal` / `items.scarecrow`，由现有 `FarmAssets.icon()` 在内存创建 RGBA 纹理；不是新上传的 PNG 或 CDN 对象。当前仅作本地功能占位，不能据能显示或构建通过认定最终美术质量。正式素材制作、来源登记、发布与真人验收仍需按项目流程完成。

| 项目 | 尺寸 | 源定义格式 / MIME | 源定义字节 | SHA-256 |
|---|---|---|---:|---|
| coal | 16×16 | 原生 pixels JSON / application/json | 420 | `480381df54637db5ce93e846014ded2d7d4867eca3c6944f9b0ab0d26a3b59aa` |
| scarecrow | 16×24 | 原生 pixels JSON / application/json | 572 | `032fe307fb22b30256c158d8bd14182c93e1f756f75d844d929e505f9d0fff10` |

哈希针对单个 items 定义，使用 JSON 按键排序、无多余空格、UTF-8 编码计算，不是 PNG 哈希。无新增对象 key、远端 URL 或缓存头；既有第三方媒体仍使用原登记项。

已在隐藏浏览器中的真实游戏场景 / 制作菜单检查占位比例与图标，测试使用内存农场；正式风格验收未完成。检查用导出包和源码在 `artifacts/skills-s2b-2026-09-09/`，不进入 Git 或发布流程。
