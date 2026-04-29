from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

from ...contracts.owner_config import (
    OwnerDefaultLLMRequest,
    TavernDraftGenerateRequest,
)
from .common import get_user_id, taverns_service

router = APIRouter(prefix="/owners", tags=["owners"])


@router.get("/me/default-llm")
def get_owner_default_llm(request: Request) -> dict[str, Any]:
    return taverns_service(request).get_owner_default_llm(get_user_id(request))


@router.put("/me/default-llm")
def save_owner_default_llm(
    request: Request,
    data: OwnerDefaultLLMRequest,
) -> dict[str, Any]:
    return taverns_service(request).save_owner_default_llm(data.to_payload(), get_user_id(request))


@router.post("/me/tavern-drafts/generate")
def generate_tavern_draft(
    request: Request,
    data: TavernDraftGenerateRequest,
) -> dict[str, Any]:
    return taverns_service(request).generate_tavern_draft(data.to_payload(), get_user_id(request))
