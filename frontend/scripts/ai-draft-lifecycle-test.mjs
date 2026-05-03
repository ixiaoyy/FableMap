import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  AI_DRAFT_LIFECYCLE_STEPS,
  buildAiDraftLifecycle,
} from '../app/lib/ai-draft-lifecycle.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

assert.deepEqual(
  AI_DRAFT_LIFECYCLE_STEPS.map((step) => step.id),
  ['draft', 'review', 'published'],
  'AI draft lifecycle should have stable draft/review/published ids',
)
assert.deepEqual(
  AI_DRAFT_LIFECYCLE_STEPS.map((step) => step.label),
  ['AI 草稿', '店主待确认', '已发布内容'],
  'AI draft lifecycle should use owner-confirmed labels',
)

const tavernLifecycle = buildAiDraftLifecycle('tavern')
assert.ok(tavernLifecycle.title.includes('酒馆草稿'), 'tavern draft lifecycle should identify tavern drafts')
assert.ok(tavernLifecycle.summary.includes('可编辑表单'), 'tavern draft copy should say drafts fill editable forms')
assert.ok(tavernLifecycle.summary.includes('创建酒馆'), 'tavern draft copy should gate persistence behind create tavern')
assert.ok(tavernLifecycle.guardrails.some((item) => item.includes('公开 Tavern payload')), 'tavern draft guardrail should mention public payload boundary')

const characterLifecycle = buildAiDraftLifecycle('character')
assert.ok(characterLifecycle.title.includes('NPC 草稿'), 'character draft lifecycle should identify NPC drafts')
assert.ok(characterLifecycle.summary.includes('右侧编辑器'), 'character draft copy should say drafts enter the editor')
assert.ok(characterLifecycle.guardrails.some((item) => item.includes('覆盖已有 NPC')), 'character draft guardrail should mention no overwrite')

const gameplayLifecycle = buildAiDraftLifecycle('gameplay')
assert.ok(gameplayLifecycle.title.includes('玩法草稿'), 'gameplay draft lifecycle should identify gameplay drafts')
assert.ok(gameplayLifecycle.summary.includes('保存/发布后访客才可见'), 'gameplay draft copy should gate visitor visibility behind owner save/publish')
assert.ok(gameplayLifecycle.guardrails.some((item) => item.includes('不含战斗、等级、装备、排行')), 'gameplay draft guardrail should keep no-RPG boundary')

const createRoute = readFileSync(resolve(__dirname, '../app/routes/create.tsx'), 'utf8')
const characterModal = readFileSync(resolve(__dirname, '../app/product/CharacterManagementModal.jsx'), 'utf8')
const gameplayManager = readFileSync(resolve(__dirname, '../app/product/GameplayManager.jsx'), 'utf8')
const packageJson = readFileSync(resolve(__dirname, '../package.json'), 'utf8')

assert.ok(createRoute.includes('buildAiDraftLifecycle("tavern")'), 'create route should render tavern draft lifecycle status')
assert.ok(characterModal.includes("buildAiDraftLifecycle('character')"), 'character modal should render NPC draft lifecycle status')
assert.ok(gameplayManager.includes("buildAiDraftLifecycle('gameplay')"), 'gameplay manager should render reusable gameplay draft lifecycle status')
assert.ok(packageJson.includes('ai-draft-lifecycle-test.mjs'), 'frontend test script should include AI draft lifecycle guard')

console.log('ai-draft-lifecycle-test: ok')
