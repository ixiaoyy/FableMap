from __future__ import annotations

import hashlib
import json
import logging
import uuid
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from fastapi import HTTPException

logger = logging.getLogger(__name__)


def _tavern_llm_config_to_client(tavern_config) -> "LLMConfig":
    """Convert tavern.py LLMConfig to llm_clients.LLMConfig."""
    from fablemap.llm_clients import LLMConfig
    return LLMConfig(
        backend=tavern_config.backend,
        model=tavern_config.model,
        api_key=tavern_config.api_key,
        base_url=tavern_config.base_url,
        temperature=tavern_config.temperature,
        max_tokens=tavern_config.max_tokens,
        top_p=tavern_config.top_p,
        frequency_penalty=getattr(tavern_config, 'frequency_penalty', 0.0),
        presence_penalty=getattr(tavern_config, 'presence_penalty', 0.0),
    )


def _normalize_visitor_name(value: Any, *, max_length: int = 24) -> str:
    """Normalize a visitor-provided display name before storing or prompt use."""
    if not isinstance(value, str):
        return ""
    normalized = " ".join(value.split())
    return normalized[:max_length]


def _relationship_stage_for(strength: float, visit_count: int) -> str:
    if strength >= 0.75 or visit_count >= 8:
        return "confidant"
    if strength >= 0.45 or visit_count >= 4:
        return "regular"
    if strength >= 0.15 or visit_count >= 2:
        return "acquaintance"
    return "stranger"


def _clamp_chat_history_limit(value: Any, *, default: int = 50, maximum: int = 500) -> int:
    try:
        limit = int(value)
    except (TypeError, ValueError):
        return default
    return max(1, min(maximum, limit))

from fablemap.api_service import build_health_payload, build_meta_payload, build_nearby_payload
from fablemap.llm_clients import create_client, LLMError
from fablemap.prompt_builder import ChatMessage as PromptChatMessage, PromptBuildConfig, PromptBuilder
from fablemap.application.web_payloads import build_behavior_insights, build_orchestrate_payload, record_memory_graph_event
from fablemap.nearby import generate_nearby_preview
from fablemap.writeback import WritebackEngine, WritebackStore
from fablemap.orchestrator.rule_engine import RuleBasedOrchestrator
from fablemap.memory_graph import WorldMemoryGraph
from fablemap.dynamic_signals import inject_disturbance, clear_disturbance, get_disturbance
from fablemap.tavern import TavernService as TavernServiceCore, TavernStore as TavernStoreCore

from .config import ApiSettings


