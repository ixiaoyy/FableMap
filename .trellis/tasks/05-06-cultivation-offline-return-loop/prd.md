# Cultivation Offline Return Loop

## Goal

Design the cultivation tavern online/offline idle loop as visitor-private, bounded return-visit progression that produces text records rather than farmable resources.

## Reference Update (2026-05-08)

The “野外历练” screenshot suggests the offline/return loop should feel like a concise return receipt:

* Actor: visitor-selected or tavern-default NPC / practice route.
* Action: “野外历练 / 闭关 / 问道 / 读札记”.
* Result: one short narrative paragraph, a bounded private progress delta, and optionally one non-tradable clue/souvenir card.
* Boundary: “不牵连其他修士” maps to no PvP, no stealing, no cross-visitor effects, no rankings.

The “信任级别要求” screenshot suggests return progress should be explainable through a requirement panel:

* Status: 未达 / 可突破 / 已突破.
* Core indicators: return days, completed practice receipts, NPC conversation turns.
* Secondary bars: reading/observing local notes, confirmed memories/state cards, or owner-approved local milestones.

## Todo

* Choose the loop model: recommended hybrid of daily return + stage event.
* Define private progress fields: last return date/time, current mind-state stage, recent retreat summary, and unlocked prompts/events.
* Define caps and anti-farming rules for offline accumulation.
* Define how return results are shown as “闭关纪要 / 梦境 / NPC 留言 / 心境微变”.
* Decide whether the first MVP persists through existing VisitorState/GameplaySession or a dedicated private bucket.
* Decide whether MVP shows the first requirement panel together with the first return receipt, or defers the panel to the play-pack UI task.

## Acceptance Criteria

* [ ] Offline progress is visitor-private and not included in public Tavern payload.
* [ ] Results are bounded, replayable, and explainable.
* [ ] No paid acceleration, inventory economy, or competitive ranking is introduced.
* [ ] Failure/degraded behavior is defined for missing data or stale taverns.
* [ ] Any “修为/进境” value is capped and local/private; it does not become combat power, global level, or tradeable currency.

## Out of Scope

* Real-time background jobs required for every visitor.
* Infinite resource farming.
* Global online/offline status or social presence.
* Cross-visitor PvP, stealing, leaderboard, item market, or global social credit.
