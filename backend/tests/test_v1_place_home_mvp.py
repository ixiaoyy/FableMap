from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from fablemap_api.infrastructure.settings import ApiSettings
from fablemap_api.main import create_app


OWNER_ID = "owner-place-home"
OTHER_OWNER_ID = "owner-school-other"
VISITOR_ID = "visitor-place-home"


def _client(tmp_path: Path) -> TestClient:
    return TestClient(
        create_app(
            ApiSettings(
                output_root=tmp_path / "api",
                fixture_file=None,
                frontend_root=None,
                storage_backend="json",
                database_url="",
                mysql_url="",
            )
        )
    )


def _create_tavern(client: TestClient, owner_id: str = OWNER_ID, **payload: object) -> dict[str, object]:
    response = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": owner_id},
        json={
            "name": "Place Home Test",
            "description": "A place/home contract test fixture.",
            "lat": 31.2304,
            "lon": 121.4737,
            "access": "public",
            **payload,
        },
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_place_type_defaults_and_round_trips_through_v1_api(tmp_path: Path) -> None:
    client = _client(tmp_path)

    defaulted = _create_tavern(client)
    assert defaulted["place_type"] == "tavern"

    school = _create_tavern(client, name="第三中学", place_type="school")
    assert school["place_type"] == "school"

    hospital = _create_tavern(client, name="夜间护理站", place_type="hospital")
    assert hospital["place_type"] == "hospital"

    tavern_id = str(school["id"])
    visitor_view = client.get(f"/api/v1/taverns/{tavern_id}", headers={"X-User-Id": VISITOR_ID})
    assert visitor_view.status_code == 200
    assert visitor_view.json()["place_type"] == "school"

    updated = client.put(
        f"/api/v1/taverns/{tavern_id}",
        headers={"X-User-Id": OWNER_ID},
        json={"place_type": "bookstore"},
    )
    assert updated.status_code == 200
    assert updated.json()["place_type"] == "bookstore"


def test_invalid_place_type_is_rejected(tmp_path: Path) -> None:
    client = _client(tmp_path)

    created = client.post(
        "/api/v1/taverns",
        headers={"X-User-Id": OWNER_ID},
        json={"name": "Bad", "lat": 31.2, "lon": 121.4, "place_type": "combat-arena"},
    )
    assert created.status_code == 400
    assert "地点类型" in created.json()["error"]

    valid = _create_tavern(client)
    updated = client.put(
        f"/api/v1/taverns/{valid['id']}",
        headers={"X-User-Id": OWNER_ID},
        json={"place_type": "platform-map-poi"},
    )
    assert updated.status_code == 400
    assert "地点类型" in updated.json()["error"]


def test_home_defaults_private_and_is_hidden_from_public_discovery(tmp_path: Path) -> None:
    client = _client(tmp_path)

    home = _create_tavern(client, name="阿璃的 Home", place_type="home")
    assert home["place_type"] == "home"
    assert home["access"] == "private"
    home_id = str(home["id"])

    still_private = client.put(
        f"/api/v1/taverns/{home_id}",
        headers={"X-User-Id": OWNER_ID},
        json={"place_type": "home", "access": "public"},
    )
    assert still_private.status_code == 200
    assert still_private.json()["access"] == "private"

    public_list = client.get("/api/v1/taverns")
    assert public_list.status_code == 200
    assert all(row["id"] != home_id for row in public_list.json()["taverns"])

    visitor_view = client.get(f"/api/v1/taverns/{home_id}", headers={"X-User-Id": VISITOR_ID})
    assert visitor_view.status_code == 403

    owner_view = client.get(f"/api/v1/taverns/{home_id}", headers={"X-User-Id": OWNER_ID})
    assert owner_view.status_code == 200
    assert owner_view.json()["place_type"] == "home"


def test_home_members_default_silent_and_do_not_become_npcs(tmp_path: Path) -> None:
    client = _client(tmp_path)
    home = _create_tavern(client, name="石头孩子之家", place_type="home")
    home_id = str(home["id"])

    added = client.post(
        f"/api/v1/taverns/{home_id}/home-members",
        headers={"X-User-Id": OWNER_ID},
        json={"name": "小石头", "member_type": "silent_member", "description": "一块被当作孩子照顾的石头"},
    )
    assert added.status_code == 200, added.text
    member = added.json()["member"]
    assert member["member_type"] == "silent_member"
    assert member["speech_mode"] == "silent"

    owner_view = client.get(f"/api/v1/taverns/{home_id}", headers={"X-User-Id": OWNER_ID})
    assert owner_view.status_code == 200
    assert owner_view.json()["home_members"][0]["name"] == "小石头"
    assert owner_view.json()["characters"] == []

    enter = client.post(f"/api/v1/taverns/{home_id}/enter", headers={"X-User-Id": OWNER_ID}, json={})
    assert enter.status_code == 200
    assert enter.json()["characters"] == []


