import assert from 'node:assert/strict'

import { getWizardReadiness } from '../src/tavernCreateReadiness.js'

const incomplete = getWizardReadiness({
  lat: '200',
  lon: 'abc',
  name: '',
  description: '',
  scene_prompt: '',
  characters: [],
}, false)
assert.equal(incomplete.total, 7)
assert.equal(incomplete.checks.find((item) => item.id === 'coordinate').done, false)
assert.equal(incomplete.checks.find((item) => item.id === 'name').done, false)
assert.deepEqual(incomplete.missingRequired.map((item) => item.id), ['coordinate', 'name'])

const readyWithoutAi = getWizardReadiness({
  lat: '31.2304',
  lon: '121.4737',
  name: '街角冒险者公会',
  description: '任务板和委托。',
  scene_prompt: '老少皆宜的轻冒险。',
  characters: [{ name: '洛塔', first_mes: '欢迎来到任务板。' }],
}, false)
assert.equal(readyWithoutAi.missingRequired.length, 0)
assert.equal(readyWithoutAi.checks.find((item) => item.id === 'ai').optional, true)
assert.equal(readyWithoutAi.checks.find((item) => item.id === 'ai').done, false)
assert.ok(readyWithoutAi.percent < 100)

const fullyReady = getWizardReadiness({
  lat: 31.2304,
  lon: 121.4737,
  name: '雨夜失物调查局',
  description: '十分钟轻推理。',
  scene_prompt: '每轮给 2-3 个选项。',
  characters: [{ name: '闻笺', firstMes: '先看钥匙还是便签？' }],
}, true)
assert.equal(fullyReady.doneCount, fullyReady.total)
assert.equal(fullyReady.percent, 100)

const resilient = getWizardReadiness({}, false)
assert.equal(resilient.checks.find((item) => item.id === 'character').done, false)
assert.equal(resilient.missingRequired.length, 2)

console.log('tavern-create-readiness-test: ok')
