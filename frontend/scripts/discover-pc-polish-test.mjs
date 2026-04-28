import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const discoverSource = readFileSync(resolve(__dirname, "../app/routes/discover.tsx"), "utf8")

assert.ok(discoverSource.includes("DesktopRadarTelemetry"), "discover PC radar should include a desktop telemetry strip")
assert.ok(discoverSource.includes("lg:grid-cols-[0.62fr_1.38fr]"), "discover PC layout should give the radar board stronger width dominance")
assert.ok(discoverSource.includes("lg:sticky lg:top-28"), "discover PC control column should stay stable while scanning results")
assert.ok(discoverSource.includes("lg:min-h-[680px]"), "discover PC radar board should have a stronger desktop poster scale")
assert.ok(discoverSource.includes("xl:grid-cols-2"), "discover radar signals should become denser in two columns on wide desktop")
assert.ok(discoverSource.includes("Live telemetry"), "discover telemetry should expose a visible cockpit label")
assert.ok(discoverSource.includes('type DiscoverViewMode = "radar" | "cards"'), "discover view-mode contract must remain intact")

console.log("discover-pc-polish-test: ok")