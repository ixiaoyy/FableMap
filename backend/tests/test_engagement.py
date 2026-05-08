"""
Engagement System Tests — per-tavern soft currency, gifts, and bonus draw vouchers.
"""

from __future__ import annotations

import pytest

from fablemap_api.core.engagement import (
    EngagementConfig,
    EngagementConfig,
    VisitorEngagementProgress,
    earn_coins,
    check_earn_eligibility,
    spend_coins,
    check_spend_eligibility,
    send_gift,
    redeem_voucher,
    calculate_gift_affinity_delta,
    DEFAULT_GIFT_CATALOG,
    DEFAULT_BONUS_DRAW,
)


# ─── EngagementConfig ───────────────────────────────────────────────────────────


def test_engagement_config_default() -> None:
    cfg = EngagementConfig.default_template()
    assert cfg.coin_label == "纪念币"
    assert cfg.earn_limits.daily_per_visitor == 50
    assert cfg.earn_limits.weekly_per_visitor == 200
    assert len(cfg.gift_catalog) == 3
    assert cfg.bonus_draw.enabled is True
    assert cfg.bonus_draw.voucher_price == 30


def test_engagement_config_from_dict() -> None:
    data = {
        "coin_label": "心意点",
        "earn_limits": {"daily_per_visitor": 30, "weekly_per_visitor": 100},
        "gift_catalog": DEFAULT_GIFT_CATALOG,
        "bonus_draw": DEFAULT_BONUS_DRAW,
    }
    cfg = EngagementConfig.from_dict(data)
    assert cfg.coin_label == "心意点"
    assert cfg.earn_limits.daily_per_visitor == 30
    assert cfg.gift_catalog[0].id == "warm_tea"


def test_engagement_config_to_dict_roundtrip() -> None:
    cfg = EngagementConfig.default_template()
    data = cfg.to_dict()
    restored = EngagementConfig.from_dict(data)
    assert restored.coin_label == cfg.coin_label
    assert restored.earn_limits.daily_per_visitor == cfg.earn_limits.daily_per_visitor


# ─── VisitorEngagementProgress ─────────────────────────────────────────────────


def test_visitor_progress_defaults() -> None:
    progress = VisitorEngagementProgress()
    assert progress.wallet.balance == 0
    assert progress.wallet.lifetime_earned == 0
    assert progress.wallet.lifetime_spent == 0
    assert len(progress.ledger) == 0
    assert len(progress.bonus_draw_vouchers) == 0


def test_visitor_progress_from_dict() -> None:
    data = {
        "wallet": {"balance": 50, "lifetime_earned": 100, "lifetime_spent": 50},
        "ledger": [],
        "daily_counters": {},
        "gift_history": [],
        "bonus_draw_vouchers": [],
        "claimed_session_ids": ["session_1", "session_2"],
    }
    progress = VisitorEngagementProgress.from_dict(data)
    assert progress.wallet.balance == 50
    assert progress.wallet.lifetime_earned == 100
    assert "session_1" in progress.claimed_session_ids


def test_visitor_progress_to_dict_roundtrip() -> None:
    progress = VisitorEngagementProgress()
    progress.wallet.balance = 75
    progress.claimed_session_ids.add("test_session")
    data = progress.to_dict()
    restored = VisitorEngagementProgress.from_dict(data)
    assert restored.wallet.balance == 75
    assert "test_session" in restored.claimed_session_ids


# ─── Earn Coins ─────────────────────────────────────────────────────────────────


def test_earn_coins_basic() -> None:
    progress = VisitorEngagementProgress()
    cfg = EngagementConfig.default_template()

    result = earn_coins(progress, cfg, amount=10, source_type="gameplay_completion", source_id="gp_1")
    assert result.success is True
    assert result.amount == 10
    assert progress.wallet.balance == 10
    assert progress.wallet.lifetime_earned == 10
    assert len(progress.ledger) == 1
    assert progress.ledger[0].type == "earn"


