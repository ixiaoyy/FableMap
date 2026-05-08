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
    :root { --shell-title:#f8fafc; --shell-text:#e2e8f0; --shell-text-soft:#94a3b8; --card-bg: rgba(15,23,42,.96); --shell-border: rgba(148,163,184,.22); color-scheme: dark; }
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
    <div><span class="guild-kicker">🌱 菜园酒馆</span><h4>我的小菜园</h4><p>黑钻只在本酒馆副玩法内流转，不接入充值或 Token 结算。</p></div>
    <div class="guild-header-actions"><button class="guild-status-btn">查看状态</button><button class="guild-status-btn">行情播报</button><button class="guild-status-btn">邻田机会</button><button class="guild-status-btn">🛒 商店</button></div>
  </div>
  <div class="guild-progress-row"><span>空地 <strong>2</strong></span><span>仓库藏品 <strong>4</strong></span><span>收益 <strong>0.26 黑钻</strong></span><span>偷菜剩余 <strong>2/3</strong></span></div>
  <div class="farm-visitor-stats-row">
    <div class="farm-stats-cards"><div class="farm-stat-card"><span class="farm-stat-icon">🏆</span><span class="farm-stat-label">收获王</span><span class="farm-stat-value">4</span></div><div class="farm-stat-card"><span class="farm-stat-icon">💰</span><span class="farm-stat-label">收益王</span><span class="farm-stat-value">26</span></div><div class="farm-stat-card"><span class="farm-stat-icon">⭐</span><span class="farm-stat-label">常客王</span><span class="farm-stat-value">1</span></div></div>
    <button class="farm-bonus-btn">🎁 每日登录 +0.10 黑钻</button>
  </div>
  <div class="farm-plots-grid"><div class="farm-plot is-empty"><div class="farm-plot-title">空地</div><div class="farm-plot-meta">选择一种种子开始种植</div><div class="farm-plot-actions"><button>种🫐 蓝莓 · 0.02 黑钻</button><button disabled>种🍉 西瓜 · 0.18 黑钻</button></div></div><div class="farm-plot is-mature"><div class="farm-plot-title">🍓 草莓 (成熟)</div><div class="farm-plot-meta"><span>可以收获了！</span><span>水量: 8/10</span></div><div class="farm-plot-actions"><button class="btn-harvest">收获</button></div></div></div>
  <div class="farm-market-panel" aria-label="菜园交易所行情"><div class="farm-market-header"><div><strong>📈 菜园交易所</strong><span>西瓜固定锚定 1.00 黑钻，其它作物按今日需求浮动。</span></div></div><div class="farm-market-grid"><div class="farm-market-card trend-up"><div class="farm-market-card__top"><strong>🫐 蓝莓</strong><span>+6%</span></div><div class="farm-market-price">0.11 黑钻</div><p>甜浆需求升温，适合小批量卖出。</p><div class="farm-market-meta"><span>库存 3</span><span>上涨</span></div></div></div></div>
  <div class="farm-shop-overlay" role="dialog" aria-modal="true" aria-label="农场商店"><div class="farm-shop-modal"><div class="farm-shop-header"><h4>🛒 农场商店</h4><button class="farm-shop-close" aria-label="关闭商店">✕</button></div><div class="farm-shop-balance"><span>💎 我的余额：2.20 黑钻</span></div><div class="farm-shop-items"><div class="farm-shop-item is-affordable"><div class="farm-shop-item__icon">🌟</div><div class="farm-shop-item__info"><strong>高级种子包</strong><p>解锁南瓜和西红柿种子</p></div><div class="farm-shop-item__action"><button>2.00 黑钻</button></div></div></div></div></div>
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
  await page.getByText('每日登录 +0.10 黑钻').waitFor({ state: 'visible' })
  await page.getByText('种🫐 蓝莓 · 0.02 黑钻').waitFor({ state: 'visible' })
  await page.getByLabel('农场商店').waitFor({ state: 'visible' })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  if (overflow) throw new Error(`${viewport.name} viewport has horizontal overflow`)
  const screenshot = resolve(artifactDir, `${viewport.name}-garden-currency.png`)
  await page.screenshot({ path: screenshot, fullPage: true })
  report.push(`- ${viewport.name} ${viewport.width}x${viewport.height}: PASS, screenshot ${screenshot}`)
  await page.close()
}
await browser.close()
const reportPath = resolve(artifactDir, 'report.md')
writeFileSync(reportPath, `# Garden Tavern Currency Economy Playwright Self-check\n\n${report.join('\n')}\n`, 'utf8')
console.log(`garden currency playwright self-check ok: ${reportPath}`)
