import React from 'react'
import { createRoot } from 'react-dom/client'
import '../../../../frontend/app/styles.css'
import { TavernActivitySignalsCard } from '../../../../frontend/app/components/TavernActivitySignalsCard.tsx'

const tavern = {
  id: 'tavern_activity',
  name: '月台茶室',
  lat: 31.2304,
  lon: 121.4737,
  access: 'public',
  status: 'open',
  visit_count: 24,
  characters: [{ id: 'npc_1', name: '守夜人' }, { id: 'npc_2', name: '调茶师' }],
  gameplay_definitions: [{ id: 'gp_1' }],
  skill_packs: [{ id: 'local-rumor', enabled: true, config: { limit: 3 } }],
}

function App() {
  return (
    <main style={{ minHeight: '100vh', padding: 20 }}>
      <TavernActivitySignalsCard tavern={tavern} />
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
