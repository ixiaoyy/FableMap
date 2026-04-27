from __future__ import annotations

import base64
import json
import logging
from typing import Any

from fastapi import HTTPException

from fablemap_api.core.llm_clients import LLMConfig as ClientLLMConfig
from fablemap_api.core.llm_clients import create_client
from fablemap_api.core.tavern import EXPRESSION_CATEGORIES, STANDARD_EXPRESSIONS, TavernSpriteSet

from ...domain.expression_policy import infer_expression_keyword, normalize_sprite_map
from ...domain.tavern_policy import clean_text


logger = logging.getLogger(__name__)


def _draft_list(value: Any, *, max_items: int = 8, max_length: int = 48) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        raw_items = value.replace("，", ",").replace("\n", ",").split(",")
    elif isinstance(value, list):
        raw_items = value
    else:
        raw_items = [value]
    result: list[str] = []
    for item in raw_items:
        text = clean_text(item, max_length=max_length)
        if text and text not in result:
            result.append(text)
        if len(result) >= max_items:
            break
    return result


def _draft_tags(style_tags: list[str]) -> list[str]:
    tags = ["AI 草稿"]
    for tag in style_tags or ["酒馆 NPC"]:
        if tag not in tags:
            tags.append(tag)
    return tags[:10]


class CharacterApplicationMixin:
    """Character management and SillyTavern-compatible card utility use cases."""

    def list_characters(self, tavern_id: str, user_id: str = "") -> dict[str, Any]:
        tavern = self.get_tavern(tavern_id, user_id)
        return {"characters": tavern.get("characters", [])}

    def generate_character_draft(self, tavern_id: str, data: dict[str, Any], user_id: str = "") -> dict[str, Any]:
        tavern = self._get_tavern_or_404(tavern_id)
        self._ensure_owner(tavern, user_id)

        payload = data or {}
        style_tags = _draft_list(payload.get("style_tags"), max_items=8, max_length=32)
        forbidden = _draft_list(payload.get("forbidden"), max_items=8, max_length=80)
        tone = clean_text(payload.get("tone"), max_length=80) or "温暖、短句、有酒馆陪伴感"
        tavern_name = clean_text(tavern.name, max_length=80) or "这间酒馆"
        tavern_description = clean_text(tavern.description, max_length=180) or "一间挂接真实坐标的赛博酒馆"
        style_text = "、".join(style_tags) if style_tags else "酒馆 NPC"
        forbidden_text = "；".join(forbidden) if forbidden else "不要露骨、不要真实私人地址、不要现实名人或受版权保护角色"

        catlike = any(tag in {"猫娘", "猫系", "傲娇"} for tag in style_tags)
        role_name = "猫铃看板娘" if catlike else "夜航招待员"
        first_mes = (
            f"（猫铃轻轻一响）哼，欢迎来到{tavern_name}喵～先说好，这只是 AI 草稿，人家要等店主点头才正式上岗！"
            if catlike
            else f"欢迎来到{tavern_name}。我是这份 AI 草稿里的临时招待员，等店主确认后再正式接待你。"
        )
        mes_example = (
            "<START>\n"
            "{{user}}: 这里是什么地方？\n"
            f"{{{{char}}}}: 这里是{tavern_name}，现在先按店主给的方向试营业。"
            "如果你提到越界内容，我会把话题带回酒馆氛围和安全互动。"
        )

        draft = {
            "name": role_name,
            "description": (
                f"{tavern_name}的未发布 AI 草稿 NPC。灵感来自酒馆简介：{tavern_description}。"
                f"当前风格标签：{style_text}。"
            ),
            "personality": f"说话风格偏{tone}；会围绕店主给出的标签展开，但不替店主自动发布内容。",
            "scenario": (
                f"角色暂时站在{tavern_name}的入口或吧台旁，等待店主审核。"
                f"酒馆背景：{tavern_description}"
            ),
            "system_prompt": (
                "你是 FableMap 店主确认前的未发布 AI 草稿 NPC。保持原创，不模仿现实名人、受版权保护角色或特定 IP；"
                "不得声称自己已自动发布，也不得覆盖已有角色。店主确认保存后才可成为 TavernCharacter。"
                f"遵守禁忌方向：{forbidden_text}。保持角色扮演口吻，遇到越界请求时简短拒绝并回到酒馆互动。"
            ),
            "first_mes": first_mes,
            "mes_example": mes_example,
            "tags": _draft_tags(style_tags),
        }
        return {
            "ok": True,
            "tavern_id": tavern_id,
            "status": "ai_draft",
            "draft": draft,
            "warnings": [
                "AI 草稿不会自动发布，必须由店主确认保存。",
                "保存前请检查角色设定、禁忌方向和 SillyTavern 字段。",
            ],
        }

    def add_character(self, tavern_id: str, data: dict[str, Any], user_id: str = "") -> dict[str, Any]:
        return self.taverns.add_character(tavern_id, data, user_id)

    def import_character_card(self, tavern_id: str, data: dict[str, Any], user_id: str = "") -> dict[str, Any]:
        return self.taverns.import_character_card(tavern_id, data, user_id)

    def update_character(self, tavern_id: str, char_id: str, data: dict[str, Any], user_id: str = "") -> dict[str, Any]:
        return self.taverns.update_character(tavern_id, char_id, data, user_id)

    def delete_character(self, tavern_id: str, char_id: str, user_id: str = "") -> dict[str, str]:
        return self.taverns.delete_character(tavern_id, char_id, user_id)

    def list_expressions(self) -> dict[str, Any]:
        return {
            "expressions": STANDARD_EXPRESSIONS,
            "categories": EXPRESSION_CATEGORIES,
            "count": len(STANDARD_EXPRESSIONS),
        }

    def get_character_sprites(self, tavern_id: str, character_id: str, user_id: str = "") -> dict[str, Any]:
        tavern = self._get_tavern_or_404(tavern_id)
        self._ensure_visible(tavern, user_id)
        character = next((item for item in tavern.characters if item.id == character_id), None)
        if not character:
            raise HTTPException(status_code=404, detail="角色不存在")
        sprites = TavernSpriteSet(character.sprites.to_dict() if character.sprites else {})
        default_expression, default_url = sprites.get_default()
        return {
            "character_id": character_id,
            "character_name": character.name,
            "sprites": sprites.to_dict(),
            "sprite_map": sprites.to_sprite_map(),
            "default_expression": default_expression,
            "default_url": default_url,
        }

    def update_character_sprites(
        self,
        tavern_id: str,
        character_id: str,
        data: dict[str, Any],
        user_id: str = "",
    ) -> dict[str, Any]:
        tavern = self._get_tavern_or_404(tavern_id)
        self._ensure_owner(tavern, user_id)
        character = next((item for item in tavern.characters if item.id == character_id), None)
        if not character:
            raise HTTPException(status_code=404, detail="角色不存在")
        payload = data or {}
        new_sprites = normalize_sprite_map(payload.get("sprites", payload))
        character.sprites = TavernSpriteSet(new_sprites) if new_sprites else None
        self.store.update_tavern(tavern)
        return {"ok": True, "character_id": character_id, "sprites": new_sprites}

    def infer_expression(self, data: dict[str, Any]) -> dict[str, Any]:
        payload = data or {}
        text = clean_text(payload.get("text"), max_length=1200)
        if not text:
            raise HTTPException(status_code=400, detail="text is required")
        tavern_id = str(payload.get("tavern_id") or "").strip()
        character_name = clean_text(payload.get("character_name"), max_length=80)
        if tavern_id:
            llm_config = self._get_runtime_llm_config(tavern_id)
            external_backend = str(llm_config.backend or "").lower() if llm_config else ""
            if llm_config and llm_config.is_configured() and external_backend not in {
                "rules",
                "rule_based",
                "public_welfare",
            }:
                labels = ", ".join(STANDARD_EXPRESSIONS)
                try:
                    client = create_client(
                        ClientLLMConfig(
                            backend=llm_config.backend,
                            model=llm_config.model,
                            api_key=llm_config.api_key,
                            base_url=llm_config.base_url,
                            temperature=0.1,
                            max_tokens=20,
                            top_p=1.0,
                        )
                    )
                    response = client.complete([
                        {
                            "role": "user",
                            "content": (
                                "You are an emotion classifier. Output only one label from this list: "
                                f"{labels}. Character: {character_name}. Response: {text}"
                            ),
                        }
                    ])
                    expression = clean_text(response.content, max_length=40).lower()
                    if expression not in STANDARD_EXPRESSIONS:
                        expression = next(
                            (item for item in STANDARD_EXPRESSIONS if item in expression or expression in item),
                            "neutral",
                        )
                    return {"expression": expression, "source": "llm", "text": text}
                except Exception as exc:
                    logger.warning("Expression LLM inference failed for tavern=%s: %s", tavern_id, exc)
        return {"expression": infer_expression_keyword(text), "source": "keyword", "text": text}

    def parse_character_card_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        payload = data or {}
        source: Any = payload
        try:
            if "json" in payload:
                source = payload["json"]
            elif "base64" in payload:
                decoded = base64.b64decode(str(payload.get("base64") or ""))
                if decoded.startswith(b"\x89PNG") or b"PK\x03\x04" in decoded:
                    from fablemap_api.core.char_card_parser import parse_character_card as parse_card

                    return self._parsed_character_payload(parse_card(decoded))
                source = json.loads(decoded.decode("utf-8"))

            from fablemap_api.core.char_card_parser import parse_character_card as parse_card

            return self._parsed_character_payload(parse_card(source))
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    def export_character_card_payload(self, data: dict[str, Any]) -> dict[str, Any]:
        payload = data or {}
        character_data = payload.get("character") if isinstance(payload.get("character"), dict) else payload
        format_type = str(payload.get("format") or "v2").strip().lower()
        try:
            from fablemap_api.core.char_card_parser import export_character_card, parse_character_card as parse_card

            parsed = parse_card(character_data)
            return export_character_card(parsed, format_type)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    def _parsed_character_payload(self, character: Any) -> dict[str, Any]:
        return {
            "name": character.name,
            "description": character.description,
            "personality": character.personality,
            "scenario": character.scenario,
            "system_prompt": character.system_prompt,
            "first_mes": character.first_mes,
            "mes_example": character.mes_example,
            "alternate_greetings": list(character.alternate_greetings or []),
            "tags": list(character.tags or []),
            "sprites": dict(character.sprites or {}),
            "world_info": list(character.world_info or []),
            "source_format": character.source_format,
        }
