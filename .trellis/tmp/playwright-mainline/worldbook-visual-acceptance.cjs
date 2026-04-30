const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.WORLDBOOK_HARNESS_URL || 'http://127.0.0.1:5174';
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-worldbook-visual-acceptance');
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

async function captureViewport(page, viewport, name) {
  await page.setViewportSize(viewport);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByText('正在加载世界书').first().waitFor({ timeout: 15000 });
  await page.getByText('毕业照').first().waitFor({ timeout: 15000 });
  await page.getByText('Ctrl/⌘+S 保存').first().waitFor({ timeout: 15000 });
  await page.getByText('2 条设定').first().waitFor({ timeout: 15000 });
  await page.getByText('常驻').first().waitFor({ timeout: 15000 });
  const overflow = await checkNoOverflow(page);
  const screenshotPath = path.join(evidenceDir, name);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return { screenshotPath, overflow };
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

  await page.route('**/api/v1/taverns/worldbook_harness_tavern/world-info/test', async (route) => {
    apiCalls.push({ method: route.request().method(), url: route.request().url(), kind: 'test' });
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        tavern_id: 'worldbook_harness_tavern',
        message: '刘大爷，我想看毕业照。',
        entry_count: 2,
        matched_count: 1,
        matches: [],
        entries: [
          {
            id: 'wi_photo_wall',
            title: '毕业照',
            matched: true,
            status: 'matched',
            matched_keys: ['毕业照'],
            matched_secondary_keys: ['刘大爷'],
            order: 100,
            depth: 4,
          },
          {
            id: 'wi_tavern_rules',
            title: '常驻设定',
            matched: false,
            status: 'not_matched',
            matched_keys: [],
            matched_secondary_keys: [],
            constant: true,
            order: 10,
            depth: 2,
          },
        ],
        scanned_recent_count: 0,
        include_tavern_context: false,
      }),
    });
  });

  await page.route('**/api/v1/taverns/worldbook_harness_tavern', async (route) => {
    apiCalls.push({ method: route.request().method(), url: route.request().url(), kind: 'save' });
    const requestBody = route.request().postDataJSON?.() || {};
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        id: 'worldbook_harness_tavern',
        name: '世界书验收酒馆',
        owner_id: 'owner-demo',
        world_info: requestBody.world_info || [],
      }),
    });
  });

  try {
    const desktop = await captureViewport(page, { width: 1366, height: 980 }, 'worldbook-desktop.png');
    const mobile = await captureViewport(page, { width: 390, height: 844 }, 'worldbook-mobile.png');

    await page.setViewportSize({ width: 1366, height: 980 });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.getByText('毕业照').first().waitFor({ timeout: 15000 });

    await page.getByPlaceholder('例如：刘大爷，我想看毕业照。').fill('刘大爷，我想看毕业照。');
    await page.keyboard.press('Control+Enter');
    await page.getByText('1 / 2 条命中').first().waitFor({ timeout: 15000 });
    await page.getByText('命中词：毕业照、刘大爷').first().waitFor({ timeout: 15000 });

    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true })));
    await page.getByText('世界书已保存。').first().waitFor({ timeout: 15000 });

    assert(apiCalls.some((call) => call.kind === 'test'), 'Ctrl+Enter did not call WorldInfo test endpoint', apiCalls);
    assert(apiCalls.some((call) => call.kind === 'save'), 'Ctrl+S did not call tavern save endpoint', apiCalls);
    assert(consoleSignals.length === 0, 'browser console/page errors detected', consoleSignals);
    assert(requestFailures.length === 0, 'request failures detected', requestFailures);

    const interactionShot = path.join(evidenceDir, 'worldbook-shortcuts.png');
    await page.screenshot({ path: interactionShot, fullPage: true });

    const report = {
      ok: true,
      baseUrl,
      evidenceDir,
      desktop,
      mobile,
      interactionShot,
      apiCalls,
      consoleSignals,
      requestFailures,
      checked: ['loading state', 'desktop layout', 'mobile layout', 'Ctrl+Enter test', 'Ctrl+S save', 'no overflow'],
    };
    const reportPath = path.join(evidenceDir, 'worldbook-visual-acceptance-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try { await page.screenshot({ path: failurePath, fullPage: true }); } catch {}
    console.error('WORLDBOOK_VISUAL_ACCEPTANCE_FAILED');
    console.error(error.stack || error.message || String(error));
    if (error.details !== undefined) console.error('details:', JSON.stringify(error.details, null, 2));
    console.error('apiCalls:', JSON.stringify(apiCalls, null, 2));
    try { console.error('bodyText:', (await page.locator('body').innerText()).slice(0, 2000)); } catch {}
    console.error('failureScreenshot:', failurePath);
    process.exitCode = 1;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
})();
