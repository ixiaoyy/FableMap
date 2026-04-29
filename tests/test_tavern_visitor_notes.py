from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


def _client(tmp_path):
    app = create_app(ApiSettings(output_root=tmp_path, fixture_file=None, frontend_root=None))
    return TestClient(app)


def _create_tavern(client, owner_id="owner_notes"):
    response = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": owner_id},
        json={
            "name": "回访反馈小店",
            "description": "用于测试访客反馈",
            "lat": 31.2304,
            "lon": 121.4737,
            "access": "public",
            "llm_config": {"backend": "rules", "model": "rules"},
        },
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_visitor_can_create_owner_only_note(tmp_path):
    client = _client(tmp_path)
    tavern = _create_tavern(client)

    response = client.post(
        f"/api/v1/taverns/{tavern['id']}/visitor-notes",
        headers={"X-User-Id": "visitor_alpha"},
        json={"visitor_nickname": "  旅人  ", "content": "  氛围很好，下次还来。  "},
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["ok"] is True
    note = body["note"]
    assert note["tavern_id"] == tavern["id"]
    assert note["visitor_id"] == "visitor_alpha"
    assert note["visitor_nickname"] == "旅人"
    assert note["content"] == "氛围很好，下次还来。"
    assert note["visibility"] == "owner_only"
    assert "is_pinned" not in note
    assert "parent_id" not in note


def test_owner_can_list_notes_but_other_visitors_cannot(tmp_path):
    client = _client(tmp_path)
    tavern = _create_tavern(client, "owner_notes")
    created = client.post(
        f"/api/v1/taverns/{tavern['id']}/visitor-notes",
        headers={"X-User-Id": "visitor_alpha"},
        json={"visitor_nickname": "旅人", "content": "希望增加雨夜菜单。"},
    )
    assert created.status_code == 200

    forbidden = client.get(
        f"/api/v1/taverns/{tavern['id']}/visitor-notes",
        headers={"X-User-Id": "visitor_beta"},
    )
    assert forbidden.status_code == 403

    listed = client.get(
        f"/api/v1/taverns/{tavern['id']}/visitor-notes",
        headers={"X-User-Id": "owner_notes"},
    )
    assert listed.status_code == 200, listed.text
    body = listed.json()
    assert body["count"] == 1
    assert body["notes"][0]["content"] == "希望增加雨夜菜单。"


def test_public_tavern_payload_does_not_include_visitor_notes(tmp_path):
    client = _client(tmp_path)
    tavern = _create_tavern(client)
    client.post(
        f"/api/v1/taverns/{tavern['id']}/visitor-notes",
        headers={"X-User-Id": "visitor_alpha"},
        json={"visitor_nickname": "旅人", "content": "只给店主看的反馈。"},
    )

    public_payload = client.get(f"/api/v1/taverns/{tavern['id']}").json()
    assert "visitor_notes" not in public_payload
    assert "messages" not in public_payload


def test_owner_can_delete_note(tmp_path):
    client = _client(tmp_path)
    tavern = _create_tavern(client, "owner_notes")
    note = client.post(
        f"/api/v1/taverns/{tavern['id']}/visitor-notes",
        headers={"X-User-Id": "visitor_alpha"},
        json={"visitor_nickname": "旅人", "content": "可以删除的反馈。"},
    ).json()["note"]

    deleted = client.delete(
        f"/api/v1/taverns/{tavern['id']}/visitor-notes/{note['id']}",
        headers={"X-User-Id": "owner_notes"},
    )
    assert deleted.status_code == 200, deleted.text
    assert deleted.json() == {"ok": True, "note_id": note["id"]}

    listed = client.get(
        f"/api/v1/taverns/{tavern['id']}/visitor-notes",
        headers={"X-User-Id": "owner_notes"},
    )
    assert listed.json()["count"] == 0


def test_social_message_routes_are_not_exposed(tmp_path):
    client = _client(tmp_path)
    tavern = _create_tavern(client)

    assert client.get(f"/api/v1/taverns/{tavern['id']}/messages").status_code == 404
    assert client.post(
        f"/api/v1/taverns/{tavern['id']}/messages",
        headers={"X-User-Id": "visitor_alpha"},
        json={"content": "public wall"},
    ).status_code == 404
    assert client.post(
        f"/api/v1/taverns/{tavern['id']}/messages/msg_x/reply",
        headers={"X-User-Id": "visitor_alpha"},
        json={"content": "reply"},
    ).status_code == 404
    assert client.put(
        f"/api/v1/taverns/{tavern['id']}/messages/msg_x/pin",
        headers={"X-User-Id": "owner_notes"},
    ).status_code == 404