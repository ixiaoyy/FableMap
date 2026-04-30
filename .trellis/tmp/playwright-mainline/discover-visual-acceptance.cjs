const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.FABLEMAP_BASE_URL || 'http://127.0.0.1:8951';
const evidenceDir = path.resolve(__dirname, 'evidence', '04-30-discover-visual-acceptance');
fs.mkdirSync(evidenceDir, { recursive: true });

const taverns = [
  {
    id: 'discover_public_cafe',
    name: '雨巷咖啡通讯站',
    description: '真实街角上的安静咖啡入口，店主留下了读书角和夜雨频道。',
    lat: 31.2304,
    lon: 121.4737,
    address: '上海市黄浦区雨巷 17 号',
    access: 'public',
    status: 'open',
    place_type: 'cafe',
    visit_count: 12,
    local_time_display: '21:30',
    is_open: true,
    characters: [
      { id: 'barista', name: '夜班咖啡师', tags: ['陪伴', '咖啡'] },
      { id: 'reader', name: '靠窗读者', tags: ['阅读'] },
    ],
  },
  {
    id: 'discover_password_tavern',
    name: '霓虹口令酒馆',
    description: '只有知道口令的人才能推开蓝色门帘。',
    lat: 31.2241,
    lon: 121.4812,
    address: '上海市黄浦区蓝门弄堂',
    access: 'password',
    status: 'open',
    place_type: 'tavern',
    visit_count: 3,
    local_time_display: '22:10',
    is_open: true,
    characters: [{ id: 'keeper', name: '灯牌酒保', tags: ['委托板'] }],
  },
  {
    id: 'discover_private_bookstore',
    name: '主人私藏旧书店',
    description: '主人只向被邀请的旅人打开书架后的门。',
    lat: 31.219,
    lon: 121.47,
    address: '上海市黄浦区旧书巷',
    access: 'private',
    status: 'open',
    place_type: 'bookstore',
    visit_count: 0,
    local_time_display: '20:05',
    is_open: true,
    characters: [],
  },
  {
    id: 'discover_closed_hospital',
    name: '深夜护士站回声',
    description: '护理陪伴入口暂时熄灯，只保留安全边界提示。',
    lat: 31.212,
    lon: 121.465,
    address: '上海市黄浦区安心路 8 号',
    access: 'public',
    status: 'closed',
    place_type: 'hospital',
    visit_count: 28,
    local_time_display: '02:15',
    is_open: false,
    characters: [{ id: 'nurse', name: '值夜护士', tags: ['公益', '护理'] }],
  },
];

function assert(condition, message, details) {
  if (!condition) {
    const error = new Error(message);
    if (details !== undefined) error.details = details;
    throw error;
  }
}

async function checkViewport(page, viewport, screenshotName) {
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/discover`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByText('附近坐标').first().waitFor({ timeout: 15000 });
  await page.getByText('公开入店').first().waitFor({ timeout: 15000 });
  await page.getByText('口令门扉').first().waitFor({ timeout: 15000 });
  await page.getByText('主人私域').first().waitFor({ timeout: 15000 });
  await page.getByText('今日熄灯').first().waitFor({ timeout: 15000 });

  const signalGrids = await page.locator('[aria-label="入店探索线索"]').count();
  assert(signalGrids >= 4, 'expected entry signal grids for discovery cards', { signalGrids });

  const rawAccessTexts = await page.locator('text=/\\b(password|private)\\b/i').count();
  assert(rawAccessTexts === 0, 'raw access enum leaked into discovery UI', { rawAccessTexts });

  const overflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(overflow.scrollWidth <= overflow.innerWidth + 2, 'page has horizontal overflow in viewport', overflow);

  const screenshotPath = path.join(evidenceDir, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return { screenshotPath, signalGrids, overflow };
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-proxy-server'] });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const consoleSignals = [];
  const requestFailures = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleSignals.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (error) => consoleSignals.push({ type: 'pageerror', text: String(error) }));
  page.on('requestfailed', (request) => requestFailures.push({ url: request.url(), failure: request.failure()?.errorText || 'unknown' }));

  await page.route('**/api/v1/taverns**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ taverns, count: taverns.length }),
    });
  });

  try {
    const desktop = await checkViewport(page, { width: 1440, height: 1100 }, 'discover-desktop.png');
    const mobile = await checkViewport(page, { width: 390, height: 844 }, 'discover-mobile.png');

    assert(consoleSignals.length === 0, 'browser console/page errors detected', consoleSignals);
    assert(requestFailures.length === 0, 'request failures detected', requestFailures);

    const report = {
      ok: true,
      baseUrl,
      route: '/discover',
      evidenceDir,
      mockTavernCount: taverns.length,
      desktop,
      mobile,
      consoleSignals,
      requestFailures,
      checkedStates: ['公开入店', '口令门扉', '主人私域', '今日熄灯', '入店探索线索'],
    };
    const reportPath = path.join(evidenceDir, 'discover-visual-acceptance-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try { await page.screenshot({ path: failurePath, fullPage: true }); } catch {}
    console.error('DISCOVER_VISUAL_ACCEPTANCE_FAILED');
    console.error(error.stack || error.message || String(error));
    if (error.details !== undefined) console.error('details:', JSON.stringify(error.details, null, 2));
    console.error('failureScreenshot:', failurePath);
    process.exitCode = 1;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
})();
