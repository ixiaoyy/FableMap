import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from fastapi.testclient import TestClient

from fablemap.api import create_app
from fablemap.api_service import build_health_payload, build_meta_payload, build_nearby_payload
from fablemap.web.config import ApiSettings
from fablemap.web.service import WebService


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "overpass_sample.json"
FRONTEND_ROOT = Path(__file__).resolve().parent.parent / "frontend"


class ApiTests(unittest.TestCase):
    def test_api_server_serves_built_frontend_health_and_meta(self) -> None:
        with TemporaryDirectory() as tmpdir:
            output_root = Path(tmpdir) / ".fablemap-api"
            app = create_app(
                output_root=output_root,
                fixture_file=FIXTURE_PATH,
                frontend_root=FRONTEND_ROOT,
            )
            with TestClient(app) as client:
                html = client.get("/").text
                health = client.get("/api/health").json()
                meta = client.get("/api/meta").json()

        self.assertIn("FableMap · FastAPI + React", html)
        self.assertIn('id="root"', html)
        self.assertIn('/assets/', html)
        self.assertIn('type="module" crossorigin', html)
        self.assertIn('rel="stylesheet" crossorigin', html)
        self.assertEqual(health["status"], "ok")
        self.assertTrue(health["fixture_available"])
        self.assertTrue(health["frontend_available"])
        self.assertEqual(health["output_root"], str(output_root.resolve()))
        self.assertEqual(meta["project"], "FableMap")
        self.assertEqual(meta["frontend_mode"], "separated-shell")
        self.assertEqual(meta["api_base"], "http://testserver")
        self.assertEqual(meta["default_preview_base"], "http://testserver/generated")
        self.assertEqual(meta["default_mode"], "live")
        self.assertEqual(meta["endpoints"]["meta"], "/api/meta")
        self.assertIn("fixture", meta["supported_modes"])

    def test_api_server_serves_vite_source_shell_when_dist_is_unavailable(self) -> None:
        with TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            output_root = root / ".fablemap-api"
            frontend_root = root / "frontend"
            frontend_root.mkdir()
            (frontend_root / "index.html").write_text(FRONTEND_ROOT.joinpath("index.html").read_text(encoding="utf-8"), encoding="utf-8")
            src_root = frontend_root / "src"
            src_root.mkdir()
            (src_root / "main.jsx").write_text(FRONTEND_ROOT.joinpath("src", "main.jsx").read_text(encoding="utf-8"), encoding="utf-8")
            (src_root / "App.jsx").write_text(FRONTEND_ROOT.joinpath("src", "App.jsx").read_text(encoding="utf-8"), encoding="utf-8")
            (src_root / "styles.css").write_text(FRONTEND_ROOT.joinpath("src", "styles.css").read_text(encoding="utf-8"), encoding="utf-8")

            app = create_app(
                output_root=output_root,
                fixture_file=FIXTURE_PATH,
                frontend_root=frontend_root,
            )
            with TestClient(app) as client:
                html = client.get("/").text
                main_js = client.get("/src/main.jsx").text
                app_js = client.get("/src/App.jsx").text

        self.assertIn('type="module" src="/src/main.jsx"', html)
        self.assertIn("ReactDOM.createRoot", main_js)
        self.assertIn("Full-stack engineered migration", app_js)

    def test_api_server_generates_fixture_preview(self) -> None:
        with TemporaryDirectory() as tmpdir:
            output_root = Path(tmpdir) / ".fablemap-api"
            app = create_app(
                output_root=output_root,
                fixture_file=FIXTURE_PATH,
                frontend_root=FRONTEND_ROOT,
            )
            with TestClient(app) as client:
                response = client.post(
                    "/api/nearby",
                    data={
                        "lat": "35.6580",
                        "lon": "139.7016",
                        "radius": "300",
                        "mode": "fixture",
                    },
                )
                result = response.json()
                preview_html = client.get(result["preview_url"].replace("http://testserver", "")).text

                generated_output_dir = Path(result["output_dir"])

                self.assertEqual(response.status_code, 200)
                self.assertEqual(result["provider"], "fixture")
                self.assertEqual(result["mode"], "fixture")
                self.assertTrue(result["run_id"].startswith("run-"))
                self.assertEqual(result["frontend_url"], "http://testserver/")
                self.assertEqual(result["world_url"], f"http://testserver/generated/{result['run_id']}/world.json")
                self.assertIn(f"/generated/{result['run_id']}/bundle/index.html", result["preview_url"])
                self.assertIn("Language / 语言", preview_html)
                self.assertEqual(generated_output_dir.parent, output_root.resolve())
                self.assertTrue((generated_output_dir / "bundle" / "index.html").exists())


