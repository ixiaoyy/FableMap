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
    :root {
      --shell-title: #f8fafc;
      --shell-text: #e2e8f0;
      --shell-text-soft: #94a3b8;
      --surface-color: rgba(15, 23, 42, 0.9);
      --border-color: rgba(148, 163, 184, 0.16);
      color-scheme: dark;
    }
    body {
      margin: 0;
      min-height: 100vh;
      background: radial-gradient(circle at top, #164e63 0, #020617 44%);
      font-family: Inter, "Microsoft YaHei", system-ui, sans-serif;
      color: var(--shell-text);
    }
    button { font-family: inherit; cursor: pointer; }
    button:disabled { cursor: not-allowed; opacity: 0.48; }
    ${productCss}
  </style>
</head>
<body>
  <main style="padding: 24px; max-width: 1120px; margin: 0 auto;">
    <section class="guild-quest-panel farm-panel" aria-label="菜园、仓库与交易所">
      <div class="guild-quest-panel__header">
        <div>
          <span class="guild-kicker">🌱 菜园酒馆</span>
          <h4>我的小菜园</h4>
          <p>种植、收获，再把库存拿到 NPC 管家的交易所看行情。</p>
        </div>
        <div class="guild-header-actions">
          <button type="button" class="guild-status-btn">查看状态</button>
          <button type="button" class="guild-status-btn">行情播报</button>
        </div>
      </div>
      <div class="guild-progress-row">
        <span>空地 <strong>1</strong></span><span>生长中 <strong>1</strong></span><span>可收获 <strong>1</strong></span><span>仓库藏品 <strong>4</strong></span><span>收益 <strong>0.32 黑钻</strong></span>
      </div>
      <div class="farm-plots-grid">
        <div class="farm-plot is-empty"><div class="farm-plot-title">空地</div><div class="farm-plot-meta">选择一种种子开始种植</div><div class="farm-plot-actions"><button>种🫐 蓝莓</button><button>种🍓 草莓</button><button>种🍉 西瓜</button></div></div>
        <div class="farm-plot is-growing"><div class="farm-plot-title">🫐 蓝莓</div><div class="farm-plot-meta"><span>剩余: 3分钟</span><span>水量: 2/10</span></div><div class="farm-plot-actions"><button>浇水</button></div></div>
        <div class="farm-plot is-mature"><div class="farm-plot-title">🍓 草莓 (成熟)</div><div class="farm-plot-meta"><span>可以收获了！</span><span>水量: 8/10</span></div><div class="farm-plot-actions"><button class="btn-harvest">收获</button></div></div>
      </div>
      <div class="farm-inventory"><strong>📦 仓库</strong><div class="farm-inventory-list"><div class="inventory-item">🫐 蓝莓 x3</div><div class="inventory-item">🍉 西瓜 x1</div></div></div>
      <div class="farm-market-panel" aria-label="菜园交易所行情">
        <div class="farm-market-header"><div><strong>📈 菜园交易所</strong><span>西瓜固定锚定 1.00 黑钻，其它作物按今日需求浮动。</span></div></div>
        <div class="farm-market-grid">
          <div class="farm-market-card trend-up"><div class="farm-market-card__top"><strong>🫐 蓝莓</strong><span>+6%</span></div><div class="farm-market-price">0.11 黑钻</div><p>甜浆需求升温，适合小批量卖出。</p><div class="farm-market-meta"><span>库存 3</span><span>上涨</span></div><div class="farm-market-actions"><button>卖 1 个 · 0.11 黑钻</button><button>全卖 · 0.33 黑钻</button></div></div>
          <div class="farm-market-card trend-up"><div class="farm-market-card__top"><strong>🍓 草莓</strong><span>+8%</span></div><div class="farm-market-price">0.16 黑钻</div><p>茶点摊补货，今日收购价偏强。</p><div class="farm-market-meta"><span>库存 0</span><span>上涨</span></div><div class="farm-market-actions"><button disabled>卖 1 个</button><button disabled>全卖</button></div></div>
          <div class="farm-market-card trend-flat"><div class="farm-market-card__top"><strong>🍉 西瓜</strong><span>锚定</span></div><div class="farm-market-price">1.00 黑钻</div><p>交易所锚定价，作为今日作物行情基准。</p><div class="farm-market-meta"><span>库存 1</span><span>稳定</span></div><div class="farm-market-actions"><button>卖 1 个 · 1.00 黑钻</button><button disabled>全卖</button></div></div>
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
  await page.getByLabel('菜园、仓库与交易所').waitFor({ state: 'visible' })
  await page.getByLabel('菜园交易所行情').waitFor({ state: 'visible' })
  await page.getByText('西瓜固定锚定 1.00 黑钻').waitFor({ state: 'visible' })
  await page.getByRole('button', { name: /卖 1 个 · 0\.11 黑钻/ }).waitFor({ state: 'visible' })
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  if (horizontalOverflow) {
    throw new Error(`${viewport.name} viewport has horizontal overflow`)
  }
  const screenshot = resolve(artifactDir, `${viewport.name}-garden-exchange.png`)
  await page.screenshot({ path: screenshot, fullPage: true })
  report.push(`- ${viewport.name} ${viewport.width}x${viewport.height}: PASS, screenshot ${screenshot}`)
  await page.close()
}
await browser.close()

const reportPath = resolve(artifactDir, 'report.md')
writeFileSync(reportPath, `# Garden Tavern Exchange Playwright Self-check\n\n${report.join('\n')}\n`, 'utf8')
console.log(`garden exchange playwright self-check ok: ${reportPath}`)


