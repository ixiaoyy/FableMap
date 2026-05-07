import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../../frontend/app/product/styles.css'
import CharacterManagementModal from '../../../../frontend/app/product/CharacterManagementModal.jsx'

const initialTavern = {
  id: 'npc_batch_harness_tavern',
  name: '批量验收空间',
  owner_id: 'owner-demo',
  characters: [
    {
      id: 'char_existing',
      name: '阿柜',
      description: '已经存在的柜台 NPC。',
      personality: '温和、记性好。',
      scenario: '在柜台后整理旧账本。',
      gender: 'unspecified',
      system_prompt: '保持温和和边界。',
      first_mes: '欢迎回来。',
      mes_example: '',
      tags: ['主役'],
      alternate_greetings: [],
      avatar: '',
      sprites: {},
    },
  ],
}

function App() {
  const [characters, setCharacters] = useState(initialTavern.characters)
  return (
    <div style={{ minHeight: '100vh', padding: 20, background: '#020617' }}>
      <CharacterManagementModal
        tavern={{ ...initialTavern, characters }}
        ownerId="owner-demo"
        onClose={() => {}}
        onCharactersChanged={setCharacters}
      />
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
