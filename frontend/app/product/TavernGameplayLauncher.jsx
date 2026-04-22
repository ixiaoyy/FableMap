import './tavernGameplay.css'

const ACTIVE_STATES = new Set(['started', 'in_progress'])

function gameplayTitleFor(session, gameplays) {
  const gameplay = gameplays.find((item) => item.id === session.gameplay_id)
  return gameplay?.title || session.gameplay_title || session.gameplay_id || '未命名玩法'
}

export default function TavernGameplayLauncher({ gameplays = [], activeSessions = [], busy = false, onStart, onResume }) {
  const publishedGameplays = gameplays.filter((gameplay) => gameplay?.status === 'published')
  const resumableSessions = activeSessions.filter((session) => ACTIVE_STATES.has(session?.state))

  if (publishedGameplays.length === 0 && resumableSessions.length === 0) return null

  return (
    <section className="tavern-gameplay-launcher" aria-label="酒馆玩法入口">
      <div className="tavern-gameplay-launcher__header">
        <div>
          <span className="mini-label">酒馆玩法</span>
          <strong>可玩的内容</strong>
        </div>
        {busy ? <small>处理中...</small> : null}
      </div>

      {resumableSessions.length > 0 ? (
        <div className="tavern-gameplay-launcher__sessions">
          {resumableSessions.map((session) => (
            <button key={session.id} type="button" className="gameplay-chip active" onClick={() => onResume?.(session)} disabled={busy}>
              继续 · {gameplayTitleFor(session, gameplays)}
            </button>
          ))}
        </div>
      ) : null}

      {publishedGameplays.length > 0 ? (
        <div className="tavern-gameplay-launcher__grid">
          {publishedGameplays.map((gameplay) => (
            <article key={gameplay.id} className="gameplay-launch-card">
              <div>
                <strong>{gameplay.title}</strong>
                <p>{gameplay.summary || '进入一局由酒馆主持的轻量玩法。'}</p>
              </div>
              <button type="button" className="secondary" onClick={() => onStart?.(gameplay)} disabled={busy}>
                {gameplay.entry_label || '开始玩法'}
              </button>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
