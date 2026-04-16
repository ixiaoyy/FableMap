import { useState } from 'react'
import { getDefaultTavernService, parseCharacterCard, extractCharacterCardFromPng, getTavernAccessLabel, getTavernAccessIcon } from './services/tavernService'
import LLMConfigForm, { DEFAULT_MODELS, DEFAULT_BASE_URLS } from './LLMConfigForm'
import CharacterEditor, { createEmptyCharacterDraft } from './CharacterEditor'

/**
 * TavernCreatePanel — 创建酒馆的面板
 *
 * 用户可以：
 * 1. 填写酒馆基本信息（名称、描述、位置）
 * 2. 设置访问权限（公开/密码/私人）
 * 3. 配置 LLM（可选，暂时跳过）
 * 4. 导入 SillyTavern 角色卡
 */
export default function TavernCreatePanel({
  initialLat = 0,
  initialLon = 0,
  onCreated,
  onCancel,
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    lat: initialLat,
    lon: initialLon,
    access: 'public',
    password: '',
    // 角色
    characters: [],
    scene_prompt: '',
  })
  const [llmFormData, setLlmFormData] = useState({
    backend: 'openai',
    model: DEFAULT_MODELS['openai'],
    api_key: '',
    base_url: DEFAULT_BASE_URLS['openai'] || '',
    temperature: 0.8,
    max_tokens: 4096,
    top_p: 0.95,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: 基本信息, 2: LLM配置, 3: 角色导入
  const [editingCharacterIndex, setEditingCharacterIndex] = useState(null)

  const tavernService = getDefaultTavernService()

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('请填写酒馆名称')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        lat: parseFloat(form.lat),
        lon: parseFloat(form.lon),
        access: form.access,
        password: form.access === 'password' ? form.password : '',
        scene_prompt: form.scene_prompt,
      }

      // 添加 LLM 配置（如果用户填写了）
      if (llmFormData.api_key) {
        payload.llm_config = {
          backend: llmFormData.backend,
          model: llmFormData.model,
          api_key: llmFormData.api_key,
          base_url: llmFormData.base_url,
          temperature: parseFloat(llmFormData.temperature),
          max_tokens: parseInt(llmFormData.max_tokens),
          top_p: parseFloat(llmFormData.top_p),
        }
      }

      const tavern = await tavernService.createTavern(payload)

      // 添加角色
      const addedCharacters = []
      for (const char of form.characters) {
        const addedCharacter = await tavernService.addCharacter(tavern.id, char)
        addedCharacters.push(addedCharacter)
      }

      if (onCreated) {
        onCreated({ ...tavern, characters: addedCharacters })
      }
    } catch (err) {
      setError(`创建失败：${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleImportCard(e) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // 尝试解析为 JSON
      if (file.name.endsWith('.json')) {
        const text = await file.text()
        const cardData = JSON.parse(text)
        const charData = parseCharacterCard(cardData)
        setForm((prev) => ({
          ...prev,
          characters: [...prev.characters, charData],
        }))
        return
      }

      // 尝试从 PNG 提取
      const charData = await extractCharacterCardFromPng(file)
      setForm((prev) => ({
        ...prev,
        characters: [...prev.characters, charData],
      }))
    } catch (err) {
      setError(`导入角色卡失败：${err.message}`)
    }

    e.target.value = ''
  }

  function removeCharacter(index) {
    setForm((prev) => ({
      ...prev,
      characters: prev.characters.filter((_, i) => i !== index),
    }))
    setEditingCharacterIndex((current) => {
      if (current === index) return null
      if (current > index) return current - 1
      return current
    })
  }

  function updateCharacter(index, characterData) {
    setForm((prev) => ({
      ...prev,
      characters: prev.characters.map((character, currentIndex) => (
        currentIndex === index ? { ...character, ...characterData } : character
      )),
    }))
    setEditingCharacterIndex(null)
  }

  async function handleTestDirect(config) {
    return tavernService.testLlmConfigDirect(config)
  }

  return (
    <div className="tavern-create-panel">
      <div className="tavern-create-header">
        <h3>创建酒馆</h3>
        <div className="tavern-create-steps">
          <button
            type="button"
            className={`step-btn ${step === 1 ? 'active' : ''}`}
            onClick={() => setStep(1)}
          >
            1. 基本信息
          </button>
          <button
            type="button"
            className={`step-btn ${step === 2 ? 'active' : ''}`}
            onClick={() => setStep(2)}
          >
            2. AI 配置
          </button>
          <button
            type="button"
            className={`step-btn ${step === 3 ? 'active' : ''}`}
            onClick={() => setStep(3)}
          >
            3. 角色
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: 基本信息 */}
        {step === 1 && (
          <div className="tavern-create-step">
            <div className="form-group">
              <label>酒馆名称 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="例如：第三中学传达室"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>场景描述</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="描述这个酒馆的氛围和故事..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="form-group">
              <label>场景氛围提示词</label>
              <textarea
                value={form.scene_prompt}
                onChange={(e) => updateField('scene_prompt', e.target.value)}
                placeholder="给 AI 的场景描述，例如：这是一个古朴的传达室，老式电话、搪瓷茶缸、堆积的报纸..."
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>纬度</label>
                <input
                  type="number"
                  step="0.000001"
                  value={form.lat}
                  onChange={(e) => updateField('lat', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>经度</label>
                <input
                  type="number"
                  step="0.000001"
                  value={form.lon}
                  onChange={(e) => updateField('lon', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>访问权限</label>
              <div className="access-options">
                {['public', 'password', 'private'].map((acc) => (
                  <label key={acc} className="access-option">
                    <input
                      type="radio"
                      name="access"
                      value={acc}
                      checked={form.access === acc}
                      onChange={(e) => updateField('access', e.target.value)}
                    />
                    <span>{getTavernAccessIcon(acc)} {getTavernAccessLabel(acc)}</span>
                  </label>
                ))}
              </div>
            </div>

            {form.access === 'password' && (
              <div className="form-group">
                <label>密码</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="设置访问密码"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: LLM 配置 */}
        {step === 2 && (
          <div className="tavern-create-step">
            <div className="form-note">
              <p>配置 AI 后端，让你的酒馆 NPC 可以和访客聊天。</p>
              <p>可以跳过此步骤，之后在酒馆列表的「AI 配置」按钮中配置。</p>
            </div>

            <LLMConfigForm
              value={llmFormData}
              onChange={(cfg) => setLlmFormData(cfg)}
              compact={false}
              tavernId={null}
              testDirect={handleTestDirect}
            />
          </div>
        )}

        {/* Step 3: 角色导入 */}
        {step === 3 && (
          <div className="tavern-create-step">
            <div className="form-group">
              <label>导入角色</label>
              <p className="form-hint">
                支持 SillyTavern Character Card 格式（JSON 或 PNG）
              </p>
              <input
                type="file"
                accept=".json,.png"
                onChange={handleImportCard}
              />
            </div>

            {form.characters.length > 0 && (
              <div className="character-list">
                <label>已添加角色 ({form.characters.length})</label>
                {form.characters.map((char, index) => (
                  <div key={index} className="character-item">
                    <div className="character-info">
                      <strong>{char.name}</strong>
                      <span className="muted">{char.description?.slice(0, 50)}...</span>
                    </div>
                    <div className="character-item-actions">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setEditingCharacterIndex(index)}
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeCharacter(index)}
                      >
                        移除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editingCharacterIndex != null && form.characters[editingCharacterIndex] ? (
              <div className="character-editor-shell">
                <CharacterEditor
                  value={form.characters[editingCharacterIndex]}
                  title={`编辑角色：${form.characters[editingCharacterIndex].name || '未命名角色'}`}
                  submitLabel="保存到创建表单"
                  onSave={(characterData) => updateCharacter(editingCharacterIndex, characterData)}
                  onCancel={() => setEditingCharacterIndex(null)}
                />
              </div>
            ) : null}

            {/* 手动添加角色 */}
            <details className="manual-add">
              <summary>手动添加角色</summary>
              <ManualCharacterAdder
                onAdd={(charData) => {
                  setForm((prev) => ({
                    ...prev,
                    characters: [...prev.characters, charData],
                  }))
                }}
              />
            </details>
          </div>
        )}

        {error && <div className="form-error">{error}</div>}

        <div className="tavern-create-actions">
          {step > 1 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep(step - 1)}
            >
              上一步
            </button>
          )}
          {step < 3 && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setStep(step + 1)}
            >
              下一步
            </button>
          )}
          {step === 3 && (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={onCancel}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? '创建中...' : '创建酒馆'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}

/**
 * 手动添加角色的简单表单
 */
function ManualCharacterAdder({ onAdd }) {
  const [draftSeed, setDraftSeed] = useState(() => createEmptyCharacterDraft())

  return (
    <div className="manual-char-form">
      <CharacterEditor
        value={draftSeed}
        title="新角色"
        submitLabel="添加角色"
        onSave={(charData) => {
          onAdd(charData)
          setDraftSeed(createEmptyCharacterDraft())
        }}
      />
    </div>
  )
}
