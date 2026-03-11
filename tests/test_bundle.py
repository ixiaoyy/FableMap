import io
import json
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from fablemap.bundle import main
from fablemap.world_builder import build_world, write_world


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "overpass_sample.json"


class BundleTests(unittest.TestCase):
    def test_bundle_runner_writes_static_bundle(self) -> None:
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
            output_dir = Path(tmpdir) / "bundle-output"
            write_world(input_path, world)

            with redirect_stdout(stdout), redirect_stderr(stderr):
                exit_code = main(["--input", str(input_path), "--output-dir", str(output_dir)])

            self.assertEqual(exit_code, 0)
            self.assertEqual(stderr.getvalue(), "")

            bundle_world_path = output_dir / "world.json"
            summary_path = output_dir / "summary.json"
            showcase_json_path = output_dir / "showcase.json"
            showcase_md_path = output_dir / "showcase.md"
            preview_html_path = output_dir / "index.html"
            manifest_path = output_dir / "manifest.json"

            self.assertTrue(bundle_world_path.exists())
            self.assertTrue(summary_path.exists())
            self.assertTrue(showcase_json_path.exists())
            self.assertTrue(showcase_md_path.exists())
            self.assertTrue(preview_html_path.exists())
            self.assertTrue(manifest_path.exists())

            manifest_stdout = json.loads(stdout.getvalue())
            bundled_world = json.loads(bundle_world_path.read_text(encoding="utf-8"))
            summary = json.loads(summary_path.read_text(encoding="utf-8"))
            showcase = json.loads(showcase_json_path.read_text(encoding="utf-8"))
            preview_html = preview_html_path.read_text(encoding="utf-8")
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

        self.assertEqual(manifest_stdout["world_id"], world["world_id"])
        self.assertEqual(bundled_world["world_id"], world["world_id"])
        self.assertEqual(summary["input"], "world.json")
        self.assertEqual(showcase["summary"]["input"], "world.json")
        self.assertEqual(manifest["world_id"], world["world_id"])
        self.assertEqual(manifest["files"]["world"], "world.json")
        self.assertEqual(manifest["entrypoints"]["primary_showcase"], "showcase.json")
        self.assertEqual(manifest_stdout["preview"], str(preview_html_path))
        self.assertEqual(manifest["bundle_version"], "0.3")
        self.assertEqual(manifest["files"]["preview_html"], "index.html")
        self.assertEqual(manifest["entrypoints"]["primary_preview"], "index.html")
        self.assertEqual(manifest["slots"]["world_data"]["path"], "world.json")
        self.assertEqual(manifest["slots"]["preview_html"]["format"], "html")
        self.assertEqual(manifest["slots"]["showcase_markdown"]["format"], "markdown")
        self.assertEqual(len(manifest["resources"]), 5)
        self.assertEqual(manifest["resources"][0]["slot"], "world_data")
        self.assertEqual(manifest["resources"][2]["role"], "showcase_payload")
        self.assertEqual(manifest["resources"][4]["role"], "interactive_preview")
        self.assertEqual(showcase["reality_skeleton"]["provider"], world["source"]["provider"])
        self.assertEqual(showcase["world_state"]["dominant_faction"], world["region"]["dominant_faction"])
        self.assertGreater(len(showcase["playable_hooks"]), 0)
        self.assertIn("<title>", preview_html)
        self.assertIn(world["region"]["name"], preview_html)
        self.assertIn("showcase.json", preview_html)
        self.assertIn('id="language-select"', preview_html)
        self.assertIn('value="zh-CN">中文</option>', preview_html)
        self.assertIn('value="en">English</option>', preview_html)
        self.assertIn('id="section-reality"', preview_html)
        self.assertIn('data-i18n="sectionReality"', preview_html)
        self.assertIn('id="section-world-state"', preview_html)
        self.assertIn('data-i18n="sectionWorldState"', preview_html)
        self.assertIn('id="section-continuity"', preview_html)
        self.assertIn('id="section-playable-hooks"', preview_html)
        self.assertIn('data-i18n="sectionPlayableHooks"', preview_html)
        self.assertIn("fablemap-language", preview_html)


if __name__ == "__main__":
    unittest.main()