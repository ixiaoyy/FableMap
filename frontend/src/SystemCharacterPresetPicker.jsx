import { useMemo, useState } from 'react'
import CharacterAvatar from './CharacterAvatar'
import CharacterLookSummary from './CharacterLookSummary'
import {
  SYSTEM_CHARACTER_PRESETS,
  SYSTEM_CHARACTER_PRESET_CATEGORIES,
} from './systemCharacterPresets'

export default function SystemCharacterPresetPicker({
  title = '系统预设角色',
  description = '从系统内置角色原型里挑一个，再按你的酒馆风格继续改。',
  actionLabel = '加入角色',
  disabled = false,
  onPick,
}) {
  const [activeCategory, setActiveCategory] = useState('全部')

  const categories = useMemo(
    () => ['全部', ...SYSTEM_CHARACTER_PRESET_CATEGORIES],
    [],
  )

  const presets = useMemo(() => {
    if (activeCategory === '全部') {
      return SYSTEM_CHARACTER_PRESETS
    }
    return SYSTEM_CHARACTER_PRESETS.filter((preset) => preset.category === activeCategory)
  }, [activeCategory])

  return (
    <section className="system-character-picker">
      <div className="system-character-picker__header">
        <div>
          <p className="mini-label">系统预设角色</p>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
      </div>

      <div className="system-character-picker__filters" aria-label="角色题材筛选">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={activeCategory === category ? 'is-active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {presets.length === 0 ? (
        <div className="system-character-picker__empty">当前分类下还没有可用角色。</div>
      ) : (
        <div className="system-character-picker__grid">
          {presets.map((preset) => (
            <article key={preset.id} className="system-character-card">
              <div className="system-character-card__meta">
                <CharacterAvatar character={preset} size="small" />
                <div>
                  <span>{preset.category}</span>
                  <small>{preset.tags.slice(0, 3).join(' · ')}</small>
                </div>
              </div>
              <div className="system-character-card__title">
                <strong>{preset.name}</strong>
                <em>{preset.summary}</em>
              </div>
              <CharacterLookSummary character={preset} compact />
              <p>{preset.description}</p>
              <div className="system-character-card__tags" aria-label={`${preset.name} 标签`}>
                {preset.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <button
                type="button"
                className="secondary"
                disabled={disabled}
                onClick={() => onPick?.(preset)}
              >
                {actionLabel}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
