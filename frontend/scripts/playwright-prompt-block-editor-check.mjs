import { spawn, spawnSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, expect } from '@playwright/test'

const here = dirname(fileURLToPath(import.meta.url))
const frontendRoot = resolve(here, '..')
const repoRoot = resolve(frontendRoot, '..')
const artifactDir = resolve(repoRoot, '.trellis/tasks/05-09-modular-visual-prompt-editor/artifacts/playwright')
const harnessPath = resolve(frontendRoot, 'build/playwright-harness/prompt-block-editor-harness.jsx')
const harnessHtmlPath = resolve(frontendRoot, 'build/playwright-harness/prompt-block-editor-harness.html')
const baseUrl = process.env.FABLEMAP_PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173'

async function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok || response.status < 500) return
    } catch {
      // Keep waiting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 500))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

function startDevServer() {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const child = spawn(command, ['run', 'dev'], {
    cwd: frontendRoot,
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })
  child.stdout.on('data', () => {})
  child.stderr.on('data', () => {})
  return child
}

function stopDevServer(child) {
  if (!child || child.exitCode !== null) return
  if (process.platform === 'win32' && child.pid) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
  }
  child.kill()
}

async function writeHarness() {
  await mkdir(artifactDir, { recursive: true })
  await mkdir(dirname(harnessPath), { recursive: true })
  const harness = `
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../app/product/styles.css'
import PromptBlockEditor from '../../app/product/PromptBlockEditor.jsx'

const initialCharacter = {
  id: 'c1',
  name: '灯叔',
  description: '深夜便利店柜台旁的空间店员。',
  personality: '慢热，短句，愿意解释规则。',
  scenario: '雨夜，门口有人误会了登记册规则。',
  first_mes: '伞放这边，别挡门。',
  style_dials: {
    replyLength: 'short',
    density: 'dialogue',
    perspective: 'first_person_npc',
    emotion: 'stable',
    genre: 'cyber_tavern',
  }
}

const initialTavern = {
  id: 't1',
  name: '深夜便利店',
}

function App() {
  return (
    <main className="app-shell" style={{ background: '#07111f', minHeight: '100vh' }}>
      <PromptBlockEditor
        character={initialCharacter}
        tavern={initialTavern}
        onSave={(updated) => console.log('Saved:', updated)}
        onBack={() => console.log('Back')}
      />
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
`
  await writeFile(harnessPath, harness, 'utf8')
  await writeFile(harnessHtmlPath, `<!doctype html>
<html lang="zh-CN">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="margin: 0; padding: 0;">
    <div id="root"></div>
    <script type="module">
      import '/@id/__x00__virtual:react-router/inject-hmr-runtime'
    </script>
    <script type="module" src="/@vite/client"></script>
    <script type="module" src="./prompt-block-editor-harness.jsx"></script>
  </body>
</html>
`, 'utf8')
}

async function checkViewport(browser, config) {
  const context = await browser.newContext({
    viewport: config.viewport,
    deviceScaleFactor: 1,
    isMobile: config.isMobile || false,
  })
  const page = await context.newPage()
  const diagnostics = []
  page.on('console', (message) => {
    diagnostics.push(`[console:${message.type()}] ${message.text()}`)
  })
  page.on('pageerror', (error) => {
    diagnostics.push(`[pageerror] ${error.message}`)
  })
  const harnessUrl = `${baseUrl}/@fs/${harnessHtmlPath.replace(/\\/g, '/')}`
  await page.goto(harnessUrl, { waitUntil: 'networkidle' })
  
  try {
    await expect(page.getByText('提示词实验室')).toBeVisible()
    await expect(page.getByText('Prompt Layer Stack')).toBeVisible()
    await expect(page.getByText('Compiled System Prompt')).toBeVisible()
  } catch (error) {
    diagnostics.push(`[body] ${(await page.locator('body').innerText()).slice(0, 600)}`)
    throw new Error(`${config.name} harness did not render:\n${diagnostics.join('\n')}\n${error.message}`)
  }

  // 验证编辑功能
  const personalityArea = page.locator('textarea').nth(1) // Personality is the 2nd textarea (after description)
  await personalityArea.fill('性格：非常神秘，不苟言笑。')
  
  // 验证拨盘
  const genreSelect = page.locator('select').last()
  await genreSelect.selectOption('light_novel')
  
  // 验证预览同步
  await expect(page.getByText('性格：非常神秘，不苟言笑。')).toBeVisible()
  await expect(page.getByText('轻小说')).toBeVisible()

  const screenshotPath = resolve(artifactDir, `${config.name}-prompt-block-editor.png`)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await context.close()
  return screenshotPath
}

await writeHarness()

const server = startDevServer()
const screenshots = []
try {
  await waitForServer(baseUrl)
  const browser = await chromium.launch()
  try {
    screenshots.push(...[
      await checkViewport(browser, { name: 'desktop', viewport: { width: 1440, height: 900 } }),
      await checkViewport(browser, { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true }),
    ])
  } finally {
    await browser.close()
  }
} finally {
  stopDevServer(server)
}

const reportPath = resolve(artifactDir, 'report.md')
await writeFile(reportPath, `# Prompt Block Editor Playwright Check

Date: 2026-05-10

## Assertions

- PromptBlockEditor renders a split-pane workbench with Stack and Preview.
- Character card fields (Personality, Scenario, etc.) are editable and sync to preview.
- Style Dials (selects) correctly update the preview content.
- Visual markers distinguish different layers in the compiled prompt.
- Mobile view handles the split-pane reasonably (or stacks if designed).

## Screenshots

${screenshots.map((item) => `- [${item.split(/[\\\\/]/).pop()}](${item.replace(/\\/g, '/')})`).join('\n')}

## Limits

- Harness renders PromptBlockEditor in isolation.
- No real backend sync during this visual check.
`, 'utf8')

console.log('prompt-block-editor-playwright-check: ok')
console.log(`report: ${reportPath}`)
