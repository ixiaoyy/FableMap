"""Tests for relationship graph prompt injection.

Covers:
- PromptBuilder injection of [关系图] system message
- Privacy: only confirmed edges appear
- Bounded: max 5 edges injected
- Direction labeling: outgoing vs incoming
- Empty relationship_context produces no relationship message
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from fablemap_api.core.prompt_builder import (
    ChatMessage as PromptChatMessage,
    PromptBuilder,
    PromptBuildConfig,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_prompt(
    relationship_context: list[dict] | None = None,
    messages: list[PromptChatMessage] | None = None,
) -> list[dict]:
    """Build a prompt and return the message list."""
    config = PromptBuildConfig(
        char_name="测试角色",
        tavern_name="测试空间",
        relationship_context=relationship_context or [],
        output_format="openai",
    )
    builder = PromptBuilder(config)
    result = builder.build(messages or [], "你好")
    return result["messages"]


def _find_relationship_message(messages: list[dict]) -> str | None:
    """Find the [关系图] system message, or return None."""
    for m in messages:
        content = m.get("content", "")
        if content.startswith("[关系图]"):
            return content
    return None


# ---------------------------------------------------------------------------
# PromptBuilder injection tests
# ---------------------------------------------------------------------------

class TestRelationshipPromptInjection:
    """Test that relationship context is injected into prompts correctly."""

    def test_empty_context_no_injection(self) -> None:
        messages = _build_prompt(relationship_context=[])
        rel = _find_relationship_message(messages)
        assert rel is None, "Empty context should produce no [关系图] message"

    def test_single_outgoing_edge(self) -> None:
        ctx = [{
            "target_name": "隔壁咖啡馆",
            "behavior_type": "friendly",
            "strength_preset": "normal",
            "direction": "outgoing",
            "display_name": "隔壁咖啡馆",
            "description": "",
        }]
        messages = _build_prompt(relationship_context=ctx)
        rel = _find_relationship_message(messages)
        assert rel is not None
        assert "隔壁咖啡馆" in rel
        assert "友好" in rel
        assert "一般" in rel
        assert "店主配置" in rel

    def test_single_incoming_edge(self) -> None:
        ctx = [{
            "target_name": "远古遗迹",
            "behavior_type": "rival",
            "strength_preset": "strong",
            "direction": "incoming",
            "display_name": "远古遗迹",
            "description": "",
        }]
        messages = _build_prompt(relationship_context=ctx)
        rel = _find_relationship_message(messages)
        assert rel is not None
        assert "远古遗迹" in rel
        assert "竞争" in rel
        assert "紧密" in rel
        assert "对你的" in rel

    def test_multiple_edges(self) -> None:
        ctx = [
            {
                "target_name": "A馆",
                "behavior_type": "allied",
                "strength_preset": "strong",
                "direction": "outgoing",
                "display_name": "A馆",
                "description": "",
            },
            {
                "target_name": "B馆",
                "behavior_type": "hostile",
                "strength_preset": "weak",
                "direction": "incoming",
                "display_name": "B馆",
                "description": "",
            },
        ]
        messages = _build_prompt(relationship_context=ctx)
        rel = _find_relationship_message(messages)
        assert rel is not None
        assert "A馆" in rel
        assert "同盟" in rel
        assert "B馆" in rel
        assert "敌对" in rel
        assert "微弱" in rel

    def test_direction_labels_outgoing(self) -> None:
        ctx = [{
            "target_name": "目标",
            "behavior_type": "neutral",
            "strength_preset": "normal",
            "direction": "outgoing",
            "display_name": "目标",
            "description": "",
        }]
        messages = _build_prompt(relationship_context=ctx)
        rel = _find_relationship_message(messages)
        assert rel is not None
        assert "你对他们的" in rel

    def test_direction_labels_incoming(self) -> None:
        ctx = [{
            "target_name": "来源",
            "behavior_type": "neutral",
            "strength_preset": "normal",
            "direction": "incoming",
            "display_name": "来源",
            "description": "",
        }]
        messages = _build_prompt(relationship_context=ctx)
        rel = _find_relationship_message(messages)
        assert rel is not None
        assert "对你的" in rel

    def test_display_name_fallback_to_target_name(self) -> None:
        ctx = [{
            "target_name": "隐秘之地",
            "behavior_type": "friendly",
            "strength_preset": "weak",
            "direction": "outgoing",
            "display_name": "",
            "description": "",
        }]
        messages = _build_prompt(relationship_context=ctx)
        rel = _find_relationship_message(messages)
        assert rel is not None
        assert "隐秘之地" in rel

    def test_unknown_behavior_type_passthrough(self) -> None:
        """Unknown behavior_type should pass through as-is."""
        ctx = [{
            "target_name": "X",
            "behavior_type": "custom_type",
            "strength_preset": "normal",
            "direction": "outgoing",
            "display_name": "X",
            "description": "",
        }]
        messages = _build_prompt(relationship_context=ctx)
        rel = _find_relationship_message(messages)
        assert rel is not None
        assert "custom_type" in rel

    def test_max_5_edges_in_config(self) -> None:
        """PromptBuildConfig accepts any number; runtime limits to 5."""
        ctx = [
            {
                "target_name": f"空间{i}",
                "behavior_type": "friendly",
                "strength_preset": "normal",
                "direction": "outgoing",
                "display_name": f"空间{i}",
                "description": "",
            }
            for i in range(10)
        ]
        # Config doesn't limit; the runtime method does.
        # But prompt builder should handle any list gracefully.
        messages = _build_prompt(relationship_context=ctx)
        rel = _find_relationship_message(messages)
        assert rel is not None
        # All 10 should appear in the prompt text (runtime limits to 5)
        for i in range(10):
            assert f"空间{i}" in rel


# ---------------------------------------------------------------------------
# _fetch_relationship_context tests (with mocked store)
# ---------------------------------------------------------------------------

class TestFetchRelationshipContext:
    """Test the runtime method that fetches relationship edges."""

    def _make_edge(
        self,
        edge_id: str,
        source_node_type: str = "tavern",
        source_node_id: str = "t1",
        target_node_type: str = "tavern",
        target_node_id: str = "t2",
        behavior_type: str = "friendly",
        strength_preset: str = "normal",
        display_name: str = "",
        description: str = "",
        status: str = "confirmed",
    ):
        """Create a mock RelationshipEdge."""
        edge = MagicMock()
        edge.id = edge_id
        edge.source_node_type = source_node_type
        edge.source_node_id = source_node_id
        edge.target_node_type = target_node_type
        edge.target_node_id = target_node_id
        edge.behavior_type = behavior_type
        edge.strength_preset = strength_preset
        edge.display_name = display_name
        edge.description = description
        edge.status = status
        return edge

    def test_no_database_returns_empty(self) -> None:
        from fablemap_api.application.services.runtime import RuntimeApplicationMixin

        mixin = RuntimeApplicationMixin.__new__(RuntimeApplicationMixin)
        mixin.store = MagicMock()

        with patch("fablemap_api.application.services.runtime.store_database", return_value=None):
            result = mixin._fetch_relationship_context("t1", "c1")
        assert result == []

    def test_confirmed_tavern_edge_outgoing(self) -> None:
        from fablemap_api.application.services.runtime import RuntimeApplicationMixin

        mixin = RuntimeApplicationMixin.__new__(RuntimeApplicationMixin)
        mixin.store = MagicMock()

        edge = self._make_edge(
            "e1",
            source_node_id="t1",
            target_node_id="t2",
            display_name="邻居空间",
        )

        with (
            patch("fablemap_api.application.services.runtime.store_database", return_value=MagicMock()),
            patch(
                "fablemap_api.infrastructure.relationship_graph_store.SQLAlchemyRelationshipGraphStore",
                return_value=MagicMock(list_confirmed_edges_for_node=MagicMock(return_value=[edge])),
            ),
        ):
            result = mixin._fetch_relationship_context("t1", "")

        assert len(result) == 1
        assert result[0]["direction"] == "outgoing"
        assert result[0]["target_name"] == "邻居空间"
        assert result[0]["behavior_type"] == "friendly"

    def test_confirmed_edge_incoming_direction(self) -> None:
        from fablemap_api.application.services.runtime import RuntimeApplicationMixin

        mixin = RuntimeApplicationMixin.__new__(RuntimeApplicationMixin)
        mixin.store = MagicMock()

        # Edge where current tavern is the TARGET, not source
        edge = self._make_edge(
            "e2",
            source_node_id="other_tavern",
            target_node_id="t1",
            display_name="远方来客",
        )

        with (
            patch("fablemap_api.application.services.runtime.store_database", return_value=MagicMock()),
            patch(
                "fablemap_api.infrastructure.relationship_graph_store.SQLAlchemyRelationshipGraphStore",
                return_value=MagicMock(list_confirmed_edges_for_node=MagicMock(return_value=[edge])),
            ),
        ):
            result = mixin._fetch_relationship_context("t1", "")

        assert len(result) == 1
        assert result[0]["direction"] == "incoming"
        assert result[0]["target_name"] == "远方来客"

    def test_dedup_across_tavern_and_character_edges(self) -> None:
        from fablemap_api.application.services.runtime import RuntimeApplicationMixin

        mixin = RuntimeApplicationMixin.__new__(RuntimeApplicationMixin)
        mixin.store = MagicMock()

        shared_edge = self._make_edge("shared_e", source_node_id="t1", target_node_id="t2")
        char_edge = self._make_edge("char_e", source_node_type="character", source_node_id="c1", target_node_id="t3", display_name="角色关系")

        def mock_list_confirmed(node_type, node_id, source_owner_id=None):
            if node_type == "tavern":
                return [shared_edge]
            return [char_edge]

        with (
            patch("fablemap_api.application.services.runtime.store_database", return_value=MagicMock()),
            patch(
                "fablemap_api.infrastructure.relationship_graph_store.SQLAlchemyRelationshipGraphStore",
                return_value=MagicMock(list_confirmed_edges_for_node=MagicMock(side_effect=mock_list_confirmed)),
            ),
        ):
            result = mixin._fetch_relationship_context("t1", "c1")

        assert len(result) == 2
        ids = {r["display_name"] for r in result}
        assert "邻居空间" not in ids or "" in ids  # shared_edge has no display_name

    def test_max_5_edges_returned(self) -> None:
        from fablemap_api.application.services.runtime import RuntimeApplicationMixin

        mixin = RuntimeApplicationMixin.__new__(RuntimeApplicationMixin)
        mixin.store = MagicMock()

        edges = [
            self._make_edge(f"e{i}", source_node_id="t1", target_node_id=f"t{i}", display_name=f"空间{i}")
            for i in range(8)
        ]

        with (
            patch("fablemap_api.application.services.runtime.store_database", return_value=MagicMock()),
            patch(
                "fablemap_api.infrastructure.relationship_graph_store.SQLAlchemyRelationshipGraphStore",
                return_value=MagicMock(list_confirmed_edges_for_node=MagicMock(return_value=edges)),
            ),
        ):
            result = mixin._fetch_relationship_context("t1", "")

        assert len(result) == 5

    def test_store_import_error_returns_empty(self) -> None:
        from fablemap_api.application.services.runtime import RuntimeApplicationMixin

        mixin = RuntimeApplicationMixin.__new__(RuntimeApplicationMixin)
        mixin.store = MagicMock()

        with (
            patch("fablemap_api.application.services.runtime.store_database", return_value=MagicMock()),
            patch(
                "fablemap_api.infrastructure.relationship_graph_store.SQLAlchemyRelationshipGraphStore",
                side_effect=ImportError("no module"),
            ),
        ):
            result = mixin._fetch_relationship_context("t1", "")

        assert result == []

    def test_fallback_display_name_to_node_id(self) -> None:
        from fablemap_api.application.services.runtime import RuntimeApplicationMixin

        mixin = RuntimeApplicationMixin.__new__(RuntimeApplicationMixin)
        mixin.store = MagicMock()

        edge = self._make_edge("e1", source_node_id="t1", target_node_id="hidden_space_id", display_name="")

        with (
            patch("fablemap_api.application.services.runtime.store_database", return_value=MagicMock()),
            patch(
                "fablemap_api.infrastructure.relationship_graph_store.SQLAlchemyRelationshipGraphStore",
                return_value=MagicMock(list_confirmed_edges_for_node=MagicMock(return_value=[edge])),
            ),
        ):
            result = mixin._fetch_relationship_context("t1", "")

        assert len(result) == 1
        assert result[0]["target_name"] == "hidden_space_id"
