import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '../../../../..')
const artifactDir = resolve(__dirname)
mkdirSync(artifactDir, { recursive: true })
const { chromium } = await import(pathToFileURL(resolve(repoRoot, 'frontend/node_modules/@playwright/test/index.mjs')).href)
const productCss = readFileSync(resolve(repoRoot, 'frontend/app/product/styles.css'), 'utf8')
const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <style>
    :root { --shell-title:#f8fafc; --shell-text:#e2e8f0; --shell-text-soft:#94a3b8; color-scheme: dark; }
    body { margin:0; min-height:100vh; background:radial-gradient(circle at top,#164e63 0,#020617 46%); font-family:Inter,"Microsoft YaHei",system-ui,sans-serif; color:var(--shell-text); }
    button { font-family:inherit; cursor:pointer; }
    button:disabled { cursor:not-allowed; opacity:.48; }
    ${productCss}
  </style>
</head>
<body>
<main style="padding:24px; max-width:1120px; margin:0 auto;">
<section class="guild-quest-panel farm-panel" aria-label="菜园、仓库、交易所与邻田">
  <div class="guild-quest-panel__header">
    <div><span class="guild-kicker">🌱 菜园酒馆</span><h4>我的小菜园</h4><p>种植、收获，再把库存拿到 NPC 管家的交易所看行情。</p></div>
    <div class="guild-header-actions"><button class="guild-status-btn">查看状态</button><button class="guild-status-btn">行情播报</button><button class="guild-status-btn">邻田机会</button></div>
  </div>
  <div class="guild-progress-row"><span>空地 <strong>1</strong></span><span>生长中 <strong>1</strong></span><span>可收获 <strong>1</strong></span><span>仓库藏品 <strong>4</strong></span><span>收益 <strong>0.32 黑钻</strong></span><span>偷菜剩余 <strong>2/3</strong></span></div>
  <div class="farm-steal-panel" aria-label="菜园邻田偷菜">
    <div class="farm-market-header"><div><strong>🥷 邻田成熟作物</strong><span>每日最多顺手摘 3 次；管家会给被摘的院主留通知，不做公开社交墙。</span></div></div>
    <div class="farm-steal-grid">
      <div class="farm-steal-card is-ready"><div class="farm-market-card__top"><strong>🫐 晨雾旅人</strong><span>成熟可摘</span></div><p>篱笆边有两簇成熟蓝莓，管家提醒只可轻轻摘一份。</p><div class="farm-market-meta"><span>成熟 2</span><span>今日剩余 2</span></div><div class="farm-market-actions"><button>顺手摘 1 个 · 蓝莓</button></div></div>
      <div class="farm-steal-card is-locked"><div class="farm-market-card__top"><strong>🍓 邮筒小院</strong><span>今日已摘</span></div><p>草莓已经变红，摘走后管家会给院主留补偿便签。</p><div class="farm-market-meta"><span>成熟 1</span><span>今日剩余 2</span></div><div class="farm-market-actions"><button disabled>顺手摘 1 个</button></div></div>
      <div class="farm-steal-card is-ready"><div class="farm-market-card__top"><strong>🍉 灯下邻田</strong><span>成熟可摘</span></div><p>西瓜成熟但很显眼，每天最多顺手摘一次。</p><div class="farm-market-meta"><span>成熟 1</span><span>今日剩余 2</span></div><div class="farm-market-actions"><button>顺手摘 1 个 · 西瓜</button></div></div>
    </div>
  </div>
</section>
</main>
</body>
</html>`

const browser = await chromium.launch({ headless: true })
const report = []
for (const viewport of [
  { name: 'desktop', width: 1366, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport })
  await page.setContent(html, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('菜园邻田偷菜').waitFor({ state: 'visible' })
  await page.getByText('每日最多顺手摘 3 次').waitFor({ state: 'visible' })
  await page.getByRole('button', { name: /顺手摘 1 个 · 蓝莓/ }).waitFor({ state: 'visible' })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  if (overflow) throw new Error(`${viewport.name} viewport has horizontal overflow`)
  const screenshot = resolve(artifactDir, `${viewport.name}-garden-stealing.png`)
  await page.screenshot({ path: screenshot, fullPage: true })
  report.push(`- ${viewport.name} ${viewport.width}x${viewport.height}: PASS, screenshot ${screenshot}`)
  await page.close()
}
await browser.close()
const reportPath = resolve(artifactDir, 'report.md')
writeFileSync(reportPath, `# Garden Tavern Stealing Playwright Self-check\n\n${report.join('\n')}\n`, 'utf8')
console.log(`garden stealing playwright self-check ok: ${reportPath}`)
