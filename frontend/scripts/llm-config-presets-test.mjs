import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(__dirname, "../app/product/LLMConfigForm.jsx"), "utf8")
const packageJson = readFileSync(resolve(__dirname, "../package.json"), "utf8")

assert.ok(source.includes("deepseek-v4-flash-free"), "LLM config presets should expose OpenCode DeepSeek V4 Flash Free")
assert.ok(source.includes("opencode-deepseek-v4-flash-free"), "OpenCode free preset should be explicit owner opt-in")
assert.ok(source.includes("https://opencode.ai/zen"), "OpenCode preset should include the Zen OpenAI-compatible base URL")
assert.ok(source.includes("后端版本化配置补齐连接信息"), "OpenCode preset copy should explain system/public-welfare server-side test config")
assert.ok(source.includes("不作为平台强制默认"), "free model copy must not imply a forced platform default")
assert.ok(source.includes("额度"), "free model copy should warn about quota/stability limitations")
assert.ok(source.includes("限时免费"), "free model copy should warn that the OpenCode offer is time-limited")
assert.ok(packageJson.includes("llm-config-presets-test.mjs"), "frontend test script should include the LLM preset guard")

console.log("llm-config-presets-test: ok")
