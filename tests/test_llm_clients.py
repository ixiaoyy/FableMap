from __future__ import annotations

import json

import pytest

from fablemap_api.core import llm_clients
from fablemap_api.core.llm_clients import (
    ClaudeBackend,
    LLMBackend,
    LLMConfig,
    LLMError,
    LLMResponse,
    OpenAIBackend,
    TextGenBackend,
    create_client,
    get_default_model,
    list_supported_backends,
)


class EchoBackend(LLMBackend):
    def complete(self, messages: list[dict[str, str]], **kwargs) -> LLMResponse:
        joined = " | ".join(message["content"] for message in messages)
        return LLMResponse(content=f"echo:{joined}", model=self.config.model, usage={"prompt_tokens": len(messages)})

    def count_tokens(self, text: str) -> int:
        return self._estimate_tokens(text)

    def supports_streaming(self) -> bool:
        return False


class StreamingEchoBackend(EchoBackend):
    def complete_stream(self, messages: list[dict[str, str]], **kwargs):
        yield LLMResponse.from_chunk("hello", self.config.model)
        yield LLMResponse.from_chunk(" world", self.config.model)

    def supports_streaming(self) -> bool:
        return True


def test_llm_config_and_factory_cover_defaults_aliases_and_unknown_backend() -> None:
    assert LLMConfig().is_configured() is False
    assert LLMConfig(api_key="sk-test").is_configured() is True
    assert LLMConfig(base_url="http://localhost:11434").is_configured() is True

    assert get_default_model("OPENAI") == "gpt-4o-mini"
    assert get_default_model("unknown") == ""

    openai = create_client(LLMConfig(backend="openai", model="gpt-4o-mini", api_key="sk-test"))
    local = create_client(LLMConfig(backend="local", model="llama3.2", base_url="http://localhost:11434"))

    assert isinstance(openai, OpenAIBackend)
    assert local.__class__.__name__ == "OllamaBackend"

    with pytest.raises(LLMError, match="Unknown backend 'missing'"):
        create_client(LLMConfig(backend="missing"))


def test_llm_backend_base_helpers_build_request_body_and_headers() -> None:
    backend = EchoBackend(
        LLMConfig(
            backend="unit",
            model="unit-model",
            api_key="sk-test",
            temperature=0.25,
            max_tokens=128,
            top_p=0.75,
            frequency_penalty=0.1,
            presence_penalty=0.2,
            seed=7,
        )
    )

    body = backend._build_body(
        [{"role": "user", "content": "你好，酒馆"}],
        "unit-model",
        stream=True,
        response_format={"type": "json_object"},
    )
    headers = backend._default_headers("sk-test", {"X-Provider": "unit"})

    assert body == {
        "model": "unit-model",
        "messages": [{"role": "user", "content": "你好，酒馆"}],
        "temperature": 0.25,
        "max_tokens": 128,
        "top_p": 0.75,
        "stream": True,
        "frequency_penalty": 0.1,
        "presence_penalty": 0.2,
        "seed": 7,
        "response_format": {"type": "json_object"},
    }
    assert headers["Authorization"] == "Bearer sk-test"
    assert headers["Content-Type"] == "application/json"
    assert headers["X-Provider"] == "unit"
    assert backend.count_tokens("中文abc") > 0


