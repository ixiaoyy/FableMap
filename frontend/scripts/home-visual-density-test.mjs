import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const homeSource = readFileSync(resolve(__dirname, "../app/routes/home.tsx"), "utf8")
const radarAssetPath = resolve(__dirname, "../app/assets/discover/reference/discover-radar-surface.png")

assert.ok(existsSync(radarAssetPath), "homepage hero should rely on a project-local high-quality radar/city asset")
assert.ok(homeSource.includes("discoverRadarSurfaceImage"), "homepage hero should import the high-quality radar surface asset")
assert.ok(homeSource.includes("discover-radar-surface.png"), "homepage hero should reference the project-local high-quality image path")
assert.ok(!homeSource.includes("heroReferenceImage"), "homepage hero should not keep using the old low-resolution screenshot-like reference")
assert.ok(!homeSource.includes("neon-cyber-tavern-reference.png"), "homepage hero should not reference the old blurry homepage image")
assert.ok(!homeSource.includes("min-h-[calc(100vh-88px)]"), "homepage hero section should not force a viewport-height layout that creates large blank space")
assert.ok(/py-6[^"]*lg:py-8/.test(homeSource), "homepage hero should use compact vertical padding above the fold")
assert.ok(homeSource.includes("lg:min-h-[560px]"), "homepage visual should use the approved PC poster height without reverting to the old 640px oversized height")
assert.ok(!homeSource.includes("lg:min-h-[640px]"), "homepage visual should not retain the oversized hero poster height")

console.log("home-visual-density-test: ok")
