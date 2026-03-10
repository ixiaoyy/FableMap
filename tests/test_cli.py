import io
import json
from contextlib import redirect_stderr
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from fablemap.cli import main
from fablemap.overpass import OverpassError


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



if __name__ == "__main__":
    unittest.main()