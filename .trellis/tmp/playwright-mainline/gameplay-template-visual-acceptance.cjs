const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.GAMEPLAY_TEMPLATE_HARNESS_URL || 'http://127.0.0.1:5177';
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-gameplay-template-visual-acceptance');
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

async function prepareRoutes(page, apiCalls) {
  await page.route('**/api/v1/taverns/gameplay_template_harness_tavern/gameplays', async (route) => {
    const request = route.request();
    const body = request.postDataJSON?.() || null;
    apiCalls.push({ method: request.method(), url: request.url(), body });
    if (request.method() === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({ ok: true, tavern_id: 'gameplay_template_harness_tavern', gameplays: body?.gameplays || [] }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ tavern_id: 'gameplay_template_harness_tavern', gameplays: [] }),
    });
  });
}

async function runTemplateFlow(page, viewport, screenshotName) {
  await page.setViewportSize(viewport);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByText('模板验收酒馆 · 玩法管理').waitFor({ timeout: 15000 });
  await page.getByText('玩法模板库').waitFor({ timeout: 15000 });
  await page.getByText('不含战斗、等级、装备、排行或交易奖励').waitFor({ timeout: 15000 });
  await page.getByPlaceholder('线索、回访、陪伴、物件...').fill('医院');
  await page.getByRole('button', { name: /街区善意清单/ }).click();
  await page.getByText('玩法模板已生成本地草稿').waitFor({ timeout: 15000 });
  await page.locator('input[value="街区善意清单"]').waitFor({ timeout: 15000 });
  await page.getByText('不使用战斗、等级、装备、排行榜或可交易奖励').waitFor({ timeout: 15000 });
  const overflowBeforeSave = await checkNoOverflow(page);
  const screenshotPath = path.join(evidenceDir, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await page.getByRole('button', { name: '保存玩法' }).click();
  await page.getByText('玩法已保存。published 对访客可见').waitFor({ timeout: 15000 });
  const overflowAfterSave = await checkNoOverflow(page);
  return { screenshotPath, overflowBeforeSave, overflowAfterSave };
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-proxy-server'] });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const consoleSignals = [];
  const requestFailures = [];
  const apiCalls = [];

  page.on('console', (msg) => { if (msg.type() === 'error') consoleSignals.push({ type: msg.type(), text: msg.text() }); });
  page.on('pageerror', (error) => consoleSignals.push({ type: 'pageerror', text: String(error) }));
  page.on('requestfailed', (request) => requestFailures.push({ url: request.url(), failure: request.failure()?.errorText || 'unknown' }));
  await prepareRoutes(page, apiCalls);

  try {
    const desktop = await runTemplateFlow(page, { width: 1366, height: 980 }, 'gameplay-template-desktop.png');
    const mobile = await runTemplateFlow(page, { width: 390, height: 844 }, 'gameplay-template-mobile.png');
    const putCalls = apiCalls.filter((call) => call.method === 'PUT');
    assert(putCalls.length === 2, 'save should reuse existing gameplay PUT endpoint in both viewports', apiCalls);
    for (const call of putCalls) {
      const gameplay = call.body?.gameplays?.[0];
      assert(gameplay?.status === 'draft', 'template should save as draft unless owner changes status', call.body);
      assert(Array.isArray(gameplay?.nodes) && gameplay.nodes.length >= 3, 'template should use GameplayDefinition nodes', call.body);
      const serialized = JSON.stringify(gameplay);
      assert(serialized.includes('不使用战斗、等级、装备、排行榜或可交易奖励'), 'template should carry forbidden non-RPG boundary', call.body);
      assert(!serialized.includes('可交易奖励系统'), 'template should not introduce tradable rewards', call.body);
    }
    assert(consoleSignals.length === 0, 'browser console/page errors detected', consoleSignals);
    assert(requestFailures.length === 0, 'request failures detected', requestFailures);

    const report = {
      ok: true,
      baseUrl,
      evidenceDir,
      desktop,
      mobile,
      apiCalls,
      consoleSignals,
      requestFailures,
      checked: ['desktop template library', 'mobile template library', 'owner-confirmed save', 'existing gameplays PUT', 'draft status', 'no RPG reward boundary', 'no overflow'],
    };
    const reportPath = path.join(evidenceDir, 'gameplay-template-visual-acceptance-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try { await page.screenshot({ path: failurePath, fullPage: true }); } catch {}
    console.error('GAMEPLAY_TEMPLATE_VISUAL_ACCEPTANCE_FAILED');
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
