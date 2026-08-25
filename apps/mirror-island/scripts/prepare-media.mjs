import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const vendorBaseUrl = "https://img.pingxingxian.space/game/media/v1/assets/vendor";
const ninjaBaseUrl = `${vendorBaseUrl}/ninja-adventure/2024-04-19`;
const vectoraithBaseUrl = `${vendorBaseUrl}/vectoraith/farming-sim-v1.08`;
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
    name: "VectoRaith Farm terrain",
    url: `${vectoraithBaseUrl}/farm-terrain.png`,
    outputs: [
      "public/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/farm-terrain.png",
      "src/tiled/farm-terrain.png",
    ],
    bytes: 3469,
    sha256: "7eb50c6588605efeb54e3d5f6aefa6dfa105b827f95aaad8322d9d8bfadab5d6",
  },
  {
    name: "VectoRaith Farm buildings",
    url: `${vectoraithBaseUrl}/farm-buildings.png`,
    outputs: [
      "public/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/farm-buildings.png",
      "src/tiled/farm-buildings.png",
    ],
    bytes: 3063,
    sha256: "3f3c121917067bbe5056574f6ccf800308a2d98b486d7e299b4d543aa46ff357",
  },
  {
    name: "VectoRaith Farm details",
    url: `${vectoraithBaseUrl}/farm-details.png`,
    outputs: [
      "public/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/farm-details.png",
      "src/tiled/farm-details.png",
    ],
    bytes: 5322,
    sha256: "40f48f1e5469156988af5e46363f62af44b9b3ec394b54141b1153be4f4fd5bd",
  },
  {
    name: "VectoRaith Farm entities",
    url: `${vectoraithBaseUrl}/farm-entities.png`,
    outputs: ["public/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/farm-entities.png"],
    bytes: 2867,
    sha256: "0a0d2a6ca099ebcbc898bae482b6407cd22fbead3265d624f162a213de018833",
  },
  {
    name: "VectoRaith farmer",
    url: `${vectoraithBaseUrl}/farmer.png`,
    outputs: ["public/game-media/v1/assets/vendor/vectoraith/farming-sim-v1.08/farmer.png"],
    bytes: 2950,
    sha256: "864bd89bb8386f5a79324dca6b9eecd4289f2e30d966e5a501d4b2ae44f3113a",
  },
];

/** Returns the lowercase SHA-256 digest for one downloaded byte buffer. */
function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

/** Downloads one immutable asset, verifies its contract, and writes it only after validation. */
async function downloadVerifiedAsset(asset) {
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
