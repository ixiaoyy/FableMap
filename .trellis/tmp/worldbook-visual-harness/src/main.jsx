import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import WorldBookEditor from '../../../../frontend/app/product/WorldBookEditor.jsx'
import '../../../../frontend/app/product/styles.css'

const initialTavern = {
  id: 'worldbook_harness_tavern',
  name: '世界书验收空间',
  owner_id: 'owner-demo',
  world_info: [
    {
      id: 'wi_photo_wall',
      keys: ['毕业照', '旧校舍'],
      keys_secondary: ['刘大爷'],
      content: '照片墙记录着旧校舍、毕业照和钥匙传闻；当访客提到这些词时，NPC 可以补充背景。',
      selective: true,
      constant: false,
      depth: 4,
      order: 100,
      probability: 100,
      disable: false,
    },
    {
      id: 'wi_tavern_rules',
      keys: [],
      keys_secondary: [],
      content: '这间空间永远尊重店主确认的内容，不自动发布平台生成设定。',
      selective: false,
      constant: true,
      depth: 2,
      order: 10,
      probability: 100,
      disable: false,
    },
  ],
}

function Harness() {
  const [tavern, setTavern] = useState(initialTavern)
  const [closed, setClosed] = useState(false)
  return (
    <main className="product-app-shell" style={{ minHeight: '100vh', padding: 24 }}>
      {closed ? (
        <button type="button" className="primary" onClick={() => setClosed(false)}>重新打开世界书</button>
      ) : (
        <WorldBookEditor
          tavern={tavern}
          ownerId="owner-demo"
          onClose={() => setClosed(true)}
          onWorldInfoChanged={(next) => setTavern(next)}
        />
      )}
    </main>
  )
}

createRoot(document.getElementById('root')).render(<Harness />)
