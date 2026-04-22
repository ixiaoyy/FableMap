import { createTavernService } from '../app/product/services/tavernService.js'
import { NEWCOMER_TAVERN_ID, resolveNewcomerTavern } from '../app/product/services/newcomerTavern.js'

const service = createTavernService(() => '')

const requiredMethods = [
  // Tavern / owner flows
  'listTaverns',
  'createTavern',
  'getTavern',
  'updateTavern',
  'deleteTavern',
  'getCharacters',
  'addCharacter',
  'updateCharacter',
  'deleteCharacter',
  // Chat flows
  'sendChat',
  'getChatHistory',
  'listChatSessions',
  'exportChatHistory',
  'searchChatHistory',
  // Tavern group chat flows
  'getGroupChatConfig',
  'updateGroupChatConfig',
  'sendGroupChat',
  'getGroupChatHistory',
  'updateTalkativeness',
  // Voice flows used by TavernChatRoom / TavernOwnerPanel
  'getVoiceConfig',
  'saveVoiceConfig',
  'synthesizeVoice',
  'transcribeVoice',
  'listTtsProviders',
  'listTtsVoices',
]

const missing = requiredMethods.filter((name) => typeof service[name] !== 'function')

if (missing.length) {
  console.error(`Tavern service contract missing methods: ${missing.join(', ')}`)
  process.exit(1)
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function testNewcomerPrimaryTavern() {
  let listCalled = false
  const primaryTavern = {
    id: NEWCOMER_TAVERN_ID,
    access: 'public',
    status: 'open',
  }

  const resolved = await resolveNewcomerTavern({
    async getTavern(tavernId, userId) {
      assert(tavernId === NEWCOMER_TAVERN_ID, 'newcomer resolver should request the default tavern first')
      assert(userId === 'visitor_a', 'newcomer resolver should pass through the visitor id')
      return primaryTavern
    },
    async listTaverns() {
      listCalled = true
      return []
    },
  }, 'visitor_a')

  assert(resolved === primaryTavern, 'newcomer resolver should use the public open default tavern')
  assert(!listCalled, 'newcomer resolver should not list fallback taverns when the primary tavern is available')
}

async function testNewcomerFallbackWhenPrimaryClosed() {
  const fallbackTavern = {
    id: 'pw_backup_helpdesk',
    access: 'public',
    status: 'open',
  }

  const resolved = await resolveNewcomerTavern({
    async getTavern() {
      return {
        id: NEWCOMER_TAVERN_ID,
        access: 'public',
        status: 'closed',
      }
    },
    async listTaverns(filters) {
      assert(filters.query === '公益', 'newcomer fallback should search public welfare taverns')
      assert(filters.access === 'public', 'newcomer fallback should only search public taverns')
      assert(filters.status === 'open', 'newcomer fallback should only search open taverns')
      return {
        taverns: [
          { id: 'pw_password_only', access: 'password', status: 'open' },
          fallbackTavern,
        ],
      }
    },
  })

  assert(resolved === fallbackTavern, 'newcomer resolver should fall back when the default tavern is not open')
}

async function testNewcomerFallbackWhenPrimaryMissing() {
  const exactFallback = {
    id: NEWCOMER_TAVERN_ID,
    access: 'public',
    status: 'open',
  }

  const resolved = await resolveNewcomerTavern({
    async getTavern() {
      throw new Error('HTTP 404')
    },
    async listTaverns() {
      return [
        { id: 'pw_backup_helpdesk', access: 'public', status: 'open' },
        exactFallback,
      ]
    },
  })

  assert(resolved === exactFallback, 'newcomer resolver should prefer the default tavern when it appears in fallback results')
}

await testNewcomerPrimaryTavern()
await testNewcomerFallbackWhenPrimaryClosed()
await testNewcomerFallbackWhenPrimaryMissing()

console.log(`Tavern service contract ok (${requiredMethods.length} methods, newcomer fallback ok)`)
