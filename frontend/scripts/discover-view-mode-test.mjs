import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const discoverSource = readFileSync(resolve(__dirname, "../app/routes/discover.tsx"), "utf8")
const shellSource = readFileSync(resolve(__dirname, "../app/shell/product-shell.tsx"), "utf8")

assert.match(
  discoverSource,
  /type\s+DiscoverViewMode\s*=\s*"radar"\s*\|\s*"cards"/,
  "discover route should define the approved radar/cards view mode contract",
)
assert.ok(discoverSource.includes("manualViewMode"), "discover route should preserve manual view-mode choice")
assert.ok(discoverSource.includes("雷达视图"), "discover route should expose a radar view toggle")
assert.ok(discoverSource.includes("卡片视图"), "discover route should expose a card view toggle")
assert.ok(discoverSource.includes("附近坐标") && discoverSource.includes("正在发光"), "discover hero should use the approved glowing-coordinate headline")
assert.ok(discoverSource.includes("activeViewMode"), "discover route should derive the active view mode")
assert.ok(discoverSource.includes("discoverRadarSurfaceImage"), "discover radar view should use a project-local high-quality radar surface asset")
assert.ok(discoverSource.includes("discover-cover-neon-alley.png"), "discover cards should use project-local high-quality cover assets")
assert.ok(!discoverSource.includes("发现附近的空间"), "discover hero should not remain Tavern-only")
assert.ok(!discoverSource.includes("搜索空间名称…"), "discover search placeholder should not remain Tavern-only")
assert.ok(!shellSource.includes("Cyber taverns on real places"), "product shell subtitle should not remain Tavern-only")
assert.ok(shellSource.includes("Cyber life on real coordinates"), "product shell should align with the broader coordinate-space positioning")

console.log("discover-view-mode-test: ok")


