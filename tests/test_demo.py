import io
import json
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from fablemap.demo import _FIXTURE_PATH, main


_FIXTURE = str(_FIXTURE_PATH)


class DemoTests(unittest.TestCase):
    def test_demo_runner_writes_world_and_summary(self) -> None:
        """offline mode (--source-file) を使って Overpass ネットワーク不要で実行する。"""
        stdout = io.StringIO()
        stderr = io.StringIO()
        with TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir) / "demo-output"
            with redirect_stdout(stdout), redirect_stderr(stderr):
                exit_code = main(["--output-dir", str(output_dir), "--source-file", _FIXTURE])

            self.assertEqual(exit_code, 0)
            self.assertEqual(stderr.getvalue(), "")

            world_path = output_dir / "world.json"
            summary_path = output_dir / "summary.json"
            self.assertTrue(world_path.exists())
            self.assertTrue(summary_path.exists())

            manifest = json.loads(stdout.getvalue())
            world = json.loads(world_path.read_text(encoding="utf-8"))
            summary = json.loads(summary_path.read_text(encoding="utf-8"))

        self.assertEqual(manifest["world_id"], world["world_id"])
        self.assertEqual(manifest["provider"], "fixture")
        self.assertEqual(summary["world_id"], world["world_id"])
        self.assertEqual(summary["provider"], "fixture")
        self.assertGreater(summary["poi_count"], 0)
        self.assertGreater(summary["landmark_count"], 0)


if __name__ == "__main__":
    unittest.main()