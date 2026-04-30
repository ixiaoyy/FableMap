import json
from pathlib import Path
path = Path('.trellis/tasks/04-28-new-features-brainstorm/task.json')
data = json.loads(path.read_text(encoding='utf-8'))
files = data.get('relatedFiles') or []
if 'risk-closure.md' not in files:
    files.append('risk-closure.md')
data['relatedFiles'] = files
meta = data.get('meta') or {}
meta['risk_closure'] = {
    'status': 'functional_acceptance_clear',
    'remaining_operational_risk': 'dirty workspace requires explicit commit-prep/staging review before any git commit',
    'mitigated': [
        'Restored parent child tracking to 13/13 done.',
        'Preserved archive provenance instead of deleting historical records.',
        'Recorded Playwright evidence paths for /quests, /owner, and /create.',
        'Classified backend/API/schema non-change as intentional out of scope.',
    ],
    'accepted_open_items': [
        'No git commit from this dirty workspace without a separate explicit staging review.',
        '.trellis/tmp evidence retained for visual acceptance; scratch temp cleanup deferred unless requested.',
    ],
    'document': 'risk-closure.md',
}
# Keep deferred_not_done precise: these are intentional/non-blocking, not acceptance failures.
meta['deferred_not_done'] = [
    'No parent-level backend/API/schema migration in closure step; intentionally out of scope.',
    'No token billing, visitor social network, ranking, combat/level/equipment, or auto-published AI content; intentionally excluded by product boundary.',
    'No git commit from dirty workspace; requires separate explicit commit-prep/staging review.',
    'No archive deletion; archive copies preserved as provenance for rehydrated child task records.',
]
data['meta'] = meta
data['notes'] = data.get('notes', '') + ' Risk closure recorded in risk-closure.md; no functional acceptance blocker remains, only commit-staging hygiene is deferred.'
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
