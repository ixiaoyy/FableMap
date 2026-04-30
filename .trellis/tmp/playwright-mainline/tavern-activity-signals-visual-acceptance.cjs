const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.TAVERN_ACTIVITY_HARNESS_URL || 'http://127.0.0.1:5181';
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-tavern-activity-signals-visual-acceptance');
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

async function runViewport(page, viewport, screenshotName) {
  await page.setViewportSize(viewport);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByText('酒馆活性信号').waitFor({ timeout: 15000 });
  await page.getByText('Activity without social graph').waitFor({ timeout: 15000 });
  await page.getByText('到访热度').waitFor({ timeout: 15000 });
  await page.getByText('24 次').waitFor({ timeout: 15000 });
  await page.getByText('环境传闻', { exact: true }).waitFor({ timeout: 15000 });
  await page.getByText('店主可见').waitFor({ timeout: 15000 });
  await page.getByText('无公开访客墙').waitFor({ timeout: 15000 });
  await page.getByText('无全局社交图谱').waitFor({ timeout: 15000 });
  const bodyText = await page.locator('body').innerText();
  assert(!bodyText.includes('关注按钮'), 'should not show follow UI', bodyText);
  assert(!bodyText.includes('加好友'), 'should not show friend UI', bodyText);
  assert(!bodyText.includes('发送私信'), 'should not show DM UI', bodyText);
  assert(!bodyText.includes('排行榜'), 'should not show ranking UI', bodyText);
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
    const desktop = await runViewport(page, { width: 1366, height: 900 }, 'tavern-activity-desktop.png');
    const mobile = await runViewport(page, { width: 390, height: 844 }, 'tavern-activity-mobile.png');
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
      checked: ['desktop activity signals card', 'mobile activity signals card', 'aggregate visits', 'rumor/feedback boundaries', 'no social UI', 'no overflow'],
    };
    const reportPath = path.join(evidenceDir, 'tavern-activity-signals-visual-acceptance-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try { await page.screenshot({ path: failurePath, fullPage: true }); } catch {}
    console.error('TAVERN_ACTIVITY_SIGNALS_VISUAL_ACCEPTANCE_FAILED');
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
