import assert from "node:assert/strict"
import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const homeSource = readFileSync(resolve(__dirname, "../app/routes/home.tsx"), "utf8")
const radarAssetPath = resolve(__dirname, "../app/assets/discover/reference/discover-radar-surface.png")
const lightSliceDir = resolve(__dirname, "../app/assets/homepage/light/slices")
const lightSlices = [
  ["home-light-slice-01a-nav-bar.png", 958, 72],
  ["home-light-slice-01b-hero-main.png", 958, 398],
  ["home-light-slice-02a-featured-heading.png", 958, 82],
  ["home-light-slice-02b1-featured-card-covers.png", 958, 112],
  ["home-light-slice-02b2-featured-card-info.png", 958, 83],
  ["home-light-slice-02c-featured-bottom.png", 958, 18],
  ["home-light-slice-03a-ai-roles-heading.png", 958, 48],
  ["home-light-slice-03b-ai-roles-card-row.png", 958, 112],
  ["home-light-slice-03c-ai-roles-bottom.png", 958, 10],
  ["home-light-slice-04-memory-echoes.png", 958, 185],
  ["home-light-slice-05-recommended-coordinates.png", 958, 245],
  ["home-light-slice-06-cta-footer.png", 958, 277],
]

function readPngDimensions(path) {
  const buffer = readFileSync(path)
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

assert.ok(existsSync(radarAssetPath), "homepage hero should rely on a project-local high-quality radar/city asset")
assert.ok(homeSource.includes("discoverRadarSurfaceImage"), "homepage hero should import the high-quality radar surface asset")
assert.ok(homeSource.includes("discover-radar-surface.png"), "homepage hero should reference the project-local high-quality image path")
let totalSliceHeight = 0
for (const [name, width, height] of lightSlices) {
  const slicePath = resolve(lightSliceDir, name)
  const slice2xPath = resolve(lightSliceDir, name.replace(".png", "-2x.png"))
  const sidecarPath = resolve(lightSliceDir, name.replace(".png", ".prompt.md"))
  assert.ok(existsSync(slicePath), `${name} should exist as a project-local coarse slice`)
  assert.ok(existsSync(slice2xPath), `${name} should have a 2x HD sibling`)
  assert.ok(existsSync(sidecarPath), `${name} should have same-directory provenance`)
  assert.deepEqual(readPngDimensions(slicePath), { width, height }, `${name} should preserve its 1:1 slice dimensions`)
  assert.deepEqual(readPngDimensions(slice2xPath), { width: width * 2, height: height * 2 }, `${name} 2x should preserve retina dimensions`)
  assert.ok(statSync(slice2xPath).size > statSync(slicePath).size, `${name} 2x should contain a higher-resolution payload`)
  totalSliceHeight += height
}
assert.equal(totalSliceHeight, 1642, "coarse slices should add up to the full index_light artboard height")
assert.ok(homeSource.includes("lightHomeSlices"), "home route should use a coarse slice manifest")
assert.ok(homeSource.includes('data-home-light-reference="index-light-coarse-sliced-1to1"'), "light theme homepage should expose the coarse sliced 1:1 contract marker")
assert.ok(homeSource.includes('data-home-light-slice-count={lightHomeSlices.length}'), "light theme homepage should expose the slice count")
assert.ok(homeSource.includes('id: "01a-nav-bar"') && homeSource.includes('id: "01b-hero-main"'), "top section should be split on real frontend boundaries: Header/Nav and Hero")
assert.ok(homeSource.includes('id: "02a-featured-heading"') && homeSource.includes('id: "02b1-featured-card-covers"') && homeSource.includes('id: "02b2-featured-card-info"') && homeSource.includes('id: "02c-featured-bottom"'), "featured regions should be fine-split into heading/card-cover/card-info/bottom slices")
assert.ok(homeSource.includes('id: "03a-ai-roles-heading"') && homeSource.includes('id: "03b-ai-roles-card-row"') && homeSource.includes('id: "03c-ai-roles-bottom"'), "AI role section should be fine-split into heading/card-row/bottom slices")
assert.ok(homeSource.includes('data-home-light-artboard="index-light-958x1642"'), "light theme homepage should expose the measured artboard marker")
assert.ok(homeSource.includes('data-home-light-slice={slice.id}'), "light theme homepage should render individual slice sections")
assert.ok(homeSource.includes('data-home-hotspot-slice={hotspot.sliceId}'), "hotspots should keep semantic ownership while rendering on a full-artboard overlay")
assert.ok(homeSource.includes("srcSet") && homeSource.includes("src2x"), "light homepage should expose an HD srcSet for each slice")
assert.ok(!homeSource.includes('data-home-light-reference="componentized-index-light"'), "light theme homepage should not use the rejected approximate componentized redraw")
assert.ok(!homeSource.includes("homeLightIndexReference"), "coarse split should no longer import the full-page artboard at runtime")
assert.ok(!homeSource.includes("homeLightSliceNavHero"), "top section should not keep importing the old combined nav/hero parent slice")
assert.ok(!homeSource.includes("heroReferenceImage"), "homepage hero should not keep using the old low-resolution screenshot-like reference")
assert.ok(!homeSource.includes("neon-cyber-tavern-reference.png"), "homepage hero should not reference the old blurry homepage image")
assert.ok(!homeSource.includes("min-h-[calc(100vh-88px)]"), "homepage hero section should not force a viewport-height layout that creates large blank space")
assert.ok(homeSource.includes("LightReferenceHome"), "home route should render a dedicated light-mode reference component")
assert.ok(homeSource.includes("max-w-[958px]"), "coarse slice artboard should preserve the complete index_light source width instead of stretching it blurry")
assert.ok(homeSource.includes("查看全部角色") && homeSource.includes("查看更多记忆") && homeSource.includes("查看全部区域"), "light reference hotspots should cover the completed lower-page sections")
assert.ok(!homeSource.includes("lg:min-h-[640px]"), "homepage visual should not retain the oversized hero poster height")

console.log("home-visual-density-test: ok")
