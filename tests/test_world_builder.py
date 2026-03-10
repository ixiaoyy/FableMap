import json
from pathlib import Path
import unittest

from fablemap.world_builder import build_world


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "overpass_sample.json"


class WorldBuilderTests(unittest.TestCase):
    def _fixture(self) -> dict:
        return json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))

    def test_build_world_produces_schema_skeleton(self) -> None:
        world = build_world(
            lat=35.6580,
            lon=139.7016,
            radius=300,
            source_data=self._fixture(),
            provider="fixture",
        )
        self.assertIn("world_id", world)
        self.assertEqual(world["source"]["provider"], "fixture")
        self.assertIn("region", world)
        self.assertIn("state", world)
        self.assertGreaterEqual(len(world["pois"]), 4)
        self.assertTrue(any(poi["fantasy_type"] == "whispering_grove" for poi in world["pois"]))
        self.assertTrue(any(poi["fantasy_type"] == "healing_sanctum" for poi in world["pois"]))
        self.assertEqual(world["roads"][0]["kind"], "residential")

    def test_world_id_is_stable_for_same_input(self) -> None:
        fixture = self._fixture()
        first = build_world(35.6580, 139.7016, 300, source_data=fixture, provider="fixture")
        second = build_world(35.6580, 139.7016, 300, source_data=fixture, provider="fixture")
        self.assertEqual(first["world_id"], second["world_id"])
        self.assertEqual(first["seed"], second["seed"])


if __name__ == "__main__":
    unittest.main()