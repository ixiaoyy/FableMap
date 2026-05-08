import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const homeSource = readFileSync(resolve(__dirname, "../app/routes/home.tsx"), "utf8")

assert.ok(homeSource.includes("LightReferenceHome"), "desktop light homepage should use the dedicated reference-matched component")
assert.ok(homeSource.includes("lightHomeSlices"), "desktop light homepage should render the coarse/fine slice manifest")
assert.ok(homeSource.includes('id: "01a-nav-bar"') && homeSource.includes('id: "01b-hero-main"'), "desktop light homepage should split the top area by real Header/Nav and Hero boundaries")
assert.ok(homeSource.includes('id: "02a-featured-heading"') && homeSource.includes('id: "02b1-featured-card-covers"') && homeSource.includes('id: "02b2-featured-card-info"'), "desktop light homepage should continue fine-splitting the featured-region card body")
assert.ok(homeSource.includes('id: "03a-ai-roles-heading"') && homeSource.includes('id: "03b-ai-roles-card-row"') && homeSource.includes('id: "03c-ai-roles-bottom"'), "desktop light homepage should continue fine-splitting the AI-role section")
assert.ok(homeSource.includes("max-w-[958px]"), "desktop light homepage should preserve the reference artboard width instead of stretching a low-resolution image")
assert.ok(homeSource.includes("srcSet") && homeSource.includes("src2x"), "desktop light homepage should serve 2x image sources for HD/retina displays")
assert.ok(homeSource.includes("absolute") && homeSource.includes('label: "开始探索真实坐标"'), "light homepage should keep clickable hotspots over the reference artboard")
assert.ok(homeSource.includes('label: "查看全部角色"') && homeSource.includes('label: "查看更多记忆"'), "light homepage should include hotspots for the completed lower sections")
assert.ok(!homeSource.includes('data-home-light-reference="componentized-index-light"'), "desktop light homepage should not use the rejected approximate componentized redraw")
assert.ok(!homeSource.includes("homeLightIndexReference"), "desktop light homepage should not import the full-page artboard after coarse slicing")
assert.ok(homeSource.includes("真实坐标，") && homeSource.includes("藏着会回应的世界"), "homepage hero title should avoid a chopped three-line blob")
assert.ok(homeSource.includes("会回应的世界"), "homepage hero should keep the emotional promise concise across readable lines")
assert.ok(homeSource.includes("discoverRadarSurfaceImage"), "PC hero must keep using the high-quality radar surface asset")
assert.ok(!homeSource.includes("min-h-[calc(100vh-88px)]"), "PC polish must not reintroduce viewport-height blank space")

console.log("home-pc-polish-test: ok")
