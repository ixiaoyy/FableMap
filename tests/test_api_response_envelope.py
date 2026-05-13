from __future__ import annotations

from fastapi import Response
from fastapi.testclient import TestClient

from fablemap_api.core.api import create_app as create_core_app
from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app as create_native_app


def test_native_v1_json_success_and_error_include_transitional_envelope(tmp_path):
    app = create_native_app(ApiSettings(output_root=tmp_path, fixture_file=None, frontend_root=None))
    client = TestClient(app)

    health = client.get("/api/v1/health")
    assert health.status_code == 200
    health_payload = health.json()
    assert health_payload["ok"] is True
    assert health_payload["data"]["ok"] is True
    assert health_payload["meta"]["ok"] is True
    assert health_payload["meta"]["status"] == 200
    assert health_payload["meta"]["envelope"] == "data-meta.v1"

    missing = client.get("/api/v1/not-a-real-route")
    assert missing.status_code == 404
    missing_payload = missing.json()
    assert missing_payload["data"] is None
    assert missing_payload["meta"]["ok"] is False
    assert missing_payload["meta"]["status"] == 404
    assert missing_payload["meta"]["error"]["code"] == "HTTP_404"
    assert "detail" in missing_payload or "error" in missing_payload


def test_core_legacy_json_success_includes_transitional_envelope(tmp_path):
    app = create_core_app(output_root=tmp_path, fixture_file=None, frontend_root=None)
    client = TestClient(app)

    health = client.get("/api/health")
    assert health.status_code == 200
    payload = health.json()
    assert payload["status"] == "ok"
    assert payload["data"]["status"] == "ok"
    assert payload["meta"]["ok"] is True
    assert payload["meta"]["path"] == "/api/health"


def test_api_envelope_skips_binary_responses(tmp_path):
    app = create_native_app(ApiSettings(output_root=tmp_path, fixture_file=None, frontend_root=None))

    @app.get("/api/v1/__test__/audio")
    def audio():
        return Response(content=b"audio-bytes", media_type="audio/mpeg")

    client = TestClient(app)
    response = client.get("/api/v1/__test__/audio")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("audio/mpeg")
    assert response.content == b"audio-bytes"
    assert "x-fablemap-response-envelope" not in response.headers


def test_api_envelope_wraps_json_arrays_without_legacy_keys(tmp_path):
    app = create_native_app(ApiSettings(output_root=tmp_path, fixture_file=None, frontend_root=None))

    @app.get("/api/v1/__test__/list")
    def list_payload():
        return [{"id": "item-1"}]

    client = TestClient(app)
    response = client.get("/api/v1/__test__/list")

    assert response.status_code == 200
    payload = response.json()
    assert payload["data"] == [{"id": "item-1"}]
    assert payload["meta"]["ok"] is True
