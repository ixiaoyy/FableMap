import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, "..", "..")
const engagementLib = readFileSync(resolve(repoRoot, "frontend", "app", "lib", "engagement.ts"), "utf8")
const tavernRoute = readFileSync(resolve(repoRoot, "frontend", "app", "routes", "tavern.tsx"), "utf8")

assert.ok(
  engagementLib.includes("getVisitorEngagement(tavernId: string, userId = \"\")"),
  "engagement client should accept userId for visitor progress requests",
)

assert.ok(
  engagementLib.includes("jsonInit(\"POST\", { gift_id: giftId, character_id: characterId }, userId)"),
  "gift send requests should carry userId through the shared API init helper",
)

assert.ok(
  engagementLib.includes("value?.emoji || value?.icon || \"🎁\""),
  "gift catalog normalization should accept backend icon fields",
)

assert.ok(
  tavernRoute.includes("TavernEngagementPanel"),
  "tavern route should mount the visitor engagement panel",
)

console.log("engagement-panel-test: ok")
