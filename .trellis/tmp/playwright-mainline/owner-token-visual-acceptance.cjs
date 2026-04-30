const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OWNER_TOKEN_HARNESS_URL || 'http://127.0.0.1:5178';
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-owner-token-status-visual-acceptance');
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
  await page.getByText('模型使用参考状态').waitFor({ timeout: 15000 });
  await page.getByText('不含充值、结算、抽成或访客可见账单').waitFor({ timeout: 15000 });
  await page.getByText('不展示 API Key').waitFor({ timeout: 15000 });
  await page.getByText('访客不可见账单').waitFor({ timeout: 15000 });
  await page.getByText('月台茶室').first().waitFor({ timeout: 15000 });
  await page.getByText('AI 已配置').first().waitFor({ timeout: 15000 });
  await page.getByText('待配置 AI').first().waitFor({ timeout: 15000 });
  const bodyText = await page.locator('body').innerText();
  assert(!bodyText.includes('sk-secret'), 'API key should not be visible', bodyText);
  assert(!bodyText.includes('sk-hidden'), 'API key should not be visible', bodyText);
  assert(!bodyText.includes('购买 Token'), 'should not show token purchase CTA', bodyText);
  assert(!bodyText.includes('结算中心'), 'should not show settlement center CTA', bodyText);
  assert(!bodyText.includes('平台抽成'), 'should not show platform cut wording outside boundary copy', bodyText);
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
    const desktop = await runViewport(page, { width: 1366, height: 900 }, 'owner-token-desktop.png');
    await page.getByRole('button', { name: 'AI 配置' }).first().click();
    await page.getByText('打开 AI 配置：tavern_high').waitFor({ timeout: 15000 });
    const mobile = await runViewport(page, { width: 390, height: 844 }, 'owner-token-mobile.png');
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
      checked: ['desktop owner token reference panel', 'mobile owner token reference panel', 'no API key visible', 'no billing/recharge CTA', 'AI config action uses tavern id', 'no overflow'],
    };
    const reportPath = path.join(evidenceDir, 'owner-token-visual-acceptance-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try { await page.screenshot({ path: failurePath, fullPage: true }); } catch {}
    console.error('OWNER_TOKEN_VISUAL_ACCEPTANCE_FAILED');
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
