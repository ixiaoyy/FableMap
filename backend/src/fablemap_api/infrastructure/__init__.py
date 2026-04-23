"""Infrastructure adapters and runtime settings.

SQLAlchemy-backed storage is optional at import time.  Keep this package
initializer lightweight so the default JSON-store application can start in a
fresh environment without MySQL/SQLAlchemy dependencies installed.
"""

from __future__ import annotations

from importlib import import_module
from typing import Any

from .settings import ApiSettings

__all__ = [
    "ApiSettings",
    "Database",
    "Base",
    "create_database_from_settings",
    "TavernModel",
    "CharacterModel",
    "WorldInfoModel",
    "VisitorModel",
    "ChatMessageModel",
    "MemoryAtomModel",
    "GameplaySessionModel",
    "LLMConfigModel",
    "MySQLTavernStore",
    "create_mysql_tables",
]

_DATABASE_EXPORTS = {"Database", "Base", "create_database_from_settings"}
_MODEL_EXPORTS = {
    "TavernModel",
    "CharacterModel",
    "WorldInfoModel",
    "VisitorModel",
    "ChatMessageModel",
    "MemoryAtomModel",
    "GameplaySessionModel",
    "LLMConfigModel",
}
_MYSQL_STORE_EXPORTS = {"MySQLTavernStore", "create_mysql_tables"}


def __getattr__(name: str) -> Any:
    if name in _DATABASE_EXPORTS:
        module = import_module(f"{__name__}.database")
        return getattr(module, name)
    if name in _MODEL_EXPORTS:
        module = import_module(f"{__name__}.models")
        return getattr(module, name)
    if name in _MYSQL_STORE_EXPORTS:
        module = import_module(f"{__name__}.mysql_store")
        return getattr(module, name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
