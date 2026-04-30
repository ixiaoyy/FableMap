const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.OWNER_DIALOGUE_PREVIEW_HARNESS_URL || 'http://127.0.0.1:5176';
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-owner-dialogue-preview-visual-acceptance');
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

async function runPreviewFlow(page, viewport, screenshotName) {
  await page.setViewportSize(viewport);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByText('角色管理 — 对话预览酒馆').waitFor({ timeout: 15000 });
  await page.getByText('AI 对话预览模拟器').waitFor({ timeout: 15000 });
  await page.getByText('不调用 LLM，不写入聊天历史 / 记忆 / writeback').waitFor({ timeout: 15000 });
  await page.getByLabel('店主 AI 对话预览模拟器').getByLabel('模拟访客输入').fill('你还记得我上次说的蓝莓派吗？');
  await page.getByRole('button', { name: '生成本地预览' }).click();
  await page.getByText('preview_only: true').waitFor({ timeout: 15000 });
  await page.getByText('llm_called: false').waitFor({ timeout: 15000 });
  await page.getByText('history_written: false').waitFor({ timeout: 15000 });
  await page.getByText('writeback_written: false').waitFor({ timeout: 15000 });
  await page.getByText('本地模拟：不调用 LLM').waitFor({ timeout: 15000 });
  await page.getByText('不会写入 chat history').waitFor({ timeout: 15000 });
  await page.locator('.owner-dialogue-preview__bubble.is-assistant').getByText('阿柜').waitFor({ timeout: 15000 });
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
  const apiRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleSignals.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (error) => consoleSignals.push({ type: 'pageerror', text: String(error) }));
  page.on('requestfailed', (request) => requestFailures.push({ url: request.url(), failure: request.failure()?.errorText || 'unknown' }));
  page.on('request', (request) => {
    if (request.url().includes('/api/')) apiRequests.push({ method: request.method(), url: request.url() });
  });

  try {
    const desktop = await runPreviewFlow(page, { width: 1366, height: 980 }, 'owner-dialogue-preview-desktop.png');
    const mobile = await runPreviewFlow(page, { width: 390, height: 844 }, 'owner-dialogue-preview-mobile.png');

    assert(apiRequests.length === 0, 'local dialogue preview should not call chat/LLM APIs', apiRequests);
    assert(consoleSignals.length === 0, 'browser console/page errors detected', consoleSignals);
    assert(requestFailures.length === 0, 'request failures detected', requestFailures);

    const report = {
      ok: true,
      baseUrl,
      evidenceDir,
      desktop,
      mobile,
      apiRequests,
      consoleSignals,
      requestFailures,
      checked: [
        'desktop owner dialogue preview simulator',
        'mobile owner dialogue preview simulator',
        'preview_only/no LLM/no history/no writeback flags',
        'no API requests',
        'no overflow',
        'no console/page/request failures',
      ],
    };
    const reportPath = path.join(evidenceDir, 'owner-dialogue-preview-visual-acceptance-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try { await page.screenshot({ path: failurePath, fullPage: true }); } catch {}
    console.error('OWNER_DIALOGUE_PREVIEW_VISUAL_ACCEPTANCE_FAILED');
    console.error(error.stack || error.message || String(error));
    if (error.details !== undefined) console.error('details:', JSON.stringify(error.details, null, 2));
    console.error('apiRequests:', JSON.stringify(apiRequests, null, 2));
    try { console.error('bodyText:', (await page.locator('body').innerText()).slice(0, 2500)); } catch {}
    console.error('failureScreenshot:', failurePath);
    process.exitCode = 1;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
})();
