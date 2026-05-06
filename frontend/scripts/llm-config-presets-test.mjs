import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(__dirname, "../app/product/LLMConfigForm.jsx"), "utf8")
const packageJson = readFileSync(resolve(__dirname, "../package.json"), "utf8")

assert.ok(source.includes("kilo-auto/free"), "LLM config presets should expose kilo-auto/free as an owner-selectable free model")
assert.ok(source.includes("kilo-free-owner-opt-in"), "kilo-auto/free preset should be explicit owner opt-in")
assert.ok(source.includes("https://api.kilo.ai/api/gateway"), "Kilo preset should include the versioned test gateway base URL")
assert.ok(source.includes("后端版本化配置补齐连接信息"), "Kilo preset copy should explain system/public-welfare server-side test config")
assert.ok(source.includes("不作为平台强制默认"), "free model copy must not imply a forced platform default")
assert.ok(source.includes("额度"), "free model copy should warn about quota/stability limitations")
assert.ok(packageJson.includes("llm-config-presets-test.mjs"), "frontend test script should include the LLM preset guard")

console.log("llm-config-presets-test: ok")
