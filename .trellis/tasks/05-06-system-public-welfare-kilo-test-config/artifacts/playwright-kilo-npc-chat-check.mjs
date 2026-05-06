import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../../../");
const frontendPackage = path.join(repoRoot, "frontend", "package.json");
const require = createRequire(frontendPackage);
const { chromium } = require("playwright");

const artifactDir = __dirname;
const baseUrl = process.env.FABLEMAP_BASE_URL || "http://127.0.0.1:8952";
const tavernId = "pw_lantern_helpdesk";
const visitorId = `playwright-kilo-ui-${Date.now()}`;
const npcName = "小舟";
const message = "请只回复这句话：Playwright-Kilo-UI-通了。";
const targetNeedle = "Playwright-Kilo-UI-通了";
const desktopScreenshot = path.join(artifactDir, "kilo-npc-chat-desktop.png");
const mobileScreenshot = path.join(artifactDir, "kilo-npc-chat-mobile.png");
const reportPath = path.join(artifactDir, "playwright-kilo-npc-chat-report.json");

function compactFailure(req) {
  const failure = req.failure();
  return { url: req.url(), method: req.method(), errorText: failure?.errorText || "" };
}

async function runDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 920 }, locale: "zh-CN" });
  const page = await context.newPage();
  const consoleErrors = [];
  const requestFailures = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("requestfailed", (req) => {
    const url = req.url();
    if (!url.startsWith(baseUrl)) return;
    requestFailures.push(compactFailure(req));
  });

  const url = `${baseUrl}/tavern/${encodeURIComponent(tavernId)}?visitor_id=${encodeURIComponent(visitorId)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.locator('[data-chat-workbench="sillytavern-style"]').waitFor({ state: "visible", timeout: 30000 });
  await page.getByRole("heading", { name: "公益·灯塔问讯台" }).waitFor({ state: "visible", timeout: 30000 });

  const npcButtons = page.locator('aside[aria-label="NPC 角色列表"] button').filter({ hasText: npcName });
  const npcButtonCount = await npcButtons.count();
  if (npcButtonCount < 1) throw new Error(`未找到 NPC 按钮：${npcName}`);
  await npcButtons.first().click();
  await page.locator('[data-current-npc-stage-card]').getByRole("heading", { name: npcName }).waitFor({ state: "visible", timeout: 10000 });

  const composer = page.locator('[data-chat-composer="fast-entry"]');
  const input = composer.getByPlaceholder("Type a message，按 Enter 发送；Shift+Enter 换行");
  await input.waitFor({ state: "visible", timeout: 10000 });
  await input.fill(message);

  const sendButton = composer.getByRole("button", { name: "发送" });
  const chatResponsePromise = page.waitForResponse(
    (response) => response.url().includes(`/api/v1/taverns/${tavernId}/chat`) && response.request().method() === "POST",
    { timeout: 90000 },
  );
  await sendButton.click();
  const chatResponse = await chatResponsePromise;
  const chatPayload = await chatResponse.json();
  const responseText = String(chatPayload.response || "").trim();
  if (!chatResponse.ok()) throw new Error(`聊天接口 HTTP ${chatResponse.status()}: ${responseText || JSON.stringify(chatPayload).slice(0, 200)}`);
  if (!responseText) throw new Error("聊天接口没有返回 response 文本");

  await page.locator('[data-chat-log-compact]').getByText(responseText, { exact: true }).waitFor({ state: "visible", timeout: 30000 });
  await page.screenshot({ path: desktopScreenshot, fullPage: true });

  const title = await page.locator("h1").first().innerText();
  await context.close();
  return {
    url,
    title,
    npcName,
    message,
    apiStatus: chatResponse.status(),
    responseText,
    degraded: Boolean(chatPayload.degraded),
    degradation: chatPayload.degradation || null,
    tavernStatus: chatPayload.tavern_status || null,
    characterName: chatPayload.character_name || null,
    consoleErrors,
    requestFailures,
  };
}

async function runMobile(browser, responseText) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, locale: "zh-CN" });
  const page = await context.newPage();
  const url = `${baseUrl}/tavern/${encodeURIComponent(tavernId)}?visitor_id=${encodeURIComponent(visitorId)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.locator('[data-chat-workbench="sillytavern-style"]').waitFor({ state: "visible", timeout: 30000 });
  await page.locator('[data-chat-log-compact]').getByText(responseText, { exact: true }).waitFor({ state: "visible", timeout: 30000 });
  await page.screenshot({ path: mobileScreenshot, fullPage: true });
  await context.close();
  return { url };
}

const browser = await chromium.launch({ headless: true, args: ["--no-proxy-server"] });
try {
  const desktop = await runDesktop(browser);
  const mobile = await runMobile(browser, desktop.responseText);
  const report = {
    ok: true,
    checkedAt: new Date().toISOString(),
    baseUrl,
    tavernId,
    visitorId,
    desktop,
    mobile,
    screenshots: {
      desktop: desktopScreenshot,
      mobile: mobileScreenshot,
    },
  };
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({
    ok: true,
    reportPath,
    desktopScreenshot,
    mobileScreenshot,
    tavernStatus: desktop.tavernStatus,
    degraded: desktop.degraded,
    characterName: desktop.characterName,
    responsePrefix: desktop.responseText.slice(0, 160),
    consoleErrorCount: desktop.consoleErrors.length,
    requestFailureCount: desktop.requestFailures.length,
  }, null, 2));
} finally {
  await browser.close();
}

