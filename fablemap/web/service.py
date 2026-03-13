from __future__ import annotations

import uuid
from pathlib import Path
from typing import Any

from fastapi import HTTPException

from fablemap.api_service import build_health_payload, build_meta_payload, build_nearby_payload
from fablemap.nearby import generate_nearby_preview
from fablemap.writeback import WritebackEngine, WritebackStore

from .config import ApiSettings


class WebService:
    def __init__(self, settings: ApiSettings):
        self.settings = settings.resolved()
        self.settings.output_root.mkdir(parents=True, exist_ok=True)
        self.writeback = WritebackEngine(WritebackStore(self.settings.output_root / "writeback"))

    def health_payload(self) -> dict[str, Any]:
        return build_health_payload(
            fixture_file=self.settings.fixture_file,
            frontend_root=self.settings.frontend_root,
            output_root=self.settings.output_root,
        )

    def meta_payload(self, *, base_url: str) -> dict[str, Any]:
        return build_meta_payload(base_url=base_url)

    def nearby_payload(
        self,
        *,
        lat: float,
        lon: float,
        radius: int,
        mode: str,
        seed: str,
        refresh: bool,
        base_url: str,
    ) -> dict[str, Any]:
        if radius <= 0:
            raise HTTPException(status_code=400, detail="radius must be a positive integer")

        normalized_mode = mode.lower()
        if normalized_mode not in {"fixture", "live"}:
            raise HTTPException(status_code=400, detail="mode must be 'fixture' or 'live'")

        source_file = None
        if normalized_mode == "fixture":
            if not self.settings.fixture_file or not self.settings.fixture_file.exists():
                raise HTTPException(status_code=400, detail="fixture mode is unavailable because the fixture file is missing")
            source_file = self.settings.fixture_file

        try:
            run_id = f"run-{uuid.uuid4().hex[:12]}"
            result = generate_nearby_preview(
                lat=lat,
                lon=lon,
                radius=radius,
                output_dir=self.settings.output_root / run_id,
                seed=seed or None,
                source_file=source_file,
                refresh=refresh,
            )
            return build_nearby_payload(
                result=result,
                base_url=base_url,
                mode=normalized_mode,
                run_id=run_id,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    def writeback_event_payload(self, event: dict[str, Any]) -> dict[str, Any]:
        try:
            return self.writeback.process_event(event)
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    def generated_file_path(self, file_path: str) -> Path:
        candidate = (self.settings.output_root / Path(file_path)).resolve()
        if not _is_within_root(candidate, self.settings.output_root) or not candidate.is_file():
            raise HTTPException(status_code=404, detail="generated file not found")
        return candidate

    def frontend_static_dir(self) -> Path | None:
        preferred = self.settings.frontend_dist
        if preferred and preferred.exists():
            return preferred
        fallback = self.settings.frontend_root
        if fallback and fallback.exists():
            return fallback
        return None



def _is_within_root(candidate: Path, root: Path) -> bool:
    try:
        candidate.relative_to(root)
        return True
    except ValueError:
        return False
