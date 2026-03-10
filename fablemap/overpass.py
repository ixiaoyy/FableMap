from __future__ import annotations

import json
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


class OverpassError(RuntimeError):
    """Raised when live Overpass requests fail or return invalid data."""


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
    max_retries: int = 1,
    retry_delay_seconds: float = 1.0,
) -> dict[str, Any]:
    total_attempts = max_retries + 1
    for attempt in range(1, total_attempts + 1):
        request = Request(
            OVERPASS_URL,
            data=build_query(lat, lon, radius).encode("utf-8"),
            headers={
                "Content-Type": "text/plain; charset=utf-8",
                "User-Agent": "FableMap/0.1",
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=timeout_seconds) as response:
                payload = json.loads(response.read().decode("utf-8"))
            if not isinstance(payload, dict) or "elements" not in payload:
                raise OverpassError("Overpass response is missing the 'elements' field.")
            return payload
        except HTTPError as exc:
            message = (
                f"Overpass request failed with HTTP {exc.code} on attempt "
                f"{attempt}/{total_attempts}."
            )
            if attempt >= total_attempts or not _is_retryable_http_status(exc.code):
                raise OverpassError(message) from exc
            time.sleep(retry_delay_seconds)
        except (URLError, TimeoutError, OSError) as exc:
            reason = getattr(exc, "reason", exc)
            message = (
                "Overpass request failed due to network error on attempt "
                f"{attempt}/{total_attempts} with timeout {timeout_seconds}s: {reason}"
            )
            if attempt >= total_attempts:
                raise OverpassError(message) from exc
            time.sleep(retry_delay_seconds)
        except json.JSONDecodeError as exc:
            raise OverpassError("Overpass returned invalid JSON.") from exc
    raise OverpassError("Overpass request failed after all retry attempts.")


def _is_retryable_http_status(status_code: int) -> bool:
    return status_code == 429 or status_code >= 500