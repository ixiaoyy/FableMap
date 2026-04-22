from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import HTTPException

from fablemap_api.core.gameplay import (
    GameplayEvent,
    GameplaySession,
    completion_payload,
    fallback_result,
    is_complete_node,
    new_event,
    normalize_gameplay_definitions,
    scene_for_node,
)
from fablemap_api.core.llm_clients import LLMConfig as ClientLLMConfig
from fablemap_api.core.llm_clients import LLMError, create_client
from fablemap_api.core.memory import auto_create_memories_from_chat
from fablemap_api.core.tavern import ChatMessage, Tavern, TavernService, TavernStore, VisitorState

from ..infrastructure.settings import ApiSettings


def _utc_now_iso() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _relationship_stage_for(strength: float, visit_count: int) -> str:
    if strength >= 0.75 or visit_count >= 8:
        return "confidant"
    if strength >= 0.45 or visit_count >= 4:
        return "regular"
    if strength >= 0.15 or visit_count >= 2:
        return "acquaintance"
    return "stranger"


def _clean_text(value: Any, *, max_length: int = 800) -> str:
    text = " ".join(str(value or "").replace("\r\n", "\n").split())
    return text[:max_length]


class TavernApplicationService:
    """Application facade for native `/api/v1/taverns` use cases.

    This layer deliberately depends on the current tavern/gameplay/memory core
    modules rather than the current web router/service layer. That keeps HTTP
    contracts in `api/v1`, product orchestration here, and persistence/domain
    behavior in the core modules while the enterprise package is expanded.
    """

    def __init__(self, store: TavernStore):
        self.store = store
        self.taverns = TavernService(store)

    @classmethod
    def from_settings(cls, settings: ApiSettings) -> "TavernApplicationService":
        return cls(TavernStore(settings.output_root / "taverns"))

    def list_taverns(
        self,
        *,
        lat: float | None = None,
        lon: float | None = None,
        radius: float = 5000,
        access: str | None = None,
        status: str | None = None,
        query: str = "",
        owner_id: str = "",
    ) -> dict[str, Any]:
        taverns = self.taverns.list_taverns(
            lat=lat,
            lon=lon,
            radius=radius,
            access=access,
            status=status,
            query=query,
            owner_id=owner_id,
        )
        return {"taverns": taverns, "count": len(taverns)}

    def create_tavern(self, data: dict[str, Any], owner_id: str = "") -> dict[str, Any]:
        return self.taverns.create_tavern(data, owner_id)

    def get_tavern(self, tavern_id: str, user_id: str = "") -> dict[str, Any]:
        return self.taverns.get_tavern(tavern_id, user_id)

    def update_tavern(self, tavern_id: str, data: dict[str, Any], user_id: str = "") -> dict[str, Any]:
        return self.taverns.update_tavern(tavern_id, data, user_id)

    def delete_tavern(self, tavern_id: str, user_id: str = "") -> dict[str, str]:
        return self.taverns.delete_tavern(tavern_id, user_id)

    def enter_tavern(self, tavern_id: str, password: str = "", user_id: str = "") -> dict[str, Any]:
        return self.taverns.enter_tavern(tavern_id, password, user_id)

    def list_characters(self, tavern_id: str, user_id: str = "") -> dict[str, Any]:
        tavern = self.get_tavern(tavern_id, user_id)
        return {"characters": tavern.get("characters", [])}

    def add_character(self, tavern_id: str, data: dict[str, Any], user_id: str = "") -> dict[str, Any]:
        return self.taverns.add_character(tavern_id, data, user_id)

    def update_character(self, tavern_id: str, char_id: str, data: dict[str, Any], user_id: str = "") -> dict[str, Any]:
        return self.taverns.update_character(tavern_id, char_id, data, user_id)

    def delete_character(self, tavern_id: str, char_id: str, user_id: str = "") -> dict[str, str]:
        return self.taverns.delete_character(tavern_id, char_id, user_id)

    def chat_history(
        self,
        tavern_id: str,
        *,
        visitor_id: str,
        character_id: str | None = None,
        user_id: str = "",
        limit: int = 50,
    ) -> dict[str, Any]:
        tavern = self._get_tavern_or_404(tavern_id)
        visitor_id = str(visitor_id or user_id or "").strip()
        if not visitor_id:
            raise HTTPException(status_code=400, detail="缺少访客身份")
        self._ensure_visible(tavern, user_id)
        if user_id and user_id != visitor_id and not self._is_owner(tavern, user_id):
            raise HTTPException(status_code=403, detail="不能访问其他访客的聊天记录")

        messages = self.store.get_chat_history(tavern_id, visitor_id, character_id, limit=limit)
        return {"messages": [message.to_dict() for message in messages]}

    def send_chat(
        self,
        tavern_id: str,
        *,
        character_id: str,
        message: str,
        visitor_id: str,
        visitor_name: str = "",
        user_id: str = "",
        extra_context: list[dict[str, Any]] | None = None,
        display_message: str = "",
    ) -> dict[str, Any]:
        tavern = self._get_tavern_or_404(tavern_id)
        visitor_id = str(visitor_id or user_id or "").strip()
        user_id = str(user_id or "").strip()
        if not visitor_id:
            raise HTTPException(status_code=400, detail="缺少访客身份")
        if user_id and user_id != visitor_id and not self._is_owner(tavern, user_id):
            raise HTTPException(status_code=403, detail="不能代替其他访客发送消息")
        self._ensure_visible(tavern, user_id)

        character = next((item for item in tavern.characters if item.id == character_id), None)
        if not character:
            raise HTTPException(status_code=404, detail="角色不存在")

        clean_message = _clean_text(message, max_length=1600)
        if not clean_message:
            raise HTTPException(status_code=400, detail="消息不能为空")

        if tavern.status != "open":
            return self._degraded_chat(character_id, character.name, tavern.status, "酒馆正在歇业", "店主暂时关闭了这间酒馆。")

        llm_config = self.store.get_llm_config(tavern_id)
        if not llm_config or not llm_config.is_configured():
            return self._degraded_chat(character_id, character.name, "closed", "AI 后端还没配置", "这间酒馆还没有可用的模型配置。")

        degradation: dict[str, Any] | None = None
        try:
            response_text = self._chat_response_text(
                tavern=tavern,
                character_name=character.name,
                character_prompt=character.system_prompt or character.personality or character.description,
                message=clean_message,
                llm_config=llm_config,
                extra_context=extra_context or [],
            )
        except LLMError as exc:
            response_text = self._rules_response(character.name, clean_message, tavern)
            degradation = {
                "reason": "llm_error",
                "title": "AI 后端暂时不可用",
                "message": "模型调用失败，已切换为规则回应。",
                "action": "店主可以检查 API Key、模型名称或 Base URL。",
                "technical_detail": str(exc)[:180],
            }

        now = _utc_now_iso()
        user_message = ChatMessage(
            id=f"msg_{uuid.uuid4().hex[:12]}",
            tavern_id=tavern_id,
            character_id=character_id,
            visitor_id=visitor_id,
            visitor_name=_clean_text(visitor_name, max_length=24),
            role="user",
            content=_clean_text(display_message or clean_message, max_length=1600),
            timestamp=now,
        )
        assistant_message = ChatMessage(
            id=f"msg_{uuid.uuid4().hex[:12]}",
            tavern_id=tavern_id,
            character_id=character_id,
            visitor_id=visitor_id,
            visitor_name=user_message.visitor_name,
            role="assistant",
            content=response_text,
            timestamp=now,
        )
        self.store.add_chat_message(user_message)
        self.store.add_chat_message(assistant_message)
        self.store.add_token_usage(tavern_id, max(1, (len(clean_message) + len(response_text)) // 4))
        visitor_state = self._touch_visitor_state(tavern_id, visitor_id, now)

        created_memories: list[dict[str, Any]] = []
        try:
            atoms = auto_create_memories_from_chat(
                self.store,
                tavern_id,
                visitor_id,
                character_id,
                character.name,
                user_message.content,
                response_text,
                user_message_id=user_message.id,
                assistant_message_id=assistant_message.id,
                importance_threshold=0.5,
            )
            created_memories = [atom.to_dict() for atom in atoms]
        except Exception:
            created_memories = []

        return {
            "character_id": character_id,
            "character_name": character.name,
            "response": response_text,
            "mood": "curious",
            "degraded": bool(degradation),
            "degradation": degradation,
            "tavern_status": "closed" if degradation else tavern.status,
            "visitor_state": visitor_state.to_dict(),
            "created_memories": created_memories,
            "timestamp": now,
        }

    def list_memories(
        self,
        tavern_id: str,
        *,
        user_id: str = "",
        visitor_id: str = "",
        scope: str = "",
        dimension: str = "",
        horizon: str = "",
        pinned: bool | None = None,
        keyword: str = "",
        limit: int = 50,
        offset: int = 0,
    ) -> dict[str, Any]:
        tavern = self._get_tavern_or_404(tavern_id)
        self._ensure_visible(tavern, user_id)
        atoms = [
            atom
            for atom in self.store.list_memory_atoms(tavern_id)
            if self._memory_visible(atom, tavern, user_id)
            and (not visitor_id or atom.visitor_id == visitor_id or atom.subject == visitor_id)
            and (not scope or atom.scope == scope)
            and (not dimension or atom.dimension == dimension)
            and (not horizon or atom.horizon == horizon)
            and (pinned is None or atom.pinned is pinned)
            and (not keyword or keyword.lower() in atom.content.lower())
        ]
        safe_limit = max(1, min(int(limit or 50), 500))
        safe_offset = max(0, int(offset or 0))
        page = atoms[safe_offset : safe_offset + safe_limit]
        return {
            "memories": [atom.to_dict() for atom in page],
            "count": len(page),
            "total": len(atoms),
            "offset": safe_offset,
            "limit": safe_limit,
        }

    def list_gameplays(self, tavern_id: str, user_id: str = "") -> dict[str, Any]:
        tavern = self._get_tavern_or_404(tavern_id)
        self._ensure_visible(tavern, user_id)
        owner = self._is_owner(tavern, user_id)
        gameplays = normalize_gameplay_definitions(tavern.gameplay_definitions)
        if not owner:
            gameplays = [gameplay for gameplay in gameplays if gameplay.get("status") == "published"]
        return {"tavern_id": tavern_id, "gameplays": gameplays}

    def save_gameplays(self, tavern_id: str, data: dict[str, Any], user_id: str = "") -> dict[str, Any]:
        tavern = self._get_tavern_or_404(tavern_id)
        self._ensure_owner(tavern, user_id)
        try:
            tavern.gameplay_definitions = normalize_gameplay_definitions((data or {}).get("gameplays", []))
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        self.store.update_tavern(tavern)
        return {"ok": True, "tavern_id": tavern_id, "gameplays": tavern.gameplay_definitions}

    def list_gameplay_sessions(
        self,
        tavern_id: str,
        *,
        user_id: str = "",
        state: str = "",
        visitor_id: str = "",
    ) -> dict[str, Any]:
        tavern = self._get_tavern_or_404(tavern_id)
        self._ensure_visible(tavern, user_id)
        owner = self._is_owner(tavern, user_id)
        sessions = self.store.list_gameplay_sessions(tavern_id)
        if owner and visitor_id:
            sessions = [session for session in sessions if session.visitor_id == visitor_id]
        elif not owner:
            sessions = [session for session in sessions if session.visitor_id == user_id]
        if state == "active":
            sessions = [session for session in sessions if session.state in {"started", "in_progress"}]
        elif state:
            sessions = [session for session in sessions if session.state == state]
        return {"tavern_id": tavern_id, "sessions": [self._session_payload(session, include_events=False) for session in sessions]}

    def start_gameplay_session(self, tavern_id: str, data: dict[str, Any], user_id: str = "") -> dict[str, Any]:
        if not user_id:
            raise HTTPException(status_code=403, detail="缺少访客身份")
        tavern = self._get_tavern_or_404(tavern_id)
        self._ensure_visible(tavern, user_id)
        gameplay = self._find_gameplay(tavern, str((data or {}).get("gameplay_id") or (data or {}).get("gameplayId") or ""), user_id)
        character_id = str((data or {}).get("character_id") or (data or {}).get("characterId") or "").strip()
        if not character_id and tavern.characters:
            character_id = tavern.characters[0].id

        for session in self.store.list_gameplay_sessions(tavern_id):
            if session.visitor_id == user_id and session.gameplay_id == gameplay["id"] and session.state in {"started", "in_progress"}:
                return {"ok": True, "resumed": True, "session": self._session_payload(session), "scene": scene_for_node(gameplay, session.current_node_id)}

        first_node_id = (gameplay.get("nodes") or [{"id": "start"}])[0].get("id", "start")
        session = GameplaySession.new(
            tavern_id=tavern_id,
            gameplay_id=gameplay["id"],
            visitor_id=user_id,
            character_id=character_id,
            current_node_id=first_node_id,
        )
        start_event = new_event("session_started", narration=scene_for_node(gameplay, first_node_id).get("narration", ""), to_node_id=first_node_id, source="system")
        session.add_event(start_event)
        self.store.save_gameplay_session(tavern_id, session)
        return {"ok": True, "resumed": False, "session": self._session_payload(session), "scene": scene_for_node(gameplay, session.current_node_id)}

    def advance_gameplay_session(
        self,
        tavern_id: str,
        session_id: str,
        data: dict[str, Any],
        user_id: str = "",
    ) -> dict[str, Any]:
        tavern = self._get_tavern_or_404(tavern_id)
        self._ensure_visible(tavern, user_id)
        session = self.store.get_gameplay_session(tavern_id, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="玩法会话不存在")
        if not self._is_owner(tavern, user_id) and session.visitor_id != user_id:
            raise HTTPException(status_code=403, detail="不能访问其他访客的玩法会话")

        gameplay = self._find_gameplay(tavern, session.gameplay_id, user_id)
        choice_id = str((data or {}).get("choice_id") or (data or {}).get("choiceId") or "").strip()
        result = self._advance_by_choice(gameplay, session, choice_id) if choice_id else fallback_result(gameplay, session)
        event = GameplayEvent.from_dict(result["event"])
        session.add_event(event)
        session.turn_count += 1
        session.current_node_id = str(result.get("next_node_id") or session.current_node_id)
        if result.get("completed") or is_complete_node(gameplay, session.current_node_id):
            session.state = "completed"
            session.completion = completion_payload(gameplay, session, event.narration)
        else:
            session.state = "in_progress"
        self.store.save_gameplay_session(tavern_id, session)
        return {
            "ok": True,
            "session": self._session_payload(session),
            "event": event.to_dict(),
            "scene": scene_for_node(gameplay, session.current_node_id),
            "completed": session.state == "completed",
        }

    def _chat_response_text(
        self,
        *,
        tavern: Tavern,
        character_name: str,
        character_prompt: str,
        message: str,
        llm_config: Any,
        extra_context: list[dict[str, Any]],
    ) -> str:
        backend = str(llm_config.backend or "").lower()
        if backend in {"rules", "rule_based", "public_welfare"}:
            return self._rules_response(character_name, message, tavern)
        client = create_client(
            ClientLLMConfig(
                backend=llm_config.backend,
                model=llm_config.model,
                api_key=llm_config.api_key,
                base_url=llm_config.base_url,
                temperature=llm_config.temperature,
                max_tokens=llm_config.max_tokens,
                top_p=llm_config.top_p,
            )
        )
        messages = [
            {"role": "system", "content": f"你是 FableMap 赛博酒馆「{tavern.name}」里的 NPC {character_name}。{character_prompt}"},
            *[
                {"role": str(item.get("role") or "user"), "content": _clean_text(item.get("content"), max_length=800)}
                for item in extra_context[-12:]
                if isinstance(item, dict) and item.get("content")
            ],
            {"role": "user", "content": message},
        ]
        return _clean_text(client.complete(messages).content, max_length=2400) or self._rules_response(character_name, message, tavern)

    def _rules_response(self, character_name: str, message: str, tavern: Tavern) -> str:
        topic = _clean_text(message, max_length=80)
        scene = _clean_text(tavern.scene_prompt or tavern.description, max_length=80)
        suffix = f"这里的气味和灯光让我想到：{scene}" if scene else "我会把这句话记在今晚的吧台边。"
        return f"{character_name}望向你，轻声回应：“我听见了——{topic}。”{suffix}"

    def _degraded_chat(self, character_id: str, character_name: str, status: str, title: str, message: str) -> dict[str, Any]:
        return {
            "character_id": character_id,
            "character_name": character_name,
            "response": message,
            "mood": "quiet",
            "degraded": True,
            "degradation": {"reason": "unavailable", "title": title, "message": message, "action": "稍后再来或请店主检查配置。"},
            "tavern_status": status,
            "visitor_state": None,
            "created_memories": [],
            "timestamp": _utc_now_iso(),
        }

    def _touch_visitor_state(self, tavern_id: str, visitor_id: str, now: str) -> VisitorState:
        state = self.store.get_visitor_state(tavern_id, visitor_id) or VisitorState(visitor_id=visitor_id, tavern_id=tavern_id, first_visit=now)
        if not state.first_visit:
            state.first_visit = now
        state.last_visit = now
        state.relationship_strength = min(1.0, float(state.relationship_strength or 0.0) + 0.05)
        state.relationship_stage = _relationship_stage_for(state.relationship_strength, state.visit_count)
        self.store.update_visitor_state(tavern_id, state)
        return state

    def _get_tavern_or_404(self, tavern_id: str) -> Tavern:
        tavern = self.store.get_tavern(tavern_id)
        if not tavern:
            raise HTTPException(status_code=404, detail="酒馆不存在")
        return tavern

    def _is_owner(self, tavern: Tavern, user_id: str) -> bool:
        return bool(user_id and tavern.owner_id and tavern.owner_id == user_id)

    def _ensure_owner(self, tavern: Tavern, user_id: str) -> None:
        if tavern.owner_id and tavern.owner_id != user_id:
            raise HTTPException(status_code=403, detail="你不是此酒馆的主人")

    def _ensure_visible(self, tavern: Tavern, user_id: str) -> None:
        if tavern.access == "private" and not self._is_owner(tavern, user_id):
            raise HTTPException(status_code=403, detail="此酒馆是私人的")

    def _memory_visible(self, atom: Any, tavern: Tavern, user_id: str) -> bool:
        if atom.visibility == "public":
            return True
        if self._is_owner(tavern, user_id):
            return True
        return bool(user_id and user_id in {atom.visitor_id, atom.subject, atom.created_by})

    def _find_gameplay(self, tavern: Tavern, gameplay_id: str, user_id: str) -> dict[str, Any]:
        if not gameplay_id:
            raise HTTPException(status_code=400, detail="缺少玩法 ID")
        owner = self._is_owner(tavern, user_id)
        for gameplay in normalize_gameplay_definitions(tavern.gameplay_definitions):
            if gameplay.get("id") != gameplay_id:
                continue
            if owner or gameplay.get("status") == "published":
                return gameplay
            raise HTTPException(status_code=404, detail="玩法不存在或未发布")
        raise HTTPException(status_code=404, detail="玩法不存在")

    def _advance_by_choice(self, gameplay: dict[str, Any], session: GameplaySession, choice_id: str) -> dict[str, Any]:
        scene = scene_for_node(gameplay, session.current_node_id)
        choice = next((item for item in scene.get("choices", []) if item.get("id") == choice_id), None)
        if not choice:
            return fallback_result(gameplay, session)
        source_node = next((node for node in gameplay.get("nodes", []) if node.get("id") == session.current_node_id), {})
        raw_choice = next((item for item in source_node.get("choices", []) if item.get("id") == choice_id), {})
        next_node_id = str(raw_choice.get("next_node_id") or session.current_node_id)
        event = new_event(
            "choice_selected",
            narration=str(raw_choice.get("label") or choice.get("label") or "继续推进"),
            from_node_id=session.current_node_id,
            to_node_id=next_node_id,
            choice_id=choice_id,
            source="visitor",
        )
        return {
            "source": "choice",
            "event": event.to_dict(),
            "next_node_id": next_node_id,
            "completed": is_complete_node(gameplay, next_node_id, choice=raw_choice),
            "scene": scene_for_node(gameplay, next_node_id),
        }

    def _session_payload(self, session: GameplaySession, *, include_events: bool = True) -> dict[str, Any]:
        payload = session.to_dict()
        if not include_events:
            payload.pop("events", None)
        return payload
