import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  OWNER_TOKEN_REFERENCE_BOUNDARIES,
  buildOwnerTokenStats,
  createOwnerTokenRow,
  formatOwnerTokenUnits,
  getOwnerTokenUsage,
} from '../app/product/ownerTokenStatus.js'

const sampleTaverns = [
  {
    id: 'tavern_low',
    name: '街角小馆',
    status: 'open',
    llm_config: {
      backend: 'openai',
      model: 'gpt-4o-mini',
      api_key: 'owner-api-key-placeholder',
      token_used: 1200,
    },
  },
  {
    id: 'tavern_none',
    name: '未配置空间',
    status: 'closed',
    llm_config: {
      backend: '',
      api_key: 'sk-hidden',
      token_used: -5,
    },
  },
  {
    id: 'tavern_high',
    name: '月台茶室',
    status: 'open',
    llm_config: {
      backend: 'openrouter',
      model: 'anthropic/claude-haiku',
      api_key_configured: true,
      token_used: 12800,
    },
  },
]

assert.equal(getOwnerTokenUsage(sampleTaverns[0]), 1200)
assert.equal(getOwnerTokenUsage(sampleTaverns[1]), 0)
assert.equal(formatOwnerTokenUnits(0), '—')
assert.equal(formatOwnerTokenUnits(1200), '1.2K')
assert.equal(formatOwnerTokenUnits(1250000), '1.25M')

const row = createOwnerTokenRow(sampleTaverns[0])
assert.equal(row.tavernId, 'tavern_low')
assert.equal(row.name, '街角小馆')
assert.equal(row.configured, true)
assert.equal(row.usageLabel, '已有参考记录')
assert.equal(row.llmStatusLabel, 'AI 已配置')
assert(!JSON.stringify(row).includes('sk-secret'), 'safe row must not include API key material')
assert(!Object.hasOwn(row, 'api_key'), 'safe row must not expose api_key')

const stats = buildOwnerTokenStats(sampleTaverns)
assert.equal(stats.total, 14000)
assert.equal(stats.average, 4667)
assert.equal(stats.usedCount, 2)
assert.equal(stats.unusedCount, 1)
assert.equal(stats.configuredCount, 2)
assert.equal(stats.unconfiguredCount, 1)
assert.equal(stats.topTavernName, '月台茶室')
assert.deepEqual(stats.rows.map((item) => item.tavernId), ['tavern_high', 'tavern_low', 'tavern_none'])
assert(!JSON.stringify(stats).includes('sk-secret'), 'safe stats must not include API key material')
assert(!JSON.stringify(stats).includes('sk-hidden'), 'safe stats must not include API key material')

assert(OWNER_TOKEN_REFERENCE_BOUNDARIES.includes('仅供店主参考'))
assert(OWNER_TOKEN_REFERENCE_BOUNDARIES.includes('不展示 API Key'))
assert(OWNER_TOKEN_REFERENCE_BOUNDARIES.includes('不含充值、结算或抽成'))
assert(OWNER_TOKEN_REFERENCE_BOUNDARIES.includes('访客不可见账单'))

const panelSource = readFileSync(new URL('../app/product/TavernOwnerPanel.jsx', import.meta.url), 'utf8')
assert(panelSource.includes('buildOwnerTokenStats'), 'owner panel should use safe token stats helper')
assert(panelSource.includes('openLlmEditByTavernId'), 'owner panel should not pass raw tavern objects through token rows')
assert(panelSource.includes('模型使用参考状态'))
assert(panelSource.includes('不含充值、结算、抽成或访客可见账单'))
assert(panelSource.includes('Token 用量边界'))
assert(panelSource.includes('export function TokenUsagePanel'))
assert(!panelSource.includes('平台账单。') || panelSource.includes('不会生成平台账单'), 'empty state should avoid platform billing promise')

const styleSource = readFileSync(new URL('../app/product/styles.css', import.meta.url), 'utf8')
assert(styleSource.includes('.owner-token-boundaries'))
assert(styleSource.includes('.owner-token-status'))
assert(styleSource.includes('grid-template-columns: repeat(6, minmax(0, 1fr))'))

console.log('owner-token-status-test: ok')
