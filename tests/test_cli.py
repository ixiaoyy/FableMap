import io
import json
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from fablemap.cli import main
from fablemap.overpass import OverpassError
from fablemap.world_builder import build_world, write_world


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "overpass_sample.json"


class CliTests(unittest.TestCase):
    def test_generate_writes_world_file(self) -> None:
        with TemporaryDirectory() as tmpdir:
            output_path = Path(tmpdir) / "world.json"
            exit_code = main(
                [
                    "generate",
                    "--lat",
                    "35.6580",
                    "--lon",
                    "139.7016",
                    "--radius",
                    "300",
                    "--output",
                    str(output_path),
                    "--request-timeout",
                    "5",
                    "--request-retries",
                    "0",
                    "--source-file",
                    str(FIXTURE_PATH),
                ]
            )
            self.assertEqual(exit_code, 0)
            world = json.loads(output_path.read_text(encoding="utf-8"))
            self.assertEqual(world["source"]["provider"], "fixture")
            self.assertGreaterEqual(len(world["pois"]), 3)

    def test_generate_passes_cache_arguments_for_live_requests(self) -> None:
        fake_world = {
            "world_id": "world-demo",
            "source": {"provider": "overpass"},
            "pois": [],
            "roads": [],
            "landmarks": [],
        }
        with TemporaryDirectory() as tmpdir, patch(
            "fablemap.cli.build_world",
            return_value=fake_world,
        ) as build_world_mock, patch("fablemap.cli.write_world"):
            output_path = Path(tmpdir) / "world.json"
            cache_dir = Path(tmpdir) / "cache"
            exit_code = main(
                [
                    "generate",
                    "--lat",
                    "35.6580",
                    "--lon",
                    "139.7016",
                    "--radius",
                    "300",
                    "--output",
                    str(output_path),
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
        self.assertEqual(kwargs["fetch_cache_dir"], cache_dir)
        self.assertTrue(kwargs["refresh_cache"])
        self.assertEqual(kwargs["fetch_timeout_seconds"], 5)
        self.assertEqual(kwargs["fetch_max_retries"], 2)

    def test_generate_returns_error_when_live_fetch_fails(self) -> None:
        stderr = io.StringIO()
        with TemporaryDirectory() as tmpdir, patch(
            "fablemap.cli.build_world",
            side_effect=OverpassError("Overpass request failed due to network error on attempt 1/1 with timeout 5s: test outage"),
        ):
            output_path = Path(tmpdir) / "world.json"
            with redirect_stderr(stderr):
                exit_code = main(
                    [
                        "generate",
                        "--lat",
                        "35.6580",
                        "--lon",
                        "139.7016",
                        "--radius",
                        "300",
                        "--output",
                        str(output_path),
                        "--request-timeout",
                        "5",
                        "--request-retries",
                        "0",
                    ]
                )
        self.assertEqual(exit_code, 1)
        self.assertIn("Overpass request failed due to network error", stderr.getvalue())
        self.assertFalse(output_path.exists())

    def test_nearby_subcommand_writes_world_and_bundle(self) -> None:
        stdout = io.StringIO()
        stderr = io.StringIO()
        with TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir) / "nearby-output"
            with redirect_stdout(stdout), redirect_stderr(stderr):
                exit_code = main(
                    [
                        "nearby",
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
            result = json.loads(stdout.getvalue())
            self.assertTrue((output_dir / "world.json").exists())
            self.assertTrue((output_dir / "bundle" / "index.html").exists())

        self.assertEqual(result["provider"], "fixture")
        self.assertEqual(result["cache_status"], "fixture")
        self.assertEqual(result["preview"], str(output_dir / "bundle" / "index.html"))

    def test_page_subcommand_delegates_to_page_runner(self) -> None:
        with patch("fablemap.page.run_page", return_value=0) as run_page_mock:
            exit_code = main(["page", "--port", "8765", "--no-open"])
        self.assertEqual(exit_code, 0)
        args = run_page_mock.call_args.args[0]
        self.assertEqual(args.port, 8765)
        self.assertTrue(args.no_open)

    def test_inspect_reads_world_file_and_prints_summary(self) -> None:
        stdout = io.StringIO()
        world = build_world(
            lat=35.6580,
            lon=139.7016,
            radius=300,
            source_data=json.loads(FIXTURE_PATH.read_text(encoding="utf-8")),
            provider="fixture",
        )
        with TemporaryDirectory() as tmpdir:
            input_path = Path(tmpdir) / "world.json"
            write_world(input_path, world)
            with redirect_stdout(stdout):
                exit_code = main(["inspect", "--input", str(input_path)])
        self.assertEqual(exit_code, 0)
        summary = json.loads(stdout.getvalue())
        self.assertEqual(summary["world_id"], world["world_id"])
        self.assertEqual(summary["provider"], "fixture")
        self.assertEqual(summary["theme"], world["region"]["theme"])
        self.assertEqual(summary["poi_count"], len(world["pois"]))
        self.assertEqual(summary["landmark_count"], len(world["landmarks"]))
        self.assertEqual(summary["state_version"], world["state"]["version"])
        self.assertEqual(summary["input"], str(input_path))

    def test_inspect_returns_error_when_input_is_missing(self) -> None:
        stderr = io.StringIO()
        missing_path = Path("missing-world.json")
        with redirect_stderr(stderr):
            exit_code = main(["inspect", "--input", str(missing_path)])
        self.assertEqual(exit_code, 1)
        self.assertIn("error:", stderr.getvalue())
        self.assertIn("missing-world.json", stderr.getvalue())

    def test_inspect_returns_schema_error_when_world_id_is_missing(self) -> None:
        stderr = io.StringIO()
        world = build_world(
            lat=35.6580,
            lon=139.7016,
            radius=300,
            source_data=json.loads(FIXTURE_PATH.read_text(encoding="utf-8")),
            provider="fixture",
        )
        del world["world_id"]
        with TemporaryDirectory() as tmpdir:
            input_path = Path(tmpdir) / "invalid-world.json"
            write_world(input_path, world)
            with redirect_stderr(stderr):
                exit_code = main(["inspect", "--input", str(input_path)])
        self.assertEqual(exit_code, 4)
        self.assertIn("world schema validation failed", stderr.getvalue())
        self.assertIn("missing top-level field 'world_id'", stderr.getvalue())

    def test_inspect_returns_schema_error_when_state_version_is_missing(self) -> None:
        stderr = io.StringIO()
        world = build_world(
            lat=35.6580,
            lon=139.7016,
            radius=300,
            source_data=json.loads(FIXTURE_PATH.read_text(encoding="utf-8")),
            provider="fixture",
        )
        del world["state"]["version"]
        with TemporaryDirectory() as tmpdir:
            input_path = Path(tmpdir) / "invalid-world.json"
            write_world(input_path, world)
            with redirect_stderr(stderr):
                exit_code = main(["inspect", "--input", str(input_path)])
        self.assertEqual(exit_code, 4)
        self.assertIn("world schema validation failed", stderr.getvalue())
        self.assertIn("state.version", stderr.getvalue())

    def test_inspect_returns_schema_error_when_pois_is_not_a_list(self) -> None:
        stderr = io.StringIO()
        world = build_world(
            lat=35.6580,
            lon=139.7016,
            radius=300,
            source_data=json.loads(FIXTURE_PATH.read_text(encoding="utf-8")),
            provider="fixture",
        )
        world["pois"] = "not-a-list"
        with TemporaryDirectory() as tmpdir:
            input_path = Path(tmpdir) / "invalid-world.json"
            write_world(input_path, world)
            with redirect_stderr(stderr):
                exit_code = main(["inspect", "--input", str(input_path)])
        self.assertEqual(exit_code, 4)
        self.assertIn("field 'pois' must be a list", stderr.getvalue())



if __name__ == "__main__":
    unittest.main()