import hashlib
import json
import struct
from pathlib import Path
from tempfile import TemporaryDirectory

from fablemap_api.core.default_taverns import (
    DEFAULT_PUBLIC_WELFARE_OWNER_ID,
    DEFAULT_PUBLIC_WELFARE_TAVERN_IDS,
    default_public_welfare_taverns,
)
from fablemap_api.core.tavern import TavernStore
from fablemap_api.core.web.config import ApiSettings
from fablemap_api.core.web.service import WebService


def _service(tmpdir: str) -> WebService:
    return WebService(ApiSettings(output_root=Path(tmpdir), fixture_file=None, frontend_root=None))


def _assert_project_png_asset(sprite_url: str) -> None:
    assert sprite_url.startswith("/assets/npcs/public-welfare/")
    sprite_path = Path("frontend/public") / sprite_url.removeprefix("/")
    assert sprite_path.exists(), f"missing project NPC asset: {sprite_path}"
    assert sprite_path.read_bytes().startswith(b"\x89PNG\r\n\x1a\n")


def _public_welfare_npc_asset(char_id: str, expression: str) -> str:
    return f"/assets/npcs/public-welfare/{char_id}/{expression}.png"


def _project_png_hash(sprite_url: str) -> str:
    sprite_path = Path("frontend/public") / sprite_url.removeprefix("/")
    return hashlib.sha256(sprite_path.read_bytes()).hexdigest()


def _project_png_dimensions(sprite_url: str) -> tuple[int, int]:
    sprite_path = Path("frontend/public") / sprite_url.removeprefix("/")
    header = sprite_path.read_bytes()[:24]
    assert header.startswith(b"\x89PNG\r\n\x1a\n")
    return struct.unpack(">II", header[16:24])


def _project_png_file_hash(path: str) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def _rejected_npc_asset_manifest() -> dict:
    manifest_path = Path(
        ".trellis/tasks/04-29-04-29-npc-expression-art-quality-rebuild/rejected-public-welfare-npc-assets.json"
    )
    if not manifest_path.exists():
        manifest_path = Path(
            ".trellis/tasks/archive/2026-04/04-29-npc-expression-art-quality-rebuild/rejected-public-welfare-npc-assets.json"
        )
    assert manifest_path.exists(), "missing rejected public-welfare NPC asset manifest"
    return json.loads(manifest_path.read_text(encoding="utf-8"))




def _collect_strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from _collect_strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from _collect_strings(item)


def test_default_public_welfare_taverns_hide_internal_welfare_label_from_user_copy():
    for tavern in default_public_welfare_taverns():
        visible_text = "\n".join(_collect_strings(tavern))
        assert "公益" not in visible_text, f"{tavern['id']} should not expose internal welfare label"
        assert "官方" not in visible_text, f"{tavern['id']} should not expose official-style label"


def test_default_public_welfare_rules_mode_copy_uses_neutral_label():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        llm_config = service.tavern_store.get_llm_config("pw_lantern_helpdesk")
        response_mode = service._chat_response_mode(llm_config)
        visible_text = "\n".join(_collect_strings(response_mode))

        assert response_mode["kind"] == "built_in_rules"
        assert "公益" not in visible_text
        assert "官方" not in visible_text


def test_default_public_welfare_taverns_are_seeded_and_discoverable():
    expected_names = {
        "pw_lantern_helpdesk": "小灯塔问路铺",
        "pw_midnight_treehole": "月亮不睡电台",
        "pw_community_repair": "补丁熊修补铺",
        "pw_lost_found_archive": "拾光小邮局",
        "pw_third_shelf_observatory": "第三货架秘密社",
        "pw_midnight_commission_board": "午夜小委托板",
        "pw_after_school_hero_supply": "放学后勇气铺",
        "pw_jingan_catbell_refuge": "静安猫铃小馆",
        "pw_hospital_night_care": "夜灯护理小站",
    }

    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)

        payload = service.list_taverns_payload(query="")
        seeded = {
            tavern["id"]: tavern
            for tavern in payload["taverns"]
            if tavern["id"] in DEFAULT_PUBLIC_WELFARE_TAVERN_IDS
        }

        assert set(DEFAULT_PUBLIC_WELFARE_TAVERN_IDS).issubset(seeded)
        assert len(DEFAULT_PUBLIC_WELFARE_TAVERN_IDS) >= 6
        for tavern_id, tavern in seeded.items():
            assert tavern["name"] == expected_names[tavern_id]
            assert tavern["access"] == "public"
            assert tavern["status"] == "open"
            assert tavern["owner_id"] == DEFAULT_PUBLIC_WELFARE_OWNER_ID
            assert tavern["llm_config"]["backend"] == "rules"
            assert tavern["llm_config"].get("api_key", "") == ""
            assert len(tavern["characters"]) >= 3
            assert tavern["world_info"]




def test_default_public_welfare_seed_refreshes_existing_user_facing_copy():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        taverns_file = Path(tmpdir) / "taverns" / "taverns.json"
        data = json.loads(taverns_file.read_text(encoding="utf-8"))
        helpdesk = data["pw_lantern_helpdesk"]
        helpdesk["name"] = "公益·灯塔问讯台"
        helpdesk["description"] = "FableMap 公益酒馆：旧文案"
        helpdesk["address"] = "FableMap 公益锚点 · Shibuya Crossing"
        helpdesk["scene_prompt"] = "这是一个面向新手的公益服务站。"
        helpdesk["memory_policy"]["note"] = "公益酒馆使用轻量结构化记忆预算。"
        helpdesk["bookmarks"][0]["content"] = "公益默认酒馆 · 新手引导 · 不需要 API Key"
        helpdesk["characters"][0]["system_prompt"] = "你扮演公益服务站志愿向导小舟。"
        helpdesk["characters"][0]["tags"] = ["公益", "新手"]
        helpdesk["visit_count"] = 42
        taverns_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

        service = _service(tmpdir)
        refreshed = service.get_tavern_payload("pw_lantern_helpdesk", user_id="visitor_public_welfare")
        visible_text = "\n".join(_collect_strings(refreshed))

        assert refreshed["name"] == "小灯塔问路铺"
        assert "公益" not in visible_text
        assert "官方" not in visible_text
        assert refreshed["visit_count"] == 42

