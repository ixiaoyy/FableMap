import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const routeSource = readFileSync(resolve(__dirname, "../app/routes/tavern.tsx"), "utf8")
const shellSource = readFileSync(resolve(__dirname, "../app/shell/product-shell.tsx"), "utf8")
const ownerSource = readFileSync(resolve(__dirname, "../app/routes/owner.tsx"), "utf8")
const workbenchPath = resolve(__dirname, "../app/features/tavern-chat-workbench/index.tsx")
assert.ok(existsSync(workbenchPath), "tavern chat workbench component should exist")
const workbenchSource = readFileSync(workbenchPath, "utf8")

assert.ok(
  routeSource.includes('import { TavernChatWorkbench } from "../features/tavern-chat-workbench"'),
  "tavern route should render the native SillyTavern-style chat workbench",
)
assert.ok(
  !routeSource.includes("TavernLayoutShowcase"),
  "tavern route should not put the older layout showcase before the chat surface",
)
assert.ok(
  routeSource.includes("getCurrentUserIdFromRequest(request)") &&
    !routeSource.includes("tavern = await getTavern(tavernId, DEFAULT_OWNER_ID)"),
  "loader should use the current viewer identity and must not fall back to owner-demo",
)
assert.ok(
  routeSource.includes("isOwner") && routeSource.includes("ownerPanel={isOwner"),
  "owner management panels must be gated by current user ownership",
)

for (const snippet of [
  'data-chat-workbench="sillytavern-style"',
  'data-owner-only-panel',
  'aria-label="NPC 角色列表"',
  'aria-label="聊天记录"',
  'placeholder="Type a message',
  "Shift+Enter 换行",
  "更多酒馆功能",
  "店主管理",
]) {
  assert.ok(workbenchSource.includes(snippet), `workbench should include ${snippet}`)
}

assert.ok(
  shellSource.includes("移动首屏聚焦角色列表和聊天输入"),
  "mobile tavern guide should describe chat-first entry",
)
assert.ok(
  ownerSource.includes("owner_id=${encodeURIComponent(ownerId)}"),
  "owner dashboard links into taverns should preserve owner identity for management access",
)

console.log("tavern-chat-workbench-test: ok")