class WebServiceTests(unittest.TestCase):
    def test_frontend_static_dir_prefers_dist_when_available(self) -> None:
        with TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            frontend_root = root / "frontend"
            dist_root = frontend_root / "dist"
            dist_root.mkdir(parents=True)
            service = WebService(ApiSettings(frontend_root=frontend_root, output_root=root / "output"))

            self.assertEqual(service.frontend_static_dir(), dist_root.resolve())

    def test_frontend_static_dir_falls_back_to_frontend_root(self) -> None:
        with TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            frontend_root = root / "frontend"
            frontend_root.mkdir(parents=True)
            service = WebService(ApiSettings(frontend_root=frontend_root, output_root=root / "output"))

            self.assertEqual(service.frontend_static_dir(), frontend_root.resolve())


class ApiServiceTests(unittest.TestCase):
    def test_build_health_payload_reports_file_availability(self) -> None:
        with TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            fixture_file = root / "fixture.json"
            fixture_file.write_text("{}", encoding="utf-8")
            frontend_root = root / "frontend"
            frontend_root.mkdir()
            output_root = root / "output"
            output_root.mkdir()

            payload = build_health_payload(
                fixture_file=fixture_file,
                frontend_root=frontend_root,
                output_root=output_root,
            )

        self.assertEqual(
            payload,
            {
                "status": "ok",
                "fixture_available": True,
                "frontend_available": True,
                "output_root": str(output_root),
            },
        )

    def test_build_meta_payload_uses_base_url(self) -> None:
        payload = build_meta_payload(base_url="http://127.0.0.1:8950")

        self.assertEqual(payload["project"], "FableMap")
        self.assertEqual(payload["api_base"], "http://127.0.0.1:8950")
        self.assertEqual(payload["default_preview_base"], "http://127.0.0.1:8950/generated")
        self.assertEqual(payload["default_coordinates"]["radius"], 300)
        self.assertEqual(payload["endpoints"]["nearby"], "/api/nearby")
        self.assertEqual(payload["supported_modes"], ["live", "fixture"])

    def test_build_nearby_payload_adds_generated_urls(self) -> None:
        result = {
            "provider": "fixture",
            "region_name": "Test Region",
        }

        payload = build_nearby_payload(
            result=result,
            base_url="http://127.0.0.1:8950",
            mode="fixture",
            run_id="run-demo123",
        )

        self.assertEqual(payload["provider"], "fixture")
        self.assertEqual(payload["region_name"], "Test Region")
        self.assertEqual(payload["mode"], "fixture")
        self.assertEqual(payload["run_id"], "run-demo123")
        self.assertEqual(payload["preview_url"], "http://127.0.0.1:8950/generated/run-demo123/bundle/index.html")
        self.assertEqual(payload["manifest_url"], "http://127.0.0.1:8950/generated/run-demo123/bundle/manifest.json")
        self.assertEqual(payload["world_url"], "http://127.0.0.1:8950/generated/run-demo123/world.json")
        self.assertEqual(payload["frontend_url"], "http://127.0.0.1:8950/")
        self.assertEqual(result, {"provider": "fixture", "region_name": "Test Region"})


if __name__ == "__main__":
    unittest.main()
