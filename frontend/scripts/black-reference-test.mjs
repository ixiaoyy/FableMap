import assert from "node:assert/strict"
import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const homeRouteSource = readFileSync(resolve(__dirname, "../app/routes/home.tsx"), "utf8")
const discoverRouteSource = readFileSync(resolve(__dirname, "../app/routes/discover.tsx"), "utf8")
const homeBlackSource = readFileSync(resolve(__dirname, "../app/components/home-black-reference.tsx"), "utf8")
const homeBlackSectionsSource = readFileSync(resolve(__dirname, "../app/components/home-black-sections.tsx"), "utf8")
const discoverBlackSource = readFileSync(resolve(__dirname, "../app/components/discover-black-reference.tsx"), "utf8")
const discoverBlackSectionsSource = readFileSync(resolve(__dirname, "../app/components/discover-black-sections.tsx"), "utf8")
const homeLayoutSource = readFileSync(resolve(__dirname, "../app/components/home-reference-layout.ts"), "utf8")
const discoverLayoutSource = readFileSync(resolve(__dirname, "../app/components/discover-reference-layout.ts"), "utf8")
const topNavSource = readFileSync(resolve(__dirname, "../app/components/light-reference-top-nav.tsx"), "utf8")
const combinedHomeBlackSource = `${homeBlackSource}\n${homeBlackSectionsSource}`
const combinedDiscoverBlackSource = `${discoverBlackSource}\n${discoverBlackSectionsSource}`

function readPngInfo(path) {
  const buffer = readFileSync(path)
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer[25],
  }
}

function assertReferenceAsset(path, expectedSize) {
  const image = resolve(__dirname, "..", path)
  const image2x = image.replace(".png", "-2x.png")
  const prompt = image.replace(".png", ".prompt.md")
  assert.ok(existsSync(image), `${path} should exist`)
  assert.ok(existsSync(image2x), `${path} should have a 2x sibling`)
  const imageInfo = readPngInfo(image)
  const image2xInfo = readPngInfo(image2x)
  assert.deepEqual({ width: imageInfo.width, height: imageInfo.height }, expectedSize, `${path} should keep reference dimensions`)
  assert.deepEqual({ width: image2xInfo.width, height: image2xInfo.height }, { width: expectedSize.width * 2, height: expectedSize.height * 2 }, `${path} 2x should keep retina dimensions`)
  if (path.includes("nav-bar")) {
    assert.equal(imageInfo.colorType, 6, `${path} should be an editable transparent chrome layer, not a baked full screenshot`)
    assert.equal(image2xInfo.colorType, 6, `${path} 2x should be an editable transparent chrome layer`)
  }
  assert.ok(statSync(image2x).size > statSync(image).size, `${path} 2x should contain a larger payload`)
  if (existsSync(prompt)) {
    const sidecar = readFileSync(prompt, "utf8")
    assert.ok(sidecar.includes("prompt_type:"), `${path} optional sidecar should expose prompt_type when present`)
  }
}

function assertSamePngDimensions(lightPath, blackPath) {
  const lightInfo = readPngInfo(resolve(__dirname, "..", lightPath))
  const blackInfo = readPngInfo(resolve(__dirname, "..", blackPath))
  assert.deepEqual(
    { width: blackInfo.width, height: blackInfo.height },
    { width: lightInfo.width, height: lightInfo.height },
    `${blackPath} should keep the exact same runtime dimensions as ${lightPath}`,
  )
}

assertReferenceAsset("app/assets/homepage/black/home-black-index-reference.png", { width: 958, height: 1642 })
assertReferenceAsset("app/assets/discover/black/discover-black-reference.png", { width: 1448, height: 1086 })
assertReferenceAsset("app/assets/homepage/black/slices/home-black-slice-01a-nav-bar.png", { width: 958, height: 72 })
assertReferenceAsset("app/assets/homepage/black/slices/home-black-slice-01b-hero-main.png", { width: 958, height: 398 })
assertReferenceAsset("app/assets/homepage/black/elements/home-black-featured-cover-01.png", { width: 270, height: 112 })
assertReferenceAsset("app/assets/homepage/black/elements/home-black-featured-cover-02.png", { width: 270, height: 112 })
assertReferenceAsset("app/assets/homepage/black/elements/home-black-featured-cover-03.png", { width: 270, height: 112 })
assertReferenceAsset("app/assets/homepage/black/elements/home-black-section-bunny.png", { width: 77, height: 73 })
assertReferenceAsset("app/assets/homepage/black/elements/home-black-cta-city.png", { width: 828, height: 86 })
assertSamePngDimensions("app/assets/homepage/light/home-light-index-reference.png", "app/assets/homepage/black/home-black-index-reference.png")
assertSamePngDimensions("app/assets/homepage/light/slices/home-light-slice-01a-nav-bar.png", "app/assets/homepage/black/slices/home-black-slice-01a-nav-bar.png")
assertSamePngDimensions("app/assets/homepage/light/slices/home-light-slice-01b-hero-main.png", "app/assets/homepage/black/slices/home-black-slice-01b-hero-main.png")
assertSamePngDimensions("app/assets/homepage/light/elements/home-light-featured-cover-01.png", "app/assets/homepage/black/elements/home-black-featured-cover-01.png")
assertSamePngDimensions("app/assets/homepage/light/elements/home-light-featured-cover-02.png", "app/assets/homepage/black/elements/home-black-featured-cover-02.png")
assertSamePngDimensions("app/assets/homepage/light/elements/home-light-featured-cover-03.png", "app/assets/homepage/black/elements/home-black-featured-cover-03.png")
assertSamePngDimensions("app/assets/homepage/light/elements/home-light-section-bunny.png", "app/assets/homepage/black/elements/home-black-section-bunny.png")
assertReferenceAsset("app/assets/discover/black/slices/discover-black-slice-01a-nav-bar.png", { width: 1448, height: 72 })
assertReferenceAsset("app/assets/discover/black/elements/discover-black-sidebar-avatar.png", { width: 118, height: 124 })
assertReferenceAsset("app/assets/discover/black/elements/discover-black-sidebar-radar.png", { width: 116, height: 122 })
assertReferenceAsset("app/assets/discover/black/elements/discover-black-bottom-bunny.png", { width: 260, height: 178 })
assertReferenceAsset("app/assets/discover/black/elements/discover-black-card-01-cover.png", { width: 226, height: 172 })
assertReferenceAsset("app/assets/discover/black/elements/discover-black-right-thumb-01.png", { width: 76, height: 58 })

