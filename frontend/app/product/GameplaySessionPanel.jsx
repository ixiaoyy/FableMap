import { useState } from 'react'
import './tavernGameplay.css'

function latestNarration(session, scene) {
  if (scene?.narration) return scene.narration
  const lastEvent = Array.isArray(session?.events) ? session.events[session.events.length - 1] : null
  return lastEvent?.narration || '玩法正在进行。选择一个动作，或输入一句话交给 AI Director 主持。'
}

export default function GameplaySessionPanel({ session, scene = {}, gameplay = null, busy = false, onChoice, onSubmit, onAbandon }) {
  const [message, setMessage] = useState('')
  if (!session) return null

  const choices = Array.isArray(scene?.choices) ? scene.choices : []
  const completion = session?.completion
  const completed = session.state === 'completed'
  const goal = gameplay?.owner_brief?.goal || ''

  function handleSubmit(event) {
    event.preventDefault()
    const text = message.trim()
    if (!text || busy || completed) return
    setMessage('')
    onSubmit?.(text)
  }

  return (
    <section className={`gameplay-session-panel ${completed ? 'is-complete' : ''}`} aria-label="玩法会话">
      <div className="gameplay-session-panel__header">
        <div>
          <span className="mini-label">玩法进行中</span>
          <strong>{completed ? '已完成' : `第 ${Number(session.turn_count || 0) + 1} 步`}</strong>
        </div>
        <button type="button" className="button-link" onClick={onAbandon} disabled={busy}>
          放弃本局
        </button>
      </div>

      {goal ? (
        <div className="gameplay-session-panel__objective">
          <span className="mini-label">本局目标</span>
          <p>{goal}</p>
        </div>
      ) : null}

      <p className="gameplay-session-panel__narration">{latestNarration(session, scene)}</p>

      {completion ? (
        <div className="gameplay-session-panel__completion">
          <strong>completion</strong>
          <p>{completion.summary || '本局玩法完成。'}</p>
          {completion.reward_text ? <small>{completion.reward_text}</small> : null}
        </div>
      ) : null}

      {!completed && choices.length > 0 ? (
        <div className="gameplay-session-panel__choices">
          {choices.map((choice) => (
            <button key={choice.id} type="button" className="gameplay-session-panel__choice secondary" onClick={() => onChoice?.(choice)} disabled={busy}>
              {choice.label || choice.id}
            </button>
          ))}
        </div>
      ) : null}

      {!completed ? (
        <form className="gameplay-session-panel__input" onSubmit={handleSubmit}>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="也可以补充一句话，让主持人接住这一幕"
            disabled={busy}
          />
          <button type="submit" className="primary" disabled={busy || !message.trim()}>
            {busy ? '推进中...' : '提交'}
          </button>
        </form>
      ) : null}
    </section>
  )
}