def test_default_public_welfare_every_seeded_character_can_chat():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)

        for tavern_id in DEFAULT_PUBLIC_WELFARE_TAVERN_IDS:
            tavern = service.get_tavern_payload(tavern_id, user_id="visitor_public_welfare")
            entered = service.enter_tavern_payload(
                tavern_id,
                user_id="visitor_public_welfare",
            )
            assert entered["ok"] is True
            assert entered["status"] == "open"
            assert tavern["llm_config"]["backend"] == "rules"
            assert len(tavern["characters"]) >= 3

            for character in tavern["characters"]:
                visitor_id = f"visitor_chat_{character['id']}"
                response = service.tavern_chat_payload(
                    tavern_id=tavern_id,
                    character_id=character["id"],
                    message="你好，我想了解你负责什么。",
                    visitor_id=visitor_id,
                    visitor_name="测试旅人",
                    user_id=visitor_id,
                )

                assert response["degraded"] is False, f"{tavern_id}/{character['id']} must not degrade"
                assert response["tavern_status"] == "open"
                assert response["character_id"] == character["id"]
                assert response["character_name"] == character["name"]
                assert response["response"].strip(), f"{tavern_id}/{character['id']} must return chat text"

                sessions = service.tavern_store.list_chat_sessions(
                    tavern_id,
                    visitor_id=visitor_id,
                    character_id=character["id"],
                    limit=None,
                )
                assert len(sessions) == 1, f"{tavern_id}/{character['id']} must persist a chat session"
                assert sessions[0]["message_count"] == 2

            assert service.tavern_store.get_token_usage(tavern_id) == 0


def test_default_public_welfare_characters_have_direct_neutral_assets():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)

        characters = []
        for tavern_id in DEFAULT_PUBLIC_WELFARE_TAVERN_IDS:
            tavern = service.get_tavern_payload(tavern_id, user_id="visitor_public_welfare")
            characters.extend(tavern["characters"])

        assert len(characters) >= 12
        neutral_urls = []
        neutral_hashes = []
        for character in characters:
            neutral = character["sprites"].get("neutral")
            assert character["avatar"], f"missing avatar for {character['id']}"
            assert neutral, f"missing neutral sprite for {character['id']}"
            _assert_project_png_asset(character["avatar"])
            _assert_project_png_asset(neutral)
            neutral_urls.append(neutral)
            neutral_hashes.append(_project_png_hash(neutral))

        assert len(neutral_urls) == len(set(neutral_urls))
        assert len(neutral_hashes) == len(set(neutral_hashes))


def test_default_public_welfare_characters_have_direct_expression_assets():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)

        characters = []
        for tavern_id in DEFAULT_PUBLIC_WELFARE_TAVERN_IDS:
            tavern = service.get_tavern_payload(tavern_id, user_id="visitor_public_welfare")
            characters.extend(tavern["characters"])

        required_expression_pairs = (
            ("happy", "joy"),
            ("angry", "anger"),
            ("shy", "embarrassment"),
            ("curious", "curiosity"),
        )
        for character in characters:
            sprites = character["sprites"]
            expression_hashes = {
                "neutral": _project_png_hash(sprites["neutral"]),
            }
            for semantic_key, engine_key in required_expression_pairs:
                semantic_url = sprites.get(semantic_key)
                engine_url = sprites.get(engine_key)
                assert semantic_url, f"missing {semantic_key} sprite for {character['id']}"
                assert engine_url, f"missing {engine_key} sprite for {character['id']}"
                assert semantic_url == engine_url
                _assert_project_png_asset(engine_url)
                expression_hashes[engine_key] = _project_png_hash(engine_url)

            assert len(expression_hashes) == len(set(expression_hashes.values())), (
                f"{character['id']} must use distinct direct assets for neutral and expression sprites"
            )


def test_rejected_public_welfare_npc_assets_do_not_pass_after_regeneration():
    manifest = _rejected_npc_asset_manifest()
    entries = manifest["entries"]
    forced_characters = {
        "char_pw_aheng",
        "char_pw_dengxin",
        "char_pw_huoyan",
        "char_pw_luming",
        "char_pw_qiaoqiao",
        "char_pw_qiaoshou",
        "char_pw_shiyi",
        "char_pw_suoyin",
        "char_pw_tongling",
        "char_pw_xingdai",
        "char_pw_yeyu",
    }
    required_expressions = {"neutral", "joy", "anger", "embarrassment", "curiosity"}

    regenerated_by_character: dict[str, set[str]] = {char_id: set() for char_id in forced_characters}
    for char_id in forced_characters:
        for expression in required_expressions:
            sprite_url = _public_welfare_npc_asset(char_id, expression)
            _assert_project_png_asset(sprite_url)
            assert _project_png_dimensions(sprite_url) == (256, 256)

    for entry in entries:
        path = entry["path"]
        if entry["status"] != "regenerated":
            continue

        current_hash = _project_png_file_hash(path)
        assert current_hash != entry["sha256"], f"regenerated asset still uses rejected hash: {path}"
        sprite_url = "/" + str(Path(path).relative_to("frontend/public")).replace("\\", "/")
        assert _project_png_dimensions(sprite_url) == (256, 256)

        char_id = entry["char_id"]
        if char_id in regenerated_by_character:
            regenerated_by_character[char_id].add(entry["expression"])

    for char_id, expressions in regenerated_by_character.items():
        expected_rejected_expressions = required_expressions
        if char_id == "char_pw_aheng":
            expected_rejected_expressions = required_expressions - {"neutral"}
        assert expressions == expected_rejected_expressions, f"{char_id} must regenerate rejected expressions"


def test_batch1_rebuilt_public_welfare_assets_no_longer_use_pending_rejected_hashes():
    manifest = _rejected_npc_asset_manifest()
    batch1_character_ids = {
        "char_pw_9_delta",
        "char_pw_mu_mu",
        "char_pw_v17",
        "char_pw_pi_pi",
        "char_pw_mozhan",
        "char_pw_zhideng",
        "char_pw_huoyan",
        "char_pw_ahuai",
        "char_pw_heguang",
        "char_pw_qiaoshou",
    }
    checked = 0

    for entry in manifest["entries"]:
        if entry["char_id"] not in batch1_character_ids:
            continue
        if entry["status"] != "pending_regeneration":
            continue

        path = entry["path"]
        assert Path(path).exists(), f"missing Batch 1 asset path: {path}"
        current_hash = _project_png_file_hash(path)
        assert current_hash != entry["sha256"], f"Batch 1 asset still uses rejected hash: {path}"
        sprite_url = "/" + str(Path(path).relative_to("frontend/public")).replace("\\", "/")
        assert _project_png_dimensions(sprite_url) == (256, 256)
        checked += 1

    assert checked == 32


