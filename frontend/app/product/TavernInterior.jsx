import { useState, useEffect, useRef } from 'react'
import { getTavernStatusColor, getTavernStatusLabel, getTavernAccessIcon } from './services/tavernService'
import { resolveTavernAtmosphereImage } from './services/atmosphereAssets'
import { enterTavern, sendTavernChat } from '../lib/taverns'
import './tavernGameplay.css'
import CultivationProgressPanel from './CultivationProgressPanel'

/**
 * TavernInterior — 空间内部视图
 *
 * 显示空间内的角色列表和聊天界面。
 * 访客可以选择一个角色开始聊天。
 */

// ─── Layout style background presets ────────────────────────────────────────

const LAYOUT_BACKGROUNDS = {
  lobby: {
    gradient: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.9))',
    accent: '#f59e0b',
    icon: '🍺',
  },
  'quest-play': {
    gradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
    accent: '#22c55e',
    icon: '📜',
  },
  'npc-chat': {
    gradient: 'linear-gradient(135deg, rgba(30, 20, 40, 0.95), rgba(50, 30, 60, 0.9))',
    accent: '#a855f7',
    icon: '💬',
  },
  'hybrid-room': {
    gradient: 'linear-gradient(135deg, rgba(20, 30, 40, 0.95), rgba(40, 60, 80, 0.9))',
    accent: '#06b6d4',
    icon: '🏠',
  },
}

function getLayoutStyle(tavern) {
  const style = tavern?.layout_style || 'lobby'
  return LAYOUT_BACKGROUNDS[style] || LAYOUT_BACKGROUNDS.lobby
}

function entranceReactionContent(character, tavernName) {
  const firstMessage = String(character?.first_mes || '').trim()
  if (firstMessage) return firstMessage
  const name = character?.name || '这里的 NPC'
  return `你刚走进${tavernName || '这间空间'}，${name}向你点了点头。`
}

function entranceReactionMessages(characters, tavernName) {
  const timestamp = Date.now()
  return (Array.isArray(characters) ? characters : []).map((character, index) => ({
    id: `entrance-${character?.id || index}-${timestamp}`,
    role: 'assistant',
    content: entranceReactionContent(character, tavernName),
    timestamp,
    character,
  }))
}

// ─── Simple Character Avatar ─────────────────────────────────────────────────

