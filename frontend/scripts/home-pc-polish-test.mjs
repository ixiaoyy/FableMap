import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const homeSource = readFileSync(resolve(__dirname, "../app/routes/home.tsx"), "utf8")

assert.ok(homeSource.includes("DesktopMetricRail"), "desktop homepage should integrate metrics into the PC hero instead of leaving them only below the fold")
assert.ok(homeSource.includes("lg:grid-cols-[0.56fr_1.44fr]"), "desktop homepage should give the cyber visual panel stronger width dominance")
assert.ok(homeSource.includes("lg:min-h-[560px]"), "desktop hero visual should regain premium poster scale without using a full viewport blank layout")
assert.ok(homeSource.includes("lg:hidden"), "separate metrics band should be hidden on desktop once metrics are integrated into the hero")
assert.ok(homeSource.includes("discoverRadarSurfaceImage"), "PC hero must keep using the high-quality radar surface asset")
assert.ok(!homeSource.includes("min-h-[calc(100vh-88px)]"), "PC polish must not reintroduce viewport-height blank space")

console.log("home-pc-polish-test: ok")