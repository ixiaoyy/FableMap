from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, Request

from ...application.taverns import TavernApplicationService
from ...contracts.taverns import (
    CharacterWriteRequest,
    ChatRequest,
    EnterTavernRequest,
    GameplaySessionRequest,
    GameplayWriteRequest,
    MemoryAtomWriteRequest,
    TavernCreateRequest,
    TavernListResponse,
    TavernUpdateRequest,
)

router = APIRouter(prefix="/taverns", tags=["taverns"])


def _taverns(request: Request) -> TavernApplicationService:
    return request.app.state.taverns


def _get_user_id(request: Request) -> str:
    return str(
        request.headers.get("X-User-Id")
        or request.query_params.get("user_id")
        or request.query_params.get("owner_id")
        or ""
    ).strip()


@router.get("", response_model=TavernListResponse)
def list_taverns(
    request: Request,
    lat: float | None = None,
    lon: float | None = None,
    radius: float = 5000,
    access: str | None = None,
    status: str | None = None,
    q: str = "",
    owner_id: str = "",
) -> dict[str, Any]:
    return _taverns(request).list_taverns(
        lat=lat,
        lon=lon,
        radius=radius,
        access=access,
        status=status,
        query=q,
        owner_id=owner_id,
    )


@router.post("")
def create_tavern(request: Request, data: TavernCreateRequest) -> dict[str, Any]:
    return _taverns(request).create_tavern(data.to_payload(), _get_user_id(request))


@router.get("/{tavern_id}")
def get_tavern(request: Request, tavern_id: str) -> dict[str, Any]:
    return _taverns(request).get_tavern(tavern_id, _get_user_id(request))


@router.put("/{tavern_id}")
def update_tavern(request: Request, tavern_id: str, data: TavernUpdateRequest) -> dict[str, Any]:
    return _taverns(request).update_tavern(tavern_id, data.to_payload(), _get_user_id(request))


@router.delete("/{tavern_id}")
def delete_tavern(request: Request, tavern_id: str) -> dict[str, str]:
    return _taverns(request).delete_tavern(tavern_id, _get_user_id(request))


@router.post("/{tavern_id}/enter")
def enter_tavern(request: Request, tavern_id: str, data: EnterTavernRequest | None = None) -> dict[str, Any]:
    return _taverns(request).enter_tavern(
        tavern_id,
        password=data.password if data else "",
        user_id=_get_user_id(request),
    )


@router.get("/{tavern_id}/characters")
def list_characters(request: Request, tavern_id: str) -> dict[str, Any]:
    return _taverns(request).list_characters(tavern_id, _get_user_id(request))


@router.post("/{tavern_id}/characters")
def add_character(request: Request, tavern_id: str, data: CharacterWriteRequest) -> dict[str, Any]:
    return _taverns(request).add_character(tavern_id, data.to_payload(), _get_user_id(request))


@router.put("/{tavern_id}/characters/{character_id}")
def update_character(
    request: Request,
    tavern_id: str,
    character_id: str,
    data: CharacterWriteRequest,
) -> dict[str, Any]:
    return _taverns(request).update_character(tavern_id, character_id, data.to_payload(), _get_user_id(request))


@router.delete("/{tavern_id}/characters/{character_id}")
def delete_character(request: Request, tavern_id: str, character_id: str) -> dict[str, str]:
    return _taverns(request).delete_character(tavern_id, character_id, _get_user_id(request))


@router.get("/{tavern_id}/chat")
def get_chat_history(
    request: Request,
    tavern_id: str,
    visitor_id: str = "",
    character_id: str | None = None,
    limit: int = 50,
) -> dict[str, Any]:
    return _taverns(request).chat_history(
        tavern_id,
        visitor_id=visitor_id or _get_user_id(request),
        character_id=character_id,
        user_id=_get_user_id(request),
        limit=limit,
    )


@router.post("/{tavern_id}/chat")
def send_chat(request: Request, tavern_id: str, data: ChatRequest) -> dict[str, Any]:
    user_id = _get_user_id(request)
    return _taverns(request).send_chat(
        tavern_id,
        character_id=data.character_id,
        message=data.message,
        visitor_id=data.visitor_id or user_id,
        visitor_name=data.visitor_name,
        user_id=user_id,
        extra_context=data.extra_context,
        display_message=data.display_message,
    )