def test_school_enrollment_approval_boundaries(tmp_path: Path) -> None:
    client = _client(tmp_path)
    home = _create_tavern(client, name="阿璃的 Home", place_type="home")
    home_id = str(home["id"])
    member_resp = client.post(
        f"/api/v1/taverns/{home_id}/home-members",
        headers={"X-User-Id": OWNER_ID},
        json={"name": "星星", "member_type": "silent_member"},
    )
    member_id = member_resp.json()["member"]["id"]

    own_school = _create_tavern(client, name="自家学校", place_type="school")
    own_enrollment = client.post(
        f"/api/v1/taverns/{home_id}/relationships/school-enrollments",
        headers={"X-User-Id": OWNER_ID},
        json={"member_id": member_id, "school_tavern_id": own_school["id"]},
    )
    assert own_enrollment.status_code == 200, own_enrollment.text
    assert own_enrollment.json()["relationship"]["status"] == "approved"

    own_members = client.get(f"/api/v1/taverns/{own_school['id']}/school-members")
    assert own_members.status_code == 200
    assert [row["display_name"] for row in own_members.json()["members"]] == ["星星"]

    other_school = _create_tavern(client, owner_id=OTHER_OWNER_ID, name="他人学校", place_type="school")
    pending = client.post(
        f"/api/v1/taverns/{home_id}/relationships/school-enrollments",
        headers={"X-User-Id": OWNER_ID},
        json={"member_id": member_id, "school_tavern_id": other_school["id"]},
    )
    assert pending.status_code == 200, pending.text
    relationship = pending.json()["relationship"]
    assert relationship["status"] == "pending"

    other_members_before = client.get(f"/api/v1/taverns/{other_school['id']}/school-members")
    assert other_members_before.status_code == 200
    assert other_members_before.json()["members"] == []

    approved = client.put(
        f"/api/v1/taverns/{other_school['id']}/relationships/{relationship['id']}",
        headers={"X-User-Id": OTHER_OWNER_ID},
        json={"status": "approved", "note": "同意入学"},
    )
    assert approved.status_code == 200, approved.text
    assert approved.json()["relationship"]["status"] == "approved"

    other_members_after = client.get(f"/api/v1/taverns/{other_school['id']}/school-members")
    assert other_members_after.status_code == 200
    assert [row["display_name"] for row in other_members_after.json()["members"]] == ["星星"]


def test_place_relationships_are_not_hardcoded_to_school_enrollment(tmp_path: Path) -> None:
    client = _client(tmp_path)
    home = _create_tavern(client, name="阿璃的 Home", place_type="home")
    home_id = str(home["id"])
    member_resp = client.post(
        f"/api/v1/taverns/{home_id}/home-members",
        headers={"X-User-Id": OWNER_ID},
        json={"name": "小石头", "member_type": "silent_member"},
    )
    member_id = member_resp.json()["member"]["id"]
    care_place = _create_tavern(
        client,
        owner_id=OTHER_OWNER_ID,
        name="石头托管角",
        place_type="cafe",
    )
    care_place_id = str(care_place["id"])

    created = client.post(
        f"/api/v1/taverns/{home_id}/relationships",
        headers={"X-User-Id": OWNER_ID},
        json={
            "member_id": member_id,
            "target_tavern_id": care_place_id,
            "relation_type": "care_link",
            "display_name": "小石头",
            "source_role": "home_member",
            "target_role": "care_place",
        },
    )
    assert created.status_code == 200, created.text
    relationship = created.json()["relationship"]
    assert relationship["relation_type"] == "care_link"
    assert relationship["status"] == "pending"
    assert relationship["target_tavern_id"] == care_place_id

    target_owner_view = client.get(f"/api/v1/taverns/{care_place_id}", headers={"X-User-Id": OTHER_OWNER_ID})
    assert target_owner_view.status_code == 200
    assert [row["id"] for row in target_owner_view.json()["pending_place_relationships"]] == [relationship["id"]]

    visitor_target_view = client.get(f"/api/v1/taverns/{care_place_id}", headers={"X-User-Id": VISITOR_ID})
    assert visitor_target_view.status_code == 200
    assert "pending_place_relationships" not in visitor_target_view.json()
    assert "target_place_relationships" not in visitor_target_view.json()

    approved = client.put(
        f"/api/v1/taverns/{care_place_id}/relationships/{relationship['id']}",
        headers={"X-User-Id": OTHER_OWNER_ID},
        json={"status": "approved", "note": "允许托管"},
    )
    assert approved.status_code == 200, approved.text
    assert approved.json()["relationship"]["status"] == "approved"

    home_owner_view = client.get(f"/api/v1/taverns/{home_id}", headers={"X-User-Id": OWNER_ID})
    assert home_owner_view.status_code == 200
    [stored_relationship] = home_owner_view.json()["place_relationships"]
    assert stored_relationship["relation_type"] == "care_link"
    assert stored_relationship["status"] == "approved"

    target_owner_after = client.get(f"/api/v1/taverns/{care_place_id}", headers={"X-User-Id": OTHER_OWNER_ID})
    assert target_owner_after.status_code == 200
    assert [row["relation_type"] for row in target_owner_after.json()["target_place_relationships"]] == ["care_link"]


def test_invalid_place_relationship_type_is_rejected(tmp_path: Path) -> None:
    client = _client(tmp_path)
    home = _create_tavern(client, name="阿璃的 Home", place_type="home")
    member_resp = client.post(
        f"/api/v1/taverns/{home['id']}/home-members",
        headers={"X-User-Id": OWNER_ID},
        json={"name": "星星", "member_type": "silent_member"},
    )
    target = _create_tavern(client, owner_id=OTHER_OWNER_ID, name="目标地点", place_type="bookstore")

    response = client.post(
        f"/api/v1/taverns/{home['id']}/relationships",
        headers={"X-User-Id": OWNER_ID},
        json={
            "member_id": member_resp.json()["member"]["id"],
            "target_tavern_id": target["id"],
            "relation_type": "freeform-friend-social",
        },
    )
    assert response.status_code == 400
    assert "关系类型" in response.json()["error"]
