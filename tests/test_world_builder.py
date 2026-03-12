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

    def test_new_fantasy_types_are_generated(self) -> None:
        """扩展的 OSM 规则应正确映射到新 fantasy_type。"""
        world = build_world(
            lat=35.6580,
            lon=139.7016,
            radius=300,
            source_data=self._fixture(),
            provider="fixture",
        )
        poi_types = {poi["fantasy_type"] for poi in world["pois"]}
        # 银行 → debt_cathedral
        self.assertIn("debt_cathedral", poi_types)
        # 餐厅 → feast_hall
        self.assertIn("feast_hall", poi_types)
        # 图书馆 → memory_archive
        self.assertIn("memory_archive", poi_types)
        # 药店 → remedy_post
        self.assertIn("remedy_post", poi_types)
        # 写字楼（office 通配）→ contract_spire
        self.assertIn("contract_spire", poi_types)
        # 健身房 → labor_forge
        self.assertIn("labor_forge", poi_types)

    def test_new_types_have_required_fields(self) -> None:
        """每种新 fantasy_type 的 POI 都应包含完整必填字段。"""
        world = build_world(
            lat=35.6580,
            lon=139.7016,
            radius=300,
            source_data=self._fixture(),
            provider="fixture",
        )
        required_fields = {"id", "fantasy_name", "fantasy_type", "faction_alignment", "satire_hook", "emotion_hook"}
        new_types = {"debt_cathedral", "feast_hall", "memory_archive", "remedy_post", "contract_spire", "labor_forge"}
        for poi in world["pois"]:
            if poi.get("fantasy_type") in new_types:
                for field in required_fields:
                    self.assertIn(field, poi, f"POI {poi.get('id')} 缺少字段 {field}")

    def test_world_id_is_stable_for_same_input(self) -> None:
        fixture = self._fixture()
        first = build_world(35.6580, 139.7016, 300, source_data=fixture, provider="fixture")
        second = build_world(35.6580, 139.7016, 300, source_data=fixture, provider="fixture")
        self.assertEqual(first["world_id"], second["world_id"])
        self.assertEqual(first["seed"], second["seed"])


if __name__ == "__main__":
    unittest.main()