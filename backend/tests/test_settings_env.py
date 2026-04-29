from __future__ import annotations

from pathlib import Path

from fablemap_api.infrastructure.settings import ApiSettings


def test_api_settings_reads_docker_environment(monkeypatch, tmp_path: Path) -> None:
    output_root = tmp_path / "docker-data"
    fixture_file = tmp_path / "fixture.json"
    frontend_root = tmp_path / "frontend"

    monkeypatch.setenv("FABLEMAP_OUTPUT_ROOT", str(output_root))
    monkeypatch.setenv("FABLEMAP_FIXTURE_FILE", str(fixture_file))
    monkeypatch.setenv("FABLEMAP_FRONTEND_ROOT", str(frontend_root))
    monkeypatch.setenv("FABLEMAP_CORS_ORIGINS", "http://localhost:3000, http://127.0.0.1:3000")
    monkeypatch.setenv("FABLEMAP_SILLYTAVERN_URL", "http://sillytavern:8000")
    monkeypatch.setenv("FABLEMAP_MYSQL_URL", "mysql+pymysql://user:pass@mysql:3306/fablemap")
    monkeypatch.setenv("FABLEMAP_MYSQL_POOL_SIZE", "9")
    monkeypatch.setenv("FABLEMAP_MYSQL_MAX_OVERFLOW", "12")
    monkeypatch.setenv("FABLEMAP_MYSQL_ECHO", "true")

    settings = ApiSettings()

    assert settings.output_root == output_root
    assert settings.fixture_file == fixture_file
    assert settings.frontend_root == frontend_root
    assert settings.cors_origins == ["http://localhost:3000", "http://127.0.0.1:3000"]
    assert settings.sillytavern_url == "http://sillytavern:8000"
    assert settings.mysql_url == "mysql+pymysql://user:pass@mysql:3306/fablemap"
    assert settings.mysql_pool_size == 9
    assert settings.mysql_max_overflow == 12
    assert settings.mysql_echo is True


def test_api_settings_treats_empty_optional_paths_as_disabled(monkeypatch) -> None:
    monkeypatch.setenv("FABLEMAP_FIXTURE_FILE", "")
    monkeypatch.setenv("FABLEMAP_FRONTEND_ROOT", "")
    monkeypatch.setenv("FABLEMAP_MYSQL_POOL_SIZE", "not-an-int")

    settings = ApiSettings()

    assert settings.fixture_file is None
    assert settings.frontend_root is None
    assert settings.mysql_pool_size == 5
