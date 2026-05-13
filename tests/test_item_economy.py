"""
Tests for item_economy.py
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend" / "src"))

import pytest
from fablemap_api.core.item_economy import (
    parse_give_tags,
    strip_give_tags,
    calculate_total_coins,
    apply_gifts_to_wallet,
    process_npc_response,
    DEFAULT_ITEM_CATALOG,
)


class TestParseGiveTags:
    def test_single_item(self):
        events = parse_give_tags("你好。[GIVE:小鱼:1]")
        assert len(events) == 1
        assert events[0].item_name == "小鱼"
        assert events[0].quantity == 1
        assert events[0].coin_value_each == 2
        assert events[0].total_coins == 2

    def test_multiple_items(self):
        events = parse_give_tags("[GIVE:小鱼:2] 然后 [GIVE:热茶:3]")
        assert len(events) == 2
        assert events[0].total_coins == 4   # 2条小鱼 × 2
        assert events[1].total_coins == 3   # 3杯热茶 × 1

    def test_unknown_item_skipped(self):
        events = parse_give_tags("[GIVE:神秘宝物:1]")
        assert len(events) == 0

    def test_no_tags(self):
        events = parse_give_tags("今天天气真好。")
        assert len(events) == 0

    def test_quantity_multiplied(self):
        events = parse_give_tags("[GIVE:鱼干:3]")
        assert events[0].total_coins == 15  # 3条鱼干 × 5


class TestStripGiveTags:
    def test_strips_tag(self):
        text = "*她递给你一条小鱼* 喵～ [GIVE:小鱼:1]"
        clean = strip_give_tags(text)
        assert "[GIVE" not in clean
        assert "她递给你一条小鱼" in clean
        assert "喵～" in clean

    def test_no_tags_unchanged(self):
        text = "今天天气真好。"
        assert strip_give_tags(text) == text

    def test_multiple_tags_stripped(self):
        text = "[GIVE:小鱼:1] 一些文字 [GIVE:热茶:2]"
        clean = strip_give_tags(text)
        assert "[GIVE" not in clean
        assert "一些文字" in clean


class TestCalculateTotalCoins:
    def test_empty(self):
        assert calculate_total_coins([]) == 0

    def test_sum(self):
        events = parse_give_tags("[GIVE:小鱼:2][GIVE:热茶:1]")
        assert calculate_total_coins(events) == 5  # 4 + 1


class TestApplyGiftsToWallet:
    def test_balance_updated(self):
        wallet = {"balance": 10, "lifetime_earned": 10, "lifetime_spent": 0}
        ledger = []
        events = parse_give_tags("[GIVE:小鱼:2]")
        txn = apply_gifts_to_wallet(wallet, ledger, events)
        assert wallet["balance"] == 14
        assert wallet["lifetime_earned"] == 14
        assert txn["coins_added"] == 4

    def test_ledger_entry_created(self):
        wallet = {"balance": 0, "lifetime_earned": 0, "lifetime_spent": 0}
        ledger = []
        events = parse_give_tags("[GIVE:鱼干:1]")
        apply_gifts_to_wallet(wallet, ledger, events, character_id="char_mimi")
        assert len(ledger) == 1
        assert ledger[0]["type"] == "earn"
        assert ledger[0]["source_type"] == "npc_gift"
        assert ledger[0]["item_name"] == "鱼干"
        assert ledger[0]["amount"] == 5
        assert ledger[0]["character_id"] == "char_mimi"

    def test_empty_events_no_change(self):
        wallet = {"balance": 5, "lifetime_earned": 5, "lifetime_spent": 0}
        ledger = []
        txn = apply_gifts_to_wallet(wallet, ledger, [])
        assert wallet["balance"] == 5
        assert txn["coins_added"] == 0


class TestProcessNpcResponse:
    def test_full_pipeline(self):
        text = "*眯眯从毛茸茸的荷包里摸出一条鱼干* 哼，赏给你了喵！[GIVE:鱼干:2]"
        wallet = {"balance": 0, "lifetime_earned": 0, "lifetime_spent": 0}
        ledger = []
        result = process_npc_response(
            text,
            relationship_stage="familiar",  # 达到熟面孔才能收礼
            wallet=wallet,
            ledger=ledger,
        )

        # 文本已清洗
        assert "[GIVE" not in result["clean_text"]
        assert "眯眯" in result["clean_text"]

        # 金币已发放
        assert result["coins_added"] == 10   # 2条鱼干 × 5
        assert result["wallet_balance"] == 10

        # 账本已记录
        assert len(ledger) == 1

    def test_no_wallet_no_write(self):
        text = "送你一条鱼 [GIVE:小鱼:1]"
        result = process_npc_response(text)
        assert result["coins_added"] == 0
        assert result["wallet_balance"] is None
        assert "[GIVE" not in result["clean_text"]

    def test_coin_label_is_gold(self):
        # 默认物品表中没有"纪念币"字样，都是物品兑金币
        names = [item.name for item in DEFAULT_ITEM_CATALOG]
        assert "纪念币" not in names


class TestAffinityGate:
    """验证好感度门槛控制馈赠行为"""

    def _wallet(self):
        return {"balance": 0, "lifetime_earned": 0, "lifetime_spent": 0}

    def test_stranger_gets_no_coins(self):
        text = "随便说说 [GIVE:小鱼:1]"
        result = process_npc_response(text, relationship_stage="stranger", wallet=self._wallet())
        assert result["coins_added"] == 0
        assert "[GIVE" not in result["clean_text"]   # 标记仍被清除

    def test_acquaintance_gets_no_coins(self):
        text = "哦 [GIVE:热茶:1]"
        result = process_npc_response(text, relationship_stage="acquaintance", wallet=self._wallet())
        assert result["coins_added"] == 0

    def test_familiar_gets_coins(self):
        text = "*递给你一条鱼* [GIVE:小鱼:1]"
        result = process_npc_response(text, relationship_stage="familiar", wallet=self._wallet())
        assert result["coins_added"] == 2

    def test_friend_gets_coins(self):
        text = "[GIVE:鱼干:1]"
        result = process_npc_response(text, relationship_stage="friend", wallet=self._wallet())
        assert result["coins_added"] == 5

    def test_best_friend_gets_coins(self):
        text = "[GIVE:旧书:1]"
        result = process_npc_response(text, relationship_stage="best_friend", wallet=self._wallet())
        assert result["coins_added"] == 4

    def test_default_stage_is_stranger(self):
        """不传 relationship_stage 默认当陌生人，不发金币"""
        text = "[GIVE:小鱼:1]"
        result = process_npc_response(text, wallet=self._wallet())
        assert result["coins_added"] == 0