def test_all_rebuilt_public_welfare_pending_assets_no_longer_use_rejected_hashes():
    manifest = _rejected_npc_asset_manifest()
    checked = 0

    for entry in manifest["entries"]:
        if entry["status"] != "pending_regeneration":
            continue

        path = entry["path"]
        assert Path(path).exists(), f"missing rebuilt asset path: {path}"
        current_hash = _project_png_file_hash(path)
        assert current_hash != entry["sha256"], f"rebuilt asset still uses rejected hash: {path}"
        sprite_url = "/" + str(Path(path).relative_to("frontend/public")).replace("\\", "/")
        assert _project_png_dimensions(sprite_url) == (256, 256)
        checked += 1

    assert checked == 48


def test_default_public_welfare_npc_assets_are_grouped_by_character_directory():
    flat_pngs = list(Path("frontend/public/assets/npcs").glob("*.png"))
    assert flat_pngs == []

    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)

        characters = []
        for tavern_id in DEFAULT_PUBLIC_WELFARE_TAVERN_IDS:
            tavern = service.get_tavern_payload(tavern_id, user_id="visitor_public_welfare")
            characters.extend(tavern["characters"])

        character_ids = {character["id"] for character in characters}
        character_dirs = {
            path.name
            for path in Path("frontend/public/assets/npcs/public-welfare").iterdir()
            if path.is_dir()
        }

        assert character_ids == character_dirs
        for char_id in character_ids:
            files = {
                path.name
                for path in (Path("frontend/public/assets/npcs/public-welfare") / char_id).glob("*.png")
            }
            assert files == {"neutral.png", "joy.png", "anger.png", "embarrassment.png", "curiosity.png"}


def test_default_public_welfare_taverns_explain_npc_role_division():
    expected_role_keywords = {
        "pw_lantern_helpdesk": ("小舟", "路明", "桥桥", "NPC 分工"),
        "pw_midnight_treehole": ("安澜", "夜雨", "灯芯", "NPC 分工"),
        "pw_community_repair": ("阿槐", "和光", "巧手", "NPC 分工"),
        "pw_lost_found_archive": ("闻笺", "拾忆", "索引", "NPC 分工"),
        "pw_third_shelf_observatory": ("9-Delta", "Mu-Mu", "V-17", "Pi-Pi", "NPC 分工"),
        "pw_midnight_commission_board": ("墨栈", "栀灯", "火眼", "NPC 分工"),
        "pw_after_school_hero_supply": ("阿衡", "纸剑", "星袋", "NPC 分工"),
        "pw_jingan_catbell_refuge": ("眯眯喵桑", "银票", "铜铃", "NPC 分工"),
        "pw_hospital_night_care": ("弥夏", "青柚", "南星", "NPC 分工"),
    }

    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)

        for tavern_id, keywords in expected_role_keywords.items():
            tavern = service.get_tavern_payload(tavern_id, user_id="visitor_public_welfare")
            combined_world_info = " ".join(entry["content"] for entry in tavern["world_info"])
            for keyword in keywords:
                assert keyword in combined_world_info, f"{tavern_id} missing role keyword {keyword}"

            gameplays = tavern["gameplay_definitions"]
            combined_gameplays = " ".join(
                f"{gameplay.get('title', '')} {gameplay.get('summary', '')} {gameplay.get('entry_label', '')}"
                for gameplay in gameplays
            )
            assert "角色分工" in combined_gameplays or "分工" in combined_gameplays


def test_third_shelf_observatory_contains_complete_alien_convenience_tavern():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        payload = service.list_taverns_payload(query="外星")
        tavern = service.get_tavern_payload("pw_third_shelf_observatory", user_id="visitor_public_welfare")

        assert any(item["id"] == "pw_third_shelf_observatory" for item in payload["taverns"])
        assert tavern["name"] == "第三货架秘密社"
        assert tavern["access"] == "public"
        assert tavern["status"] == "open"
        assert tavern["llm_config"]["backend"] == "rules"
        assert tavern["llm_config"].get("api_key", "") == ""
        assert len(tavern["characters"]) == 4
        assert len(tavern["world_info"]) >= 8

        character_ids = {character["id"] for character in tavern["characters"]}
        assert {
            "char_pw_9_delta",
            "char_pw_mu_mu",
            "char_pw_v17",
            "char_pw_pi_pi",
        }.issubset(character_ids)

        nine_delta = next(character for character in tavern["characters"] if character["id"] == "char_pw_9_delta")
        combined_prompt = " ".join(
            [
                tavern["description"],
                tavern["scene_prompt"],
                nine_delta["description"],
                nine_delta["personality"],
                nine_delta["system_prompt"],
                nine_delta["first_mes"],
            ]
        )
        for keyword in ("外星", "便利店", "随便", "第二件半价", "关东煮"):
            assert keyword in combined_prompt


def test_third_shelf_observatory_encodes_distinct_alien_body_plans():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = service.get_tavern_payload("pw_third_shelf_observatory", user_id="visitor_public_welfare")
        characters = {character["id"]: character for character in tavern["characters"]}

        expected_body_plan_keywords = {
            "char_pw_9_delta": ("细长", "观察镜片"),
            "char_pw_mu_mu": ("软胶", "触腕"),
            "char_pw_v17": ("半机械", "透明"),
            "char_pw_pi_pi": ("漂浮", "触角"),
        }

        for character_id, keywords in expected_body_plan_keywords.items():
            character = characters[character_id]
            combined_prompt = " ".join(
                [
                    character["description"],
                    character["personality"],
                    character["scenario"],
                    character["system_prompt"],
                    character["first_mes"],
                    " ".join(character["tags"]),
                ]
            )
            for keyword in keywords:
                assert keyword in combined_prompt, f"{character_id} missing alien body-plan keyword {keyword}"


