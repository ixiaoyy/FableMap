import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(__dirname, "../app")
const source = (path) => readFileSync(resolve(appRoot, path), "utf8")

const runtimeConfigSource = source("lib/tavern-runtime-config.js")
assert.ok(!runtimeConfigSource.includes("owner-demo") && !runtimeConfigSource.includes("visitor-demo") && runtimeConfigSource.includes("getOrCreateVisitorIdentity") && runtimeConfigSource.includes("requireExplicitOwnerIdentity"))

const runtimeConfig = await import(pathToFileURL(resolve(appRoot, "lib/tavern-runtime-config.js")).href)
const memoryStorage = (() => {
  const values = new Map()
  return { getItem: (key) => (values.has(key) ? values.get(key) : null), setItem: (key, value) => values.set(key, String(value)) }
})()
const firstVisitorId = runtimeConfig.getOrCreateVisitorIdentity(memoryStorage)
assert.match(firstVisitorId, /^visitor_[a-z0-9]+_[a-z0-9]+$/)
assert.ok(runtimeConfig.getOrCreateVisitorIdentity(memoryStorage) === firstVisitorId && runtimeConfig.requireExplicitOwnerIdentity(" owner-live ") === "owner-live" && runtimeConfig.hasExplicitOwnerIdentity("") === false && runtimeConfig.hasExplicitOwnerIdentity(" owner-live ") === true)
assert.throws(() => runtimeConfig.requireExplicitOwnerIdentity(""), /店主身份|owner/i)

const tavernsSource = source("lib/taverns.ts")
assert.ok(!tavernsSource.includes("DEMO_TAVERN_IDENTITIES") && tavernsSource.includes('DEFAULT_OWNER_ID: string = ""') && tavernsSource.includes("getOrCreateVisitorIdentity"))
assert.ok(tavernsSource.includes("/api/v1/chat/sessions") && !tavernsSource.includes("/api/v1/sessions"))
assert.ok(source("routes/create.tsx").includes("hasExplicitOwnerIdentity") && source("routes/owner.tsx").includes("hasExplicitOwnerIdentity(ownerId)") && !source("features/tavern-chat/index.tsx").includes("visitor-demo"))

console.log("identity-boundary-test: ok")
