const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.FABLEMAP_BASE_URL || 'http://127.0.0.1:8951';
const chromePath = process.env.PLAYWRIGHT_CHROME || '';
const resolvedBrowserExecutable = chromePath || chromium.executablePath();
const evidenceDir = path.resolve(__dirname, 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const ownerId = `owner-playwright-mainline-${runId}`;
const visitorId = `visitor-playwright-mainline-${runId}`;
const tavernName = `Playwright 主链路酒馆 ${runId}`;
const npcName = '验收店员';

function assert(condition, message, details) {
  if (!condition) {
    const error = new Error(message);
    if (details !== undefined) error.details = details;
    throw error;
  }
}

async function readJson(response, label) {
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (error) {
    throw new Error(`${label} returned non-JSON ${response.status()}: ${text.slice(0, 500)}`);
  }
  assert(response.ok(), `${label} failed with HTTP ${response.status()}`, payload);
  return payload;
}

(async () => {
  const launchOptions = {
    headless: true,
    args: ['--no-proxy-server'],
  };
  if (chromePath) {
    launchOptions.executablePath = chromePath;
  }
  const browser = await chromium.launch(launchOptions);

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const requestFailures = [];
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      consoleErrors.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on('pageerror', (error) => {
    consoleErrors.push({ type: 'pageerror', text: String(error) });
  });
  page.on('requestfailed', (request) => {
    requestFailures.push({ url: request.url(), failure: request.failure()?.errorText || 'unknown' });
  });

  const steps = [];
  const mark = (step, extra = {}) => steps.push({ step, ...extra });

  try {
    const health = await readJson(await page.request.get(`${baseUrl}/api/v1/health`), 'health');
    assert(health.ok === true || health.status === 'ok', 'health payload is not ok', health);
    mark('api_health_ok', { status: health.status || 'ok' });

    await page.goto(`${baseUrl}/create`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('form').waitFor({ state: 'visible', timeout: 15000 });
    mark('create_page_loaded', { url: page.url(), title: await page.title() });

    await page.locator('input[name="owner_id"]').fill(ownerId);
    await page.locator('input[name="lat"]').fill('31.230416');
    await page.locator('input[name="lon"]').fill('121.473701');
    await page.locator('input[name="address"]').fill('上海市黄浦区 Playwright 验收点');
    await page.locator('input[name="name"]').fill(tavernName);
    await page.locator('textarea[name="description"]').fill('一间挂在真实坐标上的小酒馆，用 Playwright 验收主链路。');
    await page.locator('textarea[name="scene_prompt"]').fill('雨夜、吧台灯和一块写着回访者名字的小黑板。');
    await page.locator('input[name="character_name"]').fill(npcName);
    await page.locator('input[name="character_description"]').fill('负责确认访客记忆和回访线索的店员。');
    await page.locator('input[name="first_mes"]').fill('欢迎光临，今晚我会把重要线索先记成待确认。');
    mark('create_form_filled', { ownerId, tavernName, npcName, lat: 31.230416, lon: 121.473701 });

    const beforeSubmit = path.join(evidenceDir, '01-create-form.png');
    await page.screenshot({ path: beforeSubmit, fullPage: true });

    await Promise.all([
      page.waitForURL(/\/tavern\/[^/]+$/, { timeout: 20000 }),
      page.locator('button[type="submit"]').click(),
    ]);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const tavernUrl = page.url();
    const tavernId = decodeURIComponent(new URL(tavernUrl).pathname.split('/').filter(Boolean).pop() || '');
    assert(tavernId, 'could not derive tavern id from URL', tavernUrl);
    mark('tavern_created_and_navigated', { tavernId, tavernUrl });

    await page.getByText(tavernName, { exact: false }).first().waitFor({ timeout: 15000 });
    const createdShot = path.join(evidenceDir, '02-tavern-created.png');
    await page.screenshot({ path: createdShot, fullPage: true });
    mark('tavern_page_visible', { screenshot: createdShot });

    const tavern = await readJson(
      await page.request.get(`${baseUrl}/api/v1/taverns/${encodeURIComponent(tavernId)}`, {
        headers: { 'X-User-Id': ownerId },
      }),
      'get_tavern',
    );
    assert(tavern.name === tavernName, 'created tavern name mismatch', tavern);
    assert(tavern.status === 'open', 'created tavern should be open via rules LLM config', tavern);
    assert(tavern.owner_id === ownerId, 'created tavern owner mismatch', tavern);
    assert(Number(tavern.lat) === 31.230416 && Number(tavern.lon) === 121.473701, 'created tavern coordinate mismatch', tavern);
    assert(Array.isArray(tavern.characters) && tavern.characters.length >= 1, 'created tavern has no NPC', tavern);
    const character = tavern.characters.find((item) => item.name === npcName) || tavern.characters[0];
    assert(character && character.id, 'could not resolve created NPC id', tavern.characters);
    mark('tavern_api_verified', { status: tavern.status, characterId: character.id });

    const enterPayload = await readJson(
      await page.request.post(`${baseUrl}/api/v1/taverns/${encodeURIComponent(tavernId)}/enter`, {
        headers: { 'X-User-Id': visitorId },
        data: { visitor_gender: 'unspecified' },
      }),
      'visitor_enter',
    );
    assert(enterPayload.ok === true, 'visitor enter ok flag mismatch', enterPayload);
    assert(enterPayload.visitor_state?.visitor_id === visitorId, 'visitor enter state id mismatch', enterPayload);
    assert(enterPayload.visitor_state?.visit_count === 1, 'first visit_count should be 1', enterPayload.visitor_state);
    mark('visitor_entered', { visitorId, visitCount: enterPayload.visitor_state.visit_count });

    const chatMessage = '我喜欢茉莉茶。今天我接下桥边委托，找到铜钥匙和旧照片线索。我答应下次带照片回来。';
    const chatPayload = await readJson(
      await page.request.post(`${baseUrl}/api/v1/taverns/${encodeURIComponent(tavernId)}/chat`, {
        headers: { 'X-User-Id': visitorId },
        data: {
          character_id: character.id,
          visitor_id: visitorId,
          visitor_name: '主链路旅人',
          message: chatMessage,
        },
      }),
      'visitor_chat',
    );
    assert(chatPayload.character_id === character.id, 'chat character id mismatch', chatPayload);
    assert(Boolean(chatPayload.response), 'chat should return assistant response', chatPayload);
    assert(chatPayload.degraded === false, 'rules LLM chat should not be degraded', chatPayload);
    assert(Array.isArray(chatPayload.created_memories) && chatPayload.created_memories.length > 0, 'chat did not create memory atoms', chatPayload);
    assert(Array.isArray(chatPayload.state_card_candidates) && chatPayload.state_card_candidates.length > 0, 'chat did not create state card candidates', chatPayload);
    mark('chat_completed_with_writeback', {
      responsePreview: String(chatPayload.response).slice(0, 80),
      createdMemories: chatPayload.created_memories.length,
      stateCardCandidates: chatPayload.state_card_candidates.length,
      relationshipStage: chatPayload.visitor_state?.relationship?.stage,
    });

    const history = await readJson(
      await page.request.get(
        `${baseUrl}/api/v1/taverns/${encodeURIComponent(tavernId)}/chat?visitor_id=${encodeURIComponent(visitorId)}&character_id=${encodeURIComponent(character.id)}`,
        { headers: { 'X-User-Id': visitorId } },
      ),
      'chat_history',
    );
    assert(Array.isArray(history.messages) && history.messages.length >= 2, 'chat history should contain user + assistant', history);
    assert(history.messages[0].content === chatMessage, 'chat history did not persist user message', history.messages);
    mark('chat_history_verified', { messageCount: history.messages.length });

    const memories = await readJson(
      await page.request.get(
        `${baseUrl}/api/v1/taverns/${encodeURIComponent(tavernId)}/memory-atoms?visitor_id=${encodeURIComponent(visitorId)}`,
        { headers: { 'X-User-Id': visitorId } },
      ),
      'memory_atoms',
    );
    assert(Array.isArray(memories.memory_atoms) && memories.memory_atoms.length > 0, 'memory atoms were not retrievable', memories);
    const memoryDimensions = [...new Set(memories.memory_atoms.map((item) => item.dimension).filter(Boolean))];
    assert(memoryDimensions.some((item) => ['preference', 'event', 'promise'].includes(item)), 'memory dimensions did not include expected mainline dimensions', memoryDimensions);
    mark('memory_atoms_verified', { count: memories.memory_atoms.length, dimensions: memoryDimensions });

    const cards = await readJson(
      await page.request.get(
        `${baseUrl}/api/v1/taverns/${encodeURIComponent(tavernId)}/state-cards?status=pending&visitor_id=${encodeURIComponent(visitorId)}`,
        { headers: { 'X-User-Id': visitorId } },
      ),
      'state_cards',
    );
    assert(Array.isArray(cards.state_cards) && cards.state_cards.length > 0, 'pending state cards were not retrievable', cards);
    const cardCategories = [...new Set(cards.state_cards.map((item) => item.category).filter(Boolean))];
    assert(['task', 'resource', 'event_log'].every((item) => cardCategories.includes(item)), 'state card categories missing expected continuity categories', cardCategories);
    mark('state_cards_verified', { count: cards.state_cards.length, categories: cardCategories });

    const revisit = await readJson(
      await page.request.post(`${baseUrl}/api/v1/taverns/${encodeURIComponent(tavernId)}/enter`, {
        headers: { 'X-User-Id': visitorId },
        data: {},
      }),
      'visitor_revisit',
    );
    assert(revisit.visitor_state?.visit_count === 2, 'revisit should increment visit_count to 2', revisit.visitor_state);
    mark('visitor_revisit_verified', { visitCount: revisit.visitor_state.visit_count, lastVisit: revisit.visitor_state.last_visit });

    const visitors = await readJson(
      await page.request.get(`${baseUrl}/api/v1/taverns/${encodeURIComponent(tavernId)}/visitors`, {
        headers: { 'X-User-Id': ownerId },
      }),
      'owner_visitors',
    );
    const visitorRow = Array.isArray(visitors.visitors)
      ? visitors.visitors.find((item) => item.visitor_id === visitorId)
      : null;
    assert(visitorRow, 'owner visitor list did not include returning visitor', visitors);
    assert(visitorRow.visit_count === 2, 'owner visitor row should show revisit count', visitorRow);
    assert(visitorRow.visitor_name === '主链路旅人', 'owner visitor row should show visitor name from chat', visitorRow);
    assert(visitorRow.message_count >= 2, 'owner visitor row should show persisted chat message count', visitorRow);
    mark('owner_revisit_feedback_verified', {
      visitorName: visitorRow.visitor_name,
      visitCount: visitorRow.visit_count,
      messageCount: visitorRow.message_count,
      relationshipStage: visitorRow.relationship?.stage,
    });

    await page.goto(`${baseUrl}/tavern/${encodeURIComponent(tavernId)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.getByText(tavernName, { exact: false }).first().waitFor({ timeout: 15000 });
    const revisitShot = path.join(evidenceDir, '03-revisit-visible.png');
    await page.screenshot({ path: revisitShot, fullPage: true });
    mark('revisit_page_visible', { screenshot: revisitShot });

    const report = {
      ok: true,
      baseUrl,
      browserExecutable: resolvedBrowserExecutable,
      runId,
      ownerId,
      visitorId,
      tavernId,
      tavernName,
      characterId: character.id,
      evidenceDir,
      screenshots: {
        createForm: beforeSubmit,
        tavernCreated: createdShot,
        revisitVisible: revisitShot,
      },
      writeback: {
        createdMemories: chatPayload.created_memories.length,
        memoryAtoms: memories.memory_atoms.length,
        stateCardCandidates: chatPayload.state_card_candidates.length,
        pendingStateCards: cards.state_cards.length,
      },
      revisit: {
        visitCount: revisit.visitor_state.visit_count,
        ownerVisitorMessageCount: visitorRow.message_count,
      },
      consoleSignals: {
        consoleErrors,
        requestFailures,
      },
      steps,
    };

    const reportPath = path.join(evidenceDir, 'mainline-report.json');
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const failurePath = path.join(evidenceDir, 'failure.png');
    try {
      await page.screenshot({ path: failurePath, fullPage: true });
    } catch {}
    console.error('PLAYWRIGHT_MAINLINE_FAILED');
    console.error(error.stack || error.message || String(error));
    if (error.details !== undefined) {
      console.error('details:', JSON.stringify(error.details, null, 2));
    }
    console.error('steps:', JSON.stringify(steps, null, 2));
    console.error('failureScreenshot:', failurePath);
    process.exitCode = 1;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
})();
