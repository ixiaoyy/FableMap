import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const shellSource = readFileSync(resolve(__dirname, "../app/shell/product-shell.tsx"), "utf8")

assert.ok(shellSource.includes("px-4 py-4 sm:px-6"), "product shell header should reduce horizontal padding on 320px screens")
assert.ok(shellSource.includes("px-4 py-8 sm:px-6"), "product shell content should reduce horizontal padding on 320px screens")
assert.ok(shellSource.includes("overflow-x-auto"), "product shell nav should allow horizontal scroll instead of cramped overflow on narrow screens")
assert.ok(shellSource.includes("min-h-11 touch-manipulation"), "product shell nav/logo links should expose 44px mobile touch targets")
assert.ok(!shellSource.includes("className=\"rounded-full border px-4 py-2 text-sm"), "product shell nav items must not keep sub-44px tap targets")

console.log("mobile-shell-layout-test: ok")