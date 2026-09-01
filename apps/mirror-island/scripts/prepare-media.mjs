import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const vendorBaseUrl = "https://img.pingxingxian.space/game/media/v1/assets/vendor";
const ninjaBaseUrl = `${vendorBaseUrl}/ninja-adventure/2024-04-19`;
const vectoraithBaseUrl = `${vendorBaseUrl}/vectoraith/farming-sim-v1.08/original/16x16`;
const vectoraithNpcBaseUrl = `${vendorBaseUrl}/vectoraith/top-down-rpg-npc-v1.6-demo/original/16x16`;
const ivoryRedBaseUrl = `${vendorBaseUrl}/ivoryred/gardens-2026-08-27/original`;
const homeArtBaseUrl = "https://img.pingxingxian.space/game/media/v1/assets/original/mirror-island-home/2026-08-31";
const kenneyAudioBaseUrl = `${vendorBaseUrl}/kenney/rpg-audio-2014`;
const rubberduckAudioBaseUrl = `${vendorBaseUrl}/rubberduck/100-cc0-sfx-2-2018`;
const assets = [
  {
    name: "male player",
    url: `${ninjaBaseUrl}/player.png`,
    outputs: ["public/game-media/v1/assets/vendor/ninja-adventure/2024-04-19/player.png"],
    bytes: 6139,
    sha256: "f2dd61a264c251b81e63da7a28ab0fdccd261b807e5fa7d1832a468e14a21078",
  },
  {
    name: "female player",
    url: `${ninjaBaseUrl}/player-female.png`,
    outputs: ["public/game-media/v1/assets/vendor/ninja-adventure/2024-04-19/player-female.png"],
    bytes: 4784,
    sha256: "552e1af74a8d565408519ced8c5bb309d291a9d3002e4e37c881d2181f413e96",
  },
  {
    name: "floor tileset",
    url: `${ninjaBaseUrl}/floor.png`,
    outputs: [
      "public/game-media/v1/assets/vendor/ninja-adventure/2024-04-19/floor.png",
      "src/tiled/floor.png",
    ],
    bytes: 29615,
    sha256: "e111065065edf806e7e893330086e68efc8755175d92f14d087b42d40a331e16",
  },
  {
    name: "village tileset",
    url: `${ninjaBaseUrl}/village.png`,
    outputs: [
      "public/game-media/v1/assets/vendor/ninja-adventure/2024-04-19/village.png",
      "src/tiled/village.png",
    ],
    bytes: 31779,
    sha256: "6787c6e22a4d44ceee4f158309b2519707bdb70c59aca00b3d49006cadcca06e",
  },
  {
    name: "interior floor tileset",
    url: `${ninjaBaseUrl}/interior-floor.png`,
    outputs: [
      "public/game-media/v1/assets/vendor/ninja-adventure/2024-04-19/interior-floor.png",
      "src/tiled/interior-floor.png",
    ],
    bytes: 13012,
    sha256: "e281598e2d90f43b31fd557b94c2d2abb00d307758a053b7df301575bf535e3a",
  },
  {
    name: "interior wall tileset",
    url: `${ninjaBaseUrl}/wall.png`,
    outputs: [
      "public/game-media/v1/assets/vendor/ninja-adventure/2024-04-19/wall.png",
      "src/tiled/wall.png",
    ],
    bytes: 5149,
    sha256: "ad5eb80ab4d5e65dbcda9dc012f9981323b277717349cdab012fc65ce06e43b2",
  },
  {
    name: "VectoRaith original terrain",
    url: `${vectoraithBaseUrl}/tilesets-compact/vectoraith_tileset_farmingsims_terrain_spring_expanded.png`,
    outputs: [
      "public/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/original/16x16/tilesets-compact/vectoraith_tileset_farmingsims_terrain_spring_expanded.png",
      "src/tiled/vectoraith_tileset_farmingsims_terrain_spring_expanded.png",
    ],
    bytes: 21694,
    sha256: "e86e6c9b5f003b0e74a7cbac261cd89df2bd56a0df6af90c6cd08e046a9dbffa",
  },
  {
    name: "VectoRaith original buildings",
    url: `${vectoraithBaseUrl}/tilesets-compact/vectoraith_tileset_farmingsims_buildings.png`,
    outputs: [
      "public/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/original/16x16/tilesets-compact/vectoraith_tileset_farmingsims_buildings.png",
      "src/tiled/vectoraith_tileset_farmingsims_buildings.png",
    ],
    bytes: 16502,
    sha256: "cf4670e091ab1a4e6b84b7f88c96de7304f33730c54fc9f6956f1051bf07b69a",
  },
  {
    name: "VectoRaith original details",
    url: `${vectoraithBaseUrl}/tilesets-compact/vectoraith_tileset_farmingsims_details.png`,
    outputs: [
      "public/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/original/16x16/tilesets-compact/vectoraith_tileset_farmingsims_details.png",
      "src/tiled/vectoraith_tileset_farmingsims_details.png",
    ],
    bytes: 27372,
    sha256: "d0e32b626904506b027ce9cb7eb4fb1ac5a70fe74572bdea75983cd06c728c9e",
  },
  {
    name: "VectoRaith original orchard",
    url: `${vectoraithBaseUrl}/tilesets-compact/vectoraith_tileset_farmingsims_orchard.png`,
    outputs: ["public/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/original/16x16/tilesets-compact/vectoraith_tileset_farmingsims_orchard.png"],
    bytes: 11487,
    sha256: "5488f4107c9bb136e057be2f1b95a6b3688d80026f295b940bd057e3396788fb",
  },
  {
    name: "VectoRaith original crops",
    url: `${vectoraithBaseUrl}/tilesets-compact/vectoraith_tileset_farmingsims_crops.png`,
    outputs: ["public/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/original/16x16/tilesets-compact/vectoraith_tileset_farmingsims_crops.png"],
    bytes: 13655,
    sha256: "ac174d7c0a45afb6525f1210f06fad86d6fce1112f5ced5d5f472590fe6d3d61",
  },
  {
    name: "VectoRaith original farmer",
    url: `${vectoraithBaseUrl}/sprites/$farmer.png`,
    outputs: ["public/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/original/16x16/sprites/$farmer.png"],
    bytes: 3059,
    sha256: "85fe4b7350f2ccf9a6225c2bec6fe1bc9f5dfa00909605cc4ec3962d1c006f08",
  },
  {
    name: "VectoRaith original NPC demo",
    url: `${vectoraithNpcBaseUrl}/generic_people.png`,
    outputs: ["public/game-media/v1/assets/vendor/vectoraith/top-down-rpg-npc-v1.6-demo/original/16x16/generic_people.png"],
    bytes: 17354,
    sha256: "eb1fe419def5a351cfc147a8273b133f1e7daaa9f59a418fe4a7d3f8d7d67ba0",
  },
  {
    name: "IvoryRed GARDENS icons",
    url: `${ivoryRedBaseUrl}/all-the-icons-gardens.png`,
    outputs: ["public/game-media/v1/assets/vendor/ivoryred/gardens-2026-08-27/original/all-the-icons-gardens.png"],
    bytes: 13130,
    sha256: "de4dbbb56936520882e1217aad9dae22e60a5f57dde15512f673ec031b581536",
  },
  {
    name: "Mirror Island homepage hero",
    url: `${homeArtBaseUrl}/mirror-island-home-hero.png`,
    outputs: ["public/game-media/v1/assets/original/mirror-island-home/2026-08-31/mirror-island-home-hero.png"],
    bytes: 2659416,
    sha256: "f1182c1ef76eba8a048dd2f424ed0219c80575629e01f46be8e59519e2fe7adf",
  },
  {
    name: "Kenney footstep 1",
    url: `${kenneyAudioBaseUrl}/footstep-01.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/kenney/rpg-audio-2014/footstep-01.ogg"],
    bytes: 9475,
    sha256: "6fe61ef1fc3bcf0e253bf2eb64759db6cb69e2fe452f4d88cc597ecf78a3d601",
  },
  {
    name: "Kenney footstep 2",
    url: `${kenneyAudioBaseUrl}/footstep-02.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/kenney/rpg-audio-2014/footstep-02.ogg"],
    bytes: 9900,
    sha256: "313472dba31fd0c855376069fa368bb5a198c27251cc8398ef464578b7047a4c",
  },
  {
    name: "Kenney footstep 3",
    url: `${kenneyAudioBaseUrl}/footstep-03.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/kenney/rpg-audio-2014/footstep-03.ogg"],
    bytes: 9528,
    sha256: "2d9575b7dead6e1217ca113991fc5229e9b6d998ea0726ebbb277e7398ab888f",
  },
  {
    name: "Kenney axe chop",
    url: `${kenneyAudioBaseUrl}/axe-chop.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/kenney/rpg-audio-2014/axe-chop.ogg"],
    bytes: 9370,
    sha256: "d00c2b3c9fff07e376145c8c8c45c90e5084ec192f6ce0387db233f7b86f1486",
  },
  {
    name: "Kenney door open",
    url: `${kenneyAudioBaseUrl}/door-open.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/kenney/rpg-audio-2014/door-open.ogg"],
    bytes: 22848,
    sha256: "4ab93bab96522d8eb109ff96dc57cb6765deb02448fe14c10472084be5bb2a0b",
  },
  {
    name: "Kenney buy coins",
    url: `${kenneyAudioBaseUrl}/coins-buy.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/kenney/rpg-audio-2014/coins-buy.ogg"],
    bytes: 25394,
    sha256: "8a91f969e932df709df80ee124d86a51389eed9b67f22e5e716bc2bbf60d8dab",
  },
  {
    name: "Kenney sell coins",
    url: `${kenneyAudioBaseUrl}/coins-sell.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/kenney/rpg-audio-2014/coins-sell.ogg"],
    bytes: 13094,
    sha256: "4b857968d64f9ac9336a10ffac6694d7547e1f01566ad6857b30bc8db3ee6c32",
  },
  {
    name: "Kenney dialogue page",
    url: `${kenneyAudioBaseUrl}/dialogue-page.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/kenney/rpg-audio-2014/dialogue-page.ogg"],
    bytes: 18248,
    sha256: "fa81ac2fedc8c641661b87e349630a36c9800e795e0c800e029214efdbe26a7d",
  },
  {
    name: "Kenney sleep cue",
    url: `${kenneyAudioBaseUrl}/sleep.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/kenney/rpg-audio-2014/sleep.ogg"],
    bytes: 9292,
    sha256: "81e976532565f4372abd14e83d2684195fa548d0a28d345de221e56052454f32",
  },
  {
    name: "rubberduck hoe impact",
    url: `${rubberduckAudioBaseUrl}/hoe.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/rubberduck/100-cc0-sfx-2-2018/hoe.ogg"],
    bytes: 7629,
    sha256: "84abc80d93011d86f29bc55c10a023265ece0851d0784d1bf07c5990f08daeab",
  },
  {
    name: "rubberduck stone impact",
    url: `${rubberduckAudioBaseUrl}/stone.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/rubberduck/100-cc0-sfx-2-2018/stone.ogg"],
    bytes: 12669,
    sha256: "20d293a892e1fa6330da2569065aa260a822198bddce2b183f8c11642e7deb4d",
  },
  {
    name: "rubberduck pickup",
    url: `${rubberduckAudioBaseUrl}/pickup.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/rubberduck/100-cc0-sfx-2-2018/pickup.ogg"],
    bytes: 13577,
    sha256: "828940e6c04c63ea22f15ff47b6722c2b9fde54f148b26935d95a645baf770f4",
  },
  {
    name: "rubberduck harvest",
    url: `${rubberduckAudioBaseUrl}/harvest.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/rubberduck/100-cc0-sfx-2-2018/harvest.ogg"],
    bytes: 12726,
    sha256: "fe585eaf85fbbc0f56653174bc374aa9d2143c9dad68154bf9c596f7c1ee62d6",
  },
  {
    name: "Peludo watering splash",
    url: `${vendorBaseUrl}/peludo/water-splash-2021/watering.wav`,
    outputs: ["public/game-media/v1/assets/vendor/peludo/water-splash-2021/watering.wav"],
    bytes: 150572,
    sha256: "ad9472b711666de2d43c3b102d155a5d1118b1fcd0ecd29cb63177256ab63f31",
  },
  {
    name: "Spring Spring farm ambience",
    url: `${vendorBaseUrl}/spring-spring/birds-and-wind-2019/farm-ambience.ogg`,
    outputs: ["public/game-media/v1/assets/vendor/spring-spring/birds-and-wind-2019/farm-ambience.ogg"],
    bytes: 1883864,
    sha256: "28f99f536a0772d80052f03bcb22c9ed8fd7c6e4db7f2e8356efcf26a8e24f01",
  },
  {
    name: "Milkybread town ambience",
    url: `${vendorBaseUrl}/milkybread/village-ambience-830375/town-ambience.mp3`,
    outputs: ["public/game-media/v1/assets/vendor/milkybread/village-ambience-830375/town-ambience.mp3"],
    bytes: 513898,
    sha256: "8255e9ca011fbfc606216afc3ec4da178b013b6648523b64d9c3b5e512fb2778",
  },
  {
    name: "Breviceps town walla",
    url: `${vendorBaseUrl}/breviceps/people-talking-473586/town-walla.mp3`,
    outputs: ["public/game-media/v1/assets/vendor/breviceps/people-talking-473586/town-walla.mp3"],
    bytes: 849809,
    sha256: "53d77cb7894c8ab371310d637a00d453ff744ac9b3868a3628e1766b623ac0a9",
  },
  {
    name: "transitking lakeshore water",
    url: `${vendorBaseUrl}/transitking/water-waves-11505/lakeshore-water.mp3`,
    outputs: ["public/game-media/v1/assets/vendor/transitking/water-waves-11505/lakeshore-water.mp3"],
    bytes: 3549217,
    sha256: "ea2a900f500c32330b6ecafcf7fe283d854048f5f7364ec115f267b7faf7b29f",
  },
  {
    name: "leonelmail interior room tone",
    url: `${vendorBaseUrl}/leonelmail/roomtone-bedroom-329569/interior-room-tone.mp3`,
    outputs: ["public/game-media/v1/assets/vendor/leonelmail/roomtone-bedroom-329569/interior-room-tone.mp3"],
    bytes: 685824,
    sha256: "47efe63c314f93d1ebef554955ce7132506d15a13b317a99e084fc6c030ef0c2",
  },
];

/** Returns the lowercase SHA-256 digest for one downloaded byte buffer. */
function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

/** Reuses exact local outputs or downloads one immutable asset and writes it only after validation. */
async function downloadVerifiedAsset(asset) {
  const localBuffers = await Promise.all(asset.outputs.map(async (output) => {
    try {
      return await readFile(join(root, output));
    } catch {
      return null;
    }
  }));
  if (localBuffers.every((buffer) => buffer?.byteLength === asset.bytes && sha256(buffer) === asset.sha256)) {
    return;
  }

  const response = await fetch(asset.url);
  if (!response.ok) {
    throw new Error(`${asset.name} download failed with HTTP ${response.status}.`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength !== asset.bytes) {
    throw new Error(`${asset.name} byte length mismatch: expected ${asset.bytes}, received ${buffer.byteLength}.`);
  }
  const digest = sha256(buffer);
  if (digest !== asset.sha256) {
    throw new Error(`${asset.name} SHA-256 mismatch: expected ${asset.sha256}, received ${digest}.`);
  }

  await Promise.all(asset.outputs.map(async (output) => {
    const outputPath = join(root, output);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, buffer);
  }));
}

await Promise.all(assets.map(downloadVerifiedAsset));
console.log(`Prepared ${assets.length} verified Mirror Island media assets.`);
