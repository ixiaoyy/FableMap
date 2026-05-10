# Brainstorm Capture: Page Focus Guidance

Captured: 2026-05-07
Task: `05-07-page-focus-guidance-brainstorm`
Purpose: preserve the raw brainstorm so the thinking is not lost outside Trellis.

## Raw user notes

### 1) Page feels too rich / visually overwhelming

> 我不知道页面是不是过于丰富了
> 怎么说
> 有点眼花缭乱
> 就是让我感觉一开始不知道聚焦到哪
> 但是你说让我讲要怎么改，我也说不上来
> 所以我在想，是不是有个引导比较好，都没让人感觉这么乱

Interpretation to preserve:

* The problem is not yet a specific component bug.
* The felt issue is first-glance overload: the user does not know where to focus.
* The user suspects guidance may help, but is not yet sure whether the correct fix is guidance, simplification, or stronger hierarchy.

### 2) Product principle: better half a product than half-finished everything

> 与其做半个成品，不如做好半个产品
> 从核心出发，忘掉细节，关注不变因素
> 反复提问增加这些真的有必要吗？
> 做一款自己需要的，在网上分享，供人免费使用。
> 并且通过社交平台去分享，
> 但不要为了某个用户去修改功能，
> 要适合大众，而不是个人。
> 最好能树立一点自己的项目规范

Interpretation to preserve:

* The desired direction is product focus, not feature accumulation.
* The product should be built from invariant core value, not scattered details.
* Every visible module/feature should pass a necessity test.
* The project is intended as something the maker personally needs, can share online, and can offer free for broad use.
* Social platforms are distribution channels, not a reason to turn FableMap into a generic social network.
* Avoid one-off customization for a single user's preference; prefer broadly useful defaults.
* A concise project norm / product charter is wanted so future decisions can be consistent.

### 3) Preserve brainstorm inside Trellis

> 之前的头脑风暴也要留存起来，别遗失了，放到trellis任务里面

Interpretation to preserve:

* Brainstorm artifacts should live in the Trellis task directory, not only in chat.
* Both raw user intent and assistant synthesis should be retained.

## Assistant synthesis so far

### Diagnosis

The current "page feels too rich" concern is likely not just about aesthetics. It may be caused by three overlapping issues:

1. **Visual noise**: too many glowing cards, chips, telemetry labels, and equally weighted panels compete for attention.
2. **Information density**: many useful modules appear simultaneously before the user has formed intent.
3. **Missing journey focus**: the user cannot immediately tell which route they are in or what the first action should be.

### Product focus reframing

Do not treat guidance as "add another explanatory card everywhere." Treat guidance as a product focus mechanism:

* Make one core action obvious.
* Make secondary information earn its place.
* Demote, fold, or remove details that do not improve the first 30 seconds.

### Draft north star

FableMap should first be a **small, complete, public-shareable spatial NPC experience**:

> A real coordinate leads to an owner-authored space; a visitor can enter, understand what to do, talk with an NPC, and have a reason to come back.

### Draft feature gate questions

Before adding or keeping a visible module, ask:

1. Does this strengthen the core loop: real coordinate -> enter space -> NPC conversation -> memory/revisit?
2. Is this useful to many creators/visitors, or only one person's special workflow?
3. Would the product still make sense if this detail disappeared?
4. Does this make the first 30 seconds clearer or more confusing?
5. Can it be shared/explained online in one sentence or screenshot?
6. Does it respect existing hard boundaries: owner-authored content, real coordinates, no platform token business, no generic social network, no traditional map/game feature creep?

## Candidate directions discussed

### Approach A: Product Focus Charter first (current recommendation)

Create a concise project norm that defines:

* north star
* feature gate questions
* first-30-seconds rule
* shareability rule
* no one-off customization rule
* relation to existing `WHAT_NOT_TO_BUILD` boundaries

Then use the charter to audit overloaded pages.

Pros:

* Prevents endless local UI tweaks.
* Gives future feature/page decisions a reusable filter.
* Matches "做好半个产品" better than adding another UI widget.

Cons:

* Does not immediately simplify the interface until followed by a page proof slice.

### Approach B: One core-path UI reduction first

Pick one surface, likely homepage / discover / chat, and aggressively demote or remove secondary modules until the core action is obvious.

Pros:

* Gives visible improvement quickly.
* Useful as a concrete reference for future pages.

Cons:

* Risks solving one page symptom without establishing repeatable standards.

### Approach C: Guidance system first

Add reusable "what to do now" guidance on rich pages.

Pros:

* Low-risk and preserves existing modules.
* Could reuse the existing mobile critical-flow pattern.

Cons:

* May become even more content layered on top of clutter if not paired with reduction rules.

## Current recommended sequence

1. Write the smallest possible Product Focus Charter inside this Trellis task.
2. Choose one high-impact page as a proof slice.
3. Apply the charter to that page by demoting/removing/folding secondary modules.
4. Only then consider reusable guidance components if the page still needs them.

## Open decision

Which path should this brainstorm converge on?

1. **先立规范**: create the product focus charter only. (Drafted in PRODUCT_FOCUS_CHARTER.md)
2. **先改一个页面**: choose one route and simplify it immediately.
3. **规范 + 一个样板页**: write a minimal charter, then apply it to one page as proof.

Current assistant recommendation: **3. 规范 + 一个样板页**.
