from __future__ import annotations

from typing import Any

from fastapi import APIRouter, BackgroundTasks, Request

from ...contracts.taverns import (
    EnterTavernRequest,
    HomeMemberWriteRequest,
    PlaceRelationshipRequest,
    RelationshipDecisionRequest,
    SchoolEnrollmentRequest,
    TavernCreateRequest,
    TavernListResponse,
    TavernUpdateRequest,
    VisitorNoteCreateRequest,
    VisitorNoteListResponse,
)
from .common import get_user_id, taverns_service

router = APIRouter(prefix="/taverns", tags=["taverns"])


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
    return taverns_service(request).list_taverns(
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
    return taverns_service(request).create_tavern(data.to_payload(), get_user_id(request))


@router.get("/{tavern_id}")
def get_tavern(request: Request, tavern_id: str) -> dict[str, Any]:
    return taverns_service(request).get_tavern(tavern_id, get_user_id(request))


@router.get("/{tavern_id}/share")
def get_tavern_share(request: Request, tavern_id: str) -> dict[str, Any]:
    return taverns_service(request).get_tavern_share(
        tavern_id,
        get_user_id(request),
        str(request.base_url).rstrip("/"),
    )


@router.put("/{tavern_id}")
def update_tavern(request: Request, tavern_id: str, data: TavernUpdateRequest) -> dict[str, Any]:
    return taverns_service(request).update_tavern(tavern_id, data.to_payload(), get_user_id(request))


@router.delete("/{tavern_id}")
def delete_tavern(request: Request, tavern_id: str) -> dict[str, Any]:
    return taverns_service(request).delete_tavern(tavern_id, get_user_id(request))


@router.post("/{tavern_id}/home-members")
def add_home_member(request: Request, tavern_id: str, data: HomeMemberWriteRequest) -> dict[str, Any]:
    return taverns_service(request).add_home_member(tavern_id, data.to_payload(), get_user_id(request))


@router.get("/{tavern_id}/school-members")
def list_school_members(request: Request, tavern_id: str) -> dict[str, Any]:
    return taverns_service(request).list_school_members(tavern_id, get_user_id(request))


@router.post("/{tavern_id}/relationships/school-enrollments")
def create_school_enrollment(request: Request, tavern_id: str, data: SchoolEnrollmentRequest) -> dict[str, Any]:
    return taverns_service(request).create_school_enrollment(tavern_id, data.to_payload(), get_user_id(request))


@router.post("/{tavern_id}/relationships")
def create_place_relationship(request: Request, tavern_id: str, data: PlaceRelationshipRequest) -> dict[str, Any]:
    return taverns_service(request).create_place_relationship(tavern_id, data.to_payload(), get_user_id(request))


@router.put("/{tavern_id}/relationships/{relationship_id}")
def decide_place_relationship(
    request: Request,
    tavern_id: str,
    relationship_id: str,
    data: RelationshipDecisionRequest,
) -> dict[str, Any]:
    return taverns_service(request).decide_place_relationship(
        tavern_id,
        relationship_id,
        data.to_payload(),
        get_user_id(request),
    )


@router.post("/{tavern_id}/enter")
def enter_tavern(
    request: Request,
    background_tasks: BackgroundTasks,
    tavern_id: str,
    data: EnterTavernRequest | None = None,
) -> dict[str, Any]:
    user_id = get_user_id(request)
    result = taverns_service(request).enter_tavern(
        tavern_id,
        password=data.password if data else "",
        user_id=user_id,
        visitor_gender=data.visitor_gender if data else "",
    )

    # Trigger notification for tavern owner
    if user_id:
        tavern = taverns_service(request).store.get_tavern(tavern_id)
        if tavern and tavern.owner_id and tavern.owner_id != user_id:
            from ...core.notifications import notify_new_visitor
            background_tasks.add_task(
                notify_new_visitor,
                tavern_id,
                tavern.name,
                tavern.owner_id,
                user_id or "访客",
            )

    return result


@router.get("/{tavern_id}/metrics")
def get_tavern_metrics(request: Request, tavern_id: str) -> dict[str, Any]:
    return taverns_service(request).get_tavern_metrics(
        tavern_id,
        user_id=get_user_id(request),
    )


# ─────────────────────────────────────────
# Owner-visible Visitor Notes
# ─────────────────────────────────────────

@router.get("/{tavern_id}/visitor-notes", response_model=VisitorNoteListResponse)
def list_visitor_notes(
    request: Request,
    tavern_id: str,
    limit: int = 20,
    offset: int = 0,
) -> dict[str, Any]:
    return taverns_service(request).list_visitor_notes(
        tavern_id,
        get_user_id(request),
        limit=limit,
        offset=offset,
    )


@router.post("/{tavern_id}/visitor-notes")
def create_visitor_note(
    request: Request,
    background_tasks: BackgroundTasks,
    tavern_id: str,
    data: VisitorNoteCreateRequest,
) -> dict[str, Any]:
    user_id = get_user_id(request)
    result = taverns_service(request).create_visitor_note(
        tavern_id,
        data.to_payload(),
        user_id,
    )

    # Trigger notification for tavern owner
    tavern = taverns_service(request).store.get_tavern(tavern_id)
    if tavern and tavern.owner_id and tavern.owner_id != user_id:
        from ...core.notifications import notify_new_guest_message
        background_tasks.add_task(
            notify_new_guest_message,
            tavern_id,
            tavern.name,
            tavern.owner_id,
            data.visitor_nickname or "访客",
        )

    return result


@router.delete("/{tavern_id}/visitor-notes/{note_id}")
def delete_visitor_note(
    request: Request,
    tavern_id: str,
    note_id: str,
) -> dict[str, Any]:
    return taverns_service(request).delete_visitor_note(
        tavern_id,
        note_id,
        get_user_id(request),
    )
