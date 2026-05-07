from __future__ import annotations

import base64
import io
import json
import struct
import zipfile
import zlib

import pytest

from fablemap_api.core.char_card_parser import (
    CharacterCardParser,
    PNG_SIGNATURE,
    read_character_card_from_png,
    write_character_card_to_png,
)


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


def test_parse_sillytavern_v2_maps_core_fields_world_info_and_sprites() -> None:
    parser = CharacterCardParser()

    character = parser.parse_json(
        {
            "spec_version": "2.0",
            "name": "灯塔掌柜",
            "description": "店主编写的坐标锚定 NPC。",
            "personality": "温和、短句回复",
            "scenario": "黄浦江边的空间。",
            "system_prompt": "只基于主人提供的空间设定回应。",
            "first_mes": "灯还亮着，欢迎回来。",
            "mes_example": "<START>\n{{char}}: 地图还记得你的桌位。",
            "alternate_greetings": ["又见面了。"],
            "tags": ["tavern", 42],
            "sprite": {"neutral": "/sprites/keeper/neutral.png", "joy": "/sprites/keeper/joy.png"},
            "avatar": "/avatars/keeper.png",
            "character_book": {
                "entries": [
                    {
                        "id": "wi_lighthouse",
                        "keys": ["灯塔"],
                        "secondary_keys": ["雾"],
                        "content": "灯塔是空间的暗号。",
                        "constant": True,
                        "selective": False,
                        "order": 17,
                        "depth": 3,
                        "probability": 80,
                        "enabled": False,
                        "match_whole_words": True,
                    }
                ]
            },
        }
    )

    assert character.source_format == "sillytavern_2.0"
    assert character.name == "灯塔掌柜"
    assert character.description == "店主编写的坐标锚定 NPC。"
    assert character.system_prompt == "只基于主人提供的空间设定回应。"
    assert character.first_mes == "灯还亮着，欢迎回来。"
    assert character.alternate_greetings == ["又见面了。"]
    assert character.tags == ["tavern", "42"]
    assert character.sprites == {
        "neutral": "/sprites/keeper/neutral.png",
        "joy": "/sprites/keeper/joy.png",
    }
    assert character.avatar_url == "/avatars/keeper.png"

    entry = character.world_info[0]
    assert entry["id"] == "wi_lighthouse"
    assert entry["keys"] == ["灯塔"]
    assert entry["keys_secondary"] == ["雾"]
    assert entry["content"] == "灯塔是空间的暗号。"
    assert entry["constant"] is True
    assert entry["selective"] is False
    assert entry["insertion_order"] == 17
    assert entry["depth"] == 3
    assert entry["probability"] == 80
    assert entry["disable"] is True
    assert entry["whole_word"] is True


def test_parse_sillytavern_v3_envelope_preserves_spec_and_extensions() -> None:
    parser = CharacterCardParser()

    character = parser.parse_json(
        {
            "spec": "chara_card_v3",
            "spec_version": "3.0",
            "extensions": {"fablemap": {"owner_authored": True}, "shared": "outer"},
            "data": {
                "name": "Night Pilot",
                "first_mes": "Welcome back.",
                "sprite": "/sprites/night/neutral.png",
                "extensions": {"shared": "inner", "depth_prompt": {"role": "guide"}},
            },
        }
    )

    assert character.spec == "chara_card_v3"
    assert character.spec_version == "3.0"
    assert character.source_format == "sillytavern_3.0"
    assert character.name == "Night Pilot"
    assert character.first_mes == "Welcome back."
    assert character.sprites == {"neutral": "/sprites/night/neutral.png"}
    assert character.extensions["fablemap"] == {"owner_authored": True}
    assert character.extensions["shared"] == "inner"
    assert character.extensions["depth_prompt"] == {"role": "guide"}


def test_png_parser_prefers_ccv3_and_auto_detects_png() -> None:
    parser = CharacterCardParser()
    png = _minimal_png(
        _png_text_chunk(
            "chara",
            {
                "spec_version": "2.0",
                "name": "旧版角色名",
                "first_mes": "这个 V2 chunk 不应胜出。",
            },
        ),
        _png_text_chunk(
            "ccv3",
            {
                "spec": "chara_card_v3",
                "spec_version": "3.0",
                "data": {
                    "name": "优先 V3 角色",
                    "first_mes": "ccv3 chunk 优先。",
                    "sprite": {"neutral": "/sprites/preferred.png"},
                },
            },
        ),
    )

    raw = read_character_card_from_png(png)
    assert raw is not None
    assert raw["data"]["name"] == "优先 V3 角色"

    character = parser.parse_auto(png)
    assert character.source_format == "tavern_png"
    assert character.name == "优先 V3 角色"
    assert character.first_mes == "ccv3 chunk 优先。"
    assert character.sprites == {"neutral": "/sprites/preferred.png"}


def test_write_character_card_to_png_replaces_stale_metadata() -> None:
    stale_png = _minimal_png(
        _png_text_chunk("chara", {"name": "旧角色", "first_mes": "旧问候"}),
    )

    written = write_character_card_to_png(
        stale_png,
        {"name": "新角色", "first_mes": "新问候", "sprite": {"neutral": "/sprites/new.png"}},
        embed_v2=True,
        embed_v3=True,
    )

    assert written.startswith(PNG_SIGNATURE)
    assert written.count(b"chara\x00") == 1
    assert written.count(b"ccv3\x00") == 1
    assert written.index(b"ccv3\x00") < written.index(b"IEND")

    parsed = CharacterCardParser().parse_png(written)
    assert parsed is not None
    assert parsed.source_format == "tavern_png"
    assert parsed.name == "新角色"
    assert parsed.first_mes == "新问候"
    assert parsed.sprites == {"neutral": "/sprites/new.png"}


def test_parse_auto_reads_charx_archive_with_stub_prefix() -> None:
    archive = _charx_archive(
        {
            "character": {
                "spec": "chara_card_v3",
                "spec_version": "3.0",
                "data": {
                    "name": "CharX 掌柜",
                    "first_mes": "归档已打开。",
                    "tags": ["charx", "tavern"],
                    "character_book": {
                        "entries": [{"keys": ["CharX 掌柜"], "content": "CharX 使用 card.json。"}]
                    },
                },
            }
        },
        prefix=b"self-extracting-stub",
    )

    character = CharacterCardParser().parse_auto(archive)

    assert character.source_format == "charx"
    assert character.name == "CharX 掌柜"
    assert character.first_mes == "归档已打开。"
    assert character.tags == ["charx", "tavern"]
    assert character.world_info[0]["keys"] == ["CharX 掌柜"]


def test_parser_rejects_unrecognized_bytes_without_partial_character() -> None:
    parser = CharacterCardParser()

    assert read_character_card_from_png(_minimal_png()) is None
    assert parser.parse_png(_minimal_png()) is None

    with pytest.raises(ValueError, match="Could not parse bytes"):
        parser.parse_auto(b"not a png or charx card")
