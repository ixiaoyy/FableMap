import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from fablemap.cli import main


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
                    "--source-file",
                    str(FIXTURE_PATH),
                ]
            )
            self.assertEqual(exit_code, 0)
            world = json.loads(output_path.read_text(encoding="utf-8"))
            self.assertEqual(world["source"]["provider"], "fixture")
            self.assertGreaterEqual(len(world["pois"]), 3)


if __name__ == "__main__":
    unittest.main()