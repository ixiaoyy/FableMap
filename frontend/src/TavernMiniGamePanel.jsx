import './tavernMiniGames.css'

export default function TavernMiniGamePanel({
  templates = [],
  sending = false,
  disabled = false,
  onStart,
}) {
  if (!Array.isArray(templates) || templates.length === 0) return null

  return (
    <section className="tavern-mini-game-panel" aria-label="AI 主持小游戏">
      <div className="tavern-mini-game-panel__header">
        <div>
          <strong>和 NPC 玩一局</strong>
          <span>选择一个 3-10 分钟的老少皆宜小游戏。</span>
        </div>
        <small>AI 主持 · 点选开局</small>
      </div>
      <div className="tavern-mini-game-grid">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            className="tavern-mini-game-card"
            onClick={() => onStart?.(template)}
            disabled={disabled || sending}
            title={template.summary}
          >
            <span className="tavern-mini-game-card__icon" aria-hidden="true">{template.icon}</span>
            <span className="tavern-mini-game-card__body">
              <strong>{template.title}</strong>
              <small>{template.duration}</small>
              <em>{template.summary}</em>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