def test_complete_convenience_uses_factory_and_streaming_flag(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setitem(llm_clients._BACKENDS, "unit", EchoBackend)
    monkeypatch.setitem(llm_clients._BACKENDS, "unit_stream", StreamingEchoBackend)

    response = llm_clients.complete(
        LLMConfig(backend="unit", model="unit-model"),
        [{"role": "user", "content": "灯还亮着"}],
    )
    stream_fallback = llm_clients.complete(
        LLMConfig(backend="unit", model="unit-model"),
        [{"role": "user", "content": "非流式后端"}],
        stream=True,
    )
    chunks = list(
        llm_clients.complete(
            LLMConfig(backend="unit_stream", model="stream-model"),
            [{"role": "user", "content": "流式后端"}],
            stream=True,
        )
    )

    assert isinstance(response, LLMResponse)
    assert response.content == "echo:灯还亮着"
    assert isinstance(stream_fallback, LLMResponse)
    assert stream_fallback.content == "echo:非流式后端"
    assert [chunk.content for chunk in chunks] == ["hello", " world"]
    assert all(chunk.streaming for chunk in chunks)


def test_openai_complete_builds_expected_request_without_network(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}

    class FakeResponse:
        def __enter__(self) -> "FakeResponse":
            return self

        def __exit__(self, exc_type, exc, tb) -> None:
            return None

        def read(self) -> bytes:
            return json.dumps(
                {
                    "model": "gpt-test",
                    "choices": [{"message": {"content": "酒馆回应"}}],
                    "usage": {"prompt_tokens": 3, "completion_tokens": 5},
                }
            ).encode("utf-8")

    def fake_urlopen(request, timeout):
        captured["url"] = request.full_url
        captured["headers"] = dict(request.header_items())
        captured["body"] = json.loads(request.data.decode("utf-8"))
        captured["timeout"] = timeout
        return FakeResponse()

    monkeypatch.setattr("urllib.request.urlopen", fake_urlopen)

    backend = OpenAIBackend(
        LLMConfig(
            backend="openai",
            model="gpt-test",
            api_key="sk-test",
            base_url="https://llm.example/v1",
            temperature=0.2,
            max_tokens=64,
            json_schema={
                "name": "reply_with_mood",
                "description": "Reply contract",
                "parameters": {"type": "object"},
            },
        )
    )
    response = backend.complete([{"role": "user", "content": "今晚营业吗？"}], user="visitor-1")

    assert response.content == "酒馆回应"
    assert response.model == "gpt-test"
    assert response.usage == {"prompt_tokens": 3, "completion_tokens": 5}
    assert captured["url"] == "https://llm.example/v1/chat/completions"
    assert captured["timeout"] == 120
    assert captured["headers"]["Authorization"] == "Bearer sk-test"

    body = captured["body"]
    assert body["model"] == "gpt-test"
    assert body["messages"] == [{"role": "user", "content": "今晚营业吗？"}]
    assert body["temperature"] == 0.2
    assert body["max_tokens"] == 64
    assert body["stream"] is False
    assert body["user"] == "visitor-1"
    assert body["tools"][0]["function"]["name"] == "reply_with_mood"
    assert body["tool_choice"]["function"]["name"] == "reply_with_mood"


def test_claude_message_conversion_keeps_system_context_as_prompt_prefix() -> None:
    backend = ClaudeBackend(LLMConfig(backend="claude", model="claude-test", api_key="sk-test"))

    converted = backend._convert_messages(
        [
            {"role": "system", "content": "你是店主配置的 NPC。"},
            {"role": "user", "content": "推荐今晚的座位。"},
            {"role": "assistant", "content": "靠窗的位置还空着。"},
        ]
    )

    assert converted[0]["role"] == "user"
    assert converted[0]["content"][0]["text"] == "System context:\n你是店主配置的 NPC。"
    assert converted[1] == {"role": "user", "content": [{"type": "text", "text": "推荐今晚的座位。"}]}
    assert converted[2] == {"role": "assistant", "content": [{"type": "text", "text": "靠窗的位置还空着。"}]}


def test_textgen_prompt_conversion_and_base_url_guardrail() -> None:
    backend = TextGenBackend(LLMConfig(backend="ooba", model="local-model"))

    prompt = backend._messages_to_prompt(
        [
            {"role": "system", "content": "只使用主人提供的酒馆设定。"},
            {"role": "user", "content": "你好"},
            {"role": "assistant", "content": "欢迎。"},
        ]
    )

    assert "### System:\n只使用主人提供的酒馆设定。\n" in prompt
    assert "### User:\n你好\n" in prompt
    assert "### Assistant:\n欢迎。\n" in prompt
    assert prompt.rstrip().endswith("### Assistant:")
    assert backend.supports_streaming() is True

    with pytest.raises(LLMError, match="requires base_url"):
        backend.complete([{"role": "user", "content": "不会触发网络"}])


def test_list_supported_backends_reports_registered_backends() -> None:
    backends = list_supported_backends()
    by_id = {backend["id"]: backend for backend in backends}

    assert "openai" in by_id
    assert by_id["openai"]["class"] == "OpenAIBackend"
    assert by_id["openai"]["supports_streaming"] is True
    assert by_id["openai"]["default_model"] == "gpt-4o-mini"
    assert by_id["local"]["class"] == "OllamaBackend"
    assert by_id["ooba"]["is_textgen"] is True
