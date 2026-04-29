import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const shellSource = readFileSync(resolve(__dirname, "../app/shell/product-shell.tsx"), "utf8")

assert.ok(shellSource.includes("px-4 py-4 sm:px-6"), "product shell header should reduce horizontal padding on 320px screens")
assert.ok(shellSource.includes("px-4 py-8 pb-28 sm:px-6"), "product shell content should reduce horizontal padding on 320px screens")
assert.ok(shellSource.includes("overflow-x-auto"), "product shell nav should allow horizontal scroll instead of cramped overflow on narrow screens")
assert.ok(shellSource.includes("min-h-11 touch-manipulation"), "product shell nav/logo links should expose 44px mobile touch targets")
assert.ok(!shellSource.includes("className=\"rounded-full border px-4 py-2 text-sm"), "product shell nav items must not keep sub-44px tap targets")
assert.ok(shellSource.includes("mobile-bottom-dock fixed inset-x-3 bottom-3"), "product shell should provide a visible mobile bottom navigation dock")
assert.ok(shellSource.includes("aria-label=\"Mobile navigation\""), "mobile dock should have an accessible navigation label")
assert.ok(shellSource.includes("min-h-14 touch-manipulation"), "mobile dock items should provide comfortable touch targets")
assert.ok(shellSource.includes("pb-28 sm:px-6"), "product shell content should leave room for the fixed mobile dock")
assert.ok(shellSource.includes("lg:hidden"), "mobile bottom dock should not duplicate desktop navigation on large screens")

console.log("mobile-shell-layout-test: ok")
