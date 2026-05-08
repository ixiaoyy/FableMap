# Implementation: tavern-soft-currency-gifts-design

## Summary

Design and implement a per-tavern soft currency ("纪念币/心意点") + gift + limited bonus draw voucher system that connects gameplay completion → earning coins → spending on gifts → NPC affinity + bonus gacha. Does NOT include real-money purchase, transfer, settlement, or platform-wide wallet.

## Research Findings

### Existing Code

**Backend:**
- `backend/src/fablemap_api/core/affinity.py`: Full affinity stage system (stranger → best_friend), with calculator, stages, prompt builder. Already handles:
  - Chat-based affinity gain
  - Gameplay completion/penalty
  - Decay over time
  - Stage thresholds and milestone triggers

**Frontend:**
- `frontend/app/lib/affinity.js`: Affinity stages and helper functions
- `frontend/app/components/AffinityProgress.tsx`: Affinity progress bar
- `frontend/app/components/AffinityBadge.tsx`: Affinity badge component
- `frontend/app/lib/affinity.js` also has stage normalization

### Integration Points

- `VisitorState.relationship_strength/stage` for space-level relationship
- `character_affinity[character_id]` in visitor private data for per-NPC affinity
- Existing gacha progress bucket `_gacha_progress` for card draws
- `GameplayDefinition.completion.reward_text` for gameplay rewards

## Design: Approach A (Recommended)

Per-tavern soft currency + gifts + limited bonus vouchers.

### Key Design Decisions

1. **Currency Name**: "空间纪念币" / "心意点" — not platform-wide "金币"
2. **Scope**: Per visitor × per tavern, not transferable
3. **Earning**: Task/gameplay completion with idempotency and daily caps
4. **Spending**: Gifts only, no real-money purchase
5. **Bonus Draw**: Earned voucher only, not paid refill

## Implementation Plan

### Phase 1: Engagement Config & Storage

**Backend:**

1. Create `backend/src/fablemap_api/core/engagement.py`
   - `EngagementConfig` dataclass (coin_label, earn_limits, reward_rules, gift_catalog, bonus_draw)
   - `EngagementProgress` private bucket schema (wallet, ledger, daily_counters, gift_history, bonus_draw_vouchers)
   - Helper functions for idempotent earn/spend with caps

2. Create `backend/src/fablemap_api/api/v1/engagement.py`
   - `GET /taverns/{tavern_id}/engagement/config` — owner config
   - `PUT /taverns/{tavern_id}/engagement/config` — update config
   - `GET /taverns/{tavern_id}/engagement/me` — visitor progress
   - `POST /taverns/{tavern_id}/engagement/claim-reward` — claim gameplay reward
   - `POST /taverns/{tavern_id}/engagement/gifts/send` — send gift
   - `POST /taverns/{tavern_id}/engagement/vouchers/redeem` — redeem voucher

**Frontend:**

1. Create `frontend/app/lib/engagementService.js`
   - Typed API client for engagement endpoints
   - Helper functions for format, display, local state

### Phase 2: Gift Panel & NPC Affinity Integration

**Backend:**

1. Extend `calculate_gift_affinity()` in `affinity.py`
   - Accept gift affinity_delta and apply with diminishing returns
   - Respect per-day per-character caps
   - Return capped result with reason

2. Update gift send endpoint to:
   - Deduct currency
   - Apply capped affinity
   - Record ledger entry
   - Return narration + new affinity

**Frontend:**

1. Create `frontend/app/components/GiftPanel.jsx`
   - Display gift catalog
   - Show prices, cooldown states
   - Send gift button
   - Reaction display after sending

2. Create `frontend/app/components/CoinWalletBadge.jsx`
   - Display balance in header
   - Toast on earn/spend

### Phase 3: Bonus Draw Voucher Integration

**Backend:**

1. Extend gacha draw endpoint to accept `draw_source=bonus_voucher`
2. Check voucher validity and deduct
3. Apply affinity cap on bonus draws
4. Record draw source in history

**Frontend:**

1. Extend gacha panel with voucher count display
2. Show "Bonus Draw" CTA when vouchers available
3. Confirm before using voucher

### Phase 4: Gameplay Reward Claim

**Backend:**

1. Update `POST /taverns/{tavern_id}/gameplay-sessions/{session_id}/claim-reward`
   - Check if engagement reward configured for this gameplay
   - Check daily cap
   - Check idempotency (session already claimed)
   - Award coins
   - Return amount and source

## Files to Create/Modify

### Backend (new)
- `backend/src/fablemap_api/core/engagement.py` (NEW)
- `backend/src/fablemap_api/api/v1/engagement.py` (NEW)
- `backend/src/fablemap_api/application/engagement.py` (NEW)
- `backend/src/fablemap_api/infrastructure/engagement_store.py` (NEW)

### Backend (modify)
- `backend/src/fablemap_api/core/affinity.py` — add gift affinity calculation
- `backend/src/fablemap_api/api/v1/router.py` — register engagement routes
- `backend/src/fablemap_api/application/taverns.py` — add engagement service

### Frontend (new)
- `frontend/app/lib/engagementService.js` (NEW)
- `frontend/app/components/GiftPanel.jsx` (NEW)
- `frontend/app/components/CoinWalletBadge.jsx` (NEW)
- `frontend/app/lib/engagementModes.js` (NEW)

### Frontend (modify)
- `frontend/app/product/TavernChatRoom.jsx` — integrate gift panel
- `frontend/app/components/AffinityProgress.tsx` — show gift reactions
- `frontend/app/routes/tavern.tsx` — add engagement endpoints

## MVP Scope

For MVP, implement only:
1. Engagement config (default template, no custom config UI)
2. Basic wallet/ledger with daily cap
3. Default gift catalog (3-5 items from template)
4. Gift sending → capped affinity
5. Basic bonus draw voucher (1 voucher = 30 coins, daily limit 1)
6. Simple CoinWalletBadge

NOT in MVP:
- Custom gift catalog editor UI
- Complex daily/weekly caps configuration UI
- Multiple voucher tiers

## Validation

- `py -3 -m compileall -q backend/src`
- `py -3 -m pytest -q backend/tests/test_engagement.py --tb=short`
- `npm --prefix ./frontend run build`
- Playwright screenshots (desktop + mobile)
