"""
Lightweight JSON file-based store — drop-in replacement for MongoDB.

Provides a ``JsonCollection`` class with the same API surface used
by the route modules: ``find()``, ``find_one()``, ``insert_one()``,
``update_one()``, ``delete_one()``.

Data is persisted to ``backend/data/<collection_name>.json``.
"""

from __future__ import annotations

import json
import os
import threading
import uuid
from typing import Any, Dict, List, Optional

from config import DATA_DIR, get_logger

logger = get_logger(__name__)

_lock = threading.Lock()
_collections: Dict[str, "JsonCollection"] = {}


def get_collection(name: str) -> "JsonCollection":
    """Return (or create) a named collection backed by a JSON file."""
    if name not in _collections:
        _collections[name] = JsonCollection(name)
    return _collections[name]


class JsonCollection:
    """A minimal MongoDB-like collection backed by a single JSON file."""

    def __init__(self, name: str) -> None:
        self.name = name
        self._path = os.path.join(DATA_DIR, f"{name}.json")
        os.makedirs(DATA_DIR, exist_ok=True)
        if not os.path.exists(self._path):
            self._write([])

    # ------------------------------------------------------------------
    # Internal I/O
    # ------------------------------------------------------------------

    def _read(self) -> List[Dict[str, Any]]:
        with _lock:
            try:
                with open(self._path, "r", encoding="utf-8") as fh:
                    return json.load(fh)
            except (json.JSONDecodeError, FileNotFoundError):
                return []

    def _write(self, docs: List[Dict[str, Any]]) -> None:
        with _lock:
            with open(self._path, "w", encoding="utf-8") as fh:
                json.dump(docs, fh, indent=2, ensure_ascii=False, default=str)

    # ------------------------------------------------------------------
    # Query helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _matches(doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        """Check if *doc* matches all key-value pairs in *query*."""
        for key, value in query.items():
            if doc.get(key) != value:
                return False
        return True

    # ------------------------------------------------------------------
    # Public API (MongoDB-compatible subset)
    # ------------------------------------------------------------------

    def find(self, query: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Return all documents matching *query* (or all if query is None)."""
        docs = self._read()
        if not query:
            return docs
        return [d for d in docs if self._matches(d, query)]

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Return the first document matching *query*, or None."""
        for doc in self._read():
            if self._matches(doc, query):
                return doc
        return None

    def insert_one(self, document: Dict[str, Any]) -> "_InsertResult":
        """Insert a document, auto-generating an ``_id`` if missing."""
        if "_id" not in document:
            document["_id"] = uuid.uuid4().hex
        docs = self._read()
        docs.append(document)
        self._write(docs)
        logger.debug("Inserted document %s into %s", document["_id"], self.name)
        return _InsertResult(document["_id"])

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> "_UpdateResult":
        """Update the first document matching *query*."""
        docs = self._read()
        matched = 0
        modified = 0
        set_data = update.get("$set", update)

        for doc in docs:
            if self._matches(doc, query):
                matched = 1
                doc.update(set_data)
                modified = 1
                break

        if modified:
            self._write(docs)
        return _UpdateResult(matched, modified)

    def delete_one(self, query: Dict[str, Any]) -> "_DeleteResult":
        """Delete the first document matching *query*."""
        docs = self._read()
        for i, doc in enumerate(docs):
            if self._matches(doc, query):
                docs.pop(i)
                self._write(docs)
                return _DeleteResult(1)
        return _DeleteResult(0)


# ------------------------------------------------------------------
# Result wrappers (mimic pymongo result objects)
# ------------------------------------------------------------------

class _InsertResult:
    def __init__(self, inserted_id: str) -> None:
        self.inserted_id = inserted_id
        self.acknowledged = True


class _UpdateResult:
    def __init__(self, matched_count: int, modified_count: int) -> None:
        self.matched_count = matched_count
        self.modified_count = modified_count


class _DeleteResult:
    def __init__(self, deleted_count: int) -> None:
        self.deleted_count = deleted_count
