from tempfile import TemporaryDirectory
from pathlib import Path

from fablemap.tavern import LLMConfig, Tavern, TavernService, TavernStore


def test_token_usage_is_visible_and_survives_llm_config_update():
    with TemporaryDirectory() as tmpdir:
        store = TavernStore(Path(tmpdir))
        service = TavernService(store)

        tavern = Tavern(
            id="tavern_token_test",
            name="Token Test Tavern",
            description="A tavern for token usage checks.",
            lat=31.23,
            lon=121.47,
            owner_id="owner_token_test",
            llm_config=LLMConfig(backend="openai", model="gpt-4o-mini"),
        )
        store.create_tavern(tavern)
        store.save_llm_config(
            tavern.id,
            LLMConfig(
                backend="openai",
                model="gpt-4o-mini",
                api_key="sk-test",
                token_used=12,
            ),
        )

        store.add_token_usage(tavern.id, 88)

        listed = service.list_taverns(owner_id="owner_token_test")
        assert listed[0]["llm_config"]["token_used"] == 100

        service.update_tavern(
            tavern.id,
            {
                "llm_config": {
                    "backend": "openai",
                    "model": "gpt-4o",
                    "api_key": "sk-updated",
                    "base_url": "",
                }
            },
            user_id="owner_token_test",
        )

        updated = service.get_tavern(tavern.id, user_id="owner_token_test")
        assert updated["llm_config"]["token_used"] == 100
        assert updated["llm_config"]["model"] == "gpt-4o"
