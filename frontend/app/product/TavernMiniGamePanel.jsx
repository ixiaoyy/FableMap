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
          <span className="tavern-mini-game-panel__eyebrow">桌边小玩法</span>
          <strong>抽一张玩法卡</strong>
          <span>挑一个名字，今晚的故事就从这里拐弯。</span>
        </div>
        <small>短局 · 随时停</small>
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
            <span className="tavern-mini-game-card__action">抽卡</span>
          </button>
        ))}
      </div>
    </section>
  )
}