assert.ok(homeRouteSource.includes("HomeBlackReference") && homeRouteSource.includes("isDark"), "dark homepage should route through the black reference component")
assert.ok(discoverRouteSource.includes("DiscoverBlackReference") && discoverRouteSource.includes("isDark"), "dark discover should route through the black reference component")
assert.ok(homeRouteSource.includes("HomeLightRealDom") && discoverRouteSource.includes("DiscoverLightRealDom"), "light surfaces should stay on the light reference components")
assert.ok(homeBlackSource.includes('data-home-black-reference="index-black-real-dom"'), "black homepage should expose the real-DOM index black marker")
assert.ok(discoverBlackSource.includes('data-discover-black-reference="search-black-real-dom"'), "black discover should expose the real-DOM search black marker")
assert.ok(homeBlackSource.includes('data-home-reference-template="home-light-compatible"'), "black homepage should declare it follows the light homepage template")
assert.ok(discoverBlackSource.includes('data-discover-reference-template="search-light-compatible"'), "black discover should declare it follows the light discover template")
assert.ok(homeBlackSectionsSource.includes("HOME_BLACK_SECTIONS") && homeLayoutSource.includes("HOME_LIGHT_SECTIONS"), "home black should use the shared home section map family")
assert.ok(homeLayoutSource.includes("HOME_BLACK_ARTBOARD = HOME_LIGHT_ARTBOARD"), "black homepage artboard should use the same size as the light homepage artboard")
assert.ok(homeLayoutSource.includes("HOME_BLACK_SECTIONS: HomeReferenceSection[] = HOME_LIGHT_SECTIONS"), "black homepage sections should be the exact light homepage section layout")
assert.ok(homeBlackSource.includes('data-home-black-artboard="index-black-958x1642"'), "black homepage runtime artboard marker should match the light artboard size")
assert.ok(homeBlackSectionsSource.includes('data-home-layout-source="home-light-scaled"'), "home black section internals should declare light-layout coordinate reuse")
assert.ok(discoverBlackSectionsSource.includes("DISCOVER_REFERENCE_SECTIONS") && discoverLayoutSource.includes("main-card-grid"), "discover black should use the shared discover section map")
assert.ok(homeBlackSectionsSource.includes('data-home-shared-template-section={section.id}'), "home black sections should be tagged as shared-template sections")
assert.ok(discoverBlackSectionsSource.includes('data-discover-shared-template-section={section.id}'), "discover black sections should be tagged as shared-template sections")
assert.ok(!combinedHomeBlackSource.includes("ReferenceArtboard") && !combinedDiscoverBlackSource.includes("ReferenceArtboard"), "black pages must not fall back to full-artboard hotspot components")
assert.ok(homeBlackSource.includes("featuredCitySlices[index]?.id"), "black homepage card hotspots should derive from real featured tavern ids")
assert.ok(discoverBlackSectionsSource.includes("taverns[index]?.id"), "black discover result hotspots should derive from real tavern ids")
assert.ok(discoverBlackSectionsSource.includes('data-discover-black-search="real-input"'), "black discover should keep a real search input overlay")
assert.ok(homeBlackSource.includes('surface="black"') && discoverBlackSource.includes('surface="black"'), "black pages should reuse the shared top nav in black mode")
assert.ok(topNavSource.includes('data-reference-top-nav-surface={surface}'), "shared top nav should expose theme-specific reuse metadata")
assert.ok(topNavSource.includes('data-reference-top-nav-logo-mark="real-svg"'), "shared top nav should render the logo mark as editable SVG instead of baked screenshot text")
assert.ok(topNavSource.includes('alt=""') && topNavSource.includes('aria-hidden="true"'), "nav backing images should be decorative transparent chrome, not text-bearing screenshots")
assert.ok(!topNavSource.includes("opacity-0"), "shared top nav should not hide editable DOM/SVG text behind baked screenshot text")
assert.ok(homeBlackSource.includes("onToggleTheme") && discoverBlackSource.includes("onToggleTheme"), "black references should keep theme toggle controls")
assert.ok(topNavSource.includes("layoutForSurface") && topNavSource.includes("HOME_TOP_NAV_BASE_WIDTH"), "black homepage nav should scale the shared light nav layout instead of keeping a separate black layout")
assert.ok(homeBlackSource.split("\n").length <= 80, "black homepage shell should stay lean instead of becoming a single large page file")
assert.ok(discoverBlackSource.split("\n").length <= 90, "black discover shell should stay lean instead of becoming a single large page file")
assert.ok(homeBlackSource.includes("HomeBlackFeaturedSection") && homeBlackSectionsSource.includes("export function HomeBlackFeaturedSection"), "home black page should compose extracted section components")
assert.ok(discoverBlackSource.includes("DiscoverBlackCardGrid") && discoverBlackSectionsSource.includes("export function DiscoverBlackCardGrid"), "discover black page should compose extracted section components")

console.log("black-reference-test: ok")
