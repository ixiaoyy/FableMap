import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../../frontend/app/styles.css'
import { NotificationCenterPanel } from '../../../../frontend/app/components/NotificationCenterPanel.tsx'

const initialNotifications = [
  {
    id: 'n_owner_unread',
    user_id: 'owner-demo',
    notification_type: 'new_guest_message',
    title: '新回访反馈',
    content: '访客留下了 owner-visible 反馈，请店主在自己的酒馆后台查看。',
    created_at: '2026-04-30T08:00:00Z',
    read: false,
    tavern_id: 'tavern_a',
    tavern_name: '月台茶室',
    data: {},
  },
  {
    id: 'n_visitor_read',
    user_id: 'visitor-demo',
    notification_type: 'quest_completed',
    title: '探索完成',
    content: '你完成了一段轻量探索；这不是公开动态。',
    created_at: '2026-04-30T07:00:00Z',
    read: true,
    tavern_id: 'tavern_b',
    tavern_name: '街角小馆',
    data: {},
  },
  {
    id: 'n_owner_read',
    user_id: 'owner-demo',
    notification_type: 'new_visitor',
    title: '新访客进入',
    content: '有人进入你的酒馆。',
    created_at: '2026-04-30T06:00:00Z',
    read: true,
    tavern_id: 'tavern_a',
    tavern_name: '月台茶室',
    data: {},
  },
]

function App() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter((item) => !item.read).length
  return (
    <main style={{ minHeight: '100vh', padding: 20 }}>
      <NotificationCenterPanel
        userId="owner-demo"
        notifications={notifications}
        unreadCount={unreadCount}
        connected={true}
        loading={false}
        onMarkAsRead={(notificationId) => setNotifications((prev) => prev.map((item) => item.id === notificationId ? { ...item, read: true } : item))}
        onMarkAllAsRead={() => setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))}
      />
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
