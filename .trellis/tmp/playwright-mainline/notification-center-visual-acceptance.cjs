const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.NOTIFICATION_CENTER_HARNESS_URL || 'http://127.0.0.1:5179';
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-notification-center-visual-acceptance');
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
  await page.getByText('通知中心').waitFor({ timeout: 15000 });
  await page.getByText('复用现有通知 API / WebSocket').waitFor({ timeout: 15000 });
  await page.getByText('不做营销推送或广告复活').waitFor({ timeout: 15000 });
  await page.getByText('店主侧').first().waitFor({ timeout: 15000 });
  await page.getByText('访客侧').first().waitFor({ timeout: 15000 });
  await page.getByText('新回访反馈').waitFor({ timeout: 15000 });
  await page.getByRole('button', { name: '未读' }).click();
  await page.getByText('新回访反馈').waitFor({ timeout: 15000 });
  await page.getByRole('button', { name: '访客侧' }).click();
  await page.getByRole('heading', { name: '探索完成' }).waitFor({ timeout: 15000 });
  const bodyText = await page.locator('body').innerText();
  assert(!bodyText.includes('营销群发'), 'should not show marketing-blast copy', bodyText);
  assert(!bodyText.includes('广告投放'), 'should not show ad delivery copy', bodyText);
  assert(!bodyText.includes('排行榜'), 'should not show ranking copy', bodyText);
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
    const desktop = await runViewport(page, { width: 1366, height: 940 }, 'notification-center-desktop.png');
    await page.getByRole('button', { name: '全部标记已读' }).click();
    await page.getByText('未读').first().waitFor({ timeout: 15000 });
    const mobile = await runViewport(page, { width: 390, height: 844 }, 'notification-center-mobile.png');
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
      checked: ['desktop notification center', 'mobile notification center', 'owner/visitor filters', 'unread filter', 'mark all action', 'no marketing/ranking copy', 'no overflow'],
    };
    const reportPath = path.join(evidenceDir, 'notification-center-visual-acceptance-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try { await page.screenshot({ path: failurePath, fullPage: true }); } catch {}
    console.error('NOTIFICATION_CENTER_VISUAL_ACCEPTANCE_FAILED');
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
