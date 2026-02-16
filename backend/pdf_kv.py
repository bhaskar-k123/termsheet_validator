"""
PDF key-value pair extractor with version management.

Extracts structured data from PDF term sheets, tracks versions,
and computes diffs between document revisions.
"""

from __future__ import annotations

import os
import re
import shutil

import fitz  # PyMuPDF

from base_extractor import BaseVersionedExtractor
from config import FILES_DIR, METADATA_DIR, get_logger

logger = get_logger(__name__)


class PDFExtractor(BaseVersionedExtractor):
    """Extract key-value pairs from PDFs and manage versioned metadata."""

    SECTIONS = {
        "Parties Involved": ["Buyer", "Seller", "Broker"],
        "Instrument Details": ["Security Name", "Ticker Symbol", "ISIN", "Exchange"],
        "Trade Details": ["Trade Type", "Order Type", "Quantity", "Price per Share", "Total Trade Value"],
        "Settlement Details": ["Settlement Date", "Settlement Method", "Currency", "Clearing House"],
        "Fees and Costs": ["Brokerage Fee", "Exchange Fee", "Other Charges"],
    }

    def __init__(self) -> None:
        super().__init__(metadata_dir=METADATA_DIR)
        self.files_dir = FILES_DIR
        os.makedirs(self.files_dir, exist_ok=True)
        self._clear_metadata()

    def _clear_metadata(self) -> None:
        if os.path.exists(self.metadata_dir):
            shutil.rmtree(self.metadata_dir)
        os.makedirs(self.metadata_dir)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def process_new_document(self, filename: str) -> dict:
        """Process a PDF, extract data, and store a new version."""
        pdf_path = os.path.join(self.files_dir, filename)

        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"File {filename} not found in {self.files_dir}")

        extracted_pairs, trade_id = self.extract_all_kv_pairs(pdf_path, save_to_file=False)

        if not trade_id:
            raise ValueError("Could not extract Trade ID from the document")

        version_info = {
            "version": 0,  # will be set by save_version
            "timestamp": "",
            "filename": filename,
            "data": extracted_pairs,
        }

        return self.save_version(
            trade_id=trade_id,
            extracted_data=extracted_pairs,
            version_info=version_info,
            version_filename_stem=filename.replace(".pdf", ""),
        )

    # ------------------------------------------------------------------
    # PDF extraction
    # ------------------------------------------------------------------

    @staticmethod
    def extract_trade_id(text: str) -> str | None:
        match = re.search(r"Trade ID:?\s*(TRADE-[^\s]+)", text)
        return match.group(1) if match else None

    def extract_all_kv_pairs(self, pdf_path: str, save_to_file: bool = True):
        doc = fitz.open(pdf_path)
        all_kv_pairs: dict[str, str] = {}
        trade_id: str | None = None

        for page in doc:
            text = page.get_text()

            if not trade_id:
                trade_id = self.extract_trade_id(text)
                if trade_id:
                    all_kv_pairs["Trade ID"] = trade_id

            for _section, keys in self.SECTIONS.items():
                for key in keys:
                    patterns = [
                        rf"{key}:?\s*([^•\n]+)",
                        rf"[•]\s*{key}:?\s*([^•\n]+)",
                        rf"{key}\s*=\s*([^•\n]+)",
                    ]
                    for pattern in patterns:
                        match = re.search(pattern, text, re.IGNORECASE)
                        if match:
                            value = match.group(1).strip()
                            if value and len(value) > 1:
                                all_kv_pairs[key] = value
                                break

            # Additional bullet-style key-value pairs
            for key, value in re.findall(r"[•]\s*([^:]+):\s*([^•\n]+)", text):
                key, value = key.strip(), value.strip()
                if key and value and len(value) > 1 and key not in all_kv_pairs:
                    all_kv_pairs[key] = value

        doc.close()

        cleaned = self._clean_pairs(all_kv_pairs)

        if save_to_file and trade_id:
            self.save_to_json(cleaned, f"extracted_terms_{trade_id}.json")

        return cleaned, trade_id

    @staticmethod
    def _clean_pairs(pairs: dict[str, str]) -> dict[str, str]:
        cleaned: dict[str, str] = {}
        for key, value in pairs.items():
            clean_key = re.sub(r"^\d+\.\s*", "", key)
            clean_key = re.sub(r"^[•]\s*", "", clean_key).strip()

            clean_value = re.sub(r"\s+", " ", value).strip()
            clean_value = re.sub(r"\s*\d+\.\s*.*$", "", clean_value)

            if clean_key and clean_value and len(clean_value) > 1:
                cleaned[clean_key] = clean_value
        return cleaned