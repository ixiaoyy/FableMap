from pathlib import Path
from tempfile import TemporaryDirectory

from fablemap.tavern import Tavern, TavernCharacter, TavernService, TavernStore


def _tavern(
    tavern_id: str,
    name: str,
    *,
    description: str = "",
    lat: float = 31.23,
    lon: float = 121.47,
    access: str = "public",
    status: str = "open",
    owner_id: str = "owner_discovery",
    characters: list[TavernCharacter] | None = None,
) -> Tavern:
    return Tavern(
        id=tavern_id,
        name=name,
        description=description,
        lat=lat,
        lon=lon,
        access=access,
        status=status,
        owner_id=owner_id,
        characters=characters or [],
    )


def test_tavern_discovery_filters_query_status_access_distance_and_private_scope():
    with TemporaryDirectory() as tmpdir:
        store = TavernStore(Path(tmpdir))
        service = TavernService(store)

        store.create_tavern(_tavern(
            "moon_gate",
            "Moon Gate Tavern",
            description="Late jazz and rain-soaked noodles.",
            lat=31.23,
            lon=121.47,
        ))
        store.create_tavern(_tavern(
            "rust_bridge",
            "Rust Bridge",
            description="A password room near the old overpass.",
            lat=31.231,
            lon=121.471,
            access="password",
            status="closed",
            characters=[
                TavernCharacter(
                    id="cipher",
                    tavern_id="rust_bridge",
                    name="Cipher",
                    description="Keeps the neon ledger.",
                    tags=["broker"],
                )
            ],
        ))
        store.create_tavern(_tavern(
            "far_signal",
            "Far Signal",
            description="Outside the discovery radius.",
            lat=32.0,
            lon=122.0,
        ))
        store.create_tavern(_tavern(
            "private_room",
            "Private Memory Room",
            description="Only the owner can discover this room.",
            access="private",
            owner_id="owner_secret",
        ))

        nearby_ids = [
            row["id"]
            for row in service.list_taverns(lat=31.23, lon=121.47, radius=1000)
        ]
        assert nearby_ids == ["moon_gate", "rust_bridge"]

        assert [
            row["id"]
            for row in service.list_taverns(lat=31.23, lon=121.47, radius=1000, query="cipher")
        ] == ["rust_bridge"]

        assert [
            row["id"]
            for row in service.list_taverns(lat=31.23, lon=121.47, radius=1000, status="open")
        ] == ["moon_gate"]

        assert [
            row["id"]
            for row in service.list_taverns(lat=31.23, lon=121.47, radius=1000, access="password")
        ] == ["rust_bridge"]

        visitor_matches = service.list_taverns(query="private")
        assert all(row["id"] != "private_room" for row in visitor_matches)

        owner_matches = service.list_taverns(owner_id="owner_secret", query="private")
        assert [row["id"] for row in owner_matches] == ["private_room"]
