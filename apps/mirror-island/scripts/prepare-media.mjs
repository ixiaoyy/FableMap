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
