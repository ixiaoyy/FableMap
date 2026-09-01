# Audio source audit — 2026-09-01

Status: selected candidates; CDN publication pending. Nothing in this file is an adopted runtime asset until the immutable object is published, re-read and added to the production manifest.

## Source archives

| Source | Official URL | License | Archive bytes | Archive SHA-256 |
|---|---|---|---:|---|
| Kenney RPG Audio 1.0 | `https://kenney.nl/assets/rpg-audio` | CC0-1.0 | 964,837 | `6dbeaf8544da958d8f2adcb4a4a4b76c1ade34a05f8ab9edccd327da7375f38b` |
| rubberduck 100 CC0 SFX #2 | `https://opengameart.org/content/100-cc0-sfx-2` | CC0-1.0 | 2,367,871 | `0fc61b4494e2e893c0c015ced4877b3f689c7d84a48cb61daecd7ddb52db797b` |

Archive URLs:

- `https://kenney.nl/media/pages/assets/rpg-audio/8e99002d76-1677590336/kenney_rpg-audio.zip`
- `https://opengameart.org/sites/default/files/sfx_100_v2.zip`

## Selected one-shots

All rows are byte-identical archive members; transformation is `none`.

| Cue | Source member | Bytes | SHA-256 | Proposed object key |
|---|---|---:|---|---|
| footstep 1 | `Audio/footstep00.ogg` | 9,475 | `6fe61ef1fc3bcf0e253bf2eb64759db6cb69e2fe452f4d88cc597ecf78a3d601` | `assets/vendor/kenney/rpg-audio-2014/footstep-01.ogg` |
| footstep 2 | `Audio/footstep01.ogg` | 9,900 | `313472dba31fd0c855376069fa368bb5a198c27251cc8398ef464578b7047a4c` | `assets/vendor/kenney/rpg-audio-2014/footstep-02.ogg` |
| footstep 3 | `Audio/footstep02.ogg` | 9,528 | `2d9575b7dead6e1217ca113991fc5229e9b6d998ea0726ebbb277e7398ab888f` | `assets/vendor/kenney/rpg-audio-2014/footstep-03.ogg` |
| axe | `Audio/chop.ogg` | 9,370 | `d00c2b3c9fff07e376145c8c8c45c90e5084ec192f6ce0387db233f7b86f1486` | `assets/vendor/kenney/rpg-audio-2014/axe-chop.ogg` |
| door | `Audio/doorOpen_1.ogg` | 22,848 | `4ab93bab96522d8eb109ff96dc57cb6765deb02448fe14c10472084be5bb2a0b` | `assets/vendor/kenney/rpg-audio-2014/door-open.ogg` |
| buy | `Audio/handleCoins.ogg` | 25,394 | `8a91f969e932df709df80ee124d86a51389eed9b67f22e5e716bc2bbf60d8dab` | `assets/vendor/kenney/rpg-audio-2014/coins-buy.ogg` |
| sell | `Audio/handleCoins2.ogg` | 13,094 | `4b857968d64f9ac9336a10ffac6694d7547e1f01566ad6857b30bc8db3ee6c32` | `assets/vendor/kenney/rpg-audio-2014/coins-sell.ogg` |
| dialogue page | `Audio/bookFlip1.ogg` | 18,248 | `fa81ac2fedc8c641661b87e349630a36c9800e795e0c800e029214efdbe26a7d` | `assets/vendor/kenney/rpg-audio-2014/dialogue-page.ogg` |
| sleep | `Audio/bookClose.ogg` | 9,292 | `81e976532565f4372abd14e83d2684195fa548d0a28d345de221e56052454f32` | `assets/vendor/kenney/rpg-audio-2014/sleep.ogg` |
| hoe | `sfx100v2_wood_hit_01.ogg` | 7,629 | `84abc80d93011d86f29bc55c10a023265ece0851d0784d1bf07c5990f08daeab` | `assets/vendor/rubberduck/100-cc0-sfx-2-2018/hoe.ogg` |
| stone | `sfx100v2_stones_01.ogg` | 12,669 | `20d293a892e1fa6330da2569065aa260a822198bddce2b183f8c11642e7deb4d` | `assets/vendor/rubberduck/100-cc0-sfx-2-2018/stone.ogg` |
| pickup | `sfx100v2_items_01.ogg` | 13,577 | `828940e6c04c63ea22f15ff47b6722c2b9fde54f148b26935d95a645baf770f4` | `assets/vendor/rubberduck/100-cc0-sfx-2-2018/pickup.ogg` |
| harvest | `sfx100v2_items_02.ogg` | 12,726 | `fe585eaf85fbbc0f56653174bc374aa9d2143c9dad68154bf9c596f7c1ee62d6` | `assets/vendor/rubberduck/100-cc0-sfx-2-2018/harvest.ogg` |

## Direct official files

No local transformation is planned. Freesound rows use the official high-quality preview derivative tied to a stable sound ID; expected output hash prevents source drift.

| Cue/layer | Work and license | Exact source URL | Bytes | SHA-256 | Proposed object key |
|---|---|---|---:|---|---|
| watering | Peludo, Water Splash and sand footsteps, CC0 | `https://opengameart.org/sites/default/files/splash2_0.wav` | 150,572 | `ad9472b711666de2d43c3b102d155a5d1118b1fcd0ecd29cb63177256ab63f31` | `assets/vendor/peludo/water-splash-2021/watering.wav` |
| Farm ambience | Spring Spring, Birds and Wind - Ambient, CC0 | `https://opengameart.org/sites/default/files/Birds%20and%20Wind%20-%20Ambient_1.ogg` | 1,883,864 | `28f99f536a0772d80052f03bcb22c9ed8fd7c6e4db7f2e8356efcf26a8e24f01` | `assets/vendor/spring-spring/birds-and-wind-2019/farm-ambience.ogg` |
| Town environment | Milkybread sound `830375`, CC0 | `https://cdn.freesound.org/previews/830/830375_15877700-hq.mp3` | 513,898 | `8255e9ca011fbfc606216afc3ec4da178b013b6648523b64d9c3b5e512fb2778` | `assets/vendor/milkybread/village-ambience-830375/town-ambience.mp3` |
| Town walla | Breviceps sound `473586`, CC0 | `https://cdn.freesound.org/previews/473/473586_9159316-hq.mp3` | 849,809 | `53d77cb7894c8ab371310d637a00d453ff744ac9b3868a3628e1766b623ac0a9` | `assets/vendor/breviceps/people-talking-473586/town-walla.mp3` |
| Lakeshore water | transitking sound `11505`, CC0 | `https://cdn.freesound.org/previews/11/11505_31028-hq.mp3` | 3,549,217 | `ea2a900f500c32330b6ecafcf7fe283d854048f5f7364ec115f267b7faf7b29f` | `assets/vendor/transitking/water-waves-11505/lakeshore-water.mp3` |
| Interior room tone | leonelmail sound `329569`, CC0 | `https://cdn.freesound.org/previews/329/329569_4437257-hq.mp3` | 685,824 | `47efe63c314f93d1ebef554955ce7132506d15a13b317a99e084fc6c030ef0c2` | `assets/vendor/leonelmail/roomtone-bedroom-329569/interior-room-tone.mp3` |

## Publication constraint

The current `publish-game-media` workflow on `main` does not allow these object keys. Repository-dispatch uses the workflow from the default branch, so local/feature-branch allowlist changes cannot publish until that workflow revision reaches `main`. Small archive members can be sent as `content_base64`; direct files should be fetched by exact approved URL. This is an external release-order dependency, not a reason to reference unregistered upstream URLs from production code.
