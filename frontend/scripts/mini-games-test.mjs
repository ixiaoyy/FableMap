import assert from 'node:assert/strict'

import {
  MINI_GAME_TEMPLATES,
  RPS_MOVES,
  buildMiniGameStartPrompt,
  createRpsDuelState,
  decideRpsWinner,
  getMiniGameTemplates,
  isNpcRpsDuelTemplate,
  normalizeRpsMove,
  pickNpcRpsMove,
  playRpsRound,
} from '../app/product/tavernMiniGames.js'

const ids = MINI_GAME_TEMPLATES.map((template) => template.id)
assert.equal(new Set(ids).size, ids.length)
assert.ok(MINI_GAME_TEMPLATES.every((template) => template.id && template.title && template.duration && template.tags.includes('family-friendly')))
assert.deepEqual(ids, ['npc-rps-duel', 'clue-trail', 'riddle-quiz', 'story-relay', 'card-reading', 'twenty-questions', 'tiny-quest', 'signal-decoder', 'spectral-scanner', 'constellation-map'])

assert.ok(isNpcRpsDuelTemplate(MINI_GAME_TEMPLATES.find((template) => template.id === 'npc-rps-duel')))
assert.deepEqual(RPS_MOVES.map((move) => move.id), ['rock', 'scissors', 'paper'])
assert.deepEqual([['rock', 'scissors'], ['scissors', 'paper'], ['paper', 'rock']].map(([player, npc]) => decideRpsWinner(player, npc).outcome), ['player_win', 'player_win', 'player_win'])
assert.deepEqual([normalizeRpsMove('rock'), normalizeRpsMove('bad-move'), decideRpsWinner('rock', 'rock').outcome, decideRpsWinner('unknown', 'rock').outcome], ['rock', '', 'draw', 'invalid'])

const npcMoveA = pickNpcRpsMove({ characterName: '刘大爷', tavernName: '第三中学传达室', round: 1 })
const npcMoveB = pickNpcRpsMove({ characterName: '刘大爷', tavernName: '第三中学传达室', round: 1 })
assert.equal(npcMoveA.id, npcMoveB.id)

const firstRound = playRpsRound(createRpsDuelState(), 'rock', { characterName: '刘大爷', tavernName: '第三中学传达室' })
assert.ok(firstRound.round === 1 && firstRound.playerScore + firstRound.npcScore + firstRound.drawCount === 1 && firstRound.lastRound?.npcLine.includes('刘大爷'))

assert.deepEqual(getMiniGameTemplates({ playModeId: 'clue_game' }).map((template) => template.id).slice(0, 2), ['signal-decoder', 'clue-trail'])
assert.equal(getMiniGameTemplates({ playModeId: 'guild' })[0].id, 'tiny-quest')
assert.deepEqual(getMiniGameTemplates({ playModeId: 'chat' }).map((template) => template.id), ids)
assert.equal(buildMiniGameStartPrompt(null), '')

console.log('mini-games-test: ok')
