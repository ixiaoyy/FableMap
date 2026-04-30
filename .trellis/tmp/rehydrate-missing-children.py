import json
from pathlib import Path

def update_task(path, id_, title, notes, related_extra, meta_extra):
    p = Path(path) / 'task.json'
    data = json.loads(p.read_text(encoding='utf-8'))
    data['id'] = id_
    data['name'] = id_
    data['title'] = title
    data['status'] = 'completed'
    data['parent'] = '04-28-new-features-brainstorm'
    data['completedAt'] = data.get('completedAt') or '2026-04-30'
    data['current_phase'] = 6
    files = list(data.get('relatedFiles') or [])
    for item in related_extra:
        if item not in files:
            files.append(item)
    data['relatedFiles'] = files
    data['notes'] = notes
    meta = data.get('meta') or {}
    meta.update(meta_extra)
    data['meta'] = meta
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

update_task(
    '.trellis/tasks/04-29-04-29-owner-dashboard-presentational-mvp',
    '04-29-04-29-owner-dashboard-presentational-mvp',
    'Owner Dashboard Presentational MVP',
    'Rehydrated from archived completed task to restore parent-child tracking; current /owner surface was re-verified with tests/build and Playwright desktop/mobile self-acceptance.',
    [
        '.trellis/tmp/playwright-mainline/owner-dashboard-visual-acceptance.cjs',
        '.trellis/tmp/playwright-mainline/evidence/04-29-owner-dashboard-presentational-mvp-visual-acceptance/owner-dashboard-desktop.png',
        '.trellis/tmp/playwright-mainline/evidence/04-29-owner-dashboard-presentational-mvp-visual-acceptance/owner-dashboard-mobile.png',
        '.trellis/tmp/playwright-mainline/evidence/04-29-owner-dashboard-presentational-mvp-visual-acceptance/owner-dashboard-visual-acceptance-report.json',
    ],
    {
        'rehydrated_from_archive': '.trellis/tasks/archive/2026-04/04-29-owner-dashboard-presentational-mvp',
        'playwright_evidence': [
            '.trellis/tmp/playwright-mainline/evidence/04-29-owner-dashboard-presentational-mvp-visual-acceptance/owner-dashboard-desktop.png',
            '.trellis/tmp/playwright-mainline/evidence/04-29-owner-dashboard-presentational-mvp-visual-acceptance/owner-dashboard-mobile.png',
            '.trellis/tmp/playwright-mainline/evidence/04-29-owner-dashboard-presentational-mvp-visual-acceptance/owner-dashboard-visual-acceptance-report.json',
        ],
        'verification': [
            'node .\\frontend\\scripts\\owner-summary-test.mjs (covered by npm test; passed)',
            'node .\\frontend\\scripts\\owner-dashboard-layout-test.mjs (covered by npm test; passed)',
            'npm --prefix .\\frontend run typecheck (passed)',
            'npm --prefix .\\frontend run build (passed)',
            'npm --prefix .\\frontend test (passed)',
            "$env:OWNER_DASHBOARD_URL='http://127.0.0.1:5183/owner'; node .\\.trellis\\tmp\\playwright-mainline\\owner-dashboard-visual-acceptance.cjs (passed)",
        ],
    },
)

update_task(
    '.trellis/tasks/04-30-create-tavern-step-wizard-mvp',
    '04-30-create-tavern-step-wizard-mvp',
    'Create Tavern Step-by-step Wizard MVP',
    'Rehydrated from archived completed task to restore parent-child tracking; current /create wizard was re-verified with tests/build and Playwright desktop/mobile self-acceptance.',
    [
        '.trellis/tmp/playwright-mainline/create-wizard-visual-acceptance.cjs',
        '.trellis/tmp/playwright-mainline/evidence/04-30-create-tavern-step-wizard-visual-acceptance/create-wizard-desktop.png',
        '.trellis/tmp/playwright-mainline/evidence/04-30-create-tavern-step-wizard-visual-acceptance/create-wizard-mobile.png',
        '.trellis/tmp/playwright-mainline/evidence/04-30-create-tavern-step-wizard-visual-acceptance/create-wizard-visual-acceptance-report.json',
    ],
    {
        'rehydrated_from_archive': '.trellis/tasks/archive/2026-04/create-tavern-step-wizard-mvp',
        'playwright_evidence': [
            '.trellis/tmp/playwright-mainline/evidence/04-30-create-tavern-step-wizard-visual-acceptance/create-wizard-desktop.png',
            '.trellis/tmp/playwright-mainline/evidence/04-30-create-tavern-step-wizard-visual-acceptance/create-wizard-mobile.png',
            '.trellis/tmp/playwright-mainline/evidence/04-30-create-tavern-step-wizard-visual-acceptance/create-wizard-visual-acceptance-report.json',
        ],
        'verification': [
            'node .\\frontend\\scripts\\create-wizard-route-test.mjs (covered by npm test; passed)',
            'npm --prefix .\\frontend run typecheck (passed)',
            'npm --prefix .\\frontend run build (passed)',
            'npm --prefix .\\frontend test (passed)',
            "$env:CREATE_WIZARD_URL='http://127.0.0.1:5183/create'; node .\\.trellis\\tmp\\playwright-mainline\\create-wizard-visual-acceptance.cjs (passed)",
        ],
    },
)
