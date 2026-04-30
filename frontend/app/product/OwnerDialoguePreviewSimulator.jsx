import { useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_OWNER_PREVIEW_MESSAGE,
  buildOwnerDialoguePreview,
  summarizePreviewCharacter,
} from './dialoguePreviewSimulator'

export default function OwnerDialoguePreviewSimulator({
  tavern,
  characters = [],
  disabled = false,
}) {
  const availableCharacters = useMemo(
    () => (Array.isArray(characters) ? characters.filter((character) => character?.name) : []),
    [characters],
  )
  const [selectedCharacterId, setSelectedCharacterId] = useState(() => availableCharacters[0]?.id || availableCharacters[0]?.name || '')
  const [visitorMessage, setVisitorMessage] = useState(DEFAULT_OWNER_PREVIEW_MESSAGE)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (availableCharacters.length === 0) {
      setSelectedCharacterId('')
      setPreview(null)
      return
    }
    const stillExists = availableCharacters.some((character) => getCharacterOptionId(character) === selectedCharacterId)
    if (!stillExists) {
      setSelectedCharacterId(getCharacterOptionId(availableCharacters[0]))
      setPreview(null)
    }
  }, [availableCharacters, selectedCharacterId])

  const selectedCharacter = useMemo(
    () => availableCharacters.find((character) => getCharacterOptionId(character) === selectedCharacterId) || availableCharacters[0],
    [availableCharacters, selectedCharacterId],
  )

  const characterSummary = useMemo(
    () => selectedCharacter ? summarizePreviewCharacter(selectedCharacter) : null,
    [selectedCharacter],
  )

  function handlePreview() {
    if (!selectedCharacter) {
      setError('请先新建或导入至少一个 NPC。')
      setPreview(null)
      return
    }
    setError('')
    setPreview(buildOwnerDialoguePreview({ tavern, character: selectedCharacter, visitorMessage }))
  }

  return (
    <section className="owner-dialogue-preview" aria-label="店主 AI 对话预览模拟器">
      <div className="character-editor-section-heading">
        <span>AI 对话预览模拟器</span>
        <small>Owner-only · preview only。本地模拟回复效果，不调用 LLM，不写入聊天历史 / 记忆 / writeback。</small>
      </div>

      {availableCharacters.length === 0 ? (
        <div className="owner-dialogue-preview__empty">
          先导入、批量创建或新建一个 NPC，再用这里检查开场语气和边界是否像店主想要的样子。
        </div>
      ) : (
        <>
          <div className="owner-dialogue-preview__controls">
            <label>
              <span>选择 NPC</span>
              <select
                value={getCharacterOptionId(selectedCharacter)}
                onChange={(event) => {
                  setSelectedCharacterId(event.target.value)
                  setPreview(null)
                }}
                disabled={disabled}
              >
                {availableCharacters.map((character) => (
                  <option key={getCharacterOptionId(character)} value={getCharacterOptionId(character)}>
                    {character.name || '未命名 NPC'}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>模拟访客输入</span>
              <textarea
                value={visitorMessage}
                onChange={(event) => {
                  setVisitorMessage(event.target.value)
                  setPreview(null)
                }}
                disabled={disabled}
                rows={3}
                placeholder={DEFAULT_OWNER_PREVIEW_MESSAGE}
              />
            </label>
          </div>

          {characterSummary ? (
            <div className="owner-dialogue-preview__readiness" aria-label="NPC 预览准备度">
              {characterSummary.fieldCoverage.map((item) => (
                <span key={item.label} className={item.done ? 'is-done' : ''}>
                  {item.done ? '✓' : '·'} {item.label}
                </span>
              ))}
            </div>
          ) : null}

          <div className="owner-dialogue-preview__actions">
            <button type="button" className="primary" onClick={handlePreview} disabled={disabled}>
              生成本地预览
            </button>
            <span>正式 LLM 调用仍由店主 provider 设置控制；此处不消耗 token。</span>
          </div>

          {preview ? (
            <div className="owner-dialogue-preview__result" role="status">
              <div className="owner-dialogue-preview__flags">
                <span>preview_only: {String(preview.preview_only)}</span>
                <span>llm_called: {String(preview.llm_called)}</span>
                <span>history_written: {String(preview.history_written)}</span>
                <span>writeback_written: {String(preview.writeback_written)}</span>
              </div>
              <div className="owner-dialogue-preview__chat">
                <p className="owner-dialogue-preview__bubble is-user">{preview.visitor_message}</p>
                <p className="owner-dialogue-preview__bubble is-assistant">{preview.assistant_message}</p>
              </div>
              <ul>
                {preview.notes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </div>
          ) : null}
        </>
      )}

      {error && <div className="char-mgmt-error">{error}</div>}
    </section>
  )
}

function getCharacterOptionId(character) {
  return String(character?.id || character?.name || '')
}