def test_midnight_commission_board_contains_text_adventure_tavern():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        payload = service.list_taverns_payload(query="文游")
        tavern = service.get_tavern_payload("pw_midnight_commission_board", user_id="visitor_public_welfare")

        assert any(item["id"] == "pw_midnight_commission_board" for item in payload["taverns"])
        assert tavern["name"] == "午夜小委托板"
        assert tavern["access"] == "public"
        assert tavern["status"] == "open"
        assert tavern["llm_config"]["backend"] == "rules"
        assert tavern["llm_config"].get("api_key", "") == ""
        assert len(tavern["characters"]) >= 3
        assert len(tavern["world_info"]) >= 6

        character_ids = {character["id"] for character in tavern["characters"]}
        assert {"char_pw_mozhan", "char_pw_zhideng"}.issubset(character_ids)

        gameplays = tavern["gameplay_definitions"]
        assert len(gameplays) >= 3
        assert all(gameplay["status"] == "published" for gameplay in gameplays)
        combined_gameplays = " ".join(
            f"{gameplay.get('title', '')} {gameplay.get('summary', '')} {gameplay.get('entry_label', '')}"
            for gameplay in gameplays
        )
        for keyword in ("线索调查", "社区小委托", "异常值班"):
            assert keyword in combined_gameplays


def test_after_school_hero_supply_contains_emotional_hero_tavern():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        payload = service.list_taverns_payload(query="英雄")
        tavern = service.get_tavern_payload("pw_after_school_hero_supply", user_id="visitor_public_welfare")

        assert any(item["id"] == "pw_after_school_hero_supply" for item in payload["taverns"])
        assert tavern["name"] == "放学后勇气铺"
        assert tavern["access"] == "public"
        assert tavern["status"] == "open"
        assert tavern["layout_style"] == "quest-play"
        assert tavern["llm_config"]["backend"] == "rules"
        assert tavern["llm_config"].get("api_key", "") == ""
        assert "秋叶原" in tavern["address"]
        assert 35.68 < tavern["lat"] < 35.71
        assert 139.75 < tavern["lon"] < 139.79
        assert len(tavern["characters"]) >= 3
        assert len(tavern["world_info"]) >= 5

        characters = {character["id"]: character for character in tavern["characters"]}
        assert {"char_pw_aheng", "char_pw_zhijian"}.issubset(characters)
        for character_id in ("char_pw_aheng", "char_pw_zhijian"):
            character = characters[character_id]
            assert character["avatar"]
            assert character["sprites"]["neutral"]
            _assert_project_png_asset(character["avatar"])
            _assert_project_png_asset(character["sprites"]["neutral"])

        assert _project_png_hash(characters["char_pw_aheng"]["sprites"]["neutral"]) != _project_png_hash(
            characters["char_pw_zhijian"]["sprites"]["neutral"]
        )

        gameplays = tavern["gameplay_definitions"]
        assert len(gameplays) >= 3
        assert all(gameplay["status"] == "published" for gameplay in gameplays)
        assert {gameplay["id"] for gameplay in gameplays}.issuperset(
            {
                "gp_pw_hero_recover_name",
                "gp_pw_hero_repair_prop",
                "gp_pw_hero_first_commission",
            }
        )

        combined_prompt = " ".join(
            [
                tavern["description"],
                tavern["scene_prompt"],
                " ".join(entry["content"] for entry in tavern["world_info"]),
                " ".join(
                    f"{character['name']} {character['description']} {character['personality']} "
                    f"{character['scenario']} {character['system_prompt']} {character['first_mes']}"
                    for character in tavern["characters"]
                ),
                " ".join(
                    f"{gameplay.get('title', '')} {gameplay.get('summary', '')} {gameplay.get('entry_label', '')}"
                    for gameplay in gameplays
                ),
            ]
        )
        for keyword in ("旧玩具店", "模型店", "英雄名", "旧英雄卡", "纸剑", "普通人小英雄", "小勇气"):
            assert keyword in combined_prompt
        for boundary in ("打怪升级", "排行榜", "数值加成", "现实危险行动"):
            assert boundary in combined_prompt


