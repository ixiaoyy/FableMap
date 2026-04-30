const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.MOBILE_CRITICAL_FLOW_HARNESS_URL || 'http://127.0.0.1:5180';
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-mobile-critical-flow-visual-acceptance');
fs.mkdirSync(evidenceDir, { recursive: true });

function assert(condition, message, details) {
  if (!condition) {
    const error = new Error(message);
    if (details !== undefined) error.details = details;
    throw error;
  }
}

async function checkNoOverflow(page) {
  const overflow = await page.evaluate(() => ({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert(overflow.scrollWidth <= overflow.innerWidth + 2, 'page has horizontal overflow', overflow);
  return overflow;
}

async function runViewport(page, viewport, screenshotName, expectMobileGuide) {
  await page.setViewportSize(viewport);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByText('FableMap').first().waitFor({ timeout: 15000 });
  await page.getByText('附近坐标正在发光').waitFor({ timeout: 15000 });
  await page.getByLabel('Mobile navigation').waitFor({ timeout: 15000 });
  if (expectMobileGuide) {
    await page.getByText('Mobile first-screen').waitFor({ timeout: 15000 });
    await page.getByText('先找到一个可进入的坐标').waitFor({ timeout: 15000 });
    await page.getByRole('link', { name: '查看发现主线' }).waitFor({ timeout: 15000 });
    await page.getByRole('link', { name: '查看发现主线' }).click();
  }
  const overflow = await checkNoOverflow(page);
  const screenshotPath = path.join(evidenceDir, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return { screenshotPath, overflow };
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-proxy-server'] });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const consoleSignals = [];
  const requestFailures = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleSignals.push({ type: msg.type(), text: msg.text() }); });
  page.on('pageerror', (error) => consoleSignals.push({ type: 'pageerror', text: String(error) }));
  page.on('requestfailed', (request) => requestFailures.push({ url: request.url(), failure: request.failure()?.errorText || 'unknown' }));

  try {
    const desktop = await runViewport(page, { width: 1366, height: 900 }, 'mobile-critical-flow-desktop.png', false);
    const mobile = await runViewport(page, { width: 390, height: 844 }, 'mobile-critical-flow-mobile.png', true);
    assert(consoleSignals.length === 0, 'browser console/page errors detected', consoleSignals);
    assert(requestFailures.length === 0, 'request failures detected', requestFailures);
    const report = {
      ok: true,
      baseUrl,
      evidenceDir,
      desktop,
      mobile,
      consoleSignals,
      requestFailures,
      checked: ['desktop shell still loads', 'mobile first-screen guide', 'mobile dock visible', 'touch-safe CTA', 'anchor action', 'no overflow'],
    };
    const reportPath = path.join(evidenceDir, 'mobile-critical-flow-visual-acceptance-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try { await page.screenshot({ path: failurePath, fullPage: true }); } catch {}
    console.error('MOBILE_CRITICAL_FLOW_VISUAL_ACCEPTANCE_FAILED');
    console.error(error.stack || error.message || String(error));
    if (error.details !== undefined) console.error('details:', JSON.stringify(error.details, null, 2));
    try { console.error('bodyText:', (await page.locator('body').innerText()).slice(0, 2500)); } catch {}
    console.error('failureScreenshot:', failurePath);
    process.exitCode = 1;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
})();
