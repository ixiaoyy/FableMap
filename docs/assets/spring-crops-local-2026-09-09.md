# 春季作物原生像素稿 v1

制作者：Codex；制作日期：2026-09-09。六种收获图标、33 张播种至成熟画面和 1 张四季豆复收画面均为本轮编写的像素矩阵。未复制原作图像，未读取第三方图片像素进行重绘，未调用图片生成服务。真实任务与制作约束见同名 prompt 记录。

权威源为 `apps/mirror-island/godot/data/media.json` 的 `crops`、`cropPalette` 和六种收获物 `items`。FarmAssets 复用原生像素矩阵解码，在内存创建并缓存纹理，不生成外部资源。种子袋仍用已登记第三方袋子图，徽记复用新收获图标。原作规则参考不授予原作素材许可，本次无原作图片采用项。

采用春绿、薄荷叶影、暖白根与花球、蓝色花冠、浅木豆架。地面植株与收获物分开，所有生长帧维持原生世界像素比例和统一脚底，不再缩放同一幼苗充当阶段。

## 来源与阶段依据

以下页面于 2026-09-09 核对；只参考阶段时长，不复制图片。当前实现对照锁定 1.6.15，未改领域总天数和玩法参数。

- [防风草](https://stardewvalleywiki.com/Parsnip)：1/1/1/1。
- [花椰菜](https://stardewvalleywiki.com/Cauliflower)：1/2/4/4/1。
- [羽衣甘蓝](https://stardewvalleywiki.com/Kale)：1/2/2/1。
- [土豆](https://stardewvalleywiki.com/Potato)：1/1/1/2/1。
- [蓝爵士](https://stardewvalleywiki.com/Blue_Jazz)：1/2/2/2。
- [青豆](https://stardewvalleywiki.com/Green_Bean)：1/1/1/3/4，复收 3 天；全阶段保留豆架。

## 本地源清单

| 作物 | 收获图标 | 植株画布 | 含成熟帧数 | 源字节 | SHA-256 |
|---|---|---|---:|---:|---|
| parsnip | 16×16 | 16×24 | 5 | 3025 | `71294a40db1deb09370c7bc031625695f693b6e870f138b24c5aa898db66199c` |
| cauliflower | 16×16 | 16×24 | 6 | 3471 | `45c580bc806a724c7da33a68301ceed4249353032a334f5da40f263653c56a7a` |
| kale | 16×16 | 16×24 | 5 | 2997 | `7bb23b0e297287ee8b1ecef6bdfeefc56e8647027d6d89177d68df91b7a0896e` |
| potato | 16×16 | 16×24 | 6 | 3429 | `f640d85f831aac6e487e1e2a1dbf4b8377c5af6666d38c6b7c8690b39ce05eff` |
| blue-jazz | 16×16 | 16×24 | 5 | 3011 | `aa7acdf65d40c2cd48e7f121ba2e079b22c328355c75da317e432f51e1a32ef9` |
| green-bean | 16×16 | 16×32 | 6 | 4963 | `a9c2a8dc1c7d42c9576d5f1455fd0a601180d2f91bf857a22e02b07fdf97b948` |

哈希针对每种作物 `{crop,palette,item}` 按键排序、紧凑 JSON、UTF-8 编码；格式为原生 pixels JSON，MIME 为 application/json。四季豆另有 1 张复收帧，已包含在哈希中。无新增 PNG、对象 key、URL 或缓存头，不修改已登记第三方来源、许可或署名。

## 接入与验收状态

本地实际游戏已接入并做隐藏浏览器农场/背包截图检查，尚未获真人美术通过；像素稿不是已批准的最终美术。未上传 CDN、未部署。正式媒体发布如需形成外部图片对象，仍须完成不可变登记并另获上传/发布授权。不得把此本地代码资源清单当成 CDN 上传记录。