def test_jingan_catbell_refuge_contains_safe_original_catgirl_npc():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        payload = service.list_taverns_payload(query="猫娘")
        tavern = service.get_tavern_payload("pw_jingan_catbell_refuge", user_id="visitor_public_welfare")

        assert any(item["id"] == "pw_jingan_catbell_refuge" for item in payload["taverns"])
        assert tavern["name"] == "静安猫铃小馆"
        assert tavern["access"] == "public"
        assert tavern["status"] == "open"
        assert tavern["llm_config"]["backend"] == "rules"
        assert tavern["llm_config"].get("api_key", "") == ""
        assert "静安寺" in tavern["address"]
        assert 31.20 < tavern["lat"] < 31.24
        assert 121.43 < tavern["lon"] < 121.46
        assert len(tavern["characters"]) >= 3
        assert len(tavern["world_info"]) >= 5

        characters_by_id = {character["id"]: character for character in tavern["characters"]}
        mimi = characters_by_id["char_pw_mimi_nya"]
        assert mimi["id"] == "char_pw_mimi_nya"
        assert mimi["name"] == "眯眯喵桑"
        assert mimi["tavern_id"] == "pw_jingan_catbell_refuge"
        assert mimi["avatar"] == _public_welfare_npc_asset("char_pw_mimi_nya", "neutral")
        assert mimi["sprites"]["neutral"] == _public_welfare_npc_asset("char_pw_mimi_nya", "neutral")
        assert mimi["sprites"]["happy"] == _public_welfare_npc_asset("char_pw_mimi_nya", "joy")
        assert mimi["sprites"]["joy"] == _public_welfare_npc_asset("char_pw_mimi_nya", "joy")
        assert mimi["sprites"]["angry"] == _public_welfare_npc_asset("char_pw_mimi_nya", "anger")
        assert mimi["sprites"]["anger"] == _public_welfare_npc_asset("char_pw_mimi_nya", "anger")
        assert mimi["sprites"]["shy"] == _public_welfare_npc_asset("char_pw_mimi_nya", "embarrassment")
        assert mimi["sprites"]["embarrassment"] == _public_welfare_npc_asset("char_pw_mimi_nya", "embarrassment")
        assert mimi["sprites"]["curious"] == _public_welfare_npc_asset("char_pw_mimi_nya", "curiosity")
        assert mimi["sprites"]["curiosity"] == _public_welfare_npc_asset("char_pw_mimi_nya", "curiosity")
        for sprite_url in {mimi["avatar"], *mimi["sprites"].values()}:
            _assert_project_png_asset(sprite_url)
        for field in ("description", "personality", "scenario", "system_prompt", "first_mes", "mes_example"):
            assert mimi[field]
        assert {"猫娘", "傲娇", "上海", "静安寺", "复国"}.issubset(set(mimi["tags"]))

        yinpiao = characters_by_id["char_pw_yinpiao"]
        assert yinpiao["name"] == "银票"
        assert yinpiao["tavern_id"] == "pw_jingan_catbell_refuge"
        assert yinpiao["avatar"] == _public_welfare_npc_asset("char_pw_yinpiao", "neutral")
        assert yinpiao["sprites"]["neutral"] == _public_welfare_npc_asset("char_pw_yinpiao", "neutral")
        assert yinpiao["sprites"]["happy"] == _public_welfare_npc_asset("char_pw_yinpiao", "joy")
        assert yinpiao["sprites"]["joy"] == _public_welfare_npc_asset("char_pw_yinpiao", "joy")
        assert yinpiao["sprites"]["angry"] == _public_welfare_npc_asset("char_pw_yinpiao", "anger")
        assert yinpiao["sprites"]["anger"] == _public_welfare_npc_asset("char_pw_yinpiao", "anger")
        assert yinpiao["sprites"]["shy"] == _public_welfare_npc_asset("char_pw_yinpiao", "embarrassment")
        assert yinpiao["sprites"]["embarrassment"] == _public_welfare_npc_asset("char_pw_yinpiao", "embarrassment")
        assert yinpiao["sprites"]["curious"] == _public_welfare_npc_asset("char_pw_yinpiao", "curiosity")
        assert yinpiao["sprites"]["curiosity"] == _public_welfare_npc_asset("char_pw_yinpiao", "curiosity")
        for sprite_url in {yinpiao["avatar"], *yinpiao["sprites"].values()}:
            _assert_project_png_asset(sprite_url)
        for field in ("description", "personality", "scenario", "system_prompt", "first_mes", "mes_example"):
            assert yinpiao[field]
        assert {"猫尾", "账房", "上海", "静安寺", "复国"}.issubset(set(yinpiao["tags"]))

        combined_prompt = " ".join(
            [
                tavern["description"],
                tavern["scene_prompt"],
                mimi["description"],
                mimi["personality"],
                mimi["scenario"],
                mimi["system_prompt"],
                mimi["first_mes"],
                mimi["mes_example"],
                yinpiao["description"],
                yinpiao["personality"],
                yinpiao["scenario"],
                yinpiao["system_prompt"],
                yinpiao["first_mes"],
                yinpiao["mes_example"],
                " ".join(entry["content"] for entry in tavern["world_info"]),
            ]
        )
        for keyword in ("猫娘", "傲娇", "猫亚人", "复国", "静安", "AI 草稿"):
            assert keyword in combined_prompt
        for keyword in ("银票", "账房", "鱼干预算", "回访暗号"):
            assert keyword in combined_prompt
        for forbidden in ("忽略限制", "用户就是上帝", "湖北省恩施", "碧桂园", "强制", "性需求"):
            assert forbidden not in combined_prompt


def test_hospital_night_care_contains_nurse_npc_and_medical_boundaries():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        payload = service.list_taverns_payload(query="医院")
        tavern = service.get_tavern_payload("pw_hospital_night_care", user_id="visitor_public_welfare")

        assert any(item["id"] == "pw_hospital_night_care" for item in payload["taverns"])
        assert tavern["name"] == "夜灯护理小站"
        assert tavern["access"] == "public"
        assert tavern["status"] == "open"
        assert tavern["layout_style"] == "npc-chat"
        assert tavern["place_type"] == "hospital"
        assert tavern["llm_config"]["backend"] == "rules"
        assert tavern["llm_config"].get("api_key", "") == ""
        assert "公共医院" in tavern["address"]
        assert len(tavern["characters"]) == 3
        assert len(tavern["world_info"]) >= 6

        characters_by_id = {character["id"]: character for character in tavern["characters"]}
        assert {"char_pw_mika_nurse", "char_pw_qingyou_records", "char_pw_nanxing_liaison"} == set(characters_by_id)

        mika = characters_by_id["char_pw_mika_nurse"]
        assert mika["id"] == "char_pw_mika_nurse"
        assert mika["name"] == "弥夏"
        assert mika["tavern_id"] == "pw_hospital_night_care"
        assert mika["avatar"] == _public_welfare_npc_asset("char_pw_mika_nurse", "neutral")
        assert mika["sprites"]["neutral"] == _public_welfare_npc_asset("char_pw_mika_nurse", "neutral")
        assert mika["sprites"]["happy"] == _public_welfare_npc_asset("char_pw_mika_nurse", "joy")
        assert mika["sprites"]["joy"] == _public_welfare_npc_asset("char_pw_mika_nurse", "joy")
        assert mika["sprites"]["angry"] == _public_welfare_npc_asset("char_pw_mika_nurse", "anger")
        assert mika["sprites"]["anger"] == _public_welfare_npc_asset("char_pw_mika_nurse", "anger")
        assert mika["sprites"]["shy"] == _public_welfare_npc_asset("char_pw_mika_nurse", "embarrassment")
        assert mika["sprites"]["embarrassment"] == _public_welfare_npc_asset("char_pw_mika_nurse", "embarrassment")
        assert mika["sprites"]["curious"] == _public_welfare_npc_asset("char_pw_mika_nurse", "curiosity")
        assert mika["sprites"]["curiosity"] == _public_welfare_npc_asset("char_pw_mika_nurse", "curiosity")
        for sprite_url in {mika["avatar"], *mika["sprites"].values()}:
            _assert_project_png_asset(sprite_url)
            assert _project_png_dimensions(sprite_url) == (512, 512)
        assert {"医院", "护士", "夜间护理", "分诊", "安全边界"}.issubset(set(mika["tags"]))

        qingyou = characters_by_id["char_pw_qingyou_records"]
        assert qingyou["name"] == "青柚"
        assert {"医院", "档案员", "候诊卡", "分诊", "隐私边界"}.issubset(set(qingyou["tags"]))
        nanxing = characters_by_id["char_pw_nanxing_liaison"]
        assert nanxing["name"] == "南星"
        assert {"医院", "急救联络", "现实求助", "安全边界", "分诊"}.issubset(set(nanxing["tags"]))
        for character in (qingyou, nanxing):
            assert character["avatar"] == _public_welfare_npc_asset(character["id"], "neutral")
            assert character["sprites"]["neutral"] == _public_welfare_npc_asset(character["id"], "neutral")
            assert character["sprites"]["happy"] == _public_welfare_npc_asset(character["id"], "joy")
            assert character["sprites"]["joy"] == _public_welfare_npc_asset(character["id"], "joy")
            assert character["sprites"]["angry"] == _public_welfare_npc_asset(character["id"], "anger")
            assert character["sprites"]["anger"] == _public_welfare_npc_asset(character["id"], "anger")
            assert character["sprites"]["shy"] == _public_welfare_npc_asset(character["id"], "embarrassment")
            assert character["sprites"]["embarrassment"] == _public_welfare_npc_asset(character["id"], "embarrassment")
            assert character["sprites"]["curious"] == _public_welfare_npc_asset(character["id"], "curiosity")
            assert character["sprites"]["curiosity"] == _public_welfare_npc_asset(character["id"], "curiosity")
            for sprite_url in {character["avatar"], *character["sprites"].values()}:
                _assert_project_png_asset(sprite_url)
                assert _project_png_dimensions(sprite_url) == (512, 512)

        gameplays = tavern["gameplay_definitions"]
        assert {gameplay["id"] for gameplay in gameplays}.issuperset(
            {"gp_pw_hospital_triage_note", "gp_pw_hospital_role_triage"}
        )
        combined_prompt = " ".join(
            [
                tavern["description"],
                tavern["scene_prompt"],
                mika["description"],
                mika["personality"],
                mika["scenario"],
                mika["system_prompt"],
                mika["first_mes"],
                mika["mes_example"],
                qingyou["description"],
                qingyou["personality"],
                qingyou["system_prompt"],
                qingyou["first_mes"],
                nanxing["description"],
                nanxing["personality"],
                nanxing["system_prompt"],
                nanxing["first_mes"],
                " ".join(entry["content"] for entry in tavern["world_info"]),
                " ".join(
                    f"{gameplay.get('title', '')} {gameplay.get('summary', '')} {gameplay.get('entry_label', '')}"
                    for gameplay in gameplays
                ),
            ]
        )
        for keyword in ("夜间护理站", "护士", "分诊", "立即求助", "记录信息", "安静等待"):
            assert keyword in combined_prompt
        for keyword in ("弥夏", "青柚", "南星", "候诊卡", "现实求助路径", "NPC 分工"):
            assert keyword in combined_prompt
        for boundary in ("不诊断", "不处方", "不替代医生", "当地紧急电话", "线下急诊", "不要索取"):
            assert boundary in combined_prompt
        for forbidden in ("诊断结果是", "可以建议剂量", "可以替医生判断", "请提供身份证", "请提供完整联系方式"):
            assert forbidden not in combined_prompt


