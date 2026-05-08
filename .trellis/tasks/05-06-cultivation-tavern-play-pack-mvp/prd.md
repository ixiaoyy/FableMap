# Cultivation Tavern Play Pack MVP

## Goal

Create a cultivation-themed tavern play pack that owners can apply and confirm: NPC/world-info suggestions, lightweight GameplayDefinition templates, and safe “online cultivation” actions.

## Reference Update (2026-05-08)

User provided two reference screenshots:

1. A “韩天尊 / 野外历练” style message where an NPC/player receives a short training result, private reward text, “修为 +24000”, and a named item such as “一截灵眼之树”.
2. A LINUX DO Connect “信任级别 3 的要求” dashboard with clear unmet status, circular progress indicators, and progress bars for prerequisite metrics.

Design interpretation for this play pack:

* Treat “野外历练” as a **private cultivation receipt** inside one tavern, not as cross-player combat, ranking, or resource farming.
* Treat “修为” as a bounded private **进境值 / 心境进度** that unlocks local prompts or return-visit records, not power, equipment, or a tradable currency.
* Treat item rewards as **灵物线索卡 / 纪念卡 / 世界书触发线索**, not inventory, gear, or market goods.
* Borrow the requirement-dashboard structure for “下一心境 / 下一境界要求”, but use local tavern behaviors rather than global social metrics.

## Todo

* Define the owner-facing template contents: tavern description snippets, NPC role suggestions, world info, and gameplay nodes.
* Keep all generated/suggested content as drafts until the owner saves or confirms it.
* Reuse `GameplayDefinition` / `GameplaySession` for online “问道 / 打坐 / 观星 / 读札记” flows.
* Add non-RPG safety copy: no combat, levels, equipment, rankings, tradable rewards, or paid acceleration.
* Add a thin “历练回执” template: one action, one short result, one private progress delta, one non-tradable clue/souvenir card.
* Add a thin “突破条件” card: current state, unmet/met status, and a few local requirements such as return days, NPC conversation turns, completed practice nodes, and confirmed receipts.

## Acceptance Criteria

* [ ] Play pack can be described as owner-confirmed tavern content, not platform auto-publication.
* [ ] Online loop is testable and reuses existing gameplay boundaries.
* [ ] MVP works for taverns with 1+ NPC and degrades safely when no NPC exists.
* [ ] Training receipts are visitor-private and do not mutate NPC canon or public tavern payload automatically.
* [ ] Requirement panel explains next-step progress without global social metrics, rankings, combat stats, or tradable resources.

## Out of Scope

* Real-money or tokenized cultivation resources.
* Combat/gear/leaderboard progression.
* Auto-creating NPCs at visitor runtime.
* Cross-visitor stealing, PvP, social reputation, or item trading.
