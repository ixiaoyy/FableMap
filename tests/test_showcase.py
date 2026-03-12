import io
import json
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from fablemap.showcase import main
from fablemap.world_builder import build_world, write_world


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "overpass_sample.json"


class ShowcaseTests(unittest.TestCase):
    def test_showcase_runner_writes_json_and_markdown(self) -> None:
        stdout = io.StringIO()
        stderr = io.StringIO()
        world = build_world(
            lat=35.6580,
            lon=139.7016,
            radius=300,
            source_data=json.loads(FIXTURE_PATH.read_text(encoding="utf-8")),
            provider="fixture",
        )

        with TemporaryDirectory() as tmpdir:
            input_path = Path(tmpdir) / "world.json"
            output_dir = Path(tmpdir) / "showcase-output"
            write_world(input_path, world)

            with redirect_stdout(stdout), redirect_stderr(stderr):
                exit_code = main(["--input", str(input_path), "--output-dir", str(output_dir)])

            self.assertEqual(exit_code, 0)
            self.assertEqual(stderr.getvalue(), "")

            showcase_json_path = output_dir / "showcase.json"
            showcase_md_path = output_dir / "showcase.md"
            self.assertTrue(showcase_json_path.exists())
            self.assertTrue(showcase_md_path.exists())

            manifest = json.loads(stdout.getvalue())
            showcase = json.loads(showcase_json_path.read_text(encoding="utf-8"))
            markdown = showcase_md_path.read_text(encoding="utf-8")

        self.assertEqual(manifest["world_id"], world["world_id"])
        self.assertEqual(showcase["world_id"], world["world_id"])
        self.assertEqual(showcase["title"], world["region"]["name"])
        self.assertEqual(showcase["reality_skeleton"]["provider"], world["source"]["provider"])
        self.assertEqual(showcase["world_state"]["dominant_faction"], world["region"]["dominant_faction"])
        self.assertEqual(showcase["continuity_threads"]["memory_anchor_count"], len(world["memory_anchors"]))
        self.assertEqual(showcase["co_creation_storyline"]["city_myth_stage"], world["co_creation"]["city_myth_stage"])
        self.assertGreater(len(showcase["co_creation_storyline"]["participation_modes"]), 0)
        self.assertGreater(len(showcase["playable_hooks"]), 0)
        self.assertGreater(len(showcase["poi_highlights"]), 0)
        self.assertIn(world["region"]["name"], markdown)
        self.assertIn("Reality Skeleton", markdown)
        self.assertIn("World State", markdown)
        self.assertIn("Continuity Threads", markdown)
        self.assertIn("Co-Creation Storyline", markdown)
        self.assertIn("Playable Hooks", markdown)
        self.assertIn(showcase["poi_highlights"][0]["fantasy_name"], markdown)


if __name__ == "__main__":
    unittest.main()