@router.get("/{tavern_id}/memories")
def list_memories(
    request: Request,
    tavern_id: str,
    visitor_id: str = "",
    scope: str = "",
    dimension: str = "",
    horizon: str = "",
    pinned: bool | None = None,
    keyword: str = "",
    limit: int = 50,
    offset: int = 0,
) -> dict[str, Any]:
    return _taverns(request).list_memories(
        tavern_id,
        user_id=_get_user_id(request),
        visitor_id=visitor_id,
        scope=scope,
        dimension=dimension,
        horizon=horizon,
        pinned=pinned,
        keyword=keyword,
        limit=limit,
        offset=offset,
    )


@router.get("/{tavern_id}/memory-atoms")
def list_memory_atoms(
    request: Request,
    tavern_id: str,
    scope: str = "",
    dimension: str = "",
    horizon: str = "",
    visibility: str = "",
    visitor_id: str = "",
    character_id: str = "",
    place_id: str = "",
    limit: int = 100,
) -> dict[str, Any]:
    return _taverns(request).list_memory_atoms(
        tavern_id,
        user_id=_get_user_id(request),
        scope=scope,
        dimension=dimension,
        horizon=horizon,
        visibility=visibility,
        visitor_id=visitor_id,
        character_id=character_id,
        place_id=place_id,
        limit=limit,
    )


@router.post("/{tavern_id}/memory-atoms")
def create_memory_atom(request: Request, tavern_id: str, data: MemoryAtomWriteRequest) -> dict[str, Any]:
    return _taverns(request).create_memory_atom(tavern_id, data.to_payload(), _get_user_id(request))


@router.get("/{tavern_id}/memory-atoms/{memory_id}")
def get_memory_atom(request: Request, tavern_id: str, memory_id: str) -> dict[str, Any]:
    return _taverns(request).get_memory_atom(tavern_id, memory_id, _get_user_id(request))


@router.put("/{tavern_id}/memory-atoms/{memory_id}")
def update_memory_atom(
    request: Request,
    tavern_id: str,
    memory_id: str,
    data: MemoryAtomWriteRequest,
) -> dict[str, Any]:
    return _taverns(request).update_memory_atom(tavern_id, memory_id, data.to_payload(), _get_user_id(request))


@router.delete("/{tavern_id}/memory-atoms/{memory_id}")
def delete_memory_atom(request: Request, tavern_id: str, memory_id: str) -> dict[str, Any]:
    return _taverns(request).delete_memory_atom(tavern_id, memory_id, _get_user_id(request))


@router.get("/{tavern_id}/gameplays")
def list_gameplays(request: Request, tavern_id: str) -> dict[str, Any]:
    return _taverns(request).list_gameplays(tavern_id, _get_user_id(request))


@router.put("/{tavern_id}/gameplays")
def save_gameplays(request: Request, tavern_id: str, data: GameplayWriteRequest) -> dict[str, Any]:
    return _taverns(request).save_gameplays(tavern_id, data.to_payload(), _get_user_id(request))


@router.get("/{tavern_id}/gameplay-sessions")
def list_gameplay_sessions(
    request: Request,
    tavern_id: str,
    state: str = "",
    visitor_id: str = "",
) -> dict[str, Any]:
    return _taverns(request).list_gameplay_sessions(
        tavern_id,
        user_id=_get_user_id(request),
        state=state,
        visitor_id=visitor_id,
    )


@router.post("/{tavern_id}/gameplay-sessions")
def start_gameplay_session(request: Request, tavern_id: str, data: GameplaySessionRequest) -> dict[str, Any]:
    return _taverns(request).start_gameplay_session(tavern_id, data.to_payload(), _get_user_id(request))


@router.post("/{tavern_id}/gameplay-sessions/{session_id}/advance")
def advance_gameplay_session(
    request: Request,
    tavern_id: str,
    session_id: str,
    data: dict[str, Any] = Body(default_factory=dict),
) -> dict[str, Any]:
    return _taverns(request).advance_gameplay_session(tavern_id, session_id, data, _get_user_id(request))