def test_earn_coins_idempotency() -> None:
    progress = VisitorEngagementProgress()
    cfg = EngagementConfig.default_template()

    result1 = earn_coins(progress, cfg, amount=10, source_type="gameplay_completion", source_id="gp_1")
    assert result1.success is True

    result2 = earn_coins(progress, cfg, amount=10, source_type="gameplay_completion", source_id="gp_1")
    assert result2.success is False
    assert "已领取" in result2.reason
    assert progress.wallet.balance == 10  # Not doubled


def test_earn_coins_daily_cap() -> None:
    progress = VisitorEngagementProgress()
    cfg = EngagementConfig.default_template()
    cfg.earn_limits.daily_per_visitor = 20

    # Earn up to daily cap
    result1 = earn_coins(progress, cfg, amount=10, source_type="gameplay_completion", source_id="gp_1")
    assert result1.success is True
    assert progress.wallet.balance == 10

    result2 = earn_coins(progress, cfg, amount=10, source_type="gameplay_completion", source_id="gp_2")
    assert result2.success is True
    assert progress.wallet.balance == 20

    # Try to exceed cap
    result3 = earn_coins(progress, cfg, amount=10, source_type="gameplay_completion", source_id="gp_3")
    assert result3.success is False
    assert "已达上限" in result3.reason
    assert progress.wallet.balance == 20  # Not changed


# ─── Spend Coins ────────────────────────────────────────────────────────────────


def test_spend_coins_basic() -> None:
    progress = VisitorEngagementProgress()
    progress.wallet.balance = 50
    cfg = EngagementConfig.default_template()

    result = spend_coins(progress, cfg, amount=10, source_type="gift", source_id="warm_tea")
    assert result.success is True
    assert result.amount == 10
    assert progress.wallet.balance == 40
    assert progress.wallet.lifetime_spent == 10


def test_spend_coins_insufficient_balance() -> None:
    progress = VisitorEngagementProgress()
    progress.wallet.balance = 5
    cfg = EngagementConfig.default_template()

    result = spend_coins(progress, cfg, amount=10, source_type="gift", source_id="warm_tea")
    assert result.success is False
    assert "余额不足" in result.reason
    assert progress.wallet.balance == 5  # Not changed


# ─── Send Gift ──────────────────────────────────────────────────────────────────


def test_send_gift_basic() -> None:
    progress = VisitorEngagementProgress()
    progress.wallet.balance = 50
    cfg = EngagementConfig.default_template()

    result = send_gift(progress, cfg, gift_id="warm_tea", character_id="char_1")
    assert result.success is True
    assert result.gift_id == "warm_tea"
    assert result.character_id == "char_1"
    assert result.affinity_delta == 2.0
    assert result.cap_applied is False
    assert progress.wallet.balance == 40  # 50 - 10


def test_send_gift_insufficient_balance() -> None:
    progress = VisitorEngagementProgress()
    progress.wallet.balance = 5
    cfg = EngagementConfig.default_template()

    result = send_gift(progress, cfg, gift_id="warm_tea", character_id="char_1")
    assert result.success is False
    assert "余额不足" in result.reason


def test_send_gift_not_found() -> None:
    progress = VisitorEngagementProgress()
    progress.wallet.balance = 50
    cfg = EngagementConfig.default_template()

    result = send_gift(progress, cfg, gift_id="nonexistent", character_id="char_1")
    assert result.success is False
    assert "找不到" in result.reason


def test_send_gift_diminishing_returns() -> None:
    progress = VisitorEngagementProgress()
    progress.wallet.balance = 200
    cfg = EngagementConfig.default_template()

    # First gift today to char_1
    result1 = send_gift(progress, cfg, gift_id="warm_tea", character_id="char_1")
    assert result1.success is True
    assert result1.affinity_delta == 2.0

    # Send to a DIFFERENT character — first gift, no diminishing returns
    result2 = send_gift(progress, cfg, gift_id="warm_tea", character_id="char_2")
    assert result2.success is True
    assert result2.affinity_delta == 2.0  # No dim returns for new character

    # Send SAME gift to char_1 again — cooldown may block, so use a different gift
    result3 = send_gift(progress, cfg, gift_id="sweet_pastry", character_id="char_1")
    assert result3.success is True
    assert result3.affinity_delta == 1.5  # 3.0 * 0.5 dim returns for existing char_1 affinity


