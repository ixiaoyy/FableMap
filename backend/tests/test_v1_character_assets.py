import base64
import io
import json
import struct
import zipfile
import zlib
from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.core.char_card_parser import read_character_card_from_png, write_character_card_to_png
from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner-character-assets"
VISITOR_ID = "visitor-character-assets"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def _png_chunk(chunk_type: str, data: bytes = b"") -> bytes:
    type_bytes = chunk_type.encode("latin-1")
    crc = zlib.crc32(type_bytes + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + type_bytes + data + struct.pack(">I", crc)


def _png_text_chunk(keyword: str, payload: dict) -> bytes:
    encoded = base64.b64encode(json.dumps(payload).encode("utf-8"))
    return _png_chunk("tEXt", keyword.encode("latin-1") + b"\x00" + encoded)


def _minimal_png(*chunks: bytes) -> bytes:
    return PNG_SIGNATURE + b"".join(chunks) + _png_chunk("IEND")


def _charx_archive(card: dict, prefix: bytes = b"") -> bytes:
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        archive.writestr("card.json", json.dumps(card))
    return prefix + output.getvalue()


def _client(tmp_path: Path) -> TestClient:
    return TestClient(create_app(ApiSettings(output_root=tmp_path / "api", fixture_file=None, frontend_root=None)))


def _create_tavern_with_character(client: TestClient) -> tuple[str, str]:
    created = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={
            "name": "表情测试酒馆",
            "description": "用于测试角色表情与角色卡迁移。",
            "lat": 31.2304,
            "lon": 121.4737,
            "access": "public",
            "llm_config": {"backend": "rules", "model": "rules", "api_key": "owner-secret"},
        },
    )
    assert created.status_code == 200
    tavern_id = created.json()["id"]

    character = client.post(
        f"/api/v1/taverns/{tavern_id}/characters",
        headers={"X-User-Id": OWNER_ID},
        json={
            "name": "表情角色",
            "description": "带 SillyTavern 表情精灵图。",
            "first_mes": "今晚想喝点什么？",
            "sprites": {"neutral": "/sprites/neutral.png", "joy": "/sprites/joy.png", "empty": ""},
        },
    )
    assert character.status_code == 200
    return tavern_id, character.json()["id"]


def test_v1_expression_catalog_inference_and_character_sprites(tmp_path: Path) -> None:
    client = _client(tmp_path)
    tavern_id, character_id = _create_tavern_with_character(client)

    catalog = client.get("/api/v1/expressions")
    assert catalog.status_code == 200
    assert catalog.json()["count"] == len(catalog.json()["expressions"])
    assert "joy" in catalog.json()["expressions"]
    assert "neutral" in catalog.json()["categories"]["neutral"]

    inferred = client.post(
        "/api/v1/expression/infer",
        headers={"X-User-Id": VISITOR_ID},
        json={"text": "谢谢你，今晚太好了！", "tavern_id": tavern_id, "character_id": character_id},
    )
    assert inferred.status_code == 200
    assert inferred.json()["expression"] in {"gratitude", "joy"}
    assert inferred.json()["source"] == "keyword"

    sprites = client.get(
        f"/api/v1/taverns/{tavern_id}/characters/{character_id}/sprites",
        headers={"X-User-Id": VISITOR_ID},
    )
    assert sprites.status_code == 200
    payload = sprites.json()
    assert payload["sprites"] == {"neutral": "/sprites/neutral.png", "joy": "/sprites/joy.png"}
    assert payload["sprite_map"]["joy"] == "/sprites/joy.png"
    assert payload["default_expression"] == "joy"

    visitor_update = client.put(
        f"/api/v1/taverns/{tavern_id}/characters/{character_id}/sprites",
        headers={"X-User-Id": VISITOR_ID},
        json={"sprites": {"neutral": "/sprites/hacked.png"}},
    )
    assert visitor_update.status_code == 403

    owner_update = client.put(
        f"/api/v1/taverns/{tavern_id}/characters/{character_id}/sprites",
        headers={"X-User-Id": OWNER_ID},
        json={"sprites": {"neutral": "/sprites/new-neutral.png", "empty": ""}},
    )
    assert owner_update.status_code == 200
    assert owner_update.json()["sprites"] == {"neutral": "/sprites/new-neutral.png"}

    updated = client.get(
        f"/api/v1/taverns/{tavern_id}/characters/{character_id}/sprites",
        headers={"X-User-Id": VISITOR_ID},
    )
    assert updated.status_code == 200
    assert updated.json()["sprites"] == {"neutral": "/sprites/new-neutral.png"}
    assert updated.json()["sprite_map"]["joy"] is None
    assert updated.json()["default_expression"] == "neutral"


def test_v1_character_card_parse_and_export_contract(tmp_path: Path) -> None:
    client = _client(tmp_path)
    card = {
        "spec": "chara_card_v3",
        "spec_version": "3.0",
        "name": "夜航角色",
        "description": "坐标锚定酒馆里的 NPC。",
        "personality": "温和、短句回复",
        "scenario": "黄浦江边的赛博酒馆。",
        "first_mes": "欢迎回来。",
        "tags": ["tavern", "npc"],
        "sprite": {"neutral": "/sprites/night/neutral.png"},
        "character_book": {"entries": [{"keys": ["夜航"], "content": "夜航是酒馆暗号。"}]},
    }

    parsed = client.post("/api/v1/characters/parse", headers={"X-User-Id": OWNER_ID}, json={"json": card})
    assert parsed.status_code == 200
    payload = parsed.json()
    assert payload["name"] == "夜航角色"
    assert payload["sprites"] == {"neutral": "/sprites/night/neutral.png"}
    assert payload["world_info"][0]["keys"] == ["夜航"]
    assert payload["source_format"] == "sillytavern_3.0"

    exported = client.post(
        "/api/v1/characters/export",
        headers={"X-User-Id": OWNER_ID},
        json={"character": payload, "format": "v3"},
    )
    assert exported.status_code == 200
    exported_payload = exported.json()
    assert exported_payload["spec"] == "chara_card_v3"
    assert exported_payload["spec_version"] == "3.0"
    assert exported_payload["name"] == "夜航角色"
    assert exported_payload["sprite"] == {"neutral": "/sprites/night/neutral.png"}


def test_v1_character_card_parse_sillytavern_data_envelope(tmp_path: Path) -> None:
    client = _client(tmp_path)
    card = {
        "spec": "chara_card_v2",
        "spec_version": "2.0",
        "data": {
            "name": "Night Pilot",
            "description": "An owner-authored NPC anchored to a real tavern.",
            "personality": "Warm, concise, map-aware.",
            "scenario": "A riverside cyber tavern.",
            "first_mes": "Welcome back.",
            "mes_example": "<START>\n{{char}}: The map still remembers your table.",
            "alternate_greetings": ["The lantern is on again."],
            "tags": ["tavern", "npc"],
            "sprite": {"neutral": "/sprites/night/neutral.png"},
            "character_book": {
                "entries": [
                    {
                        "keys": ["Night Pilot"],
                        "secondary_keys": ["river"],
                        "content": "Night Pilot keeps the tavern's coordinate-bound lore.",
                        "constant": True,
                        "selective": False,
                        "order": 17,
                        "depth": 3,
                        "probability": 80,
                        "enabled": False,
                    }
                ]
            },
        },
    }

    parsed = client.post(
        "/api/v1/characters/parse",
        headers={"X-User-Id": OWNER_ID},
        json={"json": card},
    )

    assert parsed.status_code == 200
    payload = parsed.json()
    assert payload["name"] == "Night Pilot"
    assert payload["first_mes"] == "Welcome back."
    assert payload["alternate_greetings"] == ["The lantern is on again."]
    assert payload["tags"] == ["tavern", "npc"]
    assert payload["sprites"] == {"neutral": "/sprites/night/neutral.png"}
    assert payload["source_format"] == "sillytavern_2.0"

    world_entry = payload["world_info"][0]
    assert world_entry["keys"] == ["Night Pilot"]
    assert world_entry["keys_secondary"] == ["river"]
    assert world_entry["content"] == "Night Pilot keeps the tavern's coordinate-bound lore."
    assert world_entry["constant"] is True
    assert world_entry["selective"] is False
    assert world_entry["insertion_order"] == 17
    assert world_entry["depth"] == 3
    assert world_entry["probability"] == 80
    assert world_entry["disable"] is True


def test_v1_character_card_parse_png_prefers_ccv3_metadata(tmp_path: Path) -> None:
    client = _client(tmp_path)
    png = _minimal_png(
        _png_text_chunk(
            "chara",
            {
                "spec_version": "2.0",
                "name": "Old V2 Name",
                "first_mes": "This should lose to ccv3.",
            },
        ),
        _png_text_chunk(
            "ccv3",
            {
                "spec": "chara_card_v3",
                "spec_version": "3.0",
                "data": {
                    "name": "Preferred V3 Name",
                    "first_mes": "The ccv3 chunk wins.",
                    "sprite": {"neutral": "/sprites/preferred.png"},
                },
            },
        ),
    )

    parsed = client.post(
        "/api/v1/characters/parse",
        headers={"X-User-Id": OWNER_ID},
        json={"base64": base64.b64encode(png).decode("ascii")},
    )

    assert parsed.status_code == 200
    payload = parsed.json()
    assert payload["name"] == "Preferred V3 Name"
    assert payload["first_mes"] == "The ccv3 chunk wins."
    assert payload["sprites"] == {"neutral": "/sprites/preferred.png"}
    assert payload["source_format"] == "tavern_png"


def test_v1_character_card_parse_charx_archive_base64(tmp_path: Path) -> None:
    client = _client(tmp_path)
    archive = _charx_archive(
        {
            "spec": "chara_card_v3",
            "spec_version": "3.0",
            "data": {
                "name": "CharX Pilot",
                "description": "Imported from a CharX archive card.json.",
                "first_mes": "The archive opened cleanly.",
                "tags": ["charx", "tavern"],
                "character_book": {
                    "entries": [
                        {
                            "keys": ["CharX Pilot"],
                            "content": "CharX archives store the character card in card.json.",
                        }
                    ]
                },
            },
        },
        prefix=b"self-extracting-stub",
    )

    parsed = client.post(
        "/api/v1/characters/parse",
        headers={"X-User-Id": OWNER_ID},
        json={"base64": base64.b64encode(archive).decode("ascii")},
    )

    assert parsed.status_code == 200
    payload = parsed.json()
    assert payload["name"] == "CharX Pilot"
    assert payload["first_mes"] == "The archive opened cleanly."
    assert payload["tags"] == ["charx", "tavern"]
    assert payload["world_info"][0]["keys"] == ["CharX Pilot"]
    assert payload["source_format"] == "charx"


def test_character_card_png_write_round_trips_metadata_before_iend() -> None:
    card = {
        "name": "Writable PNG Card",
        "first_mes": "The card metadata is inside the readable chunk range.",
        "sprite": {"neutral": "/sprites/writable.png"},
    }

    png = write_character_card_to_png(_minimal_png(), card, embed_v2=True, embed_v3=True)
    iend_index = png.index(b"IEND") - 4
    metadata_index = png.index(b"ccv3\x00")

    assert metadata_index < iend_index
    parsed = read_character_card_from_png(png)
    assert parsed is not None
    assert parsed["name"] == "Writable PNG Card"
    assert parsed["spec"] == "chara_card_v3"
