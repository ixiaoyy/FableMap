import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const homeSource = readFileSync(resolve(__dirname, "../app/routes/home.tsx"), "utf8")
const discoverSource = readFileSync(resolve(__dirname, "../app/routes/discover.tsx"), "utf8")
const soulLinkSource = readFileSync(resolve(__dirname, "../app/components/soul-link-reference-artboards.tsx"), "utf8")
const helperPath = resolve(__dirname, "../app/lib/homepage-taverns.ts")
const helperSource = existsSync(helperPath) ? readFileSync(helperPath, "utf8") : ""

assert.ok(homeSource.includes("listTaverns"), "home route should load the real tavern list")
assert.match(homeSource, /export\s+async\s+function\s+clientLoader/, "home route should expose a clientLoader")
assert.ok(!/const\s+metrics\s*:\s*Metric\[\]\s*=\s*\[/.test(homeSource), "home route should not keep fixed live-looking metrics as source of truth")
assert.ok(!/const\s+citySlices\s*:\s*CitySlicePreview\[\]\s*=\s*\[/.test(homeSource), "home route should not keep fixed featured entry cards as source of truth")
assert.ok(homeSource.includes("SoulLinkHomeReference"), "home route should render the locked SoulLink 1:1 reference component")
assert.ok(homeSource.includes('variant="black"') && homeSource.includes('variant="light"'), "home route should keep theme-driven light/dark rendering")
assert.ok(soulLinkSource.includes('data-soul-link-design-lock="owner-reference-1-to-1"'), "SoulLink component should expose the 1:1 owner-reference lock marker")
assert.ok(soulLinkSource.includes("featuredCitySlices[index]?.id"), "home card overlays should still derive entry links from real featured tavern IDs")
assert.ok(soulLinkSource.includes("targetFor(featuredCitySlices[index]?.id)"), "home card overlay links should target real taverns when IDs exist")

assert.ok(helperSource.includes("export function buildHomepageView"), "homepage helper should export buildHomepageView")
assert.ok(helperSource.includes("export function resolveHomepageTavernCover"), "homepage helper should export the shared cover resolver")
assert.ok(helperSource.includes("visit_count"), "homepage metrics should derive from tavern visit_count when present")
assert.ok(helperSource.includes("usedCovers"), "homepage featured card builder should track used covers")
assert.ok(helperSource.includes("findUnusedHomepageCover"), "homepage helper should pick a fallback cover when needed")
assert.ok(discoverSource.includes("resolveHomepageTavernCover"), "discover route should keep the shared cover resolver for non-reference fallback surfaces")
assert.ok(discoverSource.includes("resolveUniqueHomepageTavernCovers"), "discover route should allocate varied fallback covers")

console.log("homepage-dynamic-entry-test: ok")
