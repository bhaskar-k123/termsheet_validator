"""
Shared versioning logic for document/email extractors.

``PDFExtractor`` and ``EmailExtractor`` previously duplicated ~80 lines of
identical version-management code (folder creation, version numbering,
diff computation, JSON saving).  This base class centralises that logic.
"""

from __future__ import annotations

import json
import os
import shutil
from datetime import datetime
from typing import Any, Dict

from config import get_logger

logger = get_logger(__name__)


class BaseVersionedExtractor:
    """Base class providing trade-folder / version management."""

    def __init__(self, metadata_dir: str):
        self.metadata_dir = metadata_dir
        os.makedirs(self.metadata_dir, exist_ok=True)

    # ------------------------------------------------------------------
    # Directory helpers
    # ------------------------------------------------------------------

    def _get_trade_folder(self, trade_id: str) -> str:
        trade_folder = os.path.join(self.metadata_dir, trade_id)
        if not os.path.exists(trade_folder):
            os.makedirs(trade_folder)
            os.makedirs(os.path.join(trade_folder, "versions"))
        return trade_folder

    def _get_next_version(self, trade_folder: str) -> int:
        versions_folder = os.path.join(trade_folder, "versions")
        existing = [f for f in os.listdir(versions_folder) if f.startswith("v")]
        if not existing:
            return 1
        latest = max(int(v.replace("v", "").split("_")[0]) for v in existing)
        return latest + 1

    # ------------------------------------------------------------------
    # Diff computation
    # ------------------------------------------------------------------

    @staticmethod
    def compute_differences(
        existing_data: Dict[str, Any],
        new_data: Dict[str, Any],
        version: int,
        timestamp: str,
    ) -> Dict[str, Any]:
        """Compare *existing_data* to *new_data* and return a diff dict."""
        differences: Dict[str, Any] = {
            "version": version,
            "timestamp": timestamp,
            "added": {},
            "removed": {},
            "modified": {},
        }

        for key, value in existing_data.items():
            if key in new_data:
                if value != new_data[key]:
                    differences["modified"][key] = {"old": value, "new": new_data[key]}
            else:
                differences["removed"][key] = value

        for key, value in new_data.items():
            if key not in existing_data:
                differences["added"][key] = value

        return differences

    # ------------------------------------------------------------------
    # Version save
    # ------------------------------------------------------------------

    def save_version(
        self,
        trade_id: str,
        extracted_data: Dict[str, Any],
        version_info: Dict[str, Any],
        version_filename_stem: str,
    ) -> Dict[str, Any]:
        """
        Persist a new version and return a status dict.

        Parameters
        ----------
        trade_id : str
        extracted_data : dict
            The raw key-value pairs for this version.
        version_info : dict
            Full version metadata (includes ``data``, ``version``, ``timestamp``, …).
        version_filename_stem : str
            File-safe stem used for the version file (no extension).
        """
        trade_folder = self._get_trade_folder(trade_id)
        current_version = self._get_next_version(trade_folder)

        version_info["version"] = current_version
        version_info["timestamp"] = datetime.now().isoformat()

        terms_file = os.path.join(trade_folder, "extracted_terms.json")
        version_file = os.path.join(
            trade_folder,
            "versions",
            f"v{current_version}_{version_filename_stem}.json",
        )
        changes_file = os.path.join(trade_folder, "changes.json")

        if os.path.exists(terms_file):
            with open(terms_file, "r", encoding="utf-8") as fh:
                existing = json.load(fh)

            diffs = self.compute_differences(
                existing.get("data", {}),
                extracted_data,
                current_version,
                version_info["timestamp"],
            )
            self.save_to_json(diffs, changes_file)
            self.save_to_json(version_info, version_file)
            self.save_to_json(version_info, terms_file)

            logger.info("Updated to version %d for trade %s", current_version, trade_id)
            return {
                "status": "updated",
                "trade_id": trade_id,
                "version": current_version,
                "message": f"Updated to version {current_version} for Trade ID: {trade_id}",
            }

        # First version
        self.save_to_json(version_info, version_file)
        self.save_to_json(version_info, terms_file)

        logger.info("Created version %d for trade %s", current_version, trade_id)
        return {
            "status": "created",
            "trade_id": trade_id,
            "version": current_version,
            "message": f"Created version {current_version} for Trade ID: {trade_id}",
        }

    # ------------------------------------------------------------------
    # JSON persistence
    # ------------------------------------------------------------------

    @staticmethod
    def save_to_json(data: Any, output_file: str) -> None:
        with open(output_file, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=4, ensure_ascii=False)
