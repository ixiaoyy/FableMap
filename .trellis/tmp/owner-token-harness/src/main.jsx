import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../../frontend/app/product/styles.css'
import { TokenUsagePanel } from '../../../../frontend/app/product/TavernOwnerPanel.jsx'
import { buildOwnerTokenStats } from '../../../../frontend/app/product/ownerTokenStatus.js'

const taverns = [
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
      api_key: 'sk-hidden',
      token_used: 0,
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

function App() {
  const [selected, setSelected] = useState('尚未打开 AI 配置')
  const tokenStats = buildOwnerTokenStats(taverns)
  return (
    <div style={{ minHeight: '100vh', padding: 20, background: '#020617' }}>
      <TokenUsagePanel tokenStats={tokenStats} onManageLlm={(tavernId) => setSelected(`打开 AI 配置：${tavernId}`)} />
      <p className="note muted" data-testid="selected-token-tavern">{selected}</p>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