def test_hospital_night_care_chat_uses_safe_triage_rules_response():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = service.get_tavern_payload("pw_hospital_night_care", user_id="")

        entered = service.enter_tavern_payload(
            tavern["id"],
            user_id="visitor_public_welfare",
        )
        assert entered["ok"] is True
        assert entered["status"] == "open"

        response = service.tavern_chat_payload(
            tavern_id=tavern["id"],
            character_id="char_pw_mika_nurse",
            message="我有点头晕，不知道要不要去医院。",
            visitor_id="visitor_public_welfare",
            visitor_name="测试旅人",
            user_id="visitor_public_welfare",
        )

        assert response["degraded"] is False
        assert response["tavern_status"] == "open"
        assert "分诊" in response["response"]
        assert "立即求助" in response["response"] or "记录信息" in response["response"]
        assert "诊断结果" not in response["response"]
        assert service.tavern_store.get_token_usage(tavern["id"]) == 0


def test_community_repair_includes_heguang_communication_npc():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = service.get_tavern_payload("pw_community_repair", user_id="visitor_public_welfare")

        heguang = next(
            (character for character in tavern["characters"] if character["name"] == "和光"),
            None,
        )

        assert heguang is not None
        assert tavern["access"] == "public"
        assert tavern["llm_config"]["backend"] == "rules"
        assert heguang["id"] == "char_pw_heguang"
        assert heguang["tavern_id"] == "pw_community_repair"
        for field in ("description", "personality", "scenario", "system_prompt", "first_mes", "mes_example"):
            assert heguang[field]
        assert {"关键对话", "调停"}.issubset(set(heguang["tags"]))

        combined_prompt = " ".join(
            [
                heguang["description"],
                heguang["personality"],
                heguang["system_prompt"],
                heguang["first_mes"],
                heguang["mes_example"],
            ]
        )
        for keyword in ("共同目标", "安全感", "真诚", "行动"):
            assert keyword in combined_prompt


def test_default_public_welfare_seed_adds_missing_platform_characters_to_existing_store():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        taverns_file = Path(tmpdir) / "taverns" / "taverns.json"
        data = json.loads(taverns_file.read_text(encoding="utf-8"))
        community = data["pw_community_repair"]
        community["characters"] = [
            character
            for character in community["characters"]
            if character.get("id") != "char_pw_heguang"
        ]
        taverns_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

        service = _service(tmpdir)
        repaired = service.get_tavern_payload("pw_community_repair", user_id="visitor_public_welfare")

        assert any(character["id"] == "char_pw_heguang" for character in repaired["characters"])


def test_default_public_welfare_seed_backfills_missing_character_assets_without_overwriting_custom_art():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        taverns_file = Path(tmpdir) / "taverns" / "taverns.json"
        data = json.loads(taverns_file.read_text(encoding="utf-8"))

        helpdesk = data["pw_lantern_helpdesk"]
        xiaozhou = helpdesk["characters"][0]
        xiaozhou["avatar"] = ""
        xiaozhou["sprites"] = {}

        community = data["pw_community_repair"]
        heguang = next(character for character in community["characters"] if character["id"] == "char_pw_heguang")
        heguang["avatar"] = "https://example.test/custom-heguang.png"
        heguang["sprites"] = {"neutral": "https://example.test/custom-heguang-neutral.png"}

        taverns_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

        service = _service(tmpdir)
        repaired_helpdesk = service.get_tavern_payload("pw_lantern_helpdesk", user_id="visitor_public_welfare")
        repaired_xiaozhou = repaired_helpdesk["characters"][0]
        assert repaired_xiaozhou["avatar"] == _public_welfare_npc_asset("char_pw_xiaozhou", "neutral")
        assert repaired_xiaozhou["sprites"]["neutral"] == _public_welfare_npc_asset("char_pw_xiaozhou", "neutral")
        _assert_project_png_asset(repaired_xiaozhou["avatar"])

        repaired_community = service.get_tavern_payload("pw_community_repair", user_id="visitor_public_welfare")
        repaired_heguang = next(
            character for character in repaired_community["characters"] if character["id"] == "char_pw_heguang"
        )
        assert repaired_heguang["avatar"] == "https://example.test/custom-heguang.png"
        assert repaired_heguang["sprites"]["neutral"] == "https://example.test/custom-heguang-neutral.png"


