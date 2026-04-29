from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, Request

from .common import get_user_id, taverns_service


router = APIRouter(prefix="/taverns", tags=["state-cards"])


@router.get("/{tavern_id}/state-cards")
def list_state_cards(
    request: Request,
    tavern_id: str,
    status: str = "",
    category: str = "",
    canon_scope: str = "",
    visitor_id: str = "",
    character_id: str = "",
    limit: int = 100,
) -> dict[str, Any]:
    return taverns_service(request).list_state_cards(
        tavern_id,
        user_id=get_user_id(request),
        status=status,
        category=category,
        canon_scope=canon_scope,
        visitor_id=visitor_id,
        character_id=character_id,
        limit=limit,
    )


@router.post("/{tavern_id}/state-cards")
def create_state_card(request: Request, tavern_id: str, data: dict[str, Any] = Body(...)) -> dict[str, Any]:
    return taverns_service(request).create_state_card(tavern_id, data, get_user_id(request))


@router.post("/{tavern_id}/gm-layer/preview")
def preview_gm_layer(request: Request, tavern_id: str, data: dict[str, Any] = Body(...)) -> dict[str, Any]:
    return taverns_service(request).preview_gm_layer(tavern_id, data, get_user_id(request))


@router.put("/{tavern_id}/state-cards/{card_id}/decision")
def decide_state_card(
    request: Request,
    tavern_id: str,
    card_id: str,
    data: dict[str, Any] = Body(...),
) -> dict[str, Any]:
    return taverns_service(request).decide_state_card(tavern_id, card_id, data, get_user_id(request))
