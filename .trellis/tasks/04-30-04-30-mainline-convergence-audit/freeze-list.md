# Freeze List — Mainline Convergence Audit

Effective: 2026-04-30

This list pauses **new work**, not existing file retention. Do not delete code or task directories from this list without explicit user confirmation.

## Immediate Freeze Rule

Until the Mainline Acceptance Gate in `mainline-audit.md` is green, do not start or expand tasks in these clusters:

1. **Short-drama / video / media expansion**
2. **Preview-only feature expansion**
3. **Research / inspiration / new-feature backlog expansion**
4. **Social/activity/discovery growth not required by the golden path**
5. **Home/place-type expansion beyond real-coordinate tavern constraints**
6. **Traditional game/quest/RPG-style expansion**
7. **Provider/media asset pipelines beyond owner-confirmed text chat**

## Frozen Clusters

### A. Short-drama and gameplay-template cluster

Freeze:

- `04-30-ai-video-story-mini-game-brainstorm`
- `04-30-tavern-short-drama-gameplay-template-mvp`
- `04-30-discovery-short-drama-teaser-cards`
- `04-30-owner-ai-short-drama-draft-assistant`
- `04-30-confirmed-short-video-asset-pipeline-research`
- `04-30-gameplay-template-library-for-owners`

Reason: This cluster can quickly turn into “more content templates” while the core chat/memory/revisit loop is still not singularly accepted.

Allowed while frozen:

- Fix regressions caused by already merged gameplay/template code.
- Remove misleading entry points if they interfere with mainline smoke.

Not allowed while frozen:

- Add templates, teaser cards, video/image/audio assets, AI draft assistants, or new gameplay schema.

### B. Preview-only cluster

Freeze expansion:

- `04-30-tavern-gm-layer-structured-conflict-candidates`
- `04-30-visual-souvenir-shared-moment-preview`
- `04-30-voice-greeting-tts-pack-preview`
- `04-30-preset-import-preview-safe-converter`
- `04-30-serial-novel-export-episode-builder`

Reason: These are individually bounded, but together they create many non-core surfaces.

Allowed while frozen:

- Finish review/check only if already implemented and verification is failing.
- Fix privacy/security bugs.

Not allowed while frozen:

- Convert previews into real generation, persistence, publication, synthesis, or asset storage pipelines.

### C. Research / inspiration / backlog expansion

Freeze:

- `04-29-ai-creation-sites-research`
- `04-30-public-site-reference-matrix-research`
- `04-29-new-feature-ideation`
- `04-28-new-features-brainstorm`
- `04-28-next-feature-brainstorm`
- `04-30-external-channel-companion-integration-research`

Reason: Research produces more possible features; current risk is too many possible features and too little closure.

Allowed while frozen:

- Archive/summarize existing research if needed.

Not allowed while frozen:

- Add new candidate features or child tasks.

### D. Discovery/activity/social-adjacent cluster

Freeze expansion:

- `04-29-neighborhood-rumor-system`
- `04-30-discovery-liveliness-signals-rumor-guestbook`
- `04-30-tavern-activity-signals-without-social-network`
- `04-30-revisit-care-proactive-notification-design`
- `04-30-notification-center-presentational-followup`

Reason: Activity signals can drift toward social feeds or notification products. They should only support the tavern loop after the loop is accepted.

Allowed while frozen:

- Keep bounded owner-visible guestbook feedback.
- Fix notification bugs for already-existing events.

Not allowed while frozen:

- Visitor-to-visitor feeds, global online status, social graph, proactive notifications without opt-in/frequency review.

### E. Home/place expansion cluster

Freeze expansion:

- `04-28-home-system`
- `04-28-place-type-expansion`
- `04-30-home-real-coordinate-governance-review` except as read-only audit

Reason: Home/place expansion can dilute the “real-coordinate tavern” product center.

Allowed while frozen:

- Run governance review that decides whether Home remains a real-coordinate tavern variant.
- Fix private-data or access-control bugs.

Not allowed while frozen:

- New Home-specific features, unanchored personal pages, social profile behavior.

### F. Quest/RPG cluster

Freeze and reframe:

- `04-28-quest-system`
- `04-30-quest-exploration-checklist-reframe`

Reason: Traditional quest systems risk violating the “not a game / no RPG combat/levels/ranking” boundary.

Allowed while frozen:

- Rename/reframe existing surfaces to “exploration checklist” or “tavern commission” if required to reduce risk.

Not allowed while frozen:

- Combat, levels, equipment, rankings, failure punishment, ad-revive loops.

### G. Provider/media/asset pipeline cluster

Freeze:

- `04-30-visual-souvenir-full-image-asset-pipeline`
- `04-30-voice-greeting-tts-synthesis-playback`
- `04-29-04-29-npc-expression-art-quality-rebuild` expansion beyond already planned review fixes

Reason: Real image/audio pipelines add asset governance, costs, privacy, and verification work before text chat/memory is fully accepted.

Allowed while frozen:

- Verify already generated project assets exist and are referenced correctly.
- Fix broken image paths that affect current UI.

Not allowed while frozen:

- New generation pipelines, voice cloning, audio storage, image asset lifecycle systems.

## Work That May Continue During Freeze

Only these categories should proceed:

1. **Mainline verification**
   - Golden-path test/checklist for create → configure → enter → chat → memory → revisit.
2. **Mainline bug fixes**
   - Anything that blocks the ten acceptance-gate steps in `mainline-audit.md`.
3. **Security/privacy fixes**
   - API key exposure, private visitor memory leakage, password/access bugs.
4. **Review/check of already implemented tasks**
   - Only to finish verification or document known gaps; do not expand scope.
5. **Docs/task hygiene**
   - Mark frozen tasks, update status, reduce duplication.

## Thaw Conditions

A frozen cluster can be reopened only after:

- One golden-path verification artifact exists and passes.
- The task explicitly names which mainline acceptance step it improves.
- The task has a narrow allowed file scope.
- The task includes a rollback/failure plan.
- User confirms the task should thaw.

## Suggested Next Task After This Audit

Create or repurpose one P0 task:

`04-30-mainline-golden-path-smoke`

Goal:

- Add the smallest backend or scripted smoke that proves the loop with a rules/local backend and one NPC.
- Then do one manual browser pass over the same path.

Do **not** start with UI polish. Start with proof that the data survives the loop.
