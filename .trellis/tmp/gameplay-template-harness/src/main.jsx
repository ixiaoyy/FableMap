import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../../frontend/app/product/styles.css'
import '../../../../frontend/app/product/tavernGameplay.css'
import GameplayManager from '../../../../frontend/app/product/GameplayManager.jsx'

const initialTavern = {
  id: 'gameplay_template_harness_tavern',
  name: '模板验收酒馆',
  owner_id: 'owner-demo',
  gameplay_definitions: [],
}

function App() {
  const [tavern, setTavern] = useState(initialTavern)
  return (
    <div style={{ minHeight: '100vh', padding: 20, background: '#020617' }}>
      <GameplayManager
        tavern={tavern}
        ownerId="owner-demo"
        onClose={() => {}}
        onUpdated={setTavern}
      />
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
