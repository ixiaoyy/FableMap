from __future__ import annotations

from ..contracts.health import HealthResponse
from ..domain.platform import PLATFORM_MAINLINE
from ..infrastructure.settings import ApiSettings


def build_system_status(settings: ApiSettings) -> HealthResponse:
    """Return a stable health payload for deployment and frontend smoke checks."""

    return HealthResponse(
        ok=True,
        app_name=settings.app_name,
        api_version=settings.api_version,
        mainline=PLATFORM_MAINLINE,
    )
