import json
import threading
from contextlib import contextmanager
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fablemap.page import create_server


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "overpass_sample.json"


@contextmanager
def running_page_server(output_root: Path):
    server = create_server("127.0.0.1", 0, output_root=output_root, fixture_file=FIXTURE_PATH)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}"
    finally:
        server.shutdown()
        thread.join(timeout=5)
        server.server_close()


class PageTests(unittest.TestCase):
    def test_page_server_serves_root_page_and_health(self) -> None:
        with TemporaryDirectory() as tmpdir:
            output_root = Path(tmpdir) / ".fablemap-page"
            with running_page_server(output_root) as base_url:
                with urlopen(f"{base_url}/") as response:
                    html = response.read().decode("utf-8")
                with urlopen(f"{base_url}/api/health") as response:
                    health = json.loads(response.read().decode("utf-8"))

            self.assertIn("附近地图变异世界", html)
            self.assertIn('id="language-select"', html)
            self.assertIn("Language / 语言", html)
            self.assertIn('id="use-location"', html)
            self.assertIn('data-preset="fixture-demo"', html)
            self.assertEqual(health["status"], "ok")
            self.assertTrue(health["fixture_available"])
            self.assertEqual(health["output_root"], str(output_root.resolve()))

    def test_page_server_generates_preview_bundle_from_fixture_mode(self) -> None:
        with TemporaryDirectory() as tmpdir:
            output_root = Path(tmpdir) / ".fablemap-page"
            with running_page_server(output_root) as base_url:
                request = Request(
                    f"{base_url}/api/nearby",
                    data=urlencode(
                        {
                            "lat": "35.6580",
                            "lon": "139.7016",
                            "radius": "300",
                            "mode": "fixture",
                        }
                    ).encode("utf-8"),
                    method="POST",
                )
                with urlopen(request) as response:
                    result = json.loads(response.read().decode("utf-8"))
                with urlopen(result["preview_url"]) as response:
                    preview_html = response.read().decode("utf-8")

                self.assertEqual(result["provider"], "fixture")
                self.assertEqual(result["mode"], "fixture")
                self.assertIn("region_name", result)
                self.assertIn("region_theme", result)
                self.assertIn("dominant_faction", result)
                self.assertIn("source_radius_m", result)
                self.assertIn("source_element_count", result)
                self.assertIn("generated_at", result)
                self.assertEqual(result["source_radius_m"], 300)
                self.assertTrue(result["region_name"])
                self.assertTrue(result["region_theme"])
                self.assertTrue(result["dominant_faction"])
                self.assertTrue(result["osm_url"].startswith("https://www.openstreetmap.org/"))
                self.assertTrue(result["generated_at"].endswith("Z"))
                self.assertIn("/generated/run-", result["preview_url"])
                self.assertIn("Around Late Lantern Cafe", preview_html)
                self.assertIn('id="language-select"', preview_html)
                self.assertIn("Language / 语言", preview_html)
                self.assertIn('id="section-map-observer"', preview_html)
                self.assertIn('id="observer-map"', preview_html)
                self.assertIn('id="map-detail-panel"', preview_html)
                self.assertIn('data-feature-id="', preview_html)
                self.assertIn('data-feature-card="', preview_html)
                self.assertIn("const defaultFeatureId = ", preview_html)
                self.assertIn("function setActiveFeature(featureId)", preview_html)
                self.assertTrue((output_root / result["run_id"] / "world.json").exists())
                self.assertTrue((output_root / result["run_id"] / "bundle" / "index.html").exists())


if __name__ == "__main__":
    unittest.main()