import assert from "node:assert/strict"

import {
  TAVERN_LAYOUTS,
  buildTavernLayoutStats,
  countClaimsByStatus,
  normalizeTavernLayoutStyle,
} from "../app/lib/tavern-layouts.js"

const layoutIds = TAVERN_LAYOUTS.map((layout) => layout.id)

assert.deepEqual(
  layoutIds,
  ["lobby", "npc-chat", "quest-play", "hybrid-room"],
  "tavern page should expose the four design-reference layout styles in a stable order",
)

assert.equal(new Set(layoutIds).size, 4, "layout ids must be unique")
assert.equal(normalizeTavernLayoutStyle("hybrid-room"), "hybrid-room")
assert.equal(normalizeTavernLayoutStyle("platform-generated-theme"), "lobby")
assert.equal(normalizeTavernLayoutStyle(null), "lobby")
assert.ok(
  TAVERN_LAYOUTS.every((layout) => layout.title && layout.navLabel && layout.description && layout.icon),
  "each tavern layout needs visible title, nav label, description and icon metadata",
)
assert.ok(
  TAVERN_LAYOUTS.every((layout) => layout.actions.length >= 3),
  "each tavern layout should provide at least three reference-inspired action cards",
)

assert.deepEqual(
  countClaimsByStatus([
    { status: "approved" },
    { status: "pending" },
    { status: "pending" },
    { status: "rejected" },
    {},
  ]),
  { approved: 1, pending: 2, rejected: 1, revoked: 0 },
  "roleplay claim counts should tolerate missing and unknown statuses",
)

const stats = buildTavernLayoutStats(
  {
    id: "fog",
    name: "雾灯酒馆",
    lat: 31.2304,
    lon: 121.4737,
    access: "password",
    status: "open",
    visit_count: 7,
    characters: [{ id: "a" }, { id: "b" }],
    world_info: [{ id: "w1" }, { id: "w2" }],
    gameplay_definitions: [{ id: "g1" }],
  },
  [{ id: "a" }, { id: "b" }, { id: "c" }],
  [{ status: "approved" }, { status: "pending" }],
)

assert.deepEqual(stats.claims, { approved: 1, pending: 1, rejected: 0, revoked: 0 })
assert.equal(stats.characterCount, 3)
assert.equal(stats.worldInfoCount, 2)
assert.equal(stats.gameplayCount, 1)
assert.equal(stats.location, "31.23040°N · 121.47370°E")
assert.equal(stats.accessStatus, "open · password")
assert.equal(stats.visitCount, 7)

const emptyStats = buildTavernLayoutStats(null, [], [])
assert.equal(emptyStats.location, "坐标未设置")
assert.equal(emptyStats.accessStatus, "unknown · public")
assert.equal(emptyStats.characterCount, 0)

console.log("tavern-layouts-test: ok")
