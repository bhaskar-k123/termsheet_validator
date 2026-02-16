"""
MongoDB connection module.

Provides a lazily-initialized database handle via ``get_db()``.
On first call the connection is established; subsequent calls return the
cached reference.  Module-level import ``db = get_db()`` is available for
backward compatibility with existing route modules.
"""

from pymongo import MongoClient
from config import MONGODB_URI, DATABASE_NAME, get_logger

logger = get_logger(__name__)

_client: MongoClient | None = None
_db = None


def get_db():
    """Return the MongoDB database handle, connecting on first call."""
    global _client, _db
    if _db is not None:
        return _db

    try:
        _client = MongoClient(MONGODB_URI)
        _db = _client[DATABASE_NAME]
        logger.info("Connected to MongoDB database '%s'", DATABASE_NAME)
        return _db
    except Exception:
        logger.exception("Failed to connect to MongoDB")
        raise


# Convenience alias so existing ``from db import db`` still works.
db = get_db()