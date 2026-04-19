import { useEffect, useMemo, useState } from 'react'
import CharacterLookSummary from './CharacterLookSummary'
import {
  CHARACTER_LOOK_PRESETS,
  normalizeCharacterAppearance,
  removeCharacterLookFromWardrobe,
  withActiveCharacterLook,
} from './characterLooks'

const SPRITE_FIELDS = [
  ['neutral', '中性'],
  ['joy', '喜悦'],
  ['anger', '愤怒'],
  ['annoyance', '烦躁'],
  ['sadness', '悲伤'],
  ['surprise', '惊讶'],
  ['fear', '恐惧'],
  ['disgust', '厌恶'],
  ['confusion', '困惑'],
  ['curiosity', '好奇'],
  ['admiration', '赞赏'],
  ['amusement', '愉快'],
  ['approval', '认可'],
  ['caring', '关心'],
  ['desire', '渴望'],
  ['disappointment', '失望'],
  ['disapproval', '反对'],
  ['embarrassment', '尴尬'],
  ['excitement', '兴奋'],
  ['gratitude', '感谢'],
  ['grief', '悲痛'],
  ['love', '喜爱'],
  ['nervousness', '紧张'],
  ['optimism', '乐观'],
  ['pride', '骄傲'],
  ['realization', '恍然'],
  ['relief', '释然'],
  ['remorse', '懊悔'],
]

function toText(value) {
  return typeof value === 'string' ? value : ''
}

function listToLines(value) {
  return Array.isArray(value) ? value.filter(Boolean).join('\n') : toText(value)
}

function listToTags(value) {
  return Array.isArray(value) ? value.filter(Boolean).join(', ') : toText(value)
}

function cleanSpriteMap(sprites) {
  if (!sprites || typeof sprites !== 'object') return {}
  return Object.fromEntries(
    Object.entries(sprites)
      .map(([key, value]) => [String(key).trim(), String(value || '').trim()])
      .filter(([key, value]) => key && value),
  )
}

function splitLines(value) {
  return toText(value)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function splitTags(value) {
  return toText(value)
    .split(/[,，\r\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeTalkativeness(value) {
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return 0.5
  return Math.max(0, Math.min(1, parsed))
}

function normalizeCharacterDraft(character = {}) {
  const sprites = cleanSpriteMap(character.sprites)
  return {
    id: character.id || '',
    tavern_id: character.tavern_id || '',
    name: toText(character.name),
    description: toText(character.description),
    personality: toText(character.personality),
    scenario: toText(character.scenario),
    system_prompt: toText(character.system_prompt),
    first_mes: toText(character.first_mes),
    mes_example: toText(character.mes_example),
    alternate_greetings_text: listToLines(character.alternate_greetings),
    tags_text: listToTags(character.tags),
    avatar: toText(character.avatar),
    appearance: normalizeCharacterAppearance(character),
    talkativeness: normalizeTalkativeness(character.talkativeness),
    sprites,
  }
}

export function createEmptyCharacterDraft() {
  return normalizeCharacterDraft({
    name: '',
    description: '',
    personality: '',
    scenario: '',
    system_prompt: '',
    first_mes: '',
    mes_example: '',
    alternate_greetings: [],
    tags: [],
    avatar: '',
    sprites: {},
  })
}

export function normalizeCharacterPayload(draft) {
  const payload = {
    name: draft.name.trim(),
    description: draft.description.trim(),
    personality: draft.personality.trim(),
    scenario: draft.scenario.trim(),
    system_prompt: draft.system_prompt.trim(),
    first_mes: draft.first_mes.trim(),
    mes_example: draft.mes_example.trim(),
    alternate_greetings: splitLines(draft.alternate_greetings_text),
    tags: splitTags(draft.tags_text),
    avatar: draft.avatar.trim(),
    appearance: normalizeCharacterAppearance(draft),
    talkativeness: normalizeTalkativeness(draft.talkativeness),
    sprites: cleanSpriteMap(draft.sprites),
  }

  if (draft.id) payload.id = draft.id
  if (draft.tavern_id) payload.tavern_id = draft.tavern_id
  return payload
}

export default function CharacterEditor({
  value,
  onSave,
  onCancel,
  title = '角色卡编辑',
  submitLabel = '保存角色',
  cancelLabel = '取消',
  disabled = false,
}) {
  const [draft, setDraft] = useState(() => normalizeCharacterDraft(value))
  const [error, setError] = useState('')

  useEffect(() => {
    setDraft(normalizeCharacterDraft(value))
    setError('')
  }, [value])

  const configuredSpriteCount = useMemo(() => Object.keys(cleanSpriteMap(draft.sprites)).length, [draft.sprites])

  function updateField(key, nextValue) {
    setDraft((prev) => ({ ...prev, [key]: nextValue }))
  }

  function updateSprite(expression, nextValue) {
    setDraft((prev) => ({
      ...prev,
      sprites: {
        ...prev.sprites,
        [expression]: nextValue,
      },
    }))
  }

  function updateAppearance(nextAppearance) {
    setDraft((prev) => ({
      ...prev,
      appearance: normalizeCharacterAppearance(nextAppearance),
    }))
  }

  function updateActiveLook(presetId) {
    setDraft((prev) => {
      const appearance = normalizeCharacterAppearance(prev)
      if (!presetId) {
        return {
          ...prev,
          appearance: {
            active_preset_id: '',
            wardrobe_ids: [],
            note: appearance.note,
          },
        }
      }
      return {
        ...prev,
        appearance: withActiveCharacterLook(prev, presetId),
      }
    })
  }

  function toggleWardrobeLook(presetId) {
    setDraft((prev) => {
      const appearance = normalizeCharacterAppearance(prev)
      const hasPreset = appearance.wardrobe_ids.includes(presetId)
      if (hasPreset) {
        return {
          ...prev,
          appearance: removeCharacterLookFromWardrobe(prev, presetId),
        }
      }
      const wardrobeIds = [...appearance.wardrobe_ids, presetId].slice(0, 6)
      const activePresetId = appearance.active_preset_id || presetId
      return {
        ...prev,
        appearance: normalizeCharacterAppearance({
          ...appearance,
          active_preset_id: activePresetId,
          wardrobe_ids: wardrobeIds,
        }),
      }
    })
  }

  function updateAppearanceNote(note) {
    const appearance = normalizeCharacterAppearance(draft)
    updateAppearance({ ...appearance, note })
  }

  function handleSave() {
    const payload = normalizeCharacterPayload(draft)
    if (!payload.name) {
      setError('请填写角色名称')
      return
    }
    setError('')
    onSave(payload)
  }

  const appearance = normalizeCharacterAppearance(draft)

  return (
    <div className="character-editor">
      {title ? <h4>{title}</h4> : null}

      <div className="character-editor-grid">
        <label>
          <span>角色名称 *</span>
          <input
            value={draft.name}
            onChange={(event) => updateField('name', event.target.value)}
            disabled={disabled}
            placeholder="例如：刘大爷"
          />
        </label>
        <label>
          <span>标签</span>
          <input
            value={draft.tags_text}
            onChange={(event) => updateField('tags_text', event.target.value)}
            disabled={disabled}
            placeholder="守门人, 老友, 神秘"
          />
        </label>
      </div>

      <label className="character-editor-full character-editor-range-field">
        <span>群聊发言积极度</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={draft.talkativeness}
          onChange={(event) => updateField('talkativeness', Number.parseFloat(event.target.value))}
          disabled={disabled}
        />
        <small>{Math.round(normalizeTalkativeness(draft.talkativeness) * 100)}% · 数值越高，群聊里越容易主动接话。</small>
      </label>

      <label className="character-editor-full">
        <span>角色描述</span>
        <textarea
          value={draft.description}
          onChange={(event) => updateField('description', event.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="外貌、身份、和访客第一眼会注意到的事"
        />
      </label>

      <div className="character-editor-grid">
        <label>
          <span>性格设定</span>
          <textarea
            value={draft.personality}
            onChange={(event) => updateField('personality', event.target.value)}
            disabled={disabled}
            rows={4}
            placeholder="说话方式、习惯、边界感"
          />
        </label>
        <label>
          <span>角色场景</span>
          <textarea
            value={draft.scenario}
            onChange={(event) => updateField('scenario', event.target.value)}
            disabled={disabled}
            rows={4}
            placeholder="角色所处的位置、当前状态和隐含目标"
          />
        </label>
      </div>

      <label className="character-editor-full">
        <span>角色指令（高级）</span>
        <textarea
          value={draft.system_prompt}
          onChange={(event) => updateField('system_prompt', event.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="约束角色扮演、回复边界和语气；新手可先留空"
        />
      </label>

      <div className="character-editor-grid">
        <label>
          <span>开场白</span>
          <textarea
            value={draft.first_mes}
            onChange={(event) => updateField('first_mes', event.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="角色第一次对访客说的话"
          />
        </label>
        <label>
          <span>示例对话</span>
          <textarea
            value={draft.mes_example}
            onChange={(event) => updateField('mes_example', event.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="<START>\n{{user}}: ...\n{{char}}: ..."
          />
        </label>
      </div>

      <label className="character-editor-full">
        <span>备用开场白</span>
        <textarea
          value={draft.alternate_greetings_text}
          onChange={(event) => updateField('alternate_greetings_text', event.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="每行一条"
        />
      </label>

      <label className="character-editor-full">
        <span>默认头像 URL</span>
        <input
          value={draft.avatar}
          onChange={(event) => updateField('avatar', event.target.value)}
          disabled={disabled}
          placeholder="https://example.com/avatar.png"
        />
      </label>

      <section className="character-editor-appearance">
        <div className="character-editor-section-heading">
          <span>外观预设</span>
          <small>选择角色在聊天头像和列表里的默认形象，可保留最多 6 套衣橱方案。</small>
        </div>

        <div className="character-editor-grid">
          <label>
            <span>当前形象</span>
            <select
              value={appearance.active_preset_id}
              onChange={(event) => updateActiveLook(event.target.value)}
              disabled={disabled}
            >
              <option value="">默认形象</option>
              {CHARACTER_LOOK_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.category} / {preset.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>外观备注</span>
            <input
              value={appearance.note}
              onChange={(event) => updateAppearanceNote(event.target.value)}
              disabled={disabled}
              maxLength={200}
              placeholder="例如：夜班版、校庆版、雨天版"
            />
          </label>
        </div>

        <CharacterLookSummary
          character={{ ...draft, appearance }}
          showDefault
          showSummary
          className="character-editor-look-summary"
        />

        <div className="character-look-options" aria-label="角色衣橱">
          {CHARACTER_LOOK_PRESETS.map((preset) => {
            const selected = appearance.wardrobe_ids.includes(preset.id)
            const active = appearance.active_preset_id === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                className={[
                  'character-look-option',
                  selected ? 'is-selected' : '',
                  active ? 'is-active' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => toggleWardrobeLook(preset.id)}
                disabled={disabled}
                title={preset.summary}
              >
                <span className="character-look-option__badge">{preset.badge || preset.name[0]}</span>
                <span>
                  <strong>{preset.name}</strong>
                  <small>{preset.category}</small>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <details className="character-editor-sprites">
        <summary>表情立绘 ({configuredSpriteCount} 已配置)</summary>
        <div className="character-sprite-grid">
          {SPRITE_FIELDS.map(([expression, label]) => (
            <label key={expression}>
              <span>{label}</span>
              <input
                value={draft.sprites?.[expression] || ''}
                onChange={(event) => updateSprite(expression, event.target.value)}
                disabled={disabled}
                placeholder={`${expression}.png`}
              />
            </label>
          ))}
        </div>
      </details>

      {error ? <div className="character-editor-error">{error}</div> : null}

      <div className="character-editor-actions">
        {onCancel ? (
          <button type="button" className="secondary" onClick={onCancel} disabled={disabled}>
            {cancelLabel}
          </button>
        ) : null}
        <button type="button" className="primary" onClick={handleSave} disabled={disabled}>
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
