# 镜像岛首页主视觉生成记录

## Adopted output

- 用途：首页东方田园主视觉背景，仅承载氛围，不包含可交互 UI。
- 生成方式：Codex 内置 `imagegen`，用户从三张候选中选择候选 3。
- 参考图角色：只用于构图、明亮水墨田园气质与画面层次参考；没有复制其中的文字、按钮、边框或具体场景。
- 原始输出：PNG，1672×941，2,659,416 bytes。
- SHA-256：`f1182c1ef76eba8a048dd2f424ed0219c80575629e01f46be8e59519e2fe7adf`。
- 正式对象 key：`assets/original/mirror-island-home/2026-08-31/mirror-island-home-hero.png`。
- 正式 URL：`https://img.pingxingxian.space/game/media/v1/assets/original/mirror-island-home/2026-08-31/mirror-island-home-hero.png`。
- 处理：无裁切、无重编码、无文字叠加；发布对象必须与生成输出字节完全一致。

## Prompt

```text
Use case: stylized-concept
Asset type: responsive web game homepage hero background
Input images: Image 1 is a composition, atmosphere, and painterly-style reference only; do not copy its embedded UI, typography, framing ornaments, or exact scene.
Primary request: an original luminous Chinese pastoral fantasy landscape for the single-player farming life RPG "Mirror Island"
Scene/backdrop: spring valley with layered misty karst mountains, terraced fields, a narrow river and stone bridge, vegetable plots, a modest timber-and-plaster farmhouse, flowering vines, bamboo, wildflowers, and a winding path inviting the viewer into the farm
Style/medium: refined hand-painted game key art; Chinese ink-wash atmosphere fused with delicate watercolor and high-end cozy farming-game environmental illustration; natural brush texture; cinematic depth
Lighting/mood: clear soft morning after rain, warm sun diffused through mist, tranquil, welcoming, hopeful, lived-in
Color palette: mist blue, celadon green, warm paper ivory, bamboo green, restrained harvest gold
Constraints: 16:9 landscape; no people; no characters; no text; no letters; no logos; no signs; no seals; no interface; no buttons; no frames; no watermark; coherent architecture; crisp enough for desktop but calm behind readable HTML UI
Avoid: photorealism, anime characters, pixel art, generic stock fantasy, oversaturated colors, excessive bloom, dark mood, Western medieval buildings
Composition/framing: immersive low eye-level garden-edge view; airy pale mountains and open sky create quiet negative space on the left 40 percent; detailed farmhouse veranda, bamboo, waterwheel and vegetable rows occupy the right; foreground flowers and fence frame a sunlit path without blocking it
```

## Publication source

发布工作流的临时审核源为 secret GitHub Gist `1aaf24bfffda8acdbf7e648a7150e950` 中的 base64 文件。它只用于不可变 CDN 首次发布；发布后不作为运行时依赖。

发布 payload：

```json
{
  "object_key": "assets/original/mirror-island-home/2026-08-31/mirror-island-home-hero.png",
  "content_type": "image/png",
  "bytes": 2659416,
  "sha256": "f1182c1ef76eba8a048dd2f424ed0219c80575629e01f46be8e59519e2fe7adf",
  "source_url": "https://gist.githubusercontent.com/ixiaoyy/1aaf24bfffda8acdbf7e648a7150e950/raw/7e2d5ca3a846b3fac239e040f15135447eeca503/mirror-island-home-hero.png.base64",
  "source_encoding": "base64"
}
```
