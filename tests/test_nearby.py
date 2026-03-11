import io
import json
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from fablemap.nearby import main


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "overpass_sample.json"


class NearbyTests(unittest.TestCase):
    def test_nearby_runner_writes_world_and_bundle_preview(self) -> None:
        stdout = io.StringIO()
        stderr = io.StringIO()
        with TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir) / "nearby-output"
            with redirect_stdout(stdout), redirect_stderr(stderr):
                exit_code = main(
                    [
                        "--lat",
                        "35.6580",
                        "--lon",
                        "139.7016",
                        "--radius",
                        "300",
                        "--output-dir",
                        str(output_dir),
                        "--source-file",
                        str(FIXTURE_PATH),
                    ]
                )

            self.assertEqual(exit_code, 0)
            self.assertEqual(stderr.getvalue(), "")

            world_path = output_dir / "world.json"
            bundle_world_path = output_dir / "bundle" / "world.json"
            preview_path = output_dir / "bundle" / "index.html"
            manifest_path = output_dir / "bundle" / "manifest.json"

            self.assertTrue(world_path.exists())
            self.assertTrue(bundle_world_path.exists())
            self.assertTrue(preview_path.exists())
            self.assertTrue(manifest_path.exists())

            result = json.loads(stdout.getvalue())
            world = json.loads(world_path.read_text(encoding="utf-8"))
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

        self.assertEqual(result["world_id"], world["world_id"])
        self.assertEqual(result["provider"], "fixture")
        self.assertEqual(result["cache_status"], "fixture")
        self.assertEqual(result["bundle_version"], "0.3")
        self.assertEqual(result["preview"], str(preview_path))
        self.assertEqual(manifest["entrypoints"]["primary_preview"], "index.html")

    def test_nearby_runner_passes_cache_arguments_for_live_requests(self) -> None:
        fake_world = {
            "world_id": "world-demo",
            "source": {"provider": "overpass"},
        }
        fake_bundle_result = {
            "manifest": "bundle/manifest.json",
            "preview": "bundle/index.html",
            "bundle_version": "0.3",
        }
        stdout = io.StringIO()
        with TemporaryDirectory() as tmpdir, patch(
            "fablemap.nearby.build_world",
            return_value=fake_world,
        ) as build_world_mock, patch("fablemap.nearby.write_world"), patch(
            "fablemap.nearby.export_bundle",
            return_value=fake_bundle_result,
        ):
            output_dir = Path(tmpdir) / "nearby-output"
            cache_dir = Path(tmpdir) / "cache"
            with redirect_stdout(stdout):
                exit_code = main(
                    [
                        "--lat",
                        "35.6580",
                        "--lon",
                        "139.7016",
                        "--radius",
                        "300",
                        "--output-dir",
                        str(output_dir),
                        "--cache-dir",
                        str(cache_dir),
                        "--refresh",
                        "--request-timeout",
                        "5",
                        "--request-retries",
                        "2",
                    ]
                )

        self.assertEqual(exit_code, 0)
        kwargs = build_world_mock.call_args.kwargs
        result = json.loads(stdout.getvalue())
        self.assertEqual(kwargs["fetch_cache_dir"], cache_dir)
        self.assertTrue(kwargs["refresh_cache"])
        self.assertEqual(kwargs["fetch_timeout_seconds"], 5)
        self.assertEqual(kwargs["fetch_max_retries"], 2)
        self.assertEqual(result["provider"], "overpass")
        self.assertEqual(result["cache_status"], "refreshed")
        self.assertEqual(result["cache_dir"], str(cache_dir))


if __name__ == "__main__":
    unittest.main()