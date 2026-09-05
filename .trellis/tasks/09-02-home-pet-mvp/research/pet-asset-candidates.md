# 猫狗素材候选

## Selected — OpenGameArt `[LPC] Cats and Dogs`

- 官方页：https://opengameart.org/content/lpc-cats-and-dogs
- 作者：bluecarrot16；本项目选择页面明确提供的 CC BY 3.0 许可，并随产品交付署名。
- 原始文件：`cat.png` 512×256、8348 bytes、SHA-256 `914bae85486052a70d29b26d881bfce3dcaa987f6f95cab08e4a65e30fa13f97`；`dog.png` 512×256、9202 bytes、SHA-256 `77f4667ab3f681408a8afa528f3fff0bea3e3cd7d0e28d5c11f2d09c7729b891`。
- 帧能力：32×32 网格，猫狗均有上/下/左/右三帧 walk、中间 idle 与左右 rest；正式选择橘猫色组和黄犬色组，不开放品种或换色。
- 采用边界：两个原始 PNG 原字节发布到 `game/media/v1`，运行时只选帧，不裁图、不重编码、不把二进制加入 Git。
- 结论：满足当前 Farm/Cottage idle、walk、rest 与领养预览，正式采用。

## Candidate A — OpenGameArt `Pixel art dog and cat`

- 官方作者上传页：https://opengameart.org/content/pixel-art-dog-and-cat
- 作者：bonzille；许可：CC0；文件：独立 dog/cat PNG，各约 128–133 KB。
- 优点：同一作者同时提供猫狗，像素风，来源与许可清楚。
- 实测：dog 为 182×242、cat 为 228×185 的单张正面静态图，没有四方向或动画帧。
- 结论：拒绝，不能承担本 MVP 的运行时表现。

## Candidate B — Kenney `Animal Pack`

- 官方页：https://kenney.nl/assets/animal-pack
- 许可：CC0；80 个 2D 文件。
- 优点：来源稳定、许可和再分发边界清楚。
- 实测：官方 ZIP 只有 elephant、giraffe、hippo、monkey、panda、parrot、penguin、pig、rabbit、snake 等静态 puzzle animals，没有猫狗。
- 结论：拒绝，物种与俯视动画能力都不匹配。

## Rejected

- 侧视平台动作猫狗包：视角不匹配，不能通过翻转冒充 top-down 四方向。
- 来源不明、仅个人使用、NC/ND 或强 copyleft 包：不进入候选。
- Ninja Adventure：虽为已登记 CC0 历史来源，但当前正式户外世界已从该画风退出，不因方便恢复为正式宠物。
