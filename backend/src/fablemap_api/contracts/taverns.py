from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class FlexibleBody(BaseModel):
    """Base model for owner-authored dynamic tavern payloads."""

    model_config = ConfigDict(extra="allow")

    def to_payload(self) -> dict[str, Any]:
        payload = self.model_dump(exclude_none=True)
        payload.update(self.model_extra or {})
        return payload


class TavernCreateRequest(FlexibleBody):
    name: str | None = None
    description: str | None = None
    lat: float | None = None
    lon: float | None = None
    address: str | None = None
    access: str | None = None
    password: str | None = None
    scene_prompt: str | None = None
    llm_config: dict[str, Any] | None = None


class TavernUpdateRequest(FlexibleBody):
    name: str | None = None
    description: str | None = None
    lat: float | None = None
    lon: float | None = None
    address: str | None = None
    access: str | None = None
    password: str | None = None
    status: str | None = None
    scene_prompt: str | None = None
    llm_config: dict[str, Any] | None = None


class TavernListResponse(BaseModel):
    taverns: list[dict[str, Any]]
    count: int


class EnterTavernRequest(BaseModel):
    password: str = ""


class CharacterWriteRequest(FlexibleBody):
    name: str | None = None
    description: str | None = None
    personality: str | None = None
    scenario: str | None = None
    system_prompt: str | None = None
    first_mes: str | None = None
    tags: list[str] | None = None


class ChatRequest(BaseModel):
    character_id: str = Field(min_length=1)
    message: str = Field(min_length=1)
    visitor_id: str = ""
    visitor_name: str = ""
    extra_context: list[dict[str, Any]] | None = None
    display_message: str = ""


class GameplayWriteRequest(FlexibleBody):
    gameplays: list[dict[str, Any]] | None = None


class GameplaySessionRequest(FlexibleBody):
    gameplay_id: str | None = None
    character_id: str | None = None
