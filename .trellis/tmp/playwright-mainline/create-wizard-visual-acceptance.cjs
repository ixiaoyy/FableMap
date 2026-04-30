const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.CREATE_WIZARD_URL || 'http://127.0.0.1:5183/create';
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-create-tavern-step-wizard-visual-acceptance');
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
  await page.getByRole('heading', { name: '开一间真实坐标上的酒馆' }).waitFor({ timeout: 15000 });
  await page.getByLabel('创建酒馆分步向导').waitFor({ timeout: 15000 });
  await page.getByText('真实坐标优先').waitFor({ timeout: 15000 });
  await page.getByText('填写店主确认的酒馆内容').waitFor({ timeout: 15000 });
  await page.getByText('配置首个接待 NPC').waitFor({ timeout: 15000 });
  await page.getByText('店主确认后开门').first().waitFor({ timeout: 15000 });
  await page.getByText('AI 辅助草稿').waitFor({ timeout: 15000 });
  await page.getByText('AI 草稿只进入可编辑表单').waitFor({ timeout: 15000 });
  await page.getByRole('button', { name: /创建酒馆/ }).waitFor({ timeout: 15000 });
  if (expectMobileGuide) {
    await page.getByText('Mobile first-screen').waitFor({ timeout: 15000 });
    await page.getByText('先钉真实坐标，再填内容').waitFor({ timeout: 15000 });
    await page.getByRole('link', { name: '开始创建主线' }).waitFor({ timeout: 15000 });
  }
  const bodyText = await page.locator('body').innerText();
  assert(bodyText.includes('真实坐标'), 'real coordinate anchor should be visible', bodyText);
  assert(bodyText.includes('店主确认'), 'owner confirmation boundary should be visible', bodyText);
  assert(bodyText.includes('不会自动发布') || bodyText.includes('不会自动保存为公开内容'), 'create wizard should explicitly block auto-publication', bodyText);
  assert(!bodyText.includes('Token 充值'), 'create wizard should not show platform billing', bodyText);
  assert(bodyText.includes('不创建无锚点空间'), 'create wizard should explicitly reject anchorless spaces', bodyText);
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
    const desktop = await runViewport(page, { width: 1366, height: 900 }, 'create-wizard-desktop.png', false);
    const mobile = await runViewport(page, { width: 390, height: 844 }, 'create-wizard-mobile.png', true);
    assert(consoleSignals.length === 0, 'browser console/page errors detected', consoleSignals);
    assert(requestFailures.length === 0, 'non-api request failures detected', requestFailures);
    const report = { ok: true, baseUrl, evidenceDir, desktop, mobile, consoleSignals, requestFailures, checked: ['desktop create wizard', 'mobile create guide', 'stepper', 'AI draft owner-confirmed boundary', 'real coordinate anchor', 'no overflow'] };
    const reportPath = path.join(evidenceDir, 'create-wizard-visual-acceptance-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try { await page.screenshot({ path: failurePath, fullPage: true }); } catch {}
    console.error('CREATE_WIZARD_VISUAL_ACCEPTANCE_FAILED');
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