# ─── Bonus Draw Voucher ───────────────────────────────────────────────────────────


def test_redeem_voucher_basic() -> None:
    progress = VisitorEngagementProgress()
    progress.wallet.balance = 50
    cfg = EngagementConfig.default_template()

    result = redeem_voucher(progress, cfg)
    assert result.success is True
    assert result.voucher_id
    assert len(progress.bonus_draw_vouchers) == 1
    assert progress.bonus_draw_vouchers[0].redeemed is False
    assert progress.wallet.balance == 20  # 50 - 30


def test_redeem_voucher_insufficient_balance() -> None:
    progress = VisitorEngagementProgress()
    progress.wallet.balance = 20
    cfg = EngagementConfig.default_template()

    result = redeem_voucher(progress, cfg)
    assert result.success is False
    assert "余额不足" in result.reason


def test_redeem_voucher_daily_limit() -> None:
    progress = VisitorEngagementProgress()
    progress.wallet.balance = 200
    cfg = EngagementConfig.default_template()
    cfg.bonus_draw.daily_limit = 1

    # First redeem
    result1 = redeem_voucher(progress, cfg)
    assert result1.success is True

    # Second redeem fails daily limit
    result2 = redeem_voucher(progress, cfg)
    assert result2.success is False
    assert "次数已用完" in result2.reason


def test_redeem_voucher_disabled() -> None:
    progress = VisitorEngagementProgress()
    progress.wallet.balance = 50
    cfg = EngagementConfig.default_template()
    cfg.bonus_draw.enabled = False

    result = redeem_voucher(progress, cfg)
    assert result.success is False
    assert "功能已关闭" in result.reason


# ─── Affinity Delta Calculation ──────────────────────────────────────────────────


def test_calculate_gift_affinity_first_gift() -> None:
    progress = VisitorEngagementProgress()
    cfg = EngagementConfig.default_template()
    gift = cfg.gift_catalog[0]  # warm_tea

    delta, cap = calculate_gift_affinity_delta(progress, cfg, gift, "char_1")
    assert delta == 2.0
    assert cap is False


def test_calculate_gift_affinity_diminishing_returns() -> None:
    progress = VisitorEngagementProgress()
    cfg = EngagementConfig.default_template()

    # Simulate already gifted today
    from datetime import UTC, datetime
    today_key = datetime.now(UTC).strftime("%Y-%m-%d")
    daily = progress.get_daily_counters(today_key)
    daily.gift_affinity_by_character["char_1"] = 2.0

    gift = cfg.gift_catalog[0]  # warm_tea
    delta, cap = calculate_gift_affinity_delta(progress, cfg, gift, "char_1")
    assert cap is True
    assert delta == 1.0  # 2.0 * 0.5


# ─── Ledger ──────────────────────────────────────────────────────────────────────


def test_ledger_records_earn_and_spend() -> None:
    progress = VisitorEngagementProgress()
    cfg = EngagementConfig.default_template()

    earn_coins(progress, cfg, amount=20, source_type="gameplay_completion", source_id="gp_1")
    spend_coins(progress, cfg, amount=10, source_type="gift", source_id="warm_tea")

    assert len(progress.ledger) == 2
    assert progress.ledger[0].type == "earn"
    assert progress.ledger[0].amount == 20
    assert progress.ledger[1].type == "spend"
    assert progress.ledger[1].amount == -10


def test_ledger_entry_fields() -> None:
    progress = VisitorEngagementProgress()
    cfg = EngagementConfig.default_template()

    result = earn_coins(progress, cfg, amount=15, source_type="gameplay_completion", source_id="gp_2")
    entry = progress.ledger[0]

    assert entry.id
    assert entry.type == "earn"
    assert entry.source_type == "gameplay_completion"
    assert entry.source_id == "gp_2"
    assert entry.amount == 15
    assert entry.created_at