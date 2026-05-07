# brainstorm: page focus guidance

## Goal

Explore whether FableMap's current rich pages feel visually overloaded, and define an owner/visitor-safe guidance/focus pattern that helps first-time users know where to look and what to do first without flattening the product's tavern atmosphere.

## What I already know

* User feels the current page may be too rich/visually dense.
* The main pain is not a specific missing feature, but "眼花缭乱" and not knowing where to focus at first.
* User suspects some kind of guidance/onboarding/focus aid may reduce the perceived chaos.
* This is a brainstorm task only; no implementation should start before a design is confirmed.

## Assumptions (temporary)

* "页面" may refer to one or more recent FableMap product surfaces rather than a single known route.
* The desired direction is likely not to remove all richness, but to introduce stronger hierarchy, staged disclosure, and first-action guidance.
* The solution should preserve FableMap's tavern/map/NPC personality rather than becoming a generic dashboard.

## Open Questions

* Which page/surface first triggered the feeling of visual overload?

## Requirements (evolving)

* Preserve the rich FableMap atmosphere while improving first-glance focus.
* Consider guidance patterns that help users understand the recommended first action.

## Acceptance Criteria (evolving)

* [ ] The target page/surface is identified.
* [ ] The brainstorm distinguishes between visual noise, information density, and lack of onboarding/guidance.
* [ ] 2-3 concrete UX approaches are compared with trade-offs.
* [ ] MVP scope and out-of-scope items are explicit before implementation.

## Definition of Done (team quality bar)

* Tests added/updated if behavior changes later.
* `npm --prefix .\frontend run build` run for any later frontend implementation.
* Desktop and narrow-screen visual self-check planned if later UI changes are user-visible.
* Docs/task notes updated with final decisions.

## Out of Scope (explicit)

* No implementation in this brainstorm step.
* No broad redesign of all FableMap pages unless the user explicitly chooses that scope.
* No removal of owner-authored content or map/tavern/NPC product identity.

## Technical Notes

* Task created from user request on 2026-05-07.
* Context inspection pending.

## Context Findings (2026-05-07 quick scan)

* Product brief defines the core closed loop as: map browsing -> space discovery -> entering a space -> configuring AI NPC -> chat -> relationship/memory -> revisit feedback. Any guidance should make this loop easier to see rather than adding unrelated map-app or RPG systems.
* `frontend/app/shell/product-shell.tsx` already has a mobile-only "Mobile first-screen" guide by route eyebrow (`Discover`, `Guide`, `Create`, `Tavern`, `Owner`). This means the project has an existing pattern for first-action guidance, but it is not a general desktop/route-level focus system.
* Current route scan suggests several rich surfaces with many competing modules:
  * `frontend/app/routes/home.tsx`: large hero, poster preview, metrics, featured entries, feature blocks, multiple CTAs.
  * `frontend/app/routes/discover.tsx`: filters, view switch, telemetry, radar surface, tavern cards, entry signals, modal preview.
  * `frontend/app/features/tavern-chat-workbench/index.tsx`: NPC list, public/private chat, password gate, host guide message, conversation intent chips, progress/beats cards.
  * `frontend/app/routes/create.tsx`: step wizard plus live preview and AI draft lifecycle explanations.
  * `frontend/app/routes/owner.tsx`: owner summary, forms, management links and activity panels.
* Recent prior task `.trellis/tasks/05-06-05-06-design-audit-visual-polish/prd.md` intentionally made pages more immersive/richer while preserving product boundaries. The new concern may be the other side of that trade-off: atmosphere improved, but first-glance hierarchy may now be weaker.
* Existing copy already contains local guidance (e.g. shopkeeper guide message in chat, mobile critical-flow cards, Guide page), so a likely better direction is not "add more explanatory cards everywhere", but introduce a consistent focus layer / first action / progressive disclosure pattern.

## Initial UX Diagnosis (temporary)

The issue may be one of three different problems:

1. **Visual noise**: too many glowing cards, chips, telemetry labels, and equally-weighted panels compete for attention.
2. **Information density**: the page contains many useful modules, but they appear at the same time before the user has formed intent.
3. **Missing journey focus**: users do not know which route they are in or which first action matters now, even if each component is individually understandable.

## Early Candidate Directions

**Approach A: Route-level focus rail / first action card** (likely recommended)

* Each major page gets one stable "当前该做什么" module near the top: one primary action, one sentence of why, 1-2 secondary actions max.
* Existing rich modules remain, but are visually demoted below the first action.
* Best when the product wants to keep atmosphere but reduce first-glance uncertainty.

