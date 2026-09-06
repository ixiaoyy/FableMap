# A「清新田园」本地美术样板（2026-09-06）

状态：**未发布的 DEV 候选**。本记录不表示 CDN 发布，也不表示整张农场或全部美术已验收。新增静态图片只用于 `?toolArt=preview` 隔离试玩；常规生产媒体登记仍以 `deploy/cdn/game-media-manifest.json` 为准，本批没有生产对象 key 或 CDN URL。

## 制作来源

- 制作者：镜像岛项目通过 Codex 调用 OpenAI ImageGen 辅助制作；透明边和切片整理由项目使用 Sharp 0.35.4 完成。工具结果未提供可核验的底层模型版本，因此不推定具体模型或种子。
- 版本：`fresh-pastoral-preview-2026-09-06-v1`。本批是项目 AI 辅助原创候选，不从第三方素材包提取，不为其虚构开源许可证、第三方作者署名或人工逐像素绘制经历。
- 风格依据：用户明确选定的 A「清新田园」。本地参考 `artifacts/visual-directions-2026-09-06/A-fresh-pastoral.png`，1536 × 1024，SHA-256 `26cba1531a4dc2ae8a504396f9505b4798cbb09980e1d57cfd79965f307f62c4`。参考图仅作为视觉方向；地图布局、碰撞、互动范围和存档合同继续以现有代码为准。
- [真实提示词 sidecar](fresh-pastoral-preview-2026-09-06.prompts.json) 保留实际 `tools`、`tools_alpha`、`cottage`、`interior` 及两次室内修正提示词。提示词中的尺寸与透明度是制作要求，不能替代下方实际文件测量。
- [处理元数据](fresh-pastoral-preview-2026-09-06.metadata.json) 保留源图与输出的尺寸、字节、SHA-256、透明处理规则、裁切与每件工具的缩放位置。

原始生成文件所在目录为本机 `.codex/generated_images/01a0725c-3d0e-7640-b4cb-c438941e0e4f/`，下表固定文件名用于溯源，不是可分发的运行时 URL。

| 提示词项 | 原始生成文件 | 处理决定 |
|---|---|---|
| `tools` | `exec-8709b833-f8a1-4c57-bffa-d415944d47bf.png` | 保留为 `tools-source.png`，机械去底与单格归一化后生成候选 |
| `tools_alpha` | `exec-ec49c968-6a8d-4817-949e-5ab7fef0053f.png` | 未采用；返回 RGB 棋盘格背景，未实现真实 alpha |
| `cottage` | `exec-2179872e-0261-4cb0-af59-8b69ae86d2f7.png` | 保留为 `cottage-source.png`，机械去底后裁切 |
| `interior` | `exec-f5d59bf8-e909-4386-8b50-56a8a4380f17.png` | 保留为 `interior-source.png`；床体比既有交互区域长，继续修正 |
| `interior_correction` | `exec-dc3ae242-76ae-4fd8-ba60-56c5a8c94c54.png` | 以室内初稿为编辑输入，调整床长与炉灶位置；床仍需缩短 |
| `interior_bed_correction` | `exec-3cad624d-c538-4592-9c29-d959f211457e.png` | 以上一次修正输出为编辑输入，再缩短床体；原样复制为 `interior-v1.png` |

`tools` 与 `cottage` 使用上述 A 图作为风格参考。`tools_alpha` 的编辑输入为第一张工具源图；该失败编辑输出为 1536 × 1024、1,529,139 bytes、RGB PNG，SHA-256 `59d60694b983d18455451d83898753d9f26e408eebf6db790d2470ff412a7e4d`，未用于任何候选输出。

## 已整理的工具与外屋文件

以下本地文件均位于 Git ignored 的 `artifacts/pastoral-redesign-2026-09-06/`，MIME 均为 `image/png`；本轮已从实际文件重新计算哈希。

| 文件 | 实测尺寸 | bytes | 通道 | SHA-256 |
|---|---|---:|---|---|
| `tools-source.png` | 1536 × 1024 | 1,143,308 | RGB | `482995b2e94c1746664458c59cd73f94df94c2a448002d7489c3fbb7997cb62b` |
| `tools-v1.png` | 1536 × 1024 | 544,341 | RGBA | `072a373524fce27669b1be2070be063c8e0998c8fd7c6218645c0d1077f0d7db` |
| `cottage-source.png` | 1254 × 1254 | 1,645,177 | RGB | `cf2eec7703539aa330ae659bd6b8fc54670db0aa79cabd79f23599466d952217` |
| `cottage-v1.png` | 952 × 1112 | 2,301,749 | RGBA | `32f4c21a7c0f3ec5375a752908c1ffe901f79a09286297ddb98cf83ba96819d8` |

生成器返回的工具与外屋源图均不含 alpha。处理脚本 `artifacts/pastoral-redesign-2026-09-06/prepare-alpha.mjs` 只执行机械去底、裁切与最近邻尺寸归一化，不重绘、不补造像素内容。脚本 SHA-256 为 `f6b7707a00afd411ace42057b08fedbde1faceb20a9310d451c90e21151a66f5`。