function CharAvatar({ character, size = 40, className = '' }) {
  const avatar = character?.avatar || character?.sprites?.neutral || null
  const name = character?.name || '?'

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        className={className}
      />
    )
  }

  // Fallback to name initial
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #475569, #64748b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f8fafc',
        fontWeight: 600,
        fontSize: size * 0.4,
      }}
      className={className}
      title={name}
    >
      {name[0] || '?'}
    </div>
  )
}
export default function TavernInterior({
  tavern,
  visitorId,
  onExit,
}) {
  const [selectedChar, setSelectedChar] = useState(null)
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [password, setPassword] = useState('')
  const [entering, setEntering] = useState(false)
  const [entered, setEntered] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [showProgress, setShowProgress] = useState(false)
  const [progression, setProgression] = useState(null)
  const messagesEndRef = useRef(null)

  const characters = tavern?.characters || []
  const characterSignature = characters.map((character) => [
    character?.id || '',
    character?.name || '',
    character?.first_mes || '',
  ].join(':')).join('|')
  const layoutStyle = getLayoutStyle(tavern)
  const atmosphereImage = resolveTavernAtmosphereImage(tavern)

  // Auto-select first character
  useEffect(() => {
    if (characters.length > 0 && !selectedChar) {
      setSelectedChar(characters[0])
    }
  }, [characters])

  // Enter tavern on mount
  useEffect(() => {
    if (!entered && !passwordRequired && tavern) {
      handleEnter()
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Show fresh local entrance reactions for this visit only; backend history/memory stays persisted.
  useEffect(() => {
    if (!entered) {
      setMessages([])
      return
    }
    setMessages(entranceReactionMessages(characters, tavern?.name))
  }, [entered, tavern?.id, tavern?.name, characterSignature])

  async function handleEnter(pwd = '') {
    setEntering(true)
    try {
      const result = await enterTavern(tavern.id, pwd, visitorId)
      setEntered(true)
      setPasswordRequired(false)
      if (result.cultivation_receipt) {
        setReceipt(result.cultivation_receipt)
      }
    } catch (err) {
      if (err.message.includes('密码')) {
        setPasswordRequired(true)
      } else {
        console.error('Enter tavern error:', err)
      }
    } finally {
      setEntering(false)
    }
  }

  async function handleSend(content) {
    if (!content.trim() || sending) return

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setSending(true)

    try {
      const result = await sendTavernChat(tavern.id, {
        character_id: selectedChar.id,
        message: content.trim(),
        visitor_id: visitorId,
      })
      const charMsg = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: result.response || '',
        timestamp: Date.now(),
        character: selectedChar,
      }
      if (charMsg.content.trim()) {
        setMessages((prev) => [...prev, charMsg])
      }
      if (result.progression) {
        setProgression(result.progression)
      }
    } catch (err) {
      const charMsg = {
        id: `msg-${Date.now() + 1}`,
        role: 'system',
        content: err.message || 'AI 暂时没有回应，请稍后重试。',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, charMsg])
    } finally {
      setSending(false)
    }
  }

  // Password gate
  if (passwordRequired) {
    return (
      <div className="tavern-interior tavern-password-gate">
        <div className="tavern-password-form">
          <h3>{getTavernAccessIcon('password')} 需要密码</h3>
          <p>此空间需要密码才能进入</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入密码"
            onKeyDown={(e) => e.key === 'Enter' && handleEnter(password)}
          />
          <button onClick={() => handleEnter(password)} disabled={entering}>
            {entering ? '验证中...' : '进入'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="tavern-interior"
      style={{
        backgroundColor: '#0f172a',
        '--tavern-atmosphere-image': `url("${atmosphereImage}")`,
        '--tavern-atmosphere-fallback': layoutStyle.gradient,
      }}
      data-layout-style={tavern?.layout_style || 'lobby'}
      data-atmosphere-image={atmosphereImage}
    >
      {/* Cultivation Receipt Overlay */}
      {receipt && (
        <div className="cultivation-receipt-overlay">
          <div className="cultivation-receipt-card">
            <h3>{receipt.title}</h3>
            <div className="cultivation-receipt-content">
              {receipt.summary}
            </div>
            <div className="cultivation-receipt-stats">
              <div className="cultivation-stat-item">
                <span className="cultivation-stat-label">离线时长</span>
                <span className="cultivation-stat-value">{receipt.hours} 小时</span>
              </div>
              <div className="cultivation-stat-item">
                <span className="cultivation-stat-label">修为增长</span>
                <span className="cultivation-stat-value">+{receipt.progress_delta}</span>
              </div>
            </div>
            <div className="cultivation-receipt-footer">
              <button className="btn-cultivation-confirm" onClick={() => setReceipt(null)}>
                悟道完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scene atmosphere banner */}
      {tavern?.scene_prompt && (
        <div className="tavern-scene-atmosphere">
          <span className="atmosphere-icon">{layoutStyle.icon}</span>
          <span className="atmosphere-text">{tavern.scene_prompt.slice(0, 80)}</span>
        </div>
      )}

      {/* Header */}
      <div className="tavern-interior-header" style={{ borderBottomColor: layoutStyle.accent }}>
        <div className="tavern-info">
          <h3>{tavern?.name}</h3>
          {progression && (
            <button className="btn-show-progress" onClick={() => setShowProgress(true)}>
              修为: {progression.current_stage} ({progression.percent}%)
            </button>
          )}
          <div className="tavern-meta">
            <span
              className="status-badge"
              style={{ color: getTavernStatusColor(tavern?.status) }}
            >
              {getTavernAccessIcon(tavern?.access)} {getTavernStatusLabel(tavern?.status)}
            </span>
            {characters.length > 0 && (
              <span className="char-count">{characters.length} 个角色</span>
            )}
          </div>
        </div>
        <button className="btn-exit" onClick={onExit}>
          返回地图
        </button>
      </div>

      <div className="tavern-interior-body">
        {/* Character list */}
        {characters.length > 0 && (
          <div className="tavern-char-list">
            <h4>空间角色</h4>
            {characters.map((char) => (
              <button
                key={char.id}
                className={`char-item ${selectedChar?.id === char.id ? 'active' : ''}`}
                onClick={() => setSelectedChar(char)}
              >
                <CharAvatar character={char} size={36} />
                <span className="char-name">{char.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Chat area */}
        <div className="tavern-chat-area">
          {selectedChar ? (
            <>
              <div className="chat-header">
                <div className="chat-char-info">
                  <CharAvatar character={selectedChar} size={32} />
                  <span className="chat-char-name">{selectedChar.name}</span>
                </div>
                {selectedChar.description && (
                  <span className="chat-char-desc muted">{selectedChar.description}</span>
                )}
              </div>

              <div className="chat-messages" data-entrance-reactions>
                {messages.length === 0 && (
                  <div className="chat-placeholder">
                    <p>和 {selectedChar.name} 开始对话吧。</p>
                    {selectedChar.first_mes && (
                      <p className="first-mes-hint">
                        开场白：{selectedChar.first_mes.slice(0, 50)}...
                      </p>
                    )}
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.role === 'assistant' ? 'char-msg' : 'user-msg'}`}
                  >
                    <div className="message-avatar">
                      {msg.role === 'assistant' ? (
                        <CharAvatar character={msg.character || selectedChar} size={32} />
                      ) : (
                        <div className="user-avatar-icon">👤</div>
                      )}
                    </div>
                    <div className="message-content">
                      {msg.role === 'assistant' && (msg.character?.name || selectedChar?.name) && (
                        <div className="message-sender">{msg.character?.name || selectedChar?.name}</div>
                      )}
                      <div className="message-text">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area">
                <textarea
                  placeholder={`对 ${selectedChar.name} 说...`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  disabled={sending}
                  rows={2}
                />
                <button
                  className="btn-send"
                  onClick={(e) => {
                    const textarea = e.target.closest('.chat-input-area').querySelector('textarea')
                    handleSend(textarea.value)
                    textarea.value = ''
                  }}
                  disabled={sending}
                >
                  {sending ? '...' : '发送'}
                </button>
              </div>
            </>
          ) : (
            <div className="tavern-empty">
              <p>这个空间还没有角色。</p>
              <p className="muted">让空间主人添加一些角色吧。</p>
            </div>
          )}
        </div>
      </div>

      {/* Cultivation Progress Panel */}
      {showProgress && (
        <CultivationProgressPanel 
          progression={progression} 
          onClose={() => setShowProgress(false)} 
        />
      )}
    </div>
  )
}
