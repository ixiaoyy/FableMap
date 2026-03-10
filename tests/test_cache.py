from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from fablemap.cache import cache_key_for_request, cache_path_for_request, load_cached_json, write_cached_json


class CacheTests(unittest.TestCase):
    def test_cache_key_is_stable_for_same_input(self) -> None:
        first = cache_key_for_request(35.6580, 139.7016, 300)
        second = cache_key_for_request(35.6580, 139.7016, 300)
        self.assertEqual(first, second)

    def test_cache_path_includes_overpass_directory(self) -> None:
        path = cache_path_for_request("cache-root", 35.6580, 139.7016, 300)
        self.assertEqual(path, Path("cache-root") / "overpass" / f"{cache_key_for_request(35.6580, 139.7016, 300)}.json")

    def test_cache_round_trip(self) -> None:
        with TemporaryDirectory() as tmpdir:
            path = cache_path_for_request(tmpdir, 35.6580, 139.7016, 300)
            write_cached_json(path, {"elements": [{"id": 7}]})
            payload = load_cached_json(path)
        self.assertEqual(payload, {"elements": [{"id": 7}]})