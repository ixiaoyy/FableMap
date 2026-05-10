import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const homeRouteSource = readFileSync(resolve(__dirname, "../app/routes/home.tsx"), "utf8")
const soulLinkSource = readFileSync(resolve(__dirname, "../app/components/soul-link-reference-artboards.tsx"), "utf8")
const combinedHomeSource = `${homeRouteSource}\n${soulLinkSource}`

assert.ok(homeRouteSource.includes("SoulLinkHomeReference"), "desktop homepage should use the locked SoulLink reference component")
assert.ok(soulLinkSource.includes('data-soul-link-design-lock="owner-reference-1-to-1"'), "desktop homepage should keep the owner-reference 1:1 design lock")
assert.ok(soulLinkSource.includes("home-light-real-dom-1536x1024"), "desktop light homepage should preserve source dimensions")
assert.ok(soulLinkSource.includes("home-black-real-dom-1536x1024"), "desktop black homepage should preserve source dimensions")
assert.ok(soulLinkSource.includes("aspectRatio: `${artboard.width} / ${artboard.height}`"), "artboard should scale from measured reference dimensions rather than free-layout redesign")
assert.ok(soulLinkSource.includes("min-h-11 touch-manipulation"), "interactive overlays should keep touch-safe DOM controls")
assert.ok(soulLinkSource.includes("OverlayInput") && soulLinkSource.includes("OverlayLink") && soulLinkSource.includes("OverlayButton"), "reference image slices should be paired with real DOM overlays")
assert.ok(!combinedHomeSource.includes('data-home-light-reference="componentized-index-light"'), "homepage should not use the rejected approximate redraw")
assert.ok(!combinedHomeSource.includes("homeLightIndexReference"), "desktop homepage should not import full-page old artboards")
assert.ok(!combinedHomeSource.includes("../assets/homepage/"), "desktop homepage must not reference deleted old homepage assets")
assert.ok(!combinedHomeSource.includes("min-h-[calc(100vh-88px)]"), "PC polish must not reintroduce viewport-height blank space")

console.log("home-pc-polish-test: ok")
