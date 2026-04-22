from pathlib import Path
from tempfile import TemporaryDirectory

from fablemap_api.core.default_taverns import DEFAULT_PUBLIC_WELFARE_TAVERN_IDS
from fablemap_api.core.web.config import ApiSettings
from fablemap_api.core.web.service import WebService


def _service(tmpdir: str) -> WebService:
    return WebService(ApiSettings(output_root=Path(tmpdir), fixture_file=None, frontend_root=None))


def test_default_public_welfare_taverns_have_theme_gameplays_and_rules_fallback_runs():
    expected_keywords = {
        "pw_lantern_helpdesk": ["新手", "开店", "隐私"],
        "pw_midnight_treehole": ["树洞", "留言", "未来"],
        "pw_community_repair": ["修补", "工具", "小事"],
        "pw_lost_found_archive": ["失物", "线索", "档案"],
    }

    with TemporaryDirectory() as tmpdir:
        service = _service(tmpdir)
        for tavern_id in DEFAULT_PUBLIC_WELFARE_TAVERN_IDS:
            payload = service.get_gameplays_payload(tavern_id, "visitor_public")
            gameplays = payload["gameplays"]
            assert gameplays, tavern_id
            assert all(gameplay["status"] == "published" for gameplay in gameplays)
            combined = " ".join(
                f"{gameplay.get('title', '')} {gameplay.get('summary', '')} {gameplay.get('entry_label', '')}"
                for gameplay in gameplays
            )
            assert any(keyword in combined for keyword in expected_keywords[tavern_id])

            tavern = service.get_tavern_payload(tavern_id, "visitor_public")
            started = service.start_gameplay_session_payload(
                tavern_id,
                {"gameplay_id": gameplays[0]["id"], "character_id": tavern["characters"][0]["id"]},
                "visitor_public",
            )
            assert started["session"]["state"] == "in_progress"
            advanced = service.advance_gameplay_session_payload(
                tavern_id,
                started["session"]["id"],
                {"message": "继续"},
                "visitor_public",
            )
            assert advanced["source"] in {"fallback", "choice"}
            assert advanced["event"]["narration"]
