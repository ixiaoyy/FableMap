# Hydration Error Reproduction Verification

Date: 2026-05-13
Task: `05-13-hydration-errors-reproduce`

## Scope

Checked the reported routes after reload:

- `/`
- `/discover`
- `/tavern/pw_lantern_helpdesk`

Checked two browser storage modes:

- fresh context
- `localStorage.fablemap-theme = light`

## Environment note

The shell has `HTTP_PROXY` / `HTTPS_PROXY` pointing at `127.0.0.1:7890`. Direct localhost checks initially returned `502 Bad Gateway` through that proxy. Reproduction commands therefore used `NO_PROXY=127.0.0.1,localhost` and Playwright Chromium `--no-proxy-server` to ensure requests hit local servers.

## Results

- `http://127.0.0.1:5173` React Router dev server: no console/page errors matching hydration, React #418, or React #423.
- `http://127.0.0.1:8950` backend-served frontend: no console/page errors matching hydration, React #418, or React #423.
- `http://127.0.0.1:5174` Vite preview from `frontend/build/client`: no console/page errors matching hydration, React #418, or React #423.
- `npm run build` in `frontend/` passed.

Condensed machine-readable summary: `evidence/hydration-console-summary.json`.

## Current conclusion

The reported React minified errors #418/#423 are not reproducible in the current workspace under dev, backend-served, or production-preview routes. Current React Router config is SPA mode (`ssr: false`), and the served HTML starts from the `HydrateFallback` shell rather than SSR route markup, which removes the usual SSR/client text mismatch path.

## Related observations / risks

- Backend logs showed `sqlalchemy.exc.TimeoutError: QueuePool limit ...` during repeated `/api/v1/taverns` calls in this local environment. This is a backend/database availability issue, not a React hydration signal, but it can degrade homepage/discover data during browser checks.
- `npm run start -- --host 127.0.0.1 --port 5174` failed because current React Router config is `ssr: false` and `react-router-serve ./build/server/index.js` cannot find a server entry. Production browser verification used `npx vite preview --host 127.0.0.1 --port 5174 --outDir build/client` instead.

## Remaining blocker

Need the exact failing browser/environment if the issue still appears for the user: URL, storage state, whether proxy/VPN/browser extension is enabled, and the full console stack/source bundle line.


