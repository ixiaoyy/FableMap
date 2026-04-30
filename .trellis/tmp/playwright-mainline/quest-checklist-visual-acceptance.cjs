const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.QUEST_CHECKLIST_URL || 'http://127.0.0.1:5182/quests';
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-quest-exploration-checklist-visual-acceptance');
fs.mkdirSync(evidenceDir, { recursive: true });

function assert(condition, message, details) {
  if (!condition) {
    const error = new Error(message);
    if (details !== undefined) error.details = details;
    throw error;
  }
}

async function checkNoOverflow(page) {
  const overflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(overflow.scrollWidth <= overflow.innerWidth + 2, 'page has horizontal overflow', overflow);
  return overflow;
}

async function runViewport(page, viewport, screenshotName, expectMobileGuide) {
  await page.setViewportSize(viewport);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByText('FableMap').first().waitFor({ timeout: 15000 });
  await page.getByRole('heading', { name: '探索清单' }).waitFor({ timeout: 15000 });
  await page.getByText('Explorer checklist').waitFor({ timeout: 15000 });
  await page.getByText('不是传统 RPG 主线').waitFor({ timeout: 15000 });
  await page.getByText('不新增持久化清单 Schema').waitFor({ timeout: 15000 });
  await page.getByText('当前引导状态').waitFor({ timeout: 15000 });
  await page.getByText('待探索').waitFor({ timeout: 15000 });
  await page.getByRole('link', { name: /从发现页开始/ }).waitFor({ timeout: 15000 });
  await page.getByRole('link', { name: /创建自己的酒馆/ }).waitFor({ timeout: 15000 });
  if (expectMobileGuide) {
    await page.getByText('Mobile first-screen').waitFor({ timeout: 15000 });
    await page.getByText('先选一个安全探索项目').waitFor({ timeout: 15000 });
    await page.getByRole('link', { name: '查看探索清单' }).waitFor({ timeout: 15000 });
  }
  const bodyText = await page.locator('body').innerText();
  assert(bodyText.includes('探索清单'), 'checklist copy should be visible', bodyText);
  assert(!bodyText.includes('探索任务板'), 'old quest-board title should not be visible', bodyText);
  assert(!bodyText.includes('竞技排行榜'), 'ranking loop copy should not be visible', bodyText);
  assert(!bodyText.includes('装备奖励'), 'equipment reward copy should not be visible', bodyText);
  assert(!bodyText.includes('Token 充值'), 'billing copy should not be visible', bodyText);
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
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url.includes('/api/')) return;
    requestFailures.push({ url, failure: request.failure()?.errorText || 'unknown' });
  });

  try {
    const desktop = await runViewport(page, { width: 1366, height: 900 }, 'quest-checklist-desktop.png', false);
    const mobile = await runViewport(page, { width: 390, height: 844 }, 'quest-checklist-mobile.png', true);
    assert(consoleSignals.length === 0, 'browser console/page errors detected', consoleSignals);
    assert(requestFailures.length === 0, 'non-api request failures detected', requestFailures);
    const report = {
      ok: true,
      baseUrl,
      evidenceDir,
      desktop,
      mobile,
      consoleSignals,
      requestFailures,
      checked: ['desktop checklist route', 'mobile checklist guide', 'no old quest-board title', 'no RPG reward/ranking/billing copy', 'no overflow'],
    };
    const reportPath = path.join(evidenceDir, 'quest-checklist-visual-acceptance-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try { await page.screenshot({ path: failurePath, fullPage: true }); } catch {}
    console.error('QUEST_CHECKLIST_VISUAL_ACCEPTANCE_FAILED');
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