去底从画布边缘开始，四连通移除各 RGB 通道至少 228、最大通道差至多 18 的浅色低饱和背景；图形内部未连通的浅色钢刃和奶油墙面保留。浇水壶额外从源图 `(815,132)` 与 `(915,239)` 对两个提手开口去底。透明结果另在绿色底上人工查看，不能把源图的棋盘纹误判为透明。

工具图集采用 3 列 × 2 行，每格 512 × 512；每个已占用格先取实际 alpha 包围盒，再最近邻缩放到最长边 384 并居中，四周至少留 64 像素空白。下排右格清空。顺序及手持握点如下，坐标是所在 512 像素格内的比例，镜像之前使用。

| 工具 | 列、行 | 握点 x、y | 说明 |
|---|---|---|---|
| 锄头 | 0、0 | 0.23、0.79 | 木柄下段 |
| 浇水壶 | 1、0 | 0.60、0.18 | 上提手实心部分；原 0.60、0.25 位于透明孔 |
| 斧头 | 2、0 | 0.23、0.79 | 木柄下段 |
| 镐 | 0、1 | 0.23、0.79 | 木柄下段 |
| 镰刀 | 1、1 | 0.20、0.79 | 窄木柄中部；避免原 0.23 落在边缘外 |

浇水壶握点实际采样为图集 `(819,92)`，RGBA `(232,247,222,255)`；镰刀握点为 `(614,916)`，RGBA `(140,82,32,255)`。手持显示仍使用现有人物尺度，并需在实际动作中判断完成度。源图并非严格锁在提示词所述的原生 64 × 64 网格，不能据此宣称已得到规范 64 像素精灵。

外屋源图实际轮廓为 `(153,67,948,1108)`，裁切后四边增加 2 像素透明留白，得到 952 × 1112，不执行重采样。建筑只替换外观，原门口、地块、地图出口与碰撞继续由现有 Tilemap 决定。

## 室内候选

真实 `interior` 提示词的输入依次是 `artifacts/pastoral-redesign-2026-09-06/cottage-interior-before.png` 的当前游戏房间截图，以及 A 风格参考图。要求只绘制现有 288 × 176 室内空间，保留床、柜、灶、窗、绿植与出口位置。初稿的床超出既有交互范围，随后进行了两次 ImageGen 编辑，真实修正指令依次来自 `interior-correction.prompt.txt` 与 `interior-bed-correction.prompt.txt`，已分别原文收录为 sidecar 的 `interior_correction` 与 `interior_bed_correction`。

| 链路 | 实测尺寸 | bytes | 通道 / MIME | SHA-256 |
|---|---|---:|---|---|
| 初稿 `interior-source.png` | 1604 × 980 | 2,304,748 | RGB / `image/png` | `642eef6cc71f0e6cc8b1c67db76af5e48088babb200fd543919b404c5e80ff4d` |
| 第一次修正 `exec-dc3ae242-76ae-4fd8-ba60-56c5a8c94c54.png` | 1605 × 980 | 2,118,979 | RGB / `image/png` | `533caad67f6527de1967053d856bf147c9cbd54d797f9db5a71f480834499d0a` |
| 第二次修正及 `interior-v1.png` | 1605 × 980 | 2,140,005 | RGB / `image/png` | `32386bf2a3d2ca4f137909954f1591badf071a5bbc72c078722da867de3caaae` |

最终文件与第二次修正输出逐字节一致，未执行去底、裁切、重采样、格式转换或额外像素处理。生成器未精确输出提示词要求的 1152 × 704，后续两次编辑也比初稿增加 1 像素宽度；实际记录和加载尺寸以文件为准。房间整图显示在原世界坐标 `(176,256,288,176)` 上，运行时映射到现有室内边界，不依据输出尺寸调整地图或存档。

选定图床体的目视范围约为图内 `x194..370、y197..454`，映射至房间约 `x34.8..66.4、y35.4..81.5`，接近既有 `x32..64、y32..80` 的床区域，阴影略有伸出。床原有碰撞、可点击范围和近身互动合同保持不变；该近似视觉对齐不代表逐像素一致，也不代替实际睡眠互动与玩家审美验收。窗、柜体、炉灶、地毯和植物沿用同一套浅木、薄荷与蓝白视觉语言。

## 本地读取和正式采用边界

Vite 的 `serve` 专用中间件仅开放固定路径 `/__dev-art/fresh-pastoral-tools-v1.png`、`/__dev-art/fresh-pastoral-cottage-v1.png` 和 `/__dev-art/fresh-pastoral-interior-v1.png`。响应为 `image/png` 与 `Cache-Control: no-store`，只在开发服务下读取被忽略的本地文件；这不是 CDN 的不可变缓存合同。`PASTORAL_PREVIEW` 受 `import.meta.env.DEV` 与隔离预览开关共同限制，生产构建不启用这些路径。

正式采用前必须完成实际地图、工具动作和物品界面的视觉验收，确定新版本不可变 `game/media/v1` 对象 key，按精确 allowlist 上传，回读核对 bytes、MIME、SHA-256 与 `public,max-age=31536000,immutable` 缓存头，再登记生产 manifest 和构建前媒体核验脚本。图片二进制始终不加入 Git。此处没有预填未发布 URL，也没有对源图作生产发布承诺。
