from pathlib import Path
from tempfile import TemporaryDirectory

from fablemap.llm_clients import LLMError
from fablemap.tavern import LLMConfig, Tavern, TavernCharacter
from fablemap.web.config import ApiSettings
from fablemap.web.service import WebService


def _service(tmpdir: str) -> WebService:
    return WebService(ApiSettings(output_root=Path(tmpdir), fixture_file=None, frontend_root=None))


def _create_open_tavern(service: WebService) -> Tavern:
    tavern = Tavern(
        id="tavern_degrade",
        name="Degrade Test Tavern",
        description="A tavern for LLM degradation checks.",
        lat=31.23,
        lon=121.47,
        owner_id="owner_degrade",
        status="open",
        characters=[
            TavernCharacter(
                id="char_degrade",
                tavern_id="tavern_degrade",
                name="Mira",
                first_mes="欢迎光临。",
            )
        ],
    )
    service.tavern_store.create_tavern(tavern)
    return tavern


def test_llm_failure_returns_degradation_payload_and_closes_tavern(monkeypatch):
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = _create_open_tavern(service)
        service.tavern_store.save_llm_config(
            tavern.id,
            LLMConfig(backend="openai", model="gpt-4o-mini", api_key="sk-test"),
        )

        class BrokenClient:
            def complete(self, messages):
                raise LLMError("upstream timeout")

        monkeypatch.setattr("fablemap.web.service.create_client", lambda config: BrokenClient())

        payload = service.tavern_chat_payload(
            tavern_id=tavern.id,
            character_id="char_degrade",
            message="你好",
            visitor_id="visitor_degrade",
        )

        assert payload["degraded"] is True
        assert payload["degradation"]["reason"] == "llm_error"
        assert payload["degradation"]["technical_detail"] == "upstream timeout"
        assert payload["tavern_status"] == "closed"
        assert payload["response"]
        assert service.tavern_store.get_tavern(tavern.id).status == "closed"

        history = service.tavern_store.get_chat_history(tavern.id, "visitor_degrade", "char_degrade")
        assert [message.role for message in history] == ["user", "assistant"]


def test_missing_llm_config_returns_friendly_degradation_and_closes_tavern():
    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        tavern = _create_open_tavern(service)

        payload = service.tavern_chat_payload(
            tavern_id=tavern.id,
            character_id="char_degrade",
            message="你好",
            visitor_id="visitor_degrade",
        )

        assert payload["degraded"] is True
        assert payload["degradation"]["reason"] == "llm_not_configured"
        assert payload["tavern_status"] == "closed"
        assert service.tavern_store.get_tavern(tavern.id).status == "closed"
