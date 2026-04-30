import json
from pathlib import Path
path = Path('.trellis/tasks/04-30-quest-exploration-checklist-reframe/task.json')
data = json.loads(path.read_text(encoding='utf-8'))
data.update({
    'status': 'completed',
    'dev_type': 'frontend',
    'scope': 'quest-exploration-checklist-reframe',
    'completedAt': '2026-04-30',
    'current_phase': 6,
    'relatedFiles': [
        'prd.md',
        'task.json',
        'implement.jsonl',
        'check.jsonl',
        'debug.jsonl',
        'frontend/app/lib/quest-guide.js',
        'frontend/app/routes/quests.tsx',
        'frontend/app/shell/product-shell.tsx',
        'frontend/app/lib/tavern-layouts.js',
        'frontend/app/product/tavernPlayModes.js',
        'frontend/app/product/TavernChatRoom.jsx',
        'frontend/app/product/tavernMiniGames.js',
        'frontend/app/product/tavernTemplates.js',
        'frontend/scripts/play-modes-test.mjs',
        'frontend/scripts/quest-guide-test.mjs',
        '.trellis/tmp/playwright-mainline/quest-checklist-visual-acceptance.cjs',
        '.trellis/tmp/playwright-mainline/evidence/04-30-quest-exploration-checklist-visual-acceptance/quest-checklist-desktop.png',
        '.trellis/tmp/playwright-mainline/evidence/04-30-quest-exploration-checklist-visual-acceptance/quest-checklist-mobile.png',
        '.trellis/tmp/playwright-mainline/evidence/04-30-quest-exploration-checklist-visual-acceptance/quest-checklist-visual-acceptance-report.json',
    ],
    'notes': 'Reframed quest/guild surfaces into exploration checklist and tavern commission copy with completion records, text memorial badges, revisit hints, and explicit no-RPG/no-ranking/no-billing boundaries; verified with tests and Playwright desktop/mobile evidence.',
    'meta': {
        'done': [
            'Reframed /quests route and global nav to exploration checklist wording.',
            'Reframed quest-guide helper reward/status copy to text memorial and revisit hints.',
            'Reframed product chat checklist panel and prompts while preserving existing compatibility helper names/storage.',
            'Reframed owner templates and tiny commission mini-game copy away from adventurer guild/reputation/task board wording.',
            'Added regression assertions for no old quest/RPG framing and captured Playwright desktop/mobile evidence.',
        ],
        'deferred_not_done': [
            'No combat, levels, equipment, rankings, tradeable rewards, or visitor social loop.',
            'No backend/API/schema change or persistent Quest/checklist model.',
            'No platform-autopublished AI content or token billing changes.',
        ],
        'verification': [
            'node .\\frontend\\scripts\\play-modes-test.mjs; node .\\frontend\\scripts\\quest-guide-test.mjs; node .\\frontend\\scripts\\mini-games-test.mjs (passed)',
            'npm --prefix .\\frontend run typecheck (passed)',
            'npm --prefix .\\frontend run build (passed)',
            'npm --prefix .\\frontend test (passed)',
            "$env:QUEST_CHECKLIST_URL='http://127.0.0.1:5182/quests'; node .\\.trellis\\tmp\\playwright-mainline\\quest-checklist-visual-acceptance.cjs (passed)",
        ],
        'playwright_evidence': [
            '.trellis/tmp/playwright-mainline/evidence/04-30-quest-exploration-checklist-visual-acceptance/quest-checklist-desktop.png',
            '.trellis/tmp/playwright-mainline/evidence/04-30-quest-exploration-checklist-visual-acceptance/quest-checklist-mobile.png',
            '.trellis/tmp/playwright-mainline/evidence/04-30-quest-exploration-checklist-visual-acceptance/quest-checklist-visual-acceptance-report.json',
        ],
    },
})
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
