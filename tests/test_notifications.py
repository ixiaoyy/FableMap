import asyncio

from fastapi.testclient import TestClient

from fablemap_api.core.notifications import get_notification_store
from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


def _reset_store():
    store = get_notification_store()
    store._notifications.clear()
    store._connections.clear()
    return store


def test_notification_rest_list_and_mark_read(tmp_path):
    store = _reset_store()
    asyncio.run(store.add_notification(
        user_id="owner_notify",
        notification_type="new_visitor",
        title="新访客进入",
        content="visitor_a 进入了你的酒馆",
        tavern_id="tavern_a",
        tavern_name="测试酒馆",
    ))
    client = TestClient(create_app(ApiSettings(output_root=tmp_path, fixture_file=None, frontend_root=None)))

    listed = client.get("/api/v1/notifications", headers={"X-User-Id": "owner_notify"})
    assert listed.status_code == 200, listed.text
    body = listed.json()
    assert body["total"] == 1
    assert body["unread_count"] == 1
    notification_id = body["notifications"][0]["id"]

    marked = client.post(f"/api/v1/notifications/{notification_id}/read", headers={"X-User-Id": "owner_notify"})
    assert marked.status_code == 200, marked.text
    assert marked.json()["unread_count"] == 0


def test_notification_websocket_receives_live_notification(tmp_path):
    store = _reset_store()
    client = TestClient(create_app(ApiSettings(output_root=tmp_path, fixture_file=None, frontend_root=None)))

    with client.websocket_connect("/api/v1/notifications/ws/owner_live") as websocket:
        connected = websocket.receive_json()
        assert connected["type"] == "connected"
        assert connected["unread_count"] == 0

        asyncio.run(store.add_notification(
            user_id="owner_live",
            notification_type="new_guest_message",
            title="新反馈",
            content="旅人给店主留下了回访反馈",
            tavern_id="tavern_live",
            tavern_name="实时酒馆",
        ))

        pushed = websocket.receive_json()
        assert pushed["type"] == "notification"
        assert pushed["data"]["notification_type"] == "new_guest_message"
        assert pushed["data"]["tavern_name"] == "实时酒馆"