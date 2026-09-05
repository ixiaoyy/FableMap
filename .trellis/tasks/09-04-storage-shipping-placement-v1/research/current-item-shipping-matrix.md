# Current item shipping and sort matrix

核对日期：2026-09-04。依据当前 `domain/items/definitions.ts` 与 `domain/farming/crops.ts::sellPriceForItem()`；这是镜像岛当前内容映射，不冒充 Stardew 的完整物品表。

出货资格只覆盖当前已有明确售价的物品。工具、种子、木材以及新增普通箱当前售价为 `null`，因此不可投入出货箱；后续若产品为它们增加售价，必须同时显式评审 `canShip`，不能由售价自动推导。

| sortOrder | itemId | canShip | category | current unit price |
| ---: | --- | :---: | --- | ---: |
| 0 | `wood` | no | - | - |
| 1 | `axe` | no | - | - |
| 2 | `hoe` | no | - | - |
| 3 | `pickaxe` | no | - | - |
| 4 | `scythe` | no | - | - |
| 5 | `stone` | yes | Mining | 2g |
| 6 | `fiber` | yes | Foraging | 1g |
| 7 | `turnip-seed` | no | - | - |
| 8 | `watering-can` | no | - | - |
| 9 | `turnip` | yes | Farming | 35g |
| 10 | `bok-choy-seed` | no | - | - |
| 11 | `bok-choy` | yes | Farming | 80g |
| 12 | `cauliflower-seed` | no | - | - |
| 13 | `cauliflower` | yes | Farming | 170g |
| 14 | `spring-wildflower` | yes | Foraging | 25g |
| 15 | `bamboo-shoot` | yes | Foraging | 40g |
| 16 | `green-pea-seed` | no | - | - |
| 17 | `green-pea` | yes | Farming | 48g |
| 18 | `spring-potato-seed` | no | - | - |
| 19 | `spring-potato` | yes | Farming | 72g |
| 20 | `rapeseed-seed` | no | - | - |
| 21 | `rapeseed-flower` | yes | Farming | 68g |
| 22 | `fishing-rod` | no | - | - |
| 23 | `lake-carp` | yes | Fishing | 45g |
| 24 | `silver-minnow` | yes | Fishing | 35g |
| 25 | `rain-loach` | yes | Fishing | 70g |
| 26 | `wind-dace` | yes | Fishing | 65g |
| 27 | `dusk-perch` | yes | Fishing | 85g |
| 28 | `jade-bream` | yes | Fishing | 140g |
| 29 | `chest` | no | - | - |

`sortOrder` 固定为当前 catalog 的既有展示顺序；工具在自动整理时不移动，其余物品按该字段升序合并和排列。新增物品必须显式给出唯一顺序、出货资格、分类和售价关系。
