from fablemap_api.core.tavern import TavernCharacter, VoiceConfig
from fablemap_api.core.voice_greeting import build_voice_greeting_preview


def test_voice_greeting_preview_selects_first_mes_without_generating_audio():
    character = TavernCharacter(
        id="char_keeper",
        tavern_id="tavern_voice",
        name="Keeper",
        first_mes="欢迎回到灯下，今晚先听一段安静的开场。",
        alternate_greetings=["备用问候一", "备用问候二"],
    )
    voice = VoiceConfig(
        enabled=True,
        tts_provider="edge_tts",
        tts_voice="zh-CN-XiaoxiaoNeural",
        tts_model="",
        tts_speed=1.1,
        tts_language="zh-CN",
        auto_play=True,
    )

    preview = build_voice_greeting_preview(
        tavern_id="tavern_voice",
        tavern_name="Voice Tavern",
        character=character,
        voice_config=voice,
        greeting_index=0,
    )

    assert preview["ok"] is True
    assert preview["preview_only"] is True
    assert preview["applied"] is False
    assert preview["audio_generated"] is False
    assert preview["tts_ready"] is True
    assert preview["greeting"]["source"] == "first_mes"
    assert "欢迎回到灯下" in preview["greeting"]["text"]
    assert preview["tts_request"] == {"text": preview["greeting"]["text"], "character_id": "char_keeper"}
    assert preview["voice"]["tts_provider"] == "edge_tts"
    assert "api_key" not in str(preview).lower()
    assert "audio" not in preview


def test_voice_greeting_preview_can_select_alternate_greeting_and_marks_disabled_voice():
    character = TavernCharacter(
        id="char_keeper",
        tavern_id="tavern_voice",
        name="Keeper",
        first_mes="默认问候",
        alternate_greetings=["备用问候一", "备用问候二"],
    )

    preview = build_voice_greeting_preview(
        tavern_id="tavern_voice",
        tavern_name="Voice Tavern",
        character=character,
        voice_config=VoiceConfig(enabled=False),
        greeting_index=2,
    )

    assert preview["greeting"]["source"] == "alternate_greetings[1]"
    assert preview["greeting"]["text"] == "备用问候二"
    assert preview["tts_ready"] is False
    assert any("语音未启用" in note for note in preview["notes"])
