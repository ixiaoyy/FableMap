from pathlib import Path
from tempfile import TemporaryDirectory

from fablemap.web.config import ApiSettings
from fablemap.web.service import WebService


def _web_service(tmpdir: str) -> WebService:
    return WebService(ApiSettings(output_root=Path(tmpdir), fixture_file=None, frontend_root=None))


def test_web_service_legacy_tavern_wrappers_persist_extension_fields():
    with TemporaryDirectory() as tmpdir:
        service = _web_service(tmpdir)
        tavern = service.create_tavern_payload(
            {
                "id": "tavern_router_compat",
                "name": "Router Compat Tavern",
                "description": "A tavern for legacy router compatibility.",
                "lat": 31.23,
                "lon": 121.47,
            },
            owner_id="owner_router_compat",
        )

        service.update_tavern(
            tavern["id"],
            {
                "groups": [{"id": "grp_test", "name": "Night Table"}],
                "bookmarks": [{"id": "bm_test", "content": "Remember this line."}],
                "chat_templates": [{"id": "tmpl_test", "name": "Slow Burn", "prompt": "Stay in character."}],
                "world_info": [
                    {
                        "id": "wi_test",
                        "keys": "lantern, desk",
                        "keys_secondary": "rain",
                        "content": "The brass lantern is always warm.",
                        "insertion_order": 42,
                    }
                ],
            },
            user_id="owner_router_compat",
        )

        fetched = service.get_tavern(tavern["id"], "owner_router_compat")
        assert fetched["groups"] == [{"id": "grp_test", "name": "Night Table"}]
        assert fetched["bookmarks"] == [{"id": "bm_test", "content": "Remember this line."}]
        assert fetched["chat_templates"][0]["id"] == "tmpl_test"
        assert fetched["world_info"][0]["keys"] == ["lantern", "desk"]
        assert fetched["world_info"][0]["keys_secondary"] == ["rain"]
        assert fetched["world_info"][0]["order"] == 42
        assert fetched["world_info"][0]["insertion_order"] == 42

        listed = service.list_taverns("owner_router_compat")
        assert [item["id"] for item in listed] == [tavern["id"]]


def test_character_card_world_info_import_is_attached_to_tavern():
    with TemporaryDirectory() as tmpdir:
        service = _web_service(tmpdir)
        tavern = service.create_tavern_payload(
            {
                "id": "tavern_character_book",
                "name": "Character Book Tavern",
                "description": "A tavern for character book imports.",
                "lat": 31.23,
                "lon": 121.47,
            },
            owner_id="owner_character_book",
        )

        service.add_character_payload(
            tavern["id"],
            {
                "name": "Archivist",
                "world_info": [
                    {
                        "keys": ["archive", "ledger"],
                        "content": "The ledger records every late-night visitor.",
                        "depth": 3,
                    }
                ],
            },
            user_id="owner_character_book",
        )

        fetched = service.get_tavern(tavern["id"], "owner_character_book")
        assert len(fetched["world_info"]) == 1
        assert fetched["world_info"][0]["tavern_id"] == tavern["id"]
        assert fetched["world_info"][0]["keys"] == ["archive", "ledger"]
        assert fetched["world_info"][0]["content"] == "The ledger records every late-night visitor."
        assert fetched["world_info"][0]["depth"] == 3
