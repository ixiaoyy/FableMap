import json
from pathlib import Path
path = Path('.trellis/tasks/04-28-new-features-brainstorm/task.json')
data = json.loads(path.read_text(encoding='utf-8'))
data['status'] = 'completed'
data['completedAt'] = '2026-04-30'
data['current_phase'] = 6
data['relatedFiles'] = [
    'brainstorm.md',
    'task.json',
    '.trellis/tasks/04-29-04-29-owner-dashboard-presentational-mvp/',
    '.trellis/tasks/04-30-create-tavern-step-wizard-mvp/',
    '.trellis/tasks/04-30-tavern-discovery-experience-polish-mvp/',
    '.trellis/tasks/04-30-worldinfo-visual-editor-modern-mvp/',
    '.trellis/tasks/04-30-npc-batch-import-background-cast-mvp/',
    '.trellis/tasks/04-30-owner-ai-dialogue-preview-simulator/',
    '.trellis/tasks/04-30-gameplay-template-library-for-owners/',
    '.trellis/tasks/04-30-owner-token-usage-reference-status/',
    '.trellis/tasks/04-30-notification-center-presentational-followup/',
    '.trellis/tasks/04-30-mobile-critical-flow-first-screen-polish/',
    '.trellis/tasks/04-30-tavern-activity-signals-without-social-network/',
    '.trellis/tasks/04-30-home-real-coordinate-governance-review/',
    '.trellis/tasks/04-30-quest-exploration-checklist-reframe/',
]
data['notes'] = 'Completed all 13 children. Restored two archived child records to the exact parent-referenced IDs and added fresh Playwright desktop/mobile acceptance for /owner, /create, and /quests surfaces. Frontend typecheck/build/test passed.'
data['meta'] = {
    'done': [
        'All 13 child tasks are completed and listed by Trellis as 13/13 done.',
        'Quest task was implemented/reframed to exploration checklist and verified.',
        'Archived Owner Dashboard and Create Wizard child records were rehydrated under parent-referenced IDs.',
        'Playwright desktop/mobile evidence captured for /quests, /owner, and /create closure surfaces.',
    ],
    'deferred_not_done': [
        'No parent-level backend/API/schema migration in closure step.',
        'No token billing, visitor social network, ranking, combat/level/equipment, or auto-published AI content.',
        'Future feature ideas should use new Trellis tasks rather than extending this completed parent.',
    ],
    'verification': [
        'node .\\frontend\\scripts\\play-modes-test.mjs; node .\\frontend\\scripts\\quest-guide-test.mjs; node .\\frontend\\scripts\\mini-games-test.mjs (passed)',
        'npm --prefix .\\frontend run typecheck (passed)',
        'npm --prefix .\\frontend run build (passed)',
        'npm --prefix .\\frontend test (passed)',
        "$env:QUEST_CHECKLIST_URL='http://127.0.0.1:5182/quests'; node .\\.trellis\\tmp\\playwright-mainline\\quest-checklist-visual-acceptance.cjs (passed)",
        "$env:OWNER_DASHBOARD_URL='http://127.0.0.1:5183/owner'; node .\\.trellis\\tmp\\playwright-mainline\\owner-dashboard-visual-acceptance.cjs (passed)",
        "$env:CREATE_WIZARD_URL='http://127.0.0.1:5183/create'; node .\\.trellis\\tmp\\playwright-mainline\\create-wizard-visual-acceptance.cjs (passed)",
        'py -3 .trellis/scripts/task.py validate .trellis/tasks/04-29-04-29-owner-dashboard-presentational-mvp (passed)',
        'py -3 .trellis/scripts/task.py validate .trellis/tasks/04-30-create-tavern-step-wizard-mvp (passed)',
    ],
    'playwright_evidence': [
        '.trellis/tmp/playwright-mainline/evidence/04-30-quest-exploration-checklist-visual-acceptance/quest-checklist-desktop.png',
        '.trellis/tmp/playwright-mainline/evidence/04-30-quest-exploration-checklist-visual-acceptance/quest-checklist-mobile.png',
        '.trellis/tmp/playwright-mainline/evidence/04-30-quest-exploration-checklist-visual-acceptance/quest-checklist-visual-acceptance-report.json',
        '.trellis/tmp/playwright-mainline/evidence/04-29-owner-dashboard-presentational-mvp-visual-acceptance/owner-dashboard-desktop.png',
        '.trellis/tmp/playwright-mainline/evidence/04-29-owner-dashboard-presentational-mvp-visual-acceptance/owner-dashboard-mobile.png',
        '.trellis/tmp/playwright-mainline/evidence/04-29-owner-dashboard-presentational-mvp-visual-acceptance/owner-dashboard-visual-acceptance-report.json',
        '.trellis/tmp/playwright-mainline/evidence/04-30-create-tavern-step-wizard-visual-acceptance/create-wizard-desktop.png',
        '.trellis/tmp/playwright-mainline/evidence/04-30-create-tavern-step-wizard-visual-acceptance/create-wizard-mobile.png',
        '.trellis/tmp/playwright-mainline/evidence/04-30-create-tavern-step-wizard-visual-acceptance/create-wizard-visual-acceptance-report.json',
    ],
}
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
