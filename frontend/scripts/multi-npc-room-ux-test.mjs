import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const chatRoomSource = readFileSync(join(here, '../app/product/TavernChatRoom.jsx'), 'utf8')
const stylesSource = readFileSync(join(here, '../app/product/styles.css'), 'utf8')
const packageSource = readFileSync(join(here, '../package.json'), 'utf8')

const requiredRoomCopy = [
  '多人 NPC 房间',
  '发言规则',
  '访客主导',
  '正史边界',
  'NPC 只回应',
  '不替你发言',
  '不替你决定动作',
  '确认前不是酒馆正史',
  '群聊参与者',
]

assert.ok(chatRoomSource.includes('MultiNpcRoomGuide'), 'TavernChatRoom should render a dedicated MultiNpcRoomGuide')
assert.ok(chatRoomSource.includes('GROUP_ROOM_RULES'), 'multi-NPC room rules should be source-level constants')
assert.ok(chatRoomSource.includes('getGroupRoomRules'), 'speaker/agency/canon rules should be derived from existing group config')
for (const text of requiredRoomCopy) {
  assert.ok(chatRoomSource.includes(text), `missing multi-NPC room copy: ${text}`)
}

assert.ok(
  chatRoomSource.includes('groupChatEnabled ? (') && chatRoomSource.includes('<MultiNpcRoomGuide'),
  'MultiNpcRoomGuide should be shown only in group-chat mode'
)
assert.ok(chatRoomSource.includes('groupChatConfig.response_cooldown_seconds'), 'guide should expose cooldown speaker rule')
assert.ok(chatRoomSource.includes('groupChatConfig.require_name_prefix'), 'guide should expose name-prefix speaker rule')
assert.ok(chatRoomSource.includes('character.talkativeness'), 'participant roster should reuse existing character talkativeness')

const requiredSelectors = [
  '.group-room-guide',
  '.group-room-guide__header',
  '.group-room-guide__rules',
  '.group-room-rule-card',
  '.group-room-participants',
  '.group-room-participant',
]
for (const selector of requiredSelectors) {
  assert.ok(stylesSource.includes(selector), `missing multi-NPC room style selector: ${selector}`)
}
assert.ok(stylesSource.includes('@media (max-width: 720px)'), 'multi-NPC UX must live with mobile-safe stylesheet rules')
assert.ok(packageSource.includes('multi-npc-room-ux-test.mjs'), 'frontend test script should include multi-npc-room-ux-test.mjs')

console.log('multi-npc-room-ux-test: ok')