class WebService:
    def __init__(self, settings: ApiSettings):
        self.settings = settings.resolved()
        self.settings.output_root.mkdir(parents=True, exist_ok=True)
        self.writeback = WritebackEngine(WritebackStore(self.settings.output_root / "writeback"))
        self.orchestrator = RuleBasedOrchestrator()
        self.memory_graph = WorldMemoryGraph()
        # Tavern service (new)
        self.tavern_store = TavernStoreCore(self.settings.output_root / "taverns")
        self.tavern_service = TavernServiceCore(self.tavern_store)

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
            
            # Inject managed taverns
            payload = build_nearby_payload(
                result=result,
                base_url=base_url,
                mode=normalized_mode,
                run_id=run_id,
            )
            self._inject_managed_taverns(payload, lat, lon, radius)
            return payload
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    def map_snapshot_payload(self, snapshot_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        normalized_snapshot_id = _sanitize_snapshot_id(snapshot_id)
        if not normalized_snapshot_id:
            raise HTTPException(status_code=400, detail="snapshot id is required")

        frontend_public = self.settings.frontend_public
        if frontend_public is None:
            raise HTTPException(status_code=500, detail="frontend public directory is unavailable")

        tiles = payload.get("tiles") or []
        if not isinstance(tiles, list) or not tiles:
            raise HTTPException(status_code=400, detail="tiles payload is required")

        snapshot_dir = (frontend_public / "map-snapshots" / normalized_snapshot_id).resolve()
        if not _is_within_root(snapshot_dir, frontend_public.resolve()):
            raise HTTPException(status_code=400, detail="invalid snapshot path")
        snapshot_dir.mkdir(parents=True, exist_ok=True)

        stored_tiles: list[dict[str, Any]] = []
        for index, tile in enumerate(tiles):
            if not isinstance(tile, dict):
                continue
            src = str(tile.get("src") or "").strip()
            if not src.startswith(("http://", "https://")):
                continue

            extension = _guess_tile_extension(src)
            digest = hashlib.sha1(src.encode("utf-8")).hexdigest()[:12]
            filename = f"tile-{index:03d}-{digest}{extension}"
            target_path = snapshot_dir / filename
            _download_remote_file(src, target_path)

            stored_tiles.append(
                {
                    "left": int(tile.get("left") or 0),
                    "top": int(tile.get("top") or 0),
                    "width": int(tile.get("width") or 0),
                    "height": int(tile.get("height") or 0),
                    "file": f"/map-snapshots/{normalized_snapshot_id}/{filename}",
                    "source": src,
                }
            )

        if not stored_tiles:
            raise HTTPException(status_code=400, detail="no downloadable tiles found in payload")

        manifest = {
            "snapshot_id": normalized_snapshot_id,
            "provider": "amap-static-snapshot",
            "captured_from": payload.get("captured_from") or "amap-dom",
            "world_id": payload.get("world_id") or normalized_snapshot_id,
            "origin_label": payload.get("origin_label") or "",
            "center": payload.get("center") or {},
            "zoom": payload.get("zoom"),
            "captured_at": payload.get("captured_at"),
            "viewport": {
                "width": int(payload.get("width") or 0),
                "height": int(payload.get("height") or 0),
            },
            "tiles": stored_tiles,
        }
        (snapshot_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
        return manifest

    def writeback_event_payload(self, event: dict[str, Any]) -> dict[str, Any]:
        try:
            payload = self.writeback.process_event(event)
            record_memory_graph_event(self.memory_graph, event)
            payload["behavior_insights"] = build_behavior_insights(payload=payload, memory_graph=self.memory_graph)
            return payload
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    def orchestrate_world(self, slice_id: str, player_id: str, lat: float, lon: float) -> dict[str, Any]:
        """Orchestrate world based on player state"""
        try:
            # Get POI memory
            poi_memory = self.memory_graph.get_poi_memory(slice_id)
            observer_count = poi_memory.total_observers if poi_memory else 1

            # AIO3: read real accumulated player state from memory graph
            history = self.memory_graph.get_player_history(player_id, slice_id)
            real_visit_count = history.visit_count if history else 1
            real_dwell_seconds = history.total_dwell_time if history else 0.0
            real_mark_count = len(history.marks) if history else 0
            poi_echoes = self.memory_graph.get_poi_echoes(slice_id)
            real_echo_count = len(poi_echoes)

            world_state = {
                "slice_id": slice_id,
                "observer_count": observer_count,
                "center_poi": slice_id,
                "pois": [{"id": slice_id, "name": slice_id}],
            }
            player_state = {
                "player_id": player_id,
                "lat": lat,
                "lon": lon,
                "visit_count": max(1, real_visit_count),
                "writeback_count": max(0, observer_count - 1),
                "echo_count": real_echo_count,
                "mark_count": real_mark_count,
                "dwell_seconds": real_dwell_seconds,
            }

            # Record observation
            self.memory_graph.record_observation(player_id, slice_id)

            # Run orchestration
            result = self.orchestrator.orchestrate(world_state, player_state)

            # Get relationship strength
            relationship = self.memory_graph.calculate_relationship_strength(player_id, slice_id)

            return build_orchestrate_payload(result=result, relationship_strength=relationship)
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

    def record_ghost_trace_payload(self, player_id: str, waypoints: list, mood_arc: list, visibility: str = "local_public") -> dict[str, Any]:
        try:
            trace = self.memory_graph.record_ghost_trace(player_id, waypoints, mood_arc=mood_arc, visibility=visibility)
            return {
                "trace_id": trace.trace_id,
                "player_id": trace.player_id,
                "waypoints": trace.waypoints,
                "started_at": trace.started_at,
                "ended_at": trace.ended_at,
                "mood_arc": trace.mood_arc,
                "visibility": trace.visibility,
            }
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    def get_ghost_traces_payload(self, player_id: str) -> dict[str, Any]:
        try:
            traces = self.memory_graph.get_ghost_traces(player_id)
            return {
                "player_id": player_id,
                "traces": [
                    {
                        "trace_id": t.trace_id,
                        "waypoints": t.waypoints,
                        "started_at": t.started_at,
                        "ended_at": t.ended_at,
                        "mood_arc": t.mood_arc,
                        "visibility": t.visibility,
                    }
                    for t in traces
                ],
            }
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    def landmark_honor_payload(self, slice_id: str) -> dict[str, Any]:
        try:
            store_state = self.writeback.store.load()
            slice_bucket = store_state.get("slices", {}).get(slice_id, {})
            targets = slice_bucket.get("targets", {})
            board = []
            for target_id, bucket in targets.items():
                if bucket.get("target_type") == "landmark" and bucket.get("repair_count", 0) > 0:
                    board.append({
                        "landmark_id": target_id,
                        "repair_count": bucket["repair_count"],
                        "honor_board": bucket.get("honor_board", []),
                    })
            board.sort(key=lambda x: -x["repair_count"])
            return {"slice_id": slice_id, "landmarks": board}
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    def inject_disturbance_payload(self, slice_id: str, weather: str | None, traffic_level: float | None, crowd_density: float | None, is_holiday: bool | None, event_tag: str | None) -> dict[str, Any]:
        inject_disturbance(slice_id, weather=weather, traffic_level=traffic_level, crowd_density=crowd_density, is_holiday=is_holiday, event_tag=event_tag)
        return {"slice_id": slice_id, "active": get_disturbance(slice_id)}

    def clear_disturbance_payload(self, slice_id: str) -> dict[str, Any]:
        clear_disturbance(slice_id)
        return {"slice_id": slice_id, "active": {}}

    def get_disturbance_payload(self, slice_id: str) -> dict[str, Any]:
        return {"slice_id": slice_id, "active": get_disturbance(slice_id)}

    # ─── Tavern Service (based on tavern.py) ─────────────────────────────

    def list_taverns_payload(
        self,
        lat: float | None = None,
        lon: float | None = None,
        radius: float = 5000,
        access: str | None = None,
        status: str | None = None,
        query: str = "",
        owner_id: str = "",
    ) -> dict[str, Any]:
        """List all taverns with optional location filter"""
        taverns = self.tavern_service.list_taverns(
            lat=lat, lon=lon, radius=radius, access=access, status=status, query=query, owner_id=owner_id
        )
        return {"taverns": taverns, "count": len(taverns)}

    def list_taverns(self, user_id: str = "", **filters: Any) -> list[dict[str, Any]]:
        """Compatibility wrapper for legacy router endpoints."""
        return self.tavern_service.list_taverns(owner_id=user_id, **filters)

    def get_tavern_payload(self, tavern_id: str, user_id: str = "") -> dict[str, Any]:
        """Get a specific tavern by ID"""
        return self.tavern_service.get_tavern(tavern_id, user_id)

    def get_tavern(self, tavern_id: str, user_id: str = "") -> dict[str, Any]:
        """Compatibility wrapper for legacy router endpoints."""
        return self.get_tavern_payload(tavern_id, user_id)

    def create_tavern_payload(self, data: dict[str, Any], owner_id: str = "") -> dict[str, Any]:
        """Create a new tavern"""
        return self.tavern_service.create_tavern(data, owner_id)

    def update_tavern_payload(self, tavern_id: str, data: dict[str, Any], user_id: str = "") -> dict[str, Any]:
        """Update a tavern"""
        return self.tavern_service.update_tavern(tavern_id, data, user_id)

    def update_tavern(self, tavern_id: str, data: dict[str, Any], user_id: str = "") -> dict[str, Any]:
        """Compatibility wrapper for legacy router endpoints."""
        return self.update_tavern_payload(tavern_id, data, user_id)

    def delete_tavern_payload(self, tavern_id: str, user_id: str = "") -> dict[str, str]:
        """Delete a tavern"""
        return self.tavern_service.delete_tavern(tavern_id, user_id)

    # ── Voice Config ───────────────────────────────────────────────────

    def save_voice_config_payload(
        self, tavern_id: str, data: dict[str, Any], user_id: str = ""
    ) -> dict[str, Any]:
        """Save voice config (TTS/STT settings)"""
        tavern = self.tavern_store.get_tavern(tavern_id)
        if not tavern:
            raise HTTPException(status_code=404, detail="酒馆不存在")
        if tavern.owner_id and tavern.owner_id != user_id:
            raise HTTPException(status_code=403, detail="你不是此酒馆的主人")

        from fablemap.tavern import VoiceConfig
        voice_config = VoiceConfig.from_dict(data)
        self.tavern_store.save_voice_config(tavern_id, voice_config)
        # Also update the in-memory tavern object
        tavern.voice_config = voice_config
        self.tavern_store.update_tavern(tavern)
        return {"ok": True, "voice_config": voice_config.to_dict()}

    def get_voice_config_payload(
        self, tavern_id: str, user_id: str = ""
    ) -> dict[str, Any]:
        """Get voice config — owner sees full config, others see public config"""
        tavern = self.tavern_store.get_tavern(tavern_id)
        if not tavern:
            raise HTTPException(status_code=404, detail="酒馆不存在")

        vc = self.tavern_store.get_voice_config(tavern_id)
        if vc:
            return {"voice_config": vc.to_dict()}

        # Return default empty config
        from fablemap.tavern import VoiceConfig
        default_vc = VoiceConfig()
        return {"voice_config": default_vc.to_dict()}

    def synthesize_voice_payload(
        self,
        tavern_id: str,
        text: str,
        character_id: str = "",
        user_id: str = "",
    ) -> bytes:
        """Synthesize speech for a tavern using its TTS config."""
        tavern = self.tavern_store.get_tavern(tavern_id)
        if not tavern:
            raise HTTPException(status_code=404, detail="酒馆不存在")

        vc = self.tavern_store.get_voice_config(tavern_id)
        if not vc or not vc.enabled:
            raise HTTPException(status_code=400, detail="语音未启用")

        # Get TTS provider credentials from LLM config (same api_key works)
        llm_config = self.tavern_store.get_llm_config(tavern_id)
        api_key = llm_config.api_key if llm_config else ""
        base_url = llm_config.base_url if llm_config else ""

        # Build TTS config
        from fablemap.tts_clients import TTSConfig, create_tts_provider
        tts_cfg = TTSConfig(
            provider=vc.tts_provider,
            api_key=api_key,
            base_url=base_url,
            voice=vc.tts_voice,
            model=vc.tts_model,
            speed=vc.tts_speed,
            language=vc.tts_language,
        )

        try:
            provider = create_tts_provider(tts_cfg)
            result = provider.synthesize(text, voice=vc.tts_voice or None)
            return result.audio
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"语音合成失败: {e}")

    def enter_tavern_payload(
        self, tavern_id: str, password: str = "", user_id: str = ""
    ) -> dict[str, Any]:
        """Enter a tavern (verify password)"""
        return self.tavern_service.enter_tavern(tavern_id, password, user_id)

    def list_tavern_visitors_payload(self, tavern_id: str, user_id: str = "") -> dict[str, Any]:
        """List visitor states for a tavern. Owner-only."""
        tavern = self.tavern_store.get_tavern(tavern_id)
        if not tavern:
            raise HTTPException(status_code=404, detail="Tavern not found")
        if tavern.owner_id and tavern.owner_id != user_id:
            raise HTTPException(status_code=403, detail="你不是此酒馆的主人")

        visitor_names: dict[str, str] = {}
        message_counts: dict[str, int] = {}
        for session in self.tavern_store.list_chat_sessions(tavern_id, limit=None):
            visitor_id = session.get("visitor_id", "")
            if not visitor_id:
                continue
            visitor_name = session.get("visitor_name", "")
            if visitor_name and not visitor_names.get(visitor_id):
                visitor_names[visitor_id] = visitor_name
            message_counts[visitor_id] = message_counts.get(visitor_id, 0) + int(session.get("message_count", 0) or 0)

        visitors = []
        for state in self.tavern_store.list_visitor_states(tavern_id):
            payload = state.to_dict()
            payload["visitor_name"] = visitor_names.get(state.visitor_id, "")
            payload["message_count"] = message_counts.get(state.visitor_id, 0)
            visitors.append(payload)

        return {"visitors": visitors, "count": len(visitors)}

    def add_character_payload(
        self, tavern_id: str, data: dict[str, Any], user_id: str = ""
    ) -> dict[str, Any]:
        """Add a character to a tavern"""
        return self.tavern_service.add_character(tavern_id, data, user_id)

    def update_character_payload(
        self, tavern_id: str, char_id: str, data: dict[str, Any], user_id: str = ""
    ) -> dict[str, Any]:
        """Update a character"""
        return self.tavern_service.update_character(tavern_id, char_id, data, user_id)

    def delete_character_payload(
        self, tavern_id: str, char_id: str, user_id: str = ""
    ) -> dict[str, str]:
        """Delete a character"""
        return self.tavern_service.delete_character(tavern_id, char_id, user_id)

    def import_character_card_payload(
        self, tavern_id: str, card_data: dict[str, Any], user_id: str = ""
    ) -> dict[str, Any]:
        """Import a SillyTavern character card"""
        return self.tavern_service.import_character_card(tavern_id, card_data, user_id)

    def list_tavern_backups(self, tavern_id: str = "") -> dict[str, Any]:
        backup_dir = self.settings.output_root / "backups"
        backup_dir.mkdir(parents=True, exist_ok=True)
        files = sorted(backup_dir.glob("*.json"), key=lambda item: item.stat().st_mtime, reverse=True)[:50]
        backups = []
        for file_path in files:
            if tavern_id and tavern_id not in file_path.name:
                continue
            backups.append({
                "name": file_path.name,
                "path": str(file_path),
                "size": file_path.stat().st_size,
                "modified": file_path.stat().st_mtime,
            })
        return {"backups": backups}

    def create_tavern_backup(self, tavern_id: str, user_id: str = "") -> dict[str, Any]:
        tavern = self.tavern_store.get_tavern(tavern_id)
        if not tavern:
            raise HTTPException(status_code=404, detail="Tavern not found")
        if tavern.owner_id and tavern.owner_id != user_id:
            raise HTTPException(status_code=403, detail="你不是此酒馆的主人")

        chat_sessions = self.tavern_store.list_chat_sessions(tavern_id, limit=None)
        payload = {
            "version": 1,
            "created_at": _utc_now_iso(),
            "tavern": tavern.to_dict_private(user_id),
            "chat_sessions": [
                {
                    "visitor_id": session.get("visitor_id", ""),
                    "character_id": session.get("character_id", ""),
                    "messages": [
                        message.to_dict() if hasattr(message, "to_dict") else message
                        for message in session.get("messages", [])
                    ],
                }
                for session in chat_sessions
            ],
        }

        backup_dir = self.settings.output_root / "backups"
        backup_dir.mkdir(parents=True, exist_ok=True)
        backup_name = f"backup_{_sanitize_snapshot_id(tavern_id)}_{_now_ms()}.json"
        backup_file = backup_dir / backup_name
        backup_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return {
            "ok": True,
            "backup_file": str(backup_file),
            "backup_name": backup_name,
            "tavern_id": tavern_id,
            "chat_sessions": len(payload["chat_sessions"]),
        }

    def restore_tavern_backup(
        self,
        backup_path: str,
        tavern_id: str = "",
        user_id: str = "",
        replace_chats: bool = True,
    ) -> dict[str, Any]:
        if not backup_path:
            raise HTTPException(status_code=400, detail="backup_path is required")

        backup_file = self._resolve_backup_file(backup_path)
        try:
            backup_data = json.loads(backup_file.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise HTTPException(status_code=400, detail=f"Invalid backup file: {exc}") from exc

        tavern_payload = backup_data.get("tavern", backup_data)
        target_tavern_id = tavern_id or tavern_payload.get("id", "")
        if not target_tavern_id:
            raise HTTPException(status_code=400, detail="tavern_id is required")

        existing = self.tavern_store.get_tavern(target_tavern_id)
        if existing:
            if existing.owner_id and existing.owner_id != user_id:
                raise HTTPException(status_code=403, detail="你不是此酒馆的主人")
            self.tavern_service.update_tavern(target_tavern_id, tavern_payload, user_id)
        else:
            from fablemap.tavern import Tavern
            restored_tavern = Tavern.from_dict({**tavern_payload, "id": target_tavern_id})
            if restored_tavern.owner_id and restored_tavern.owner_id != user_id:
                raise HTTPException(status_code=403, detail="你不是此酒馆的主人")
            restored_tavern.owner_id = restored_tavern.owner_id or user_id
            self.tavern_store.create_tavern(restored_tavern)

        if replace_chats:
            self.tavern_store.delete_chat_history(target_tavern_id)

        restored_messages = 0
        from fablemap.tavern import ChatMessage
        for session in backup_data.get("chat_sessions", []):
            if not isinstance(session, dict):
                continue
            visitor_id = session.get("visitor_id", "")
            character_id = session.get("character_id", "")
            if not visitor_id or not character_id:
                continue
            messages = []
            for message_data in session.get("messages", []):
                if not isinstance(message_data, dict):
                    continue
                messages.append(ChatMessage.from_dict({
                    **message_data,
                    "tavern_id": target_tavern_id,
                    "visitor_id": message_data.get("visitor_id") or visitor_id,
                    "character_id": message_data.get("character_id") or character_id,
                    "role": message_data.get("role") or "user",
                    "content": message_data.get("content") or "",
                    "timestamp": message_data.get("timestamp") or _utc_now_iso(),
                }))
            restored_messages += self.tavern_store.replace_chat_history(
                target_tavern_id,
                visitor_id,
                character_id,
                messages,
            )

        return {
            "ok": True,
            "tavern_id": target_tavern_id,
            "restored_messages": restored_messages,
        }

    def _resolve_backup_file(self, backup_path: str) -> Path:
        backup_dir = (self.settings.output_root / "backups").resolve()
        candidate = Path(backup_path)
        if not candidate.is_absolute():
            candidate = backup_dir / candidate
        candidate = candidate.resolve()
        if not _is_within_root(candidate, backup_dir):
            raise HTTPException(status_code=400, detail="backup_path must be inside backups directory")
        if not candidate.exists() or not candidate.is_file():
            raise HTTPException(status_code=404, detail="Backup file not found")
        return candidate

    # Chat methods using tavern service
    def tavern_chat_payload(
        self,
        tavern_id: str,
        character_id: str,
        message: str,
        visitor_id: str,
        visitor_name: str = "",
        user_id: str = "",
    ) -> dict[str, Any]:
        """Send a chat message and get AI response"""
        from fablemap.tavern import ChatMessage as TavernChatMessage, VisitorState

        tavern = self.tavern_store.get_tavern(tavern_id)
        if not tavern:
            raise HTTPException(status_code=404, detail="酒馆不存在")

        visitor_id = str(visitor_id or user_id or "").strip()
        user_id = str(user_id or "").strip()
        if not visitor_id:
            raise HTTPException(status_code=400, detail="缺少访客身份")
        if user_id and user_id != visitor_id and tavern.owner_id != user_id:
            raise HTTPException(status_code=403, detail="不能代替其他访客发送消息")
        if tavern.access == "private" and tavern.owner_id != user_id:
            raise HTTPException(status_code=403, detail="此酒馆是私人的")

        visitor_display_name = _normalize_visitor_name(visitor_name)
        prompt_user_name = visitor_display_name or visitor_id[:16] or "旅人"

        # Find character
        character = next((c for c in tavern.characters if c.id == character_id), None)
        if not character:
            raise HTTPException(status_code=404, detail="角色不存在")

        # Check if tavern is open
        if tavern.status != "open":
            return self._degraded_chat_payload(
                character_id=character_id,
                character_name=character.name,
                response_text="此店暂时歇业中。",
                reason="tavern_closed",
                title="酒馆正在歇业",
                message="店主暂时关闭了这间酒馆。等它重新营业后，就可以继续和角色对话。",
                action="稍后再来，或请店主在控制台重新开放酒馆。",
                tavern_status=tavern.status,
            )

        # Get LLM config
        llm_config = self.tavern_store.get_llm_config(tavern_id)
        if not llm_config or not llm_config.is_configured():
            self._mark_tavern_closed(tavern)
            return self._degraded_chat_payload(
                character_id=character_id,
                character_name=character.name,
                response_text="此店暂未配置 AI，无法回应。",
                reason="llm_not_configured",
                title="AI 后端还没配置",
                message="这间酒馆还没有可用的 API Key 或 Base URL。",
                action="店主可以在 AI 配置里补全连接信息并测试通过。",
                tavern_status="closed",
            )

        # Build messages using PromptBuilder
        messages = self.tavern_store.get_chat_history(
            tavern_id, visitor_id, character_id, limit=20
        )
        prompt_visitor_state = self.tavern_store.get_visitor_state(tavern_id, visitor_id) if visitor_id else None
        visitor_message_count = len(messages)
        if visitor_id:
            try:
                visitor_message_count = sum(
                    int(session.get("message_count", 0) or 0)
                    for session in self.tavern_store.list_chat_sessions(
                        tavern_id,
                        visitor_id=visitor_id,
                        limit=None,
                    )
                )
            except Exception:
                visitor_message_count = len(messages)

        # Convert to prompt_builder.ChatMessage format
        prompt_messages_obj = [
            PromptChatMessage(
                id=m.id,
                role=m.role,
                content=m.content,
                name=(m.visitor_name or visitor_display_name) if m.role == "user" else character.name,
                timestamp=m.timestamp or "",
            )
            for m in messages
        ]

        # Determine output format based on backend
        output_format = "openai"
        if llm_config.backend in ("claude",):
            output_format = "claude"
        elif llm_config.backend in ("ooba", "mancer", "vllm", "tabby", "koboldcpp", "togetherai", "llamacpp", "infermaticai", "dreamgen", "featherless", "huggingface", "generic", "ollama"):
            output_format = "textgen"

        # Build prompt
        config = PromptBuildConfig(
            tavern_name=tavern.name,
            tavern_scene_prompt=tavern.scene_prompt or "",
            char_name=character.name,
            char_personality=character.personality or "",
            char_scenario=character.scenario or "",
            char_first_mes=character.first_mes or "",
            char_system_prompt=character.system_prompt or "",
            user_name=prompt_user_name,
            visitor_visit_count=prompt_visitor_state.visit_count if prompt_visitor_state else 0,
            visitor_relationship_stage=prompt_visitor_state.relationship_stage if prompt_visitor_state else "",
            visitor_relationship_strength=prompt_visitor_state.relationship_strength if prompt_visitor_state else 0.0,
            visitor_first_visit=prompt_visitor_state.first_visit if prompt_visitor_state else "",
            visitor_last_visit=prompt_visitor_state.last_visit if prompt_visitor_state else "",
            visitor_message_count=visitor_message_count,
            world_info_entries=[e.to_dict() if hasattr(e, "to_dict") else e for e in tavern.world_info],
            output_format=output_format,
            history_max_messages=20,
        )
        builder = PromptBuilder(config)
        prompt_result = builder.build(prompt_messages_obj, message)

        # Call LLM using the new llm_clients
        response = None
        degradation: dict[str, Any] | None = None
        try:
            llm_client_config = _tavern_llm_config_to_client(llm_config)
            llm_client = create_client(llm_client_config)
            response = llm_client.complete(prompt_result["messages"])
            response_text = response.content
        except LLMError as e:
            logger.warning(f"LLM call failed: {e}, falling back to rule-based response")
            response_text = self._fallback_response(message, character.name)
            self._mark_tavern_closed(tavern)
            degradation = self._build_degradation(
                reason="llm_error",
                title="AI 后端暂时不可用",
                message="刚才的模型调用失败，已切换为规则回应。",
                action="店主可以在 AI 配置里测试连接，确认 API Key、模型名称或 Base URL。",
                technical_detail=str(e),
            )
        except Exception as e:
            logger.error(f"Unexpected error during LLM call: {e}")
            response_text = self._fallback_response(message, character.name)
            self._mark_tavern_closed(tavern)
            degradation = self._build_degradation(
                reason="llm_unexpected_error",
                title="AI 回应暂时中断",
                message="酒馆后端遇到异常，已切换为规则回应。",
                action="稍后重试；如果持续出现，请店主重新测试 AI 配置。",
                technical_detail=str(e),
            )

        # Save messages
        now = _utc_now_iso()
        self.tavern_store.add_chat_message(
            TavernChatMessage(
                id=f"msg_{uuid.uuid4().hex[:12]}",
                tavern_id=tavern_id,
                character_id=character_id,
                visitor_id=visitor_id,
                visitor_name=visitor_display_name,
                role="user",
                content=message,
                timestamp=now,
            )
        )
        self.tavern_store.add_chat_message(
            TavernChatMessage(
                id=f"msg_{uuid.uuid4().hex[:12]}",
                tavern_id=tavern_id,
                character_id=character_id,
                visitor_id=visitor_id,
                visitor_name=visitor_display_name,
                role="assistant",
                content=response_text,
                timestamp=now,
            )
        )

        # Record token usage
        token_count = self._count_tokens(llm_config.backend, llm_config.model, message, response_text, response)
        self.tavern_store.add_token_usage(tavern_id, token_count)

        if visitor_id:
            visitor_state = self.tavern_store.get_visitor_state(tavern_id, visitor_id) or VisitorState(
                visitor_id=visitor_id,
                tavern_id=tavern_id,
                first_visit=now,
            )
            if not visitor_state.first_visit:
                visitor_state.first_visit = now
            visitor_state.last_visit = now
            visitor_state.relationship_strength = min(
                1.0,
                float(visitor_state.relationship_strength or 0.0) + 0.05,
            )
            visitor_state.relationship_stage = _relationship_stage_for(
                visitor_state.relationship_strength,
                visitor_state.visit_count,
            )
            self.tavern_store.update_visitor_state(tavern_id, visitor_state)

        return {
            "character_id": character_id,
            "character_name": character.name,
            "response": response_text,
            "mood": "curious",
            "degraded": bool(degradation),
            "degradation": degradation,
            "tavern_status": "closed" if degradation else tavern.status,
            "timestamp": _now_ms(),
        }

    def _build_degradation(
        self,
        *,
        reason: str,
        title: str,
        message: str,
        action: str,
        technical_detail: str = "",
    ) -> dict[str, str]:
        detail = (technical_detail or "").strip()
        if len(detail) > 180:
            detail = f"{detail[:177]}..."
        return {
            "reason": reason,
            "title": title,
            "message": message,
            "action": action,
            "technical_detail": detail,
        }

    def _degraded_chat_payload(
        self,
        *,
        character_id: str,
        character_name: str,
        response_text: str,
        reason: str,
        title: str,
        message: str,
        action: str,
        tavern_status: str,
        technical_detail: str = "",
    ) -> dict[str, Any]:
        return {
            "character_id": character_id,
            "character_name": character_name,
            "response": response_text,
            "mood": "neutral",
            "degraded": True,
            "degradation": self._build_degradation(
                reason=reason,
                title=title,
                message=message,
                action=action,
                technical_detail=technical_detail,
            ),
            "tavern_status": tavern_status,
            "timestamp": _now_ms(),
        }

    def _mark_tavern_closed(self, tavern) -> None:
        if not tavern or tavern.status == "closed":
            return
        tavern.status = "closed"
        try:
            self.tavern_store.update_tavern(tavern)
        except Exception as exc:
            logger.warning(f"Failed to mark tavern closed after LLM degradation: {exc}")

    def _count_tokens(
        self,
        backend: str,
        model: str,
        input_text: str,
        output_text: str,
        response,
    ) -> int:
        """
        Count tokens for input and output text.
        Uses LLM API usage data when available, falls back to TokenCounter.
        """
        from fablemap.token_counter import get_counter

        total = 0
        # Try to use LLM API usage data
        if response and hasattr(response, "usage") and response.usage:
            usage = response.usage
            if isinstance(usage, dict):
                # OpenAI format: total_tokens
                if "total_tokens" in usage:
                    return usage["total_tokens"]
                # Anthropic format: input_tokens + output_tokens
                if "input_tokens" in usage:
                    total += usage["input_tokens"]
                    total += usage.get("output_tokens", 0)
                    if total > 0:
                        return total
                # Try prompt/completion tokens
                total += usage.get("prompt_tokens", 0)
                total += usage.get("completion_tokens", 0)
                if total > 0:
                    return total
            elif isinstance(usage, (int, float)):
                return int(usage)

        # Fallback: use TokenCounter
        counter = get_counter(backend)
        if backend == "claude":
            # Claude uses cl100k_base equivalent
            counter = get_counter("cl100k_base")
        total = counter.count(input_text) + counter.count(output_text)
        return total

    def _fallback_response(self, message: str, char_name: str) -> str:
        """Rule-based fallback when LLM is unavailable."""
        msg_lower = message.lower()
        if any(k in msg_lower for k in ["你好", "hi", "hello"]):
            return "你好，欢迎光临。"
        if any(k in msg_lower for k in ["再见", "bye", "离开"]):
            return "后会有期，有空再来。"
        if any(k in msg_lower for k in ["谢谢", "thank"]):
            return "不客气。"
        import random
        responses = [
            "我明白了。让我想想……",
            "嗯，这很有趣。",
            "你说的这些，我倒是有所耳闻。",
            "这里每天都有新故事。你想聊什么？",
        ]
        return random.choice(responses)

    def test_llm_payload(
        self,
        tavern_id: str,
        llm_config_data: dict[str, Any],
    ) -> dict[str, Any]:
        """Test LLM configuration by sending a simple prompt."""
        from fablemap.llm_clients import create_client, LLMConfig, LLMError

        try:
            cfg = LLMConfig(
                backend=llm_config_data.get("backend", "openai"),
                model=llm_config_data.get("model", ""),
                api_key=llm_config_data.get("api_key", ""),
                base_url=llm_config_data.get("base_url", ""),
                temperature=float(llm_config_data.get("temperature", 0.8)),
                max_tokens=int(llm_config_data.get("max_tokens", 256)),
                top_p=float(llm_config_data.get("top_p", 1.0)),
            )

            if not cfg.api_key and not cfg.base_url:
                return {"ok": False, "message": "请提供 API Key 或 Base URL"}

            client = create_client(cfg)
            test_messages = [
                {"role": "user", "content": "你好，请回复一个简单的问候。"},
            ]
            response = client.complete(test_messages)
            return {
                "ok": True,
                "message": "连接成功",
                "model": response.model,
                "preview": response.content[:200],
            }
        except LLMError as e:
            return {"ok": False, "message": f"连接失败：{str(e)[:200]}"}
        except Exception as e:
            logger.error(f"test_llm failed: {e}")
            return {"ok": False, "message": f"连接失败：{str(e)[:200]}"}

    def test_llm_config_payload(
        self,
        llm_config_data: dict[str, Any],
    ) -> dict[str, Any]:
        """Test LLM configuration directly, without requiring a tavern_id."""
        from fablemap.llm_clients import create_client, LLMConfig, LLMError

        try:
            cfg = LLMConfig(
                backend=llm_config_data.get("backend", "openai"),
                model=llm_config_data.get("model", ""),
                api_key=llm_config_data.get("api_key", ""),
                base_url=llm_config_data.get("base_url", ""),
                temperature=float(llm_config_data.get("temperature", 0.8)),
                max_tokens=int(llm_config_data.get("max_tokens", 256)),
                top_p=float(llm_config_data.get("top_p", 1.0)),
            )

            if not cfg.api_key and not cfg.base_url:
                return {"ok": False, "message": "请提供 API Key 或 Base URL"}

            client = create_client(cfg)
            test_messages = [
                {"role": "user", "content": "你好，请回复一个简单的问候。"},
            ]
            response = client.complete(test_messages)
            return {
                "ok": True,
                "message": "连接成功",
                "model": response.model,
                "preview": response.content[:200],
            }
        except LLMError as e:
            return {"ok": False, "message": f"连接失败：{str(e)[:200]}"}
        except Exception as e:
            logger.error(f"test_llm_config failed: {e}")
            return {"ok": False, "message": f"连接失败：{str(e)[:200]}"}

    def tavern_chat_history_payload(
        self,
        tavern_id: str,
        visitor_id: str,
        character_id: str | None = None,
        user_id: str = "",
        limit: int = 50,
    ) -> dict[str, Any]:
        """Get chat history for a tavern"""
        tavern = self.tavern_store.get_tavern(tavern_id)
        if not tavern:
            raise HTTPException(status_code=404, detail="酒馆不存在")

        visitor_id = str(visitor_id or "").strip()
        user_id = str(user_id or "").strip()
        if not visitor_id:
            raise HTTPException(status_code=400, detail="缺少访客身份")

        is_owner = bool(user_id and tavern.owner_id == user_id)
        is_visitor = bool(user_id and user_id == visitor_id)
        if not is_owner and not is_visitor:
            raise HTTPException(status_code=403, detail="不能读取其他访客的聊天记录")

        if tavern.access == "private" and not is_owner:
            raise HTTPException(status_code=403, detail="此酒馆是私人的")

        history_limit = _clamp_chat_history_limit(limit)
        messages = self.tavern_store.get_chat_history(
            tavern_id, visitor_id, character_id, limit=history_limit
        )
        character = next((c for c in tavern.characters if c.id == character_id), None) if character_id else None
        visitor_name = next((m.visitor_name for m in reversed(messages) if getattr(m, "visitor_name", "")), "")
        return {
            "tavern_id": tavern_id,
            "tavern_name": tavern.name,
            "visitor_id": visitor_id,
            "visitor_name": visitor_name,
            "character_id": character_id,
            "character_name": character.name if character else "",
            "messages": [m.to_dict() for m in messages],
            "count": len(messages),
            "limit": history_limit,
        }

    def _inject_managed_taverns(self, payload: dict[str, Any], center_lat: float, center_lon: float, radius: int):
        """Inject managed taverns into the POI list of a nearby result."""
        managed_taverns = self.writeback.store.get_taverns()
        if not managed_taverns:
            return

        world = payload.get("world")
        if not world or not isinstance(world, dict):
            return

        pois = world.setdefault("pois", [])
        
        # Simple distance check for injection (radius is in meters, but we use degree expansion for speed)
        # 1 deg approx 111000 meters
        deg_radius = radius / 111000.0
        
        for tid, data in managed_taverns.items():
            t_lat = data.get("lat")
            t_lon = data.get("lon")
            if t_lat is None or t_lon is None:
                continue
            
            if abs(t_lat - center_lat) <= deg_radius and abs(t_lon - center_lon) <= deg_radius:
                # Convert managed tavern to POI format
                poi = {
                    "id": data["id"],
                    "osm_type": "managed_tavern",
                    "real_name": data["name"],
                    "fantasy_name": data["name"],
                    "fantasy_type": "managed_tavern",
                    "position": {"lat": t_lat, "lon": t_lon},
                    "description": data.get("description", ""),
                    "faction_alignment": "neutral",
                    "managed": True,
                    "visual_hint": {
                        "style": "managed_gold",
                        "palette": "gold_and_black",
                    }
                }
                # Check if already exists by ID
                if not any(p.get("id") == poi["id"] for p in pois):
                    pois.append(poi)

    def chat_response_payload(
        self,
        character_id: str,
        message: str,
        world_id: str,
        poi_id: str,
        player_id: str,
        history: list,
    ) -> dict[str, Any]:
        """Generate a character response and persist the chat exchange to writeback."""
        from ..writeback import _utc_now_iso

        # Save player's message to writeback
        self.writeback.add_chat_message(
            player_id=player_id,
            poi_id=poi_id,
            character_id=character_id,
            role="player",
            content=message,
        )

        # Determine character archetype and mood from the message
        archetype, mood, character_name, character_description = self._derive_character_info(
            character_id, world_id
        )

        # Generate response based on archetype
        response = _generate_response(archetype, mood, message, character_description)

        # Save character's response to writeback
        char_msg = self.writeback.add_chat_message(
            player_id=player_id,
            poi_id=poi_id,
            character_id=character_id,
            role="character",
            content=response,
        )

        return {
            "character_id": character_id,
            "character_name": character_name,
            "response": response,
            "mood": mood,
            "archetype": archetype,
            "poi_id": poi_id,
            "timestamp": _now_ms(),
            "character_message": char_msg,
        }

    def chat_history_payload(
        self,
        player_id: str,
        poi_id: str,
        character_id: str | None = None,
    ) -> dict[str, Any]:
        """Get chat history for a player + POI (optionally filtered by character)."""
        messages = self.writeback.get_chat_history(
            player_id=player_id,
            poi_id=poi_id,
            character_id=character_id,
            limit=50,
        )
        return {
            "player_id": player_id,
            "poi_id": poi_id,
            "character_id": character_id,
            "messages": messages,
            "count": len(messages),
        }

    def _derive_character_info(self, character_id: str, world_id: str) -> tuple[str, str, str, str]:
        """Derive archetype, mood, name, and description from faction data."""
        import json
        from ..writeback import _utc_now_iso

        world = {}
        try:
            # Try to find world JSON in output root
            for f in self.settings.output_root.glob(f"{world_id}/*.json"):
                try:
                    data = json.loads(f.read_text("utf-8"))
                    if data.get("world_id") == world_id or data.get("world_id"):
                        world = data
                        break
                except Exception:
                    continue
        except Exception:
            pass

        archetype = "wanderer"
        mood = "curious"
        character_name = "未知角色"
        character_description = "这个角色还没有被赋予身份。"

        factions = world.get("factions", [])
        for faction in factions:
            if f"faction-{faction.get('id', '')}" == character_id:
                archetype = _archetype_from_faction(faction)
                mood = faction.get("emotional_tone", "curious")
                character_name = faction.get("name", "未知势力")
                character_description = faction.get("doctrine", "")
                break

        # If character_id looks like a POI-based character (not faction)
        if character_id.startswith("char_") or character_id.startswith("npc_"):
            archetype = "wanderer"
            mood = "mysterious"
            character_name = "旅人"
            character_description = ""

        return archetype, mood, character_name, character_description

    # ─── Quick Reply Manager ──────────────────────────────────────────────

    def get_quick_reply_manager(self):
        """Get the quick reply manager (lazy initialization)."""
        if not hasattr(self, "_quick_reply_manager"):
            from fablemap.quick_replies import QuickReplyManager
            self._quick_reply_manager = QuickReplyManager()
            # Load from storage if available
            storage_path = self.settings.output_root / "quick_replies.json"
            self._quick_reply_manager.load_from_file(storage_path)
        return self._quick_reply_manager

    # ─── Command Manager ──────────────────────────────────────────────────

    def get_command_manager(self):
        """Get the slash command manager (lazy initialization)."""
        if not hasattr(self, "_command_manager"):
            from fablemap.slash_commands import get_command_manager
            self._command_manager = get_command_manager()
        return self._command_manager

    # ─── Extension Manager ────────────────────────────────────────────────

    def get_extension_manager(self):
        """Get the extension manager (lazy initialization)."""
        if not hasattr(self, "_extension_manager"):
            from fablemap.extensions import get_extension_manager
            self._extension_manager = get_extension_manager()
        return self._extension_manager

    # ─── Group Chat Sessions ─────────────────────────────────────────────

    def create_group_chat_session(self, group_manager) -> str:
        """Create a new group chat session and return its ID."""
        if not hasattr(self, "_group_chat_sessions"):
            self._group_chat_sessions = {}
        session_id = str(uuid.uuid4())
        self._group_chat_sessions[session_id] = group_manager
        return session_id

    def get_group_chat_session(self, session_id: str):
        """Get a group chat session by ID."""
        return getattr(self, "_group_chat_sessions", {}).get(session_id)

    # ─── Preset Manager ───────────────────────────────────────────────────

    def get_preset_manager(self):
        """Get the LLM preset manager (lazy initialization)."""
        if not hasattr(self, "_preset_manager"):
            from fablemap.presets import PresetManager
            storage_path = self.settings.output_root / "presets.json"
            self._preset_manager = PresetManager(storage_path)
        return self._preset_manager


def _archetype_from_faction(faction: dict) -> str:
    """Map faction archetype to character archetype."""
    mapping = {
        "trade_guild": "merchant",
        "order_bureau": "guardian",
        "clinic_circle": "healer",
        "memory_collective": "scholar",
        "night_bloom": "wanderer",
    }
    faction_id = faction.get("id", "")
    return mapping.get(faction_id, "wanderer")


# ─── Simple rule-based response generator ────────────────────────────────────

_CHARACTER_GREETINGS = {
    "merchant": ["交易？你来得正好。", "补给的时间到了？", "欢迎来到交易站。"],
    "guardian": ["请说明你来意。", "这片区域在我的守护之下。", "来者何人？"],
    "healer": ["这里是疗愈之所。", "你受伤了吗？", "让我看看你的状况。"],
    "scholar": ["有什么值得记录的？", "知识是最宝贵的财富。", "这座城市的记忆在我这里。"],
    "wanderer": ["你来了。", "又一个过路人。", "这里没有什么特别的事。"],
}

_CHARACTER_RESPONSES = {
    "merchant": [
        "贸易是这座城市的血脉。每一笔交易都在改变着什么。",
        "我这里有各种物品和信息。你想要什么？",
        "价格公道，童叟无欺。但如果你付不起，那就另说了。",
    ],
    "guardian": [
        "我会守护这片区域，直到最后一人离开。",
        "秩序是这里的基石。没有秩序，就只有混乱。",
        "这片土地见证过太多故事。我只是其中之一。",
    ],
    "healer": [
        "伤痛总会留下痕迹，无论身体还是心灵。",
        "每一次疗愈都是一次重建。希望是最强的药剂。",
        "这里不评判来者，只治愈需要被治愈的人。",
    ],
    "scholar": [
        "这座城市的每一块砖都有自己的故事。",
        "记忆是最容易被遗忘的东西。但我不会忘。",
        "让我告诉你一些你不知道的事。",
    ],
    "wanderer": [
        "我来过这里很多次了。每次都不一样。",
        "城市在变，但某些东西永远不会变。",
        "我没有固定的身份。我是这座城市的一部分。",
    ],
}


def _generate_response(archetype: str, mood: str, message: str, description: str) -> str:
    """Generate a simple response based on archetype and mood."""
    import random

    responses = _CHARACTER_RESPONSES.get(archetype, _CHARACTER_RESPONSES["wanderer"])

    if not message.strip():
        greetings = _CHARACTER_GREETINGS.get(archetype, _CHARACTER_GREETINGS["wanderer"])
        return random.choice(greetings)

    # Check for specific keywords
    msg_lower = message.lower()
    if any(k in msg_lower for k in ["你好", "hi", "hello", "hi!"]):
        if mood == "warm":
            return "你好，欢迎来到这里。"
        elif mood == "wary":
            return "你好。你来这里做什么？"
        else:
            return "你好。有什么事？"

    if any(k in msg_lower for k in ["再见", "bye", "走", "离开"]):
        return "后会有期。"

    if any(k in msg_lower for k in ["谢谢", "thank"]):
        return "不必言谢。这是我的职责。"

    # Default: random response from archetype pool
    base = random.choice(responses)

    # Add description flavor occasionally
    if description and random.random() < 0.3:
        return f"{base}\n\n这座{archetype}的教义说：{description}"

    return base





def _utc_now_iso() -> str:
    from datetime import UTC, datetime
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _now_ms() -> int:
    import time
    return int(time.time() * 1000)


def _sanitize_snapshot_id(value: str) -> str:
    allowed = [ch.lower() if ch.isalnum() else "-" for ch in (value or "").strip()]
    normalized = "".join(allowed).strip("-")
    while "--" in normalized:
        normalized = normalized.replace("--", "-")
    return normalized[:80]


def _guess_tile_extension(url: str) -> str:
    suffix = Path(urlparse(url).path).suffix.lower()
    if suffix in {".png", ".jpg", ".jpeg", ".webp"}:
        return suffix
    return ".png"


def _download_remote_file(url: str, target_path: Path) -> None:
    request = Request(
        url,
        headers={
            "User-Agent": "FableMapSnapshot/1.0",
            "Referer": "https://webapi.amap.com/",
        },
    )
    with urlopen(request, timeout=20) as response:
        target_path.write_bytes(response.read())


def _is_within_root(candidate: Path, root: Path) -> bool:
    try:
        candidate.relative_to(root)
        return True
    except ValueError:
        return False