**Approach B: Progressive disclosure / collapsible secondary panels**

* Keep only the mainline visible at first; move telemetry, extra chips, filters, side panels, and advanced controls behind accordions/tabs/"更多" areas.
* Best when density is the core problem, especially mobile and management pages.
* Risk: may hide attractive product richness and make pages feel empty or administrative.

**Approach C: Guided tour / coach marks**

* First visit shows 2-4 step hints pointing at important areas.
* Best when users need onboarding to a new complex surface such as chat workbench.
* Risk: tours can become annoying, need state/persistence, and may not solve always-on visual hierarchy.

## Current Recommendation (not final)

Start with Approach A as the MVP: add a reusable, route-level focus pattern and audit one or two highest-friction pages first. Treat B as a page-by-page refinement and C as later if user testing shows people still need walkthrough-style help.

## User Product Principles (added 2026-05-07)

* "与其做半个成品，不如做好半个产品。" Prefer a coherent, polished core slice over a broad but half-finished surface.
* Start from the core; temporarily forget details; focus on invariant factors.
* Repeatedly ask: "这些真的有必要吗？"
* Build a product the maker personally needs, share it online, keep it free to use, and spread through social platforms.
* Do not chase one specific user's requested customization; features should serve a broad public use case rather than one person's private workflow.
* Establish a small set of project norms so future decisions have a stable filter.

## Product Focus Principles Draft

### North Star

FableMap should first be a **small, complete, public-shareable spatial NPC experience**: a real coordinate leads to an owner-authored space, a visitor can enter, understand what to do, talk with an NPC, and have a reason to come back.

### Feature Gate Questions

Before adding or keeping a visible module, ask:

1. Does this strengthen the core loop: real coordinate -> enter space -> NPC conversation -> memory/revisit?
2. Is this useful to many creators/visitors, or only one person's special workflow?
3. Would the product still make sense if this detail disappeared?
4. Does this make the first 30 seconds clearer or more confusing?
5. Can it be shared/explained online in one sentence or screenshot?
6. Does it respect existing hard boundaries: owner-authored content, real coordinates, no platform token business, no generic social network, no traditional map/game feature creep?

### Implication for Page Clutter

The page may feel overwhelming because many modules are individually reasonable but collectively fail the first-30-seconds test. The brainstorm should therefore treat "引导" not as adding another layer of instructions, but as a **product focus mechanism**: make one core action obvious, then make secondary information earn its place.

## Existing Boundary Alignment

* `docs/PRODUCT_BRIEF.md` already supports the invariant loop: map browsing -> discovery -> enter space -> configure NPC -> chat -> memory/revisit.
* `docs/WHAT_NOT_TO_BUILD.md` already provides negative product gates: no platform-autopublished content, no platform token business, no unanchored spaces, no generic visitor social network, no traditional map app/RPG feature creep.
* Missing/implicit gap: there is no concise positive "what makes a page/feature worth keeping" standard that can be applied during UI/product review.

## Refined Candidate Directions

**Approach A: Product Focus Charter first** (Recommended)

* Write/agree on a short project norm: north star, feature gates, first-30-seconds rule, shareability rule, no-one-off-customization rule.
* Then use it to audit the overloaded pages.
* Pros: prevents endless local UI tweaks; gives future work a stable decision filter.
* Cons: does not immediately simplify the interface until followed by an implementation task.

**Approach B: One core-path UI reduction first**

* Pick one surface (likely homepage/discover/chat) and aggressively demote/remove secondary modules until the core action is obvious.
* Pros: visible improvement fast.
* Cons: risks solving one symptom without establishing repeatable product standards.

**Approach C: Guidance system first**

* Add reusable "what to do now" guidance on rich pages.
* Pros: low-risk, preserves existing modules.
* Cons: may become more content on top of clutter if not paired with reduction rules.

## Current Recommendation (updated)

Start with Approach A, then apply it to one high-impact page as a proof slice. This matches "做好半个产品": first define what the half-product is, then make one route embody it instead of adding more decorative guidance everywhere.

## Brainstorm Capture

Raw brainstorm notes are preserved in `brainstorm-capture.md` in this task directory. That file records:

* the user's original wording about visual overload and lack of focus;
* the later product principle: "与其做半个成品，不如做好半个产品";
* the broad-use/free/shareable product intent;
* the emerging need for a Product Focus Charter;
* candidate directions and the current recommended sequence.