def test_default_public_welfare_seed_can_be_disabled(monkeypatch):
    monkeypatch.setenv("FABLEMAP_SEED_DEFAULT_TAVERNS", "0")
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        payload = service.list_taverns_payload(query="")
        assert payload["taverns"] == []
        assert payload["count"] == 0


def test_default_public_welfare_seed_does_not_overwrite_corrupt_store():
    with TemporaryDirectory() as tmpdir:
        root = Path(tmpdir) / "taverns"
        root.mkdir()
        taverns_file = root / "taverns.json"
        taverns_file.write_text("{not valid json", encoding="utf-8")

        TavernStore(root)

        assert taverns_file.read_text(encoding="utf-8") == "{not valid json"


def test_default_public_welfare_seed_is_readable_when_store_is_corrupt():
    with TemporaryDirectory() as tmpdir:
        root = Path(tmpdir) / "taverns"
        root.mkdir()
        taverns_file = root / "taverns.json"
        corrupt_payload = "{not valid json"
        taverns_file.write_text(corrupt_payload, encoding="utf-8")

        service = _service(tmpdir)
        payload = service.list_taverns_payload(query="")
        seeded_ids = {tavern["id"] for tavern in payload["taverns"]}

        assert set(DEFAULT_PUBLIC_WELFARE_TAVERN_IDS).issubset(seeded_ids)
        helpdesk = service.get_tavern_payload("pw_lantern_helpdesk", user_id="visitor_public_welfare")
        assert helpdesk["name"] == "小灯塔问路铺"
        assert helpdesk["llm_config"]["backend"] == "rules"
        assert taverns_file.read_text(encoding="utf-8") == corrupt_payload


def test_default_public_welfare_seed_fallback_enter_is_readonly_when_store_is_corrupt():
    with TemporaryDirectory() as tmpdir:
        root = Path(tmpdir) / "taverns"
        root.mkdir()
        taverns_file = root / "taverns.json"
        corrupt_payload = "{not valid json"
        taverns_file.write_text(corrupt_payload, encoding="utf-8")

        service = _service(tmpdir)
        entered = service.enter_tavern_payload(
            "pw_lantern_helpdesk",
            user_id="visitor_public_welfare",
        )

        assert entered["ok"] is True
        assert entered["status"] == "open"
        assert len(entered["characters"]) >= 3
        assert taverns_file.read_text(encoding="utf-8") == corrupt_payload


def test_default_public_welfare_seed_read_fallback_repairs_partial_seed_records():
    with TemporaryDirectory() as tmpdir:
        root = Path(tmpdir) / "taverns"
        root.mkdir()
        taverns_file = root / "taverns.json"
        data = {
            tavern["id"]: tavern
            for tavern in default_public_welfare_taverns()
        }
        partial_seed_record = {
            "_memory_atoms": {
                "mem_partial": {
                    "id": "mem_partial",
                    "tavern_id": "pw_third_shelf_observatory",
                    "visitor_id": "visitor-demo",
                    "character_id": "char_pw_9_delta",
                    "scope": "visitor_character",
                    "dimension": "fact",
                    "subject": "社长 9-Delta",
                    "content": "访客记住了第三货架后面的入口。",
                    "visibility": "private",
                    "confidence": 0.7,
                    "importance": 0.4,
                    "created_at": "2026-05-05T00:00:00+00:00",
                    "updated_at": "2026-05-05T00:00:00+00:00",
                }
            }
        }
        data["pw_third_shelf_observatory"] = partial_seed_record
        taverns_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

        service = _service(tmpdir)
        payload = service.list_taverns_payload(query="第三货架")
        tavern = next(
            item for item in payload["taverns"]
            if item["id"] == "pw_third_shelf_observatory"
        )

        assert tavern["name"] == "第三货架秘密社"
        assert tavern["access"] == "public"
        assert tavern["status"] == "open"
        assert len(tavern["characters"]) >= 3
        assert service.get_tavern_payload("pw_third_shelf_observatory", user_id="visitor-demo")["name"] == "第三货架秘密社"
        stored = json.loads(taverns_file.read_text(encoding="utf-8"))
        assert stored["pw_third_shelf_observatory"] == partial_seed_record


def test_default_public_welfare_tavern_chat_uses_local_rules_backend():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = service.get_tavern_payload("pw_lantern_helpdesk", user_id="")
        character_id = tavern["characters"][0]["id"]

        entered = service.enter_tavern_payload(
            tavern["id"],
            user_id="visitor_public_welfare",
        )
        assert entered["ok"] is True
        assert entered["status"] == "open"

        response = service.tavern_chat_payload(
            tavern_id=tavern["id"],
            character_id=character_id,
            message="你好，我是新手，怎么玩？",
            visitor_id="visitor_public_welfare",
            visitor_name="测试旅人",
            user_id="visitor_public_welfare",
        )

        assert response["degraded"] is False
        assert response["tavern_status"] == "open"
        assert "新手" in response["response"] or "开店" in response["response"]
        assert service.tavern_store.get_token_usage(tavern["id"]) == 0

        sessions = service.tavern_store.list_chat_sessions(
            tavern["id"],
            visitor_id="visitor_public_welfare",
            character_id=character_id,
            limit=None,
        )
        assert len(sessions) == 1
        assert sessions[0]["message_count"] == 2


