from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, Request

from .common import get_user_id, taverns_service


router = APIRouter(prefix="/taverns", tags=["skill-packs"])


@router.get("/{tavern_id}/skill-packs")
def list_skill_packs(request: Request, tavern_id: str) -> dict[str, Any]:
    return taverns_service(request).list_skill_packs(tavern_id, get_user_id(request))


@router.put("/{tavern_id}/skill-packs")
def update_skill_packs(
    request: Request,
    tavern_id: str,
    data: dict[str, Any] = Body(...),
) -> dict[str, Any]:
    return taverns_service(request).update_skill_packs(tavern_id, data, get_user_id(request))
