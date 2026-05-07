import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const workspace = "D:/work/ai-";
const outDir = path.join(workspace, "artifacts", "playwright-self-check", "2026-05-07-page-check");
const require = createRequire(path.join(workspace, "frontend", "package.json"));
const { chromium } = require("playwright");

const baseUrl = "http://127.0.0.1:8950";
const seedRoutes = ["/", "/discover", "/create", "/owner", "/notifications", "/quests", "/home/me"];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const badTextPattern = /(Application Error|Hydration failed|ReferenceError|TypeError|Unhandled Runtime Error|Cannot GET|404 Not Found|502 Bad Gateway|加载失败|请求失败|发生错误|出错了)/i;
const forbiddenCopyPattern = /(公益|官方)/;

function safeName(route) {
  return route === "/" ? "home" : route.replace(/^\//, "").replace(/[/?#&=:]+/g, "-").replace(/-$/g, "") || "home";
}

async function ensureOutDir() {
  await mkdir(outDir, { recursive: true });
}

async function sha256(fileBytes) {
  return crypto.createHash("sha256").update(fileBytes).digest("hex");
}

async function collectDynamicRoutes(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  try {
    await page.goto(`${baseUrl}/discover`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    const hrefs = await page.locator('a[href^="/tavern/"]').evaluateAll((links) => Array.from(new Set(links.map((a) => a.getAttribute("href")).filter(Boolean))));
    const tavern = hrefs.find((href) => !href.includes("/manage"));
    const manage = hrefs.find((href) => href.includes("/manage"));
    return [tavern, manage].filter(Boolean).slice(0, 2);
  } catch (error) {
    return [{ route: null, dynamicError: String(error?.message || error) }];
  } finally {
    await context.close();
  }
}

async function checkRoute(browser, route, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    ignoreHTTPSErrors: true,
    deviceScaleFactor: viewport.name === "mobile" ? 2 : 1,
    isMobile: viewport.name === "mobile",
    hasTouch: viewport.name === "mobile",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);

  const consoleMessages = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];

  page.on("console", (msg) => {
    if (["error", "warning", "warn"].includes(msg.type())) {
      consoleMessages.push({ type: msg.type(), text: msg.text().slice(0, 1000) });
    }
  });
  page.on("pageerror", (err) => {
    pageErrors.push(String(err?.stack || err?.message || err).slice(0, 1500));
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (!url.includes("favicon")) {
      failedRequests.push({ url, method: request.method(), resourceType: request.resourceType(), failure: request.failure()?.errorText || "unknown" });
    }
  });
  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes("favicon")) {
      badResponses.push({ status, url, resourceType: response.request().resourceType() });
    }
  });

  const url = `${baseUrl}${route}`;
  let gotoError = null;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 7000 }).catch(() => {});
  } catch (error) {
    gotoError = String(error?.message || error);
  }

  const metrics = await page.evaluate(({ badTextPatternSource, forbiddenCopyPatternSource }) => {
    const pattern = new RegExp(badTextPatternSource, "i");
    const forbiddenPattern = new RegExp(forbiddenCopyPatternSource, "g");
    const doc = document.documentElement;
    const body = document.body;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const text = (body?.innerText || "").replace(/\s+/g, " ").trim();
    const overflowElements = Array.from(document.querySelectorAll("body *"))
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || "",
          className: typeof el.className === "string" ? el.className.slice(0, 140) : "",
          text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          display: style.display,
          position: style.position,
        };
      })
      .filter((item) => item.width > 1 && item.display !== "none" && (item.right > viewportWidth + 2 || item.left < -2))
      .slice(0, 10);
    const brokenImages = Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0 && !img.currentSrc.includes("data:"))
      .map((img) => ({ src: img.currentSrc || img.src, alt: img.alt || "", className: img.className || "" }))
      .slice(0, 10);
    const visibleLinks = Array.from(document.querySelectorAll("a[href]"))
      .filter((a) => {
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .length;
    const visibleButtons = Array.from(document.querySelectorAll("button"))
      .filter((a) => {
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .length;
    return {
      title: document.title,
      location: window.location.href,
      viewportWidth,
      viewportHeight,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      horizontalOverflowPx: Math.max(0, doc.scrollWidth - doc.clientWidth),
      scrollHeight: doc.scrollHeight,
      textLength: text.length,
      textSample: text.slice(0, 700),
      hasBadText: pattern.test(text),
      hasForbiddenCopy: forbiddenPattern.test(text),
      forbiddenCopyMatches: Array.from(new Set(text.match(forbiddenPattern) || [])),
      overflowElements,
      brokenImages,
      visibleLinks,
      visibleButtons,
    };
  }, { badTextPatternSource: badTextPattern.source, forbiddenCopyPatternSource: forbiddenCopyPattern.source });

  const screenshotRel = `${viewport.name}-${safeName(route)}.png`;
  const screenshotPath = path.join(outDir, screenshotRel);
  const bytes = await page.screenshot({ path: screenshotPath, fullPage: true });
  const screenshotSha256 = await sha256(bytes);

  await context.close();

  const issues = [];
  if (gotoError) issues.push({ severity: "error", kind: "navigation", message: gotoError });
  if (pageErrors.length) issues.push({ severity: "error", kind: "pageerror", message: pageErrors.join("\n") });
  if (failedRequests.length) issues.push({ severity: "error", kind: "requestfailed", message: JSON.stringify(failedRequests, null, 2) });
  const badNonDocumentResponses = badResponses.filter((r) => !r.url.endsWith("/api/health"));
  if (badNonDocumentResponses.length) issues.push({ severity: "error", kind: "bad-response", message: JSON.stringify(badNonDocumentResponses, null, 2) });
  const severeConsole = consoleMessages.filter((m) => m.type === "error");
  if (severeConsole.length) issues.push({ severity: "error", kind: "console-error", message: JSON.stringify(severeConsole, null, 2) });
  if (metrics.hasBadText) issues.push({ severity: "warning", kind: "bad-text", message: "页面出现错误/失败相关文案，请人工确认是否为预期空态。" });
  if (metrics.hasForbiddenCopy) issues.push({ severity: "error", kind: "forbidden-copy", message: `页面仍出现不想展示的文案：${metrics.forbiddenCopyMatches.join(", ")}` });
  if (metrics.brokenImages.length) issues.push({ severity: "error", kind: "broken-image", message: JSON.stringify(metrics.brokenImages, null, 2) });
  if (metrics.horizontalOverflowPx > 2) issues.push({ severity: "warning", kind: "horizontal-overflow", message: `document width overflow ${metrics.horizontalOverflowPx}px`, details: metrics.overflowElements });
  if (metrics.textLength < 80) issues.push({ severity: "warning", kind: "low-content", message: `页面文本过少 textLength=${metrics.textLength}` });

  return {
    route,
    viewport: viewport.name,
    url,
    screenshot: screenshotPath,
    screenshotSha256,
    consoleMessages,
    pageErrors,
    failedRequests,
    badResponses,
    metrics,
    issues,
  };
}

async function main() {
  await ensureOutDir();
  const browser = await chromium.launch({ headless: true, args: ["--no-proxy-server"] });
  const dynamicRoutes = await collectDynamicRoutes(browser);
  const dynamicErrors = dynamicRoutes.filter((entry) => typeof entry === "object" && entry?.dynamicError);
  const extraRoutes = dynamicRoutes.filter((entry) => typeof entry === "string");
  const routes = Array.from(new Set([...seedRoutes, ...extraRoutes]));
  const results = [];
  for (const viewport of viewports) {
    for (const route of routes) {
      results.push(await checkRoute(browser, route, viewport));
    }
  }
  await browser.close();

  const allIssues = results.flatMap((result) => result.issues.map((issue) => ({ route: result.route, viewport: result.viewport, screenshot: result.screenshot, ...issue })));
  const summary = {
    checkedAt: new Date().toISOString(),
    baseUrl,
    routes,
    viewports,
    dynamicErrors,
    totals: {
      pages: results.length,
      issues: allIssues.length,
      errors: allIssues.filter((i) => i.severity === "error").length,
      warnings: allIssues.filter((i) => i.severity === "warning").length,
    },
    issues: allIssues,
    results,
  };

  await writeFile(path.join(outDir, "report.json"), JSON.stringify(summary, null, 2), "utf8");

  const md = [
    "# FableMap Playwright 页面自查报告",
    "",
    `- 时间：${summary.checkedAt}`,
    `- 入口：${baseUrl}/`,
    `- 视口：${viewports.map((v) => `${v.name} ${v.width}x${v.height}`).join(", ")}`,
    `- 页面数：${results.length}`,
    `- 问题：${summary.totals.errors} error / ${summary.totals.warnings} warning`,
    "",
    "## Routes",
    ...routes.map((route) => `- ${route}`),
    "",
    "## Issues",
    ...(allIssues.length
      ? allIssues.map((issue) => `- **${issue.severity.toUpperCase()}** ${issue.viewport} ${issue.route} ${issue.kind}: ${String(issue.message).replace(/\n/g, " ").slice(0, 500)}\n  - screenshot: ${issue.screenshot}`)
      : ["- 未发现自动化可判定的 console/pageerror/坏请求/坏图/横向溢出问题。"]),
    "",
    "## Screenshots",
    ...results.map((result) => `- ${result.viewport} ${result.route}: ${result.screenshot} (${result.metrics.viewportWidth}x${result.metrics.viewportHeight}, sha256 ${result.screenshotSha256.slice(0, 16)}…)`),
    "",
  ].join("\n");
  await writeFile(path.join(outDir, "report.md"), md, "utf8");
  console.log(JSON.stringify({ outDir, report: path.join(outDir, "report.md"), totals: summary.totals, routes }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
