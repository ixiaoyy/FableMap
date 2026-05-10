import { useState, useMemo } from 'react'
import { ArrowLeft, Save, Sparkles, AlertTriangle, Layers, Info } from 'lucide-react'
import { Link } from 'react-router'

import {
  PROMPT_STYLE_DIAL_GROUPS,
  DEFAULT_PROMPT_STYLE_DIALS,
  normalizePromptStyleDials,
  compilePromptStyleDialLines,
  buildPromptLayerPreview,
} from './promptStyleDials.js'
import {
  assertCharacterPromptRiskCanSave,
} from './characterPromptRiskLinter.js'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

/**
 * PromptBlockEditor — 模块化视觉提示词块编辑器
 */
export default function PromptBlockEditor({ 
  character, 
  tavern, 
  onSave, 
  onBack,
  disabled = false 
}) {
  const [draft, setDraft] = useState(character)
  const [dials, setDials] = useState(character.style_dials || DEFAULT_PROMPT_STYLE_DIALS)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // 模拟运行时注入的内容
  const simulatedWorldInfo = '命中关键词后注入店主确认的地点、传闻、背景或玩法线索。'
  const simulatedVisitorState = '回访次数、已确认记忆、当前 gameplay/session 状态；不公开其他访客私密内容。'

  const layers = useMemo(() => {
    return buildPromptLayerPreview(draft, dials)
  }, [draft, dials])

  const fullPrompt = useMemo(() => {
    // 模拟最终拼接逻辑
    const base = [
      `【${draft.name} 的核心设定】`,
      draft.description,
      draft.personality,
      draft.scenario,
    ].filter(Boolean).join('\n')

    const dialLines = compilePromptStyleDialLines(dials)
    
    return [
      layers.find(l => l.id === 'platform_boundary')?.body,
      base,
      `【FableMap 风格拨盘】\n${dialLines.map(l => `- ${l}`).join('\n')}\n【/FableMap 风格拨盘】`,
      `【世界背景补充】\n${simulatedWorldInfo}`,
      `【当前访客关系与记忆】\n${simulatedVisitorState}`
    ].filter(Boolean).join('\n\n')
  }, [draft, dials, layers])

  async function handleSave() {
    setBusy(true)
    setError('')
    try {
      // 风险检查
      assertCharacterPromptRiskCanSave(draft)
      await onSave({ ...draft, style_dials: dials })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="prompt-block-editor">
      <header className="prompt-block-editor__header">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">提示词实验室：{character.name}</h1>
            <p className="text-sm text-violet-100/60">模块化调校 NPC 的灵魂与表达边界</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onBack} disabled={busy}>取消</Button>
          <Button onClick={handleSave} disabled={busy || disabled}>
            <Save className="h-4 w-4" />
            保存调校
          </Button>
        </div>
      </header>

      <main className="prompt-block-editor__content">
        {/* 左侧：积木栈 */}
        <section className="prompt-block-editor__blocks">
          <div className="section-title">
            <Layers className="h-4 w-4" />
            提示词层叠栈 (Prompt Stack)
          </div>
          
          <div className="block-stack">
            {layers.map((layer) => (
              <Card key={layer.id} className={`prompt-block prompt-block--${layer.id}`}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">{layer.label}</CardTitle>
                    <Info className="h-3.5 w-3.5 text-violet-100/40" />
                  </div>
                  <CardDescription className="text-xs">{layer.helper}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  {layer.id === 'style_dials' ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {PROMPT_STYLE_DIAL_GROUPS.map((group) => (
                        <div key={group.id} className="dial-group">
                          <label className="mb-1.5 block text-xs font-medium text-violet-100/70">{group.label}</label>
                          <select 
                            value={dials[group.id]} 
                            onChange={(e) => setDials({ ...dials, [group.id]: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60"
                          >
                            {group.options.map((opt) => (
                              <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap rounded-lg bg-slate-950/50 p-3 text-xs leading-relaxed text-violet-50/80">
                      {layer.body}
                    </pre>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 右侧：实时预览 */}
        <section className="prompt-block-editor__preview">
          <div className="section-title">
            <Sparkles className="h-4 w-4" />
            最终系统提示词预览 (Compiled Prompt)
          </div>
          <div className="compiled-prompt-container">
            <pre className="compiled-prompt text-sm leading-7">
              {fullPrompt}
            </pre>
          </div>
          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
