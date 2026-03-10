import json
import unittest
from unittest.mock import MagicMock, patch
from urllib.error import URLError

from fablemap.overpass import OverpassError, fetch_overpass_data


def _mock_response(payload: dict) -> MagicMock:
    response = MagicMock()
    response.read.return_value = json.dumps(payload).encode("utf-8")
    context_manager = MagicMock()
    context_manager.__enter__.return_value = response
    context_manager.__exit__.return_value = False
    return context_manager


class OverpassTests(unittest.TestCase):
    def test_fetch_retries_after_transient_network_error(self) -> None:
        with patch("fablemap.overpass.time.sleep") as sleep_mock, patch(
            "fablemap.overpass.urlopen",
            side_effect=[URLError("temporary outage"), _mock_response({"elements": []})],
        ) as urlopen_mock:
            payload = fetch_overpass_data(35.6580, 139.7016, 300, timeout_seconds=5, max_retries=1)
        self.assertEqual(payload["elements"], [])
        self.assertEqual(urlopen_mock.call_count, 2)
        sleep_mock.assert_called_once()

    def test_fetch_raises_clear_error_when_retries_are_exhausted(self) -> None:
        with patch("fablemap.overpass.urlopen", side_effect=URLError("dns failure")):
            with self.assertRaises(OverpassError) as context:
                fetch_overpass_data(35.6580, 139.7016, 300, timeout_seconds=5, max_retries=0)
        message = str(context.exception)
        self.assertIn("attempt 1/1", message)
        self.assertIn("timeout 5s", message)
        self.assertIn("dns failure", message)