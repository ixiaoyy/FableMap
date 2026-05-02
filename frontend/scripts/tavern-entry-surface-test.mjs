import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../app/features/tavern-layout-showcase/index.tsx', import.meta.url), 'utf8')

const requiredSnippets = [
  'data-entry-surface="tavern-doorway"',
  '进入吧台',
  '和当前 NPC 对话',
  '真实坐标门牌',
  '今晚在店里',
  'min-h-14',
  'onLayoutChange("npc-chat")',
]

const missing = requiredSnippets.filter((snippet) => !source.includes(snippet))

if (missing.length) {
  console.error('Tavern entry surface polish contract failed. Missing snippets:')
  for (const snippet of missing) console.error(`- ${snippet}`)
  process.exit(1)
}

console.log('tavern-entry-surface-test passed')
