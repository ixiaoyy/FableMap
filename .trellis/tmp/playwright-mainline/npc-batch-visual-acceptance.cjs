const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.NPC_BATCH_HARNESS_URL || 'http://127.0.0.1:5175';
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-npc-batch-visual-acceptance');
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

async function prepareRoutes(page, apiCalls) {
  let nextId = 1;
  await page.route('**/api/v1/taverns/npc_batch_harness_tavern/characters', async (route) => {
    const request = route.request();
    apiCalls.push({ method: request.method(), url: request.url(), body: request.postDataJSON?.() || null });
    if (request.method() !== 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({ characters: [], count: 0 }),
      });
      return;
    }
    const body = request.postDataJSON?.() || {};
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        id: `char_batch_${nextId++}`,
        tavern_id: 'npc_batch_harness_tavern',
        ...body,
      }),
    });
  });
}

async function runBatchFlow(page, viewport, screenshotName) {
  await page.setViewportSize(viewport);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByText('角色管理 — 批量验收酒馆').waitFor({ timeout: 15000 });
  await page.getByText('批量创建背景 NPC').waitFor({ timeout: 15000 });
  await page.getByText('不自动发布、不会覆盖已有角色').waitFor({ timeout: 15000 });

  await page.getByPlaceholder('夜班灯叔 | 调暗霓虹灯的背景店员 | 后勤, 低干扰').fill([
    '夜班灯叔 | 调暗霓虹灯的背景店员 | 后勤, 低干扰',
    '雨巷信使 | 送街区传闻 | 消息, 街区',
  ].join('\n'));
  await page.getByRole('button', { name: '预览批量清单' }).click();
  await page.getByText('2 个待确认 NPC').waitFor({ timeout: 15000 });
  await page.locator('.char-mgmt-batch-preview').getByText('夜班灯叔', { exact: true }).waitFor({ timeout: 15000 });
  await page.getByText('来自逐行文本草稿').waitFor({ timeout: 15000 });
  const overflowBeforeSave = await checkNoOverflow(page);

  await page.screenshot({ path: path.join(evidenceDir, screenshotName), fullPage: true });

  await page.getByRole('button', { name: '确认创建 2 个背景 NPC' }).click();
  await page.getByText('已由店主确认创建 2 个背景 NPC').waitFor({ timeout: 15000 });
  await page.getByText('可继续逐个编辑精修').waitFor({ timeout: 15000 });
  await page.getByText('3 个角色').waitFor({ timeout: 15000 });
  const overflowAfterSave = await checkNoOverflow(page);

  return { overflowBeforeSave, overflowAfterSave };
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-proxy-server'] });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const consoleSignals = [];
  const requestFailures = [];
  const apiCalls = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleSignals.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (error) => consoleSignals.push({ type: 'pageerror', text: String(error) }));
  page.on('requestfailed', (request) => requestFailures.push({ url: request.url(), failure: request.failure()?.errorText || 'unknown' }));

  await prepareRoutes(page, apiCalls);

  try {
    const desktop = await runBatchFlow(page, { width: 1366, height: 980 }, 'npc-batch-desktop-preview.png');
    const desktopSavedShot = path.join(evidenceDir, 'npc-batch-desktop-saved.png');
    await page.screenshot({ path: desktopSavedShot, fullPage: true });

    const mobile = await runBatchFlow(page, { width: 390, height: 844 }, 'npc-batch-mobile-preview.png');
    const mobileSavedShot = path.join(evidenceDir, 'npc-batch-mobile-saved.png');
    await page.screenshot({ path: mobileSavedShot, fullPage: true });

    assert(apiCalls.filter((call) => call.method === 'POST').length === 4, 'confirmed batch import did not call addCharacter once per preview item in both viewports', apiCalls);
    assert(apiCalls.every((call) => !call.body || !('draft_status' in call.body)), 'batch payload introduced draft persistence fields', apiCalls);
    assert(consoleSignals.length === 0, 'browser console/page errors detected', consoleSignals);
    assert(requestFailures.length === 0, 'request failures detected', requestFailures);

    const report = {
      ok: true,
      baseUrl,
      evidenceDir,
      desktop,
      mobile,
      desktopSavedShot,
      mobileSavedShot,
      apiCalls,
      consoleSignals,
      requestFailures,
      checked: [
        'desktop batch preview',
        'desktop owner-confirmed save',
        'mobile batch preview',
        'mobile owner-confirmed save',
        'existing addCharacter endpoint reuse',
        'no overflow',
        'no console/page/request failures',
      ],
    };
    const reportPath = path.join(evidenceDir, 'npc-batch-visual-acceptance-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try { await page.screenshot({ path: failurePath, fullPage: true }); } catch {}
    console.error('NPC_BATCH_VISUAL_ACCEPTANCE_FAILED');
    console.error(error.stack || error.message || String(error));
    if (error.details !== undefined) console.error('details:', JSON.stringify(error.details, null, 2));
    console.error('apiCalls:', JSON.stringify(apiCalls, null, 2));
    try { console.error('bodyText:', (await page.locator('body').innerText()).slice(0, 2500)); } catch {}
    console.error('failureScreenshot:', failurePath);
    process.exitCode = 1;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
})();
