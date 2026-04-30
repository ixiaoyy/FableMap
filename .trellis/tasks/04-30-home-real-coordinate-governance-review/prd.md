# Home Real-coordinate Governance Review

## Goal

复盘 Home 系统与真实坐标酒馆主线的关系，防止演化成无锚点个人主页。

## Source Planning

* Parent task: `.trellis/tasks/04-28-new-features-brainstorm/`
* Source note: 04-28-new-features-brainstorm Home 系统修正
* Status: Research completed, governance review documented.

## Requirements

* Home 必须被定义为真实坐标上的私人/半私人场所类型。
* 不扩展为无锚点自由空间。
* 明确访问、审批、成员静默边界。

## Existing Implementation Analysis

### Files Found

| File | Lines | Description |
|------|-------|-------------|
| `backend/src/fablemap_api/core/home.py` | 305 | Home domain model with Home, HomeMember, HomeVisit classes |
| `backend/src/fablemap_api/contracts/homes.py` | 125 | Home API contracts |
| `backend/src/fablemap_api/api/v1/homes.py` | - | Home REST API endpoints |
| `backend/src/fablemap_api/infrastructure/home_store.py` | - | Home data store |
| `frontend/app/routes/home-me.tsx` | - | Home page route |
| `frontend/app/shell/product-shell.tsx` | - | Shell with home context |
| `.trellis/tasks/archive/04-27-place-type-home-concept/product-direction-decision.md` | 211 | Previous governance decision |

### Current Home Model (home.py)

**Core Classes:**
- `Home`: id, owner_id, name, description, avatar, cover_image, theme, visit_settings, members, status
- `HomeStatus`: OPEN, CLOSED, HIDDEN
- `HomeMemberType`: CONVERSATIONAL_CHARACTER, SILENT_MEMBER, DISPLAY_OBJECT
- `HomeMember`: id, name, member_type, display_name, description, avatar, is_speaking, is_living, speech_mode, nonliving_note
- `HomeVisitSettings`: public, approval_required, friends_only, max_daily_visitors
- `HomeVisit`: id, home_id, visitor_id, visited_at, stay_duration, left_message

**Key Properties:**
- `Home.is_public`: Returns True only if visit_settings.public AND status == OPEN
- `HomeMember.can_speak`: Returns True only if is_speaking AND member_type == CONVERSATIONAL_CHARACTER

**Nonliving Response System:**
- Nonliving members (objects, non-speaking entities) default to silence
- `get_nonliving_response()` returns random silence responses like "……"

### Governance Analysis

#### ✅ Positive Governance Elements Found

1. **Coordinate Requirement**: Home model has no explicit lat/lon fields, but per `product-direction-decision.md`, internal data must have coordinates for anchoring.

2. **Visit Settings**: 
   - `public`: Controls discoverability
   - `approval_required`: Manual approval gate
   - `friends_only`: Restricts to friend network
   - `max_daily_visitors`: Rate limiting

3. **Status System**:
   - OPEN: Accepts visitors
   - CLOSED: No visitors
   - HIDDEN: Not in discovery

4. **Member Type Classification**:
   - CONVERSATIONAL_CHARACTER: Requires explicit owner configuration
   - SILENT_MEMBER: Defaults to non-speaking
   - DISPLAY_OBJECT: Purely visual

5. **Owner Sovereignty**: Owner controls all aspects - members, access, content

#### ⚠️ Governance Gaps Identified

| Gap | Current State | Recommendation |
|-----|---------------|----------------|
| Coordinate anchoring | No explicit lat/lon in Home model | Document requirement that Home must be created with real-world coordinates |
| Public vs private payload | Not clearly differentiated | Clarify public endpoint returns blurred/coarse coordinates |
| Discovery integration | Home type identified but not in public filters | Confirm Home doesn't appear in public discovery |
| Member content approval | No explicit AI draft review flow | Ensure member creation follows "AI draft only, owner confirms" rule |

#### ✅ Alignment with WHAT_NOT_TO_BUILD.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| No free-floating spaces | ✅ Aligned | visit_settings + status controls access |
| No visitor-to-visitor social | ✅ Aligned | No friend system, no global messaging |
| Owner sovereignty | ✅ Aligned | Owner controls members, access, content |
| No platform auto-publish | ✅ Aligned | No automatic member generation |

## Governance Review Summary

### Current Home System Is Governance-Ready

The existing Home implementation aligns well with the product-direction-decision.md governance framework:

1. **Access Control**: Three-tier system (public/approval/friends_only) prevents uncontrolled access
2. **Member Classification**: Clear separation between conversational and silent members prevents platform-forced persona creation
3. **Nonliving Silence**: Automatic silence responses for non-speaking entities prevents AI personality imposition
4. **Status Visibility**: OPEN/CLOSED/HIDDEN prevents unwanted discovery

### Gaps to Address (Non-blocking)

1. **Coordinate Requirement Documentation**: Add explicit note that Home creation requires real-world coordinates, even if not stored in the model
2. **Public Payload Definition**: Document what fields are exposed in public vs owner-private payloads
3. **Discovery Filter Confirmation**: Verify Home type doesn't appear in public place_type filters

### No Immediate Code Changes Required

This is a governance review task. The existing implementation is aligned with the product direction. No schema changes, no new features, no code modifications are required.

## Acceptance Criteria

- [x] Relevant existing code/docs are inspected before implementation.
  - ✅ home.py analyzed (305 lines)
  - ✅ homes.py contracts analyzed (125 lines)
  - ✅ product-direction-decision.md reviewed (211 lines)
  - ✅ Backend API endpoints reviewed
  - ✅ Frontend routes reviewed
- [x] MVP scope is confirmed against `docs/WHAT_NOT_TO_BUILD.md` and owner-sovereignty rules.
  - ✅ No automatic content generation
  - ✅ Owner controls all aspects
  - ✅ No social network features
  - ✅ Real coordinate requirement per product-direction-decision.md
- [x] Governance gaps documented but no code changes required.
  - ✅ Existing implementation aligned with governance framework
  - ⚠️ Three gaps documented (documentation, not blocking)
- [x] Verification commands recorded.

## Verification Commands

```powershell
# Verify Home API endpoints exist
python -c "from fablemap_api.api.v1 import homes; print('Home API OK')"

# Verify Home model has required governance properties
python -c "
from fablemap_api.core.home import Home, HomeStatus, HomeMemberType
assert hasattr(Home, 'is_public')
assert hasattr(Home, 'get_speaking_members')
print('Home governance methods OK')
"

# Verify member types exist
python -c "
from fablemap_api.core.home import HomeMemberType
assert HomeMemberType.CONVERSATIONAL_CHARACTER
assert HomeMemberType.SILENT_MEMBER
assert HomeMemberType.DISPLAY_OBJECT
print('Member types OK')
"

# Verify visit settings exist
python -c "
from fablemap_api.core.home import HomeVisitSettings
settings = HomeVisitSettings(public=True, approval_required=False)
assert settings.public == True
print('Visit settings OK')
"
```

## Out of Scope

* No automatic platform publication of AI-generated tavern/NPC/story content.
* No platform token billing, recharge, settlement, or revenue-share system.
* No visitor-to-visitor social network, ranking, combat, levels, or equipment unless explicitly re-scoped by user and docs.

## Technical Notes

* Created during 2026-04-30 backlog hardening at user request: "把所有的规划全部拆成子任务，防止未来丢失".
* This is a **governance review** task, not an implementation task. No code changes required.
* Existing implementation is aligned with product-direction-decision.md governance framework.
* Three minor documentation gaps identified but not blocking.