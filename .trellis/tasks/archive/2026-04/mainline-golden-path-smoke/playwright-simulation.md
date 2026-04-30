# Playwright Mainline Simulation

Date: 2026-04-30

## Commands

Install Playwright-managed Chromium through local proxy:

```powershell
$env:NO_PROXY='127.0.0.1,localhost'; $env:no_proxy='127.0.0.1,localhost'; $env:HTTP_PROXY='http://127.0.0.1:7890'; $env:HTTPS_PROXY='http://127.0.0.1:7890'; npx playwright install chromium
```

Backend:

```powershell
$env:PYTHONPATH = "$PWD\backend\src"
py -3 -m fablemap_api api --host 127.0.0.1 --port 8951 --output-root .trellis\tmp\playwright-mainline-api --no-open
```

Playwright rerun with the newly installed Playwright-managed Chromium:

```powershell
$env:NO_PROXY='127.0.0.1,localhost'; $env:no_proxy='127.0.0.1,localhost'; $env:HTTP_PROXY=''; $env:HTTPS_PROXY=''; $env:FABLEMAP_BASE_URL='http://127.0.0.1:8951'; Remove-Item Env:PLAYWRIGHT_CHROME -ErrorAction SilentlyContinue; node mainline-smoke.cjs
```

Run directory:

```text
.trellis/tmp/playwright-mainline
```

## Browser Runtime

- Root cause of earlier install failure: I cleared `HTTP_PROXY/HTTPS_PROXY`, so Playwright did not use the local proxy.
- With local proxy `http://127.0.0.1:7890`, `npx playwright install chromium` completed successfully.
- Final successful rerun used the newly installed Playwright-managed Chromium:
  - `C:\Users\phpxi\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`

## Result

Passed.

Simulated path:

1. Opened `/create` in a browser.
2. Filled owner, real coordinates, address, tavern content, first NPC, and first greeting.
3. Submitted the create form and landed on `/tavern/tavern_53e992f5a4f8`.
4. Verified tavern API state: `status=open`, owner matches the browser form owner, coordinates persisted, NPC persisted.
5. Entered as visitor `visitor-playwright-mainline-20260430034349`; first `visit_count=1`.
6. Sent one visitor message through the v1 chat API from the Playwright context.
7. Verified writeback:
   - chat response returned `createdMemories=6` and `stateCardCandidates=3`;
   - memory retrieval returned `memoryAtoms=4` with dimensions `promise`, `event`, `preference`;
   - pending state-card retrieval returned `pendingStateCards=3` with categories `task`, `resource`, `event_log`.
8. Re-entered as the same visitor; `visit_count=2`.
9. Owner visitor list showed visitor name `主链路旅人`, `visit_count=2`, `message_count=2`, relationship stage `acquaintance`.
10. Reopened the tavern page and captured the revisit-visible screenshot.

## Evidence

- Machine-readable report: `.trellis/tasks/archive/2026-04/mainline-golden-path-smoke/playwright-mainline-report.json`
- Runtime screenshots:
  - `.trellis/tmp/playwright-mainline/evidence/01-create-form.png`
  - `.trellis/tmp/playwright-mainline/evidence/02-tavern-created.png`
  - `.trellis/tmp/playwright-mainline/evidence/03-revisit-visible.png`

## Notes / Risks

- Final rerun reported no browser console errors and no request failures.
- `createdMemories` count is larger than retrieved persisted memory atoms because the retrieval returns persisted/deduped atoms; the verified product requirement is that retrievable visitor memory exists with expected dimensions, not one-to-one candidate count parity.
- The run used built frontend served by the backend at `http://127.0.0.1:8951`; no frontend source was modified.
