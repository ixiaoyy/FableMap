import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const createSource = readFileSync(resolve(__dirname, "../app/routes/create.tsx"), "utf8")
const discoverSource = readFileSync(resolve(__dirname, "../app/routes/discover.tsx"), "utf8")
const tavernSource = readFileSync(resolve(__dirname, "../app/routes/tavern.tsx"), "utf8")
const ownerManageSource = readFileSync(resolve(__dirname, "../app/features/tavern-owner-management/index.tsx"), "utf8")

assert.ok(createSource.includes("data-special-tavern-type-selector"), "create route should expose a dedicated special tavern type selector")
assert.ok(createSource.includes("data-special-tavern-type-card"), "create route should render selectable special tavern type cards")
assert.ok(createSource.includes("特殊空间模板"), "create route should explain the thin special tavern type layer")
assert.ok(createSource.includes('name="layout_style"'), "create route should persist the recommended layout_style without schema changes")
assert.ok(createSource.includes("data-special-tavern-type-preview"), "create route right rail should preview the active special tavern type")

assert.ok(discoverSource.includes("activeSpecialTypes"), "discover route should keep special tavern type filter state")
assert.ok(discoverSource.includes("deriveSpecialTavernTypeDisplay"), "discover route should render thin special tavern type labels")
assert.ok(discoverSource.includes("专题体验"), "discover filters should expose a special tavern type grouping")
assert.ok(discoverSource.includes("specialTavernTypeMatchesTavern"), "discover filtering should use shared special tavern type matching")

assert.ok(tavernSource.includes("SpecialTavernTypeCard"), "tavern route should render a dedicated special tavern type card")
assert.ok(tavernSource.includes("deriveSpecialTavernTypeDisplay"), "tavern route should derive the special tavern type from persisted fields")
assert.ok(tavernSource.includes("data-special-tavern-type-card"), "tavern route should keep a stable marker for the special tavern type card")

assert.ok(ownerManageSource.includes("data-cultivation-play-pack-panel"), "owner management should expose a stable cultivation play-pack panel marker")
assert.ok(ownerManageSource.includes("确认并注入玩法包内容"), "owner management should let the owner explicitly confirm the play-pack injection")
assert.ok(ownerManageSource.includes("历练回执样例"), "cultivation play pack should preview a bounded training receipt")
assert.ok(ownerManageSource.includes("突破条件样例"), "cultivation play pack should preview the next-stage requirement panel")
assert.ok(ownerManageSource.includes("不会引入战斗、等级、装备、交易或排行"), "cultivation play pack copy should keep the non-RPG boundary explicit")

console.log("special-tavern-type-ui-test: ok")