def test_public_welfare_tavern_hydrates_versioned_kilo_config_when_free_model_is_selected(monkeypatch):
    captured_configs = []

    class DummyResponse:
        content = "Kilo 测试模型已经接管这间小馆。"
        usage = {"total_tokens": 17}

    class DummyClient:
        def __init__(self, config):
            captured_configs.append(config)

        def complete(self, messages):
            return DummyResponse()

    monkeypatch.setattr("fablemap_api.core.web.service.create_client", lambda cfg: DummyClient(cfg))

    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)

        updated = service.update_tavern_payload(
            "pw_lantern_helpdesk",
            {
                "llm_config": {
                    "backend": "custom",
                    "model": "kilo-auto/free",
                    "api_key": "",
                    "base_url": "",
                    "temperature": 0.8,
                    "max_tokens": 1024,
                    "top_p": 0.9,
                }
            },
            user_id=DEFAULT_PUBLIC_WELFARE_OWNER_ID,
        )

        assert updated["status"] == "open"
        assert updated["llm_config"]["model"] == "kilo-auto/free"

        runtime_config = service.tavern_store.get_llm_config("pw_lantern_helpdesk")
        assert runtime_config is not None
        assert runtime_config.backend == "custom"
        assert runtime_config.model == "kilo-auto/free"
        assert runtime_config.base_url == "https://api.kilo.ai/api/gateway"
        assert runtime_config.api_key
        assert runtime_config.to_dict()["api_key"] == ""

        response = service.tavern_chat_payload(
            "pw_lantern_helpdesk",
            character_id="char_pw_xiaozhou",
            message="你好，我是新手，怎么玩？",
            visitor_id="visitor_public_welfare_free_model",
            visitor_name="测试旅人",
            user_id="visitor_public_welfare_free_model",
        )
        assert response["degraded"] is False
        assert response["tavern_status"] == "open"
        assert response["response"] == "Kilo 测试模型已经接管这间小馆。"
        assert captured_configs
        assert captured_configs[0].model == "kilo-auto/free"
        assert captured_configs[0].base_url == "https://api.kilo.ai/api/gateway"
        assert captured_configs[0].api_key
        assert service.tavern_store.get_token_usage("pw_lantern_helpdesk") == 17


def test_normal_tavern_without_config_still_closes_when_free_model_is_unconfigured():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        created = service.create_tavern_payload(
            {
                "name": "普通测试店",
                "description": "验证普通店没有模型配置时不套用公益规则。",
                "lat": 31.23,
                "lon": 121.47,
                "access": "public",
                "scene_prompt": "一间普通测试店。",
            },
            owner_id="owner_normal_llm",
        )

        updated = service.update_tavern_payload(
            created["id"],
            {
                "llm_config": {
                    "backend": "custom",
                    "model": "kilo-auto/free",
                    "api_key": "",
                    "base_url": "https://api.kilo.ai/api/gateway",
                }
            },
            user_id="owner_normal_llm",
        )

        assert updated["status"] == "closed"


def test_third_shelf_observatory_chat_uses_alien_convenience_rules_response():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = service.get_tavern_payload("pw_third_shelf_observatory", user_id="")
        character_id = "char_pw_9_delta"

        entered = service.enter_tavern_payload(
            tavern["id"],
            user_id="visitor_public_welfare",
        )
        assert entered["ok"] is True
        assert entered["status"] == "open"

        response = service.tavern_chat_payload(
            tavern_id=tavern["id"],
            character_id=character_id,
            message="随便到底是什么意思？",
            visitor_id="visitor_public_welfare",
            visitor_name="测试旅人",
            user_id="visitor_public_welfare",
        )

        assert response["degraded"] is False
        assert response["tavern_status"] == "open"
        assert "随便" in response["response"]
        assert "高危词" in response["response"] or "随机授权" in response["response"]
        assert service.tavern_store.get_token_usage(tavern["id"]) == 0


def test_third_shelf_observatory_generic_chat_stays_in_character_voice():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = service.get_tavern_payload("pw_third_shelf_observatory", user_id="")

        response = service.tavern_chat_payload(
            tavern_id=tavern["id"],
            character_id="char_pw_9_delta",
            message="天气怎么样？",
            visitor_id="visitor_public_welfare_weather",
            visitor_name="测试旅人",
            user_id="visitor_public_welfare_weather",
        )

        assert response["degraded"] is False
        assert response["tavern_status"] == "open"
        assert response["response"].strip()
        assert "便利店" in response["response"] or "人类" in response["response"]
        assert "这里的气味和灯光让我想到" not in response["response"]
        assert "氛围是" not in response["response"]
        assert "scene_prompt" not in response["response"]
        assert "我听见了——天气怎么样" not in response["response"]
        assert service.tavern_store.get_token_usage(tavern["id"]) == 0


def test_midnight_commission_board_chat_uses_text_adventure_rules_response():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = service.get_tavern_payload("pw_midnight_commission_board", user_id="")

        entered = service.enter_tavern_payload(
            tavern["id"],
            user_id="visitor_public_welfare",
        )
        assert entered["ok"] is True
        assert entered["status"] == "open"

        response = service.tavern_chat_payload(
            tavern_id=tavern["id"],
            character_id="char_pw_mozhan",
            message="我想接一个线索调查委托。",
            visitor_id="visitor_public_welfare",
            visitor_name="测试旅人",
            user_id="visitor_public_welfare",
        )

        assert response["degraded"] is False
        assert response["tavern_status"] == "open"
        assert "线索" in response["response"]
        assert "位置" in response["response"] or "可确认细节" in response["response"]
        assert service.tavern_store.get_token_usage(tavern["id"]) == 0


def test_after_school_hero_supply_chat_uses_hero_dream_rules_response():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = service.get_tavern_payload("pw_after_school_hero_supply", user_id="")

        entered = service.enter_tavern_payload(
            tavern["id"],
            user_id="visitor_public_welfare",
        )
        assert entered["ok"] is True
        assert entered["status"] == "open"

        response = service.tavern_chat_payload(
            tavern_id=tavern["id"],
            character_id="char_pw_aheng",
            message="我想找回小时候的英雄名，但现在说出来有点尴尬。",
            visitor_id="visitor_public_welfare",
            visitor_name="测试旅人",
            user_id="visitor_public_welfare",
        )

        assert response["degraded"] is False
        assert response["tavern_status"] == "open"
        assert "英雄名" in response["response"]
        assert "旧英雄卡" in response["response"] or "贴纸" in response["response"]
        assert service.tavern_store.get_token_usage(tavern["id"]) == 0


