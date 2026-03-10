from __future__ import annotations

import json
from typing import Any
from urllib.request import Request, urlopen

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def build_query(lat: float, lon: float, radius: int) -> str:
    return (
        "[out:json][timeout:25];\n"
        "(\n"
        f"  node(around:{radius},{lat},{lon});\n"
        f"  way(around:{radius},{lat},{lon});\n"
        f"  relation(around:{radius},{lat},{lon});\n"
        ");\n"
        "out geom;"
    )


def fetch_overpass_data(
    lat: float,
    lon: float,
    radius: int,
    timeout_seconds: int = 30,
) -> dict[str, Any]:
    request = Request(
        OVERPASS_URL,
        data=build_query(lat, lon, radius).encode("utf-8"),
        headers={
            "Content-Type": "text/plain; charset=utf-8",
            "User-Agent": "FableMap/0.1",
        },
        method="POST",
    )
    with urlopen(request, timeout=timeout_seconds) as response:
        return json.loads(response.read().decode("utf-8"))