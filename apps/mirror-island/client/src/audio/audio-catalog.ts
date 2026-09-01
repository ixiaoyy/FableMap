import { mediaUrl } from "../game/assets/media-catalog.ts";

export const AUDIO_CUE = {
  footstep: "footstep",
  hoe: "hoe",
  watering: "watering",
  axe: "axe",
  stone: "stone",
  harvest: "harvest",
  pickup: "pickup",
  door: "door",
  buy: "buy",
  sell: "sell",
  dialoguePage: "dialogue-page",
  sleep: "sleep",
} as const;

export type AudioCue = typeof AUDIO_CUE[keyof typeof AUDIO_CUE];

export interface AudioAssetDefinition {
  readonly id: string;
  readonly url: string;
  readonly gain: number;
}

export interface AmbientLayerDefinition extends AudioAssetDefinition {
  readonly loop: true;
}

const KENNEY_AUDIO_PATH = "assets/vendor/kenney/rpg-audio-2014";
const RUBBERDUCK_AUDIO_PATH = "assets/vendor/rubberduck/100-cc0-sfx-2-2018";

export const FOOTSTEP_ASSETS: readonly AudioAssetDefinition[] = [
  asset("footstep-01", `${KENNEY_AUDIO_PATH}/footstep-01.ogg`, "6fe61ef1", 0.42),
  asset("footstep-02", `${KENNEY_AUDIO_PATH}/footstep-02.ogg`, "313472db", 0.42),
  asset("footstep-03", `${KENNEY_AUDIO_PATH}/footstep-03.ogg`, "2d9575b7", 0.42),
];

export const ONE_SHOT_ASSETS: Readonly<Record<Exclude<AudioCue, "footstep">, AudioAssetDefinition>> = {
  [AUDIO_CUE.hoe]: asset("hoe", `${RUBBERDUCK_AUDIO_PATH}/hoe.ogg`, "84abc80d", 0.7),
  [AUDIO_CUE.watering]: asset("watering", "assets/vendor/peludo/water-splash-2021/watering.wav", "ad9472b7", 0.38),
  [AUDIO_CUE.axe]: asset("axe", `${KENNEY_AUDIO_PATH}/axe-chop.ogg`, "d00c2b3c", 0.72),
  [AUDIO_CUE.stone]: asset("stone", `${RUBBERDUCK_AUDIO_PATH}/stone.ogg`, "20d293a8", 0.68),
  [AUDIO_CUE.harvest]: asset("harvest", `${RUBBERDUCK_AUDIO_PATH}/harvest.ogg`, "fe585eaf", 0.58),
  [AUDIO_CUE.pickup]: asset("pickup", `${RUBBERDUCK_AUDIO_PATH}/pickup.ogg`, "828940e6", 0.52),
  [AUDIO_CUE.door]: asset("door", `${KENNEY_AUDIO_PATH}/door-open.ogg`, "4ab93bab", 0.62),
  [AUDIO_CUE.buy]: asset("buy", `${KENNEY_AUDIO_PATH}/coins-buy.ogg`, "8a91f969", 0.58),
  [AUDIO_CUE.sell]: asset("sell", `${KENNEY_AUDIO_PATH}/coins-sell.ogg`, "4b857968", 0.58),
  [AUDIO_CUE.dialoguePage]: asset("dialogue-page", `${KENNEY_AUDIO_PATH}/dialogue-page.ogg`, "fa81ac2f", 0.45),
  [AUDIO_CUE.sleep]: asset("sleep", `${KENNEY_AUDIO_PATH}/sleep.ogg`, "81e97653", 0.48),
};

const AMBIENT_LAYERS = {
  farm: [
    ambient("farm-ambience", "assets/vendor/spring-spring/birds-and-wind-2019/farm-ambience.ogg", "28f99f53", 0.28),
  ],
  town: [
    ambient("town-ambience", "assets/vendor/milkybread/village-ambience-830375/town-ambience.mp3", "8255e9ca", 0.22),
    ambient("town-walla", "assets/vendor/breviceps/people-talking-473586/town-walla.mp3", "53d77cb7", 0.09),
  ],
  lakeshore: [
    ambient("lakeshore-water", "assets/vendor/transitking/water-waves-11505/lakeshore-water.mp3", "ea2a900f", 0.3),
  ],
  interior: [
    ambient("interior-room-tone", "assets/vendor/leonelmail/roomtone-bedroom-329569/interior-room-tone.mp3", "47efe63c", 0.14),
  ],
} as const;

export type AmbientGroup = keyof typeof AMBIENT_LAYERS;

/** Maps one world region into the reviewed ambience group without changing gameplay state. */
export function ambientGroupForRegion(regionId: string): AmbientGroup {
  if (regionId === "farm" || regionId === "town" || regionId === "lakeshore") return regionId;
  if (regionId === "foothills") return "farm";
  return "interior";
}

/** Returns the immutable audio layers for one reviewed region group. */
export function ambientLayersForGroup(group: AmbientGroup): readonly AmbientLayerDefinition[] {
  return AMBIENT_LAYERS[group];
}

/** Creates one immutable one-shot URL and gain definition from a manifest-owned path. */
function asset(id: string, path: string, version: string, gain: number): AudioAssetDefinition {
  return { id, url: mediaUrl(path, version), gain };
}

/** Creates one immutable looping layer definition from a manifest-owned audio path. */
function ambient(id: string, path: string, version: string, gain: number): AmbientLayerDefinition {
  return { ...asset(id, path, version, gain), loop: true };
}
