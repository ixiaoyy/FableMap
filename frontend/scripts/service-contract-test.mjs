import { createTavernService } from '../src/services/tavernService.js'

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

console.log(`Tavern service contract ok (${requiredMethods.length} methods)`)
