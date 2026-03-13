from __future__ import annotations

from fastapi import APIRouter, Form, Request
from fastapi.responses import FileResponse

from .service import WebService


def create_api_router(service: WebService) -> APIRouter:
    router = APIRouter()

    @router.get("/api/health")
    def get_health() -> dict:
        return service.health_payload()

    @router.get("/api/meta")
    def get_meta(request: Request) -> dict:
        return service.meta_payload(base_url=_request_base_url(request))

    @router.post("/api/nearby")
    def post_nearby(
        request: Request,
        lat: float = Form(...),
        lon: float = Form(...),
        radius: int = Form(300),
        mode: str = Form("live"),
        seed: str = Form(""),
        refresh: bool = Form(False),
    ) -> dict:
        return service.nearby_payload(
            lat=lat,
            lon=lon,
            radius=radius,
            mode=mode,
            seed=seed,
            refresh=refresh,
            base_url=_request_base_url(request),
        )

    @router.get("/generated/{file_path:path}")
    def get_generated_file(file_path: str):
        return FileResponse(service.generated_file_path(file_path))

    return router


def _request_base_url(request: Request) -> str:
    return str(request.base_url).rstrip("/")
