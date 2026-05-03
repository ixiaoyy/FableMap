const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const repoRoot = path.resolve(__dirname, '..', '..', '..')
const outputRoot = path.join(repoRoot, 'artifacts', 'research', 'ai-creation-sites')
fs.mkdirSync(outputRoot, { recursive: true })

const sites = [
  { slug: 'discord', name: 'Discord', url: 'https://discord.com/' },
  { slug: 'character-ai', name: 'Character.AI', url: 'https://character.ai/' },
  { slug: 'suno', name: 'Suno', url: 'https://suno.com/' },
  { slug: 'runway', name: 'Runway', url: 'https://runwayml.com/' },
  { slug: 'canva-ai', name: 'Canva AI', url: 'https://www.canva.com/ai/' },
  { slug: 'glif', name: 'Glif', url: 'https://glif.app/' },
]

const viewports = [
  { name: 'desktop', width: 1366, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

function sanitizeText(text = '') {
  return text.replace(/\s+/g, ' ').trim().slice(0, 1200)
}

async function closeCookieBanners(page) {
  const labels = [
    /^accept all$/i,
    /^accept$/i,
    /^agree$/i,
    /^i agree$/i,
    /^allow all$/i,
    /^reject all$/i,
    /^decline all$/i,
    /^got it$/i,
  ]
  for (const label of labels) {
    try {
      const button = page.getByRole('button', { name: label }).first()
      if (await button.isVisible({ timeout: 700 })) {
        await button.click({ timeout: 1200 })
        await page.waitForTimeout(500)
        return true
      }
    } catch {}
  }
  return false
}

async function captureSite(browser, site) {
  const dir = path.join(outputRoot, site.slug)
  fs.mkdirSync(dir, { recursive: true })
  const result = {
    ...site,
    capturedAt: new Date().toISOString(),
    publicOnly: true,
    attemptedLoginOrBypass: false,
    viewports: {},
  }

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      ignoreHTTPSErrors: true,
      locale: 'en-US',
      userAgent: viewport.name === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
    })
    const page = await context.newPage()
    const consoleErrors = []
    const requestFailures = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300))
    })
    page.on('requestfailed', (request) => {
      const url = request.url()
      if (url.startsWith('data:') || url.includes('favicon')) return
      requestFailures.push({ url: url.slice(0, 240), failure: request.failure()?.errorText || 'unknown' })
    })
    try {
      const response = await page.goto(site.url, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      })
      await page.waitForTimeout(4500)
      await closeCookieBanners(page)
      await page.waitForTimeout(1000)
      const title = await page.title().catch(() => '')
      const finalUrl = page.url()
      const bodyText = sanitizeText(await page.locator('body').innerText({ timeout: 4000 }).catch(() => ''))
      const blocked = /captcha|verify you are human|access denied|enable cookies|cloudflare/i.test(`${title} ${bodyText}`)
      const screenshot = path.join(dir, `${site.slug}-home-${viewport.name}.png`)
      await page.screenshot({ path: screenshot, fullPage: true, timeout: 30000 })
      result.viewports[viewport.name] = {
        ok: true,
        blocked,
        status: response?.status() || null,
        finalUrl,
        title,
        screenshot: path.relative(repoRoot, screenshot).replace(/\\/g, '/'),
        textSample: bodyText,
        consoleErrors: consoleErrors.slice(0, 5),
        requestFailures: requestFailures.slice(0, 5),
      }
    } catch (error) {
      const screenshot = path.join(dir, `${site.slug}-home-${viewport.name}-failure.png`)
      try { await page.screenshot({ path: screenshot, fullPage: true, timeout: 10000 }) } catch {}
      result.viewports[viewport.name] = {
        ok: false,
        error: error.message || String(error),
        screenshot: fs.existsSync(screenshot) ? path.relative(repoRoot, screenshot).replace(/\\/g, '/') : null,
        consoleErrors: consoleErrors.slice(0, 5),
        requestFailures: requestFailures.slice(0, 5),
      }
    } finally {
      await context.close().catch(() => {})
    }
  }

  fs.writeFileSync(path.join(dir, 'capture.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  return result
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-proxy-server'] })
  const results = []
  try {
    for (const site of sites) {
      console.log(`capturing ${site.slug}: ${site.url}`)
      results.push(await captureSite(browser, site))
    }
  } finally {
    await browser.close().catch(() => {})
  }
  const report = {
    capturedAt: new Date().toISOString(),
    outputRoot: path.relative(repoRoot, outputRoot).replace(/\\/g, '/'),
    sites: results,
  }
  const reportPath = path.join(outputRoot, 'capture-report.json')
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify({
    report: path.relative(repoRoot, reportPath).replace(/\\/g, '/'),
    captured: results.map((site) => ({
      slug: site.slug,
      desktop: site.viewports.desktop?.ok,
      mobile: site.viewports.mobile?.ok,
      blockedDesktop: site.viewports.desktop?.blocked,
      blockedMobile: site.viewports.mobile?.blocked,
    })),
  }, null, 2))
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
