const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OWNER_DASHBOARD_URL || 'http://127.0.0.1:5183/owner';
const evidenceDir = path.resolve(__dirname, 'evidence', '04-29-owner-dashboard-presentational-mvp-visual-acceptance');
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
  await page.getByRole('heading', { name: '店主经营摘要' }).waitFor({ timeout: 15000 });
  await page.getByText('Operating feedback').waitFor({ timeout: 15000 });
  await page.getByRole('link', { name: /开店 \/ AI 草稿辅助/ }).waitFor({ timeout: 15000 });
  await page.getByRole('link', { name: /查看发现页入口/ }).waitFor({ timeout: 15000 });
  await page.getByText('通知入口').waitFor({ timeout: 15000 });
  await page.getByText('owner-visible notes').first().waitFor({ timeout: 15000 });
  await page.getByText('默认 AI').first().waitFor({ timeout: 15000 });
  if (expectMobileGuide) {
    await page.getByText('Mobile first-screen').waitFor({ timeout: 15000 });
    await page.getByText('先处理一个店主待办').waitFor({ timeout: 15000 });
    await page.getByRole('link', { name: '查看店主主线' }).waitFor({ timeout: 15000 });
  }
  const bodyText = await page.locator('body').innerText();
  assert(!bodyText.includes('api_key'), 'owner dashboard should not expose raw api_key', bodyText);
  assert(!bodyText.includes('API Key：'), 'owner dashboard should not display API key values', bodyText);
  assert(!bodyText.includes('排行榜'), 'owner dashboard should not show ranking loop', bodyText);
  assert(bodyText.includes('不是公开留言墙'), 'owner-visible feedback boundary should be explicit', bodyText);
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
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (text.includes('Failed to load resource') || text.includes('WebSocket error')) return;
    consoleSignals.push({ type: msg.type(), text });
  });
  page.on('pageerror', (error) => consoleSignals.push({ type: 'pageerror', text: String(error) }));
  page.on('requestfailed', (request) => { if (!request.url().includes('/api/')) requestFailures.push({ url: request.url(), failure: request.failure()?.errorText || 'unknown' }); });
  try {
    const desktop = await runViewport(page, { width: 1366, height: 900 }, 'owner-dashboard-desktop.png', false);
    const mobile = await runViewport(page, { width: 390, height: 844 }, 'owner-dashboard-mobile.png', true);
    assert(consoleSignals.length === 0, 'browser console/page errors detected', consoleSignals);
    assert(requestFailures.length === 0, 'non-api request failures detected', requestFailures);
    const report = { ok: true, baseUrl, evidenceDir, desktop, mobile, consoleSignals, requestFailures, checked: ['desktop owner summary', 'mobile owner guide', 'CTAs', 'owner-visible feedback boundary', 'safe LLM status', 'no overflow'] };
    const reportPath = path.join(evidenceDir, 'owner-dashboard-visual-acceptance-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try { await page.screenshot({ path: failurePath, fullPage: true }); } catch {}
    console.error('OWNER_DASHBOARD_VISUAL_ACCEPTANCE_FAILED');
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
