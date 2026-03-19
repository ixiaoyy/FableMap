import packAScene from '../assets/map-packs/pack_a/scene/scene_01.png'
import packAQuestIcon from '../assets/map-packs/pack_a/icons/quest.png'
import packAShopIcon from '../assets/map-packs/pack_a/icons/shop.png'
import packABossIcon from '../assets/map-packs/pack_a/icons/boss.png'
import packAHomeIcon from '../assets/map-packs/pack_a/icons/home.png'
import packAEchoIcon from '../assets/map-packs/pack_a/icons/echo.png'
import packAEventIcon from '../assets/map-packs/pack_a/icons/event.png'
import packATileRoad01 from '../assets/map-packs/pack_a/tiles/road_01.png'
import packATileRoad02 from '../assets/map-packs/pack_a/tiles/road_02.png'
import packATileGround01 from '../assets/map-packs/pack_a/tiles/ground_01.png'
import packATileGround02 from '../assets/map-packs/pack_a/tiles/ground_02.png'
import packATileWater01 from '../assets/map-packs/pack_a/tiles/water_01.png'
import packATileMagic01 from '../assets/map-packs/pack_a/tiles/magic_01.png'

import packBScene from '../assets/map-packs/pack_b/scene/scene_01.png'
import packBQuestIcon from '../assets/map-packs/pack_b/icons/quest.png'
import packBShopIcon from '../assets/map-packs/pack_b/icons/shop.png'
import packBBossIcon from '../assets/map-packs/pack_b/icons/boss.png'
import packBHomeIcon from '../assets/map-packs/pack_b/icons/home.png'
import packBEchoIcon from '../assets/map-packs/pack_b/icons/echo.png'
import packBEventIcon from '../assets/map-packs/pack_b/icons/event.png'
import packBTileRoad01 from '../assets/map-packs/pack_b/tiles/road_01.png'
import packBTileRoad02 from '../assets/map-packs/pack_b/tiles/road_02.png'
import packBTileGround01 from '../assets/map-packs/pack_b/tiles/ground_01.png'
import packBTileGround02 from '../assets/map-packs/pack_b/tiles/ground_02.png'
import packBTileWater01 from '../assets/map-packs/pack_b/tiles/water_01.png'
import packBTileGarden01 from '../assets/map-packs/pack_b/tiles/garden_01.png'
import { getAssetIconKey } from './iconMapping.js'
import { getAssetPackKey } from './packSelector.js'

export const MAP_ASSET_PACKS = {
  pack_a: {
    scene: packAScene,
    icons: {
      quest: packAQuestIcon,
      shop: packAShopIcon,
      boss: packABossIcon,
      home: packAHomeIcon,
      echo: packAEchoIcon,
      event: packAEventIcon,
    },
    tiles: {
      road_01: packATileRoad01,
      road_02: packATileRoad02,
      ground_01: packATileGround01,
      ground_02: packATileGround02,
      water_01: packATileWater01,
      magic_01: packATileMagic01,
    },
  },
  pack_b: {
    scene: packBScene,
    icons: {
      quest: packBQuestIcon,
      shop: packBShopIcon,
      boss: packBBossIcon,
      home: packBHomeIcon,
      echo: packBEchoIcon,
      event: packBEventIcon,
    },
    tiles: {
      road_01: packBTileRoad01,
      road_02: packBTileRoad02,
      ground_01: packBTileGround01,
      ground_02: packBTileGround02,
      water_01: packBTileWater01,
      garden_01: packBTileGarden01,
    },
  },
}


export function getAssetPack(vibeProfile) {
  const packKey = getAssetPackKey(vibeProfile)
  return MAP_ASSET_PACKS[packKey] || MAP_ASSET_PACKS.pack_b
}

export function getAssetIconSrc(vibeProfile, fantasyType) {
  const pack = getAssetPack(vibeProfile)
  const iconKey = getAssetIconKey(fantasyType)
  return iconKey ? pack.icons[iconKey] || null : null
}
