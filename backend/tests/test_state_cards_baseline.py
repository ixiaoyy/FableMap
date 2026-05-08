
import unittest
from fablemap_api.core.state_cards import StateCard, extract_state_card_candidates_from_turn

class TestStateCard(unittest.TestCase):
    def test_basic_serialization(self):
        card = StateCard(
            id="card_1",
            tavern_id="t1",
            summary="Test summary",
            category="task",
            status="pending"
        )
        data = card.to_dict()
        self.assertEqual(data["id"], "card_1")
        self.assertEqual(data["summary"], "Test summary")
        
        card2 = StateCard.from_dict(data)
        self.assertEqual(card2.id, "card_1")
        self.assertEqual(card2.category, "task")

    def test_extraction_markers(self):
        cards = extract_state_card_candidates_from_turn(
            tavern_id="t1",
            visitor_id="v1",
            assistant_message="我会帮你找到那把钥匙。"
        )
        # Should detect "钥匙" as a resource marker
        categories = [c.category for c in cards]
        self.assertIn("resource", categories)

if __name__ == "__main__":
    unittest.main()
