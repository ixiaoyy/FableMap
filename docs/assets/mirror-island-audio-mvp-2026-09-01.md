# 镜像岛 Audio MVP 采用记录

采用日期：2026-09-01

## Scope

本批只采用 19 个 CC0 音频文件：14 个脚步/交互 one-shot，以及 Farm、Town、Lakeshore、室内 5 个环境文件。没有采用 Farm/Town 音乐，也没有上传完整素材包。

所有生产对象位于 `game/media/v1/assets/vendor/`，逐项 bytes、MIME、SHA-256、source/member、transformation、object key 和 URL 以 `deploy/cdn/game-media-manifest.json` 为权威记录。发布后已从公共 CDN 并行回读 19/19 个对象，验证 bytes、SHA-256、Content-Type 与 `public,max-age=31536000,immutable`。

## Archive sources

| Work | Author | Official source | License | Reviewed archive |
|---|---|---|---|---|
| RPG Audio 1.0 | Kenney | https://kenney.nl/assets/rpg-audio | CC0-1.0 | 964,837 bytes; SHA-256 `6dbeaf8544da958d8f2adcb4a4a4b76c1ade34a05f8ab9edccd327da7375f38b` |
| 100 CC0 SFX #2 | rubberduck | https://opengameart.org/content/100-cc0-sfx-2 | CC0-1.0 | 2,367,871 bytes; SHA-256 `0fc61b4494e2e893c0c015ced4877b3f689c7d84a48cb61daecd7ddb52db797b` |

采用的 Kenney 成员：`footstep00.ogg`、`footstep01.ogg`、`footstep02.ogg`、`chop.ogg`、`doorOpen_1.ogg`、`handleCoins.ogg`、`handleCoins2.ogg`、`bookFlip1.ogg`、`bookClose.ogg`。

采用的 rubberduck 成员：`sfx100v2_wood_hit_01.ogg`、`sfx100v2_stones_01.ogg`、`sfx100v2_items_01.ogg`、`sfx100v2_items_02.ogg`。

以上成员 transformation 均为 none，CDN 文件与官方 archive member 字节一致。

## Direct sources

| Purpose | Work/author | Official source | License | Transformation |
|---|---|---|---|---|
| Watering | Water Splash and sand footsteps / Peludo | https://opengameart.org/content/water-splash-and-sand-footsteps | CC0-1.0 | none; exact `splash2_0.wav` |
| Farm ambience | Birds and Wind - Ambient / Spring Spring | https://opengameart.org/content/birds-and-wind-ambient-birds-wind-and-synth | CC0-1.0 | none; exact official OGG |
| Town environment | Village ambience / Milkybread, Freesound 830375 | https://freesound.org/people/Milkybread/sounds/830375/ | CC0-1.0 | none; exact official HQ preview MP3 |
| Town walla | People talking / Breviceps, Freesound 473586 | https://freesound.org/people/Breviceps/sounds/473586/ | CC0-1.0 | none; exact official HQ preview MP3 |
| Lakeshore | Wavesound / transitking, Freesound 11505 | https://freesound.org/people/transitking/sounds/11505/ | CC0-1.0 | none; exact official HQ preview MP3 |
| Interior | Roomtone Bedroom Yew / leonelmail, Freesound 329569 | https://freesound.org/people/leonelmail/sounds/329569/ | CC0-1.0 | none; exact official HQ preview MP3 |

## Distribution and exit

- 只分发本阶段实际引用的文件，不提供素材浏览或下载入口。
- CC0 不要求署名；项目仍在 `THIRD_PARTY_NOTICES.txt` 提供作者与官方来源。
- 运行时只引用 manifest 登记的同源 `/game-media/v1` URL；Git 不跟踪音频二进制。
- 每个 cue 与环境层均由独立对象 key 引用，可在保持语义 cue ID 和设置合同不变的情况下逐项替换。
