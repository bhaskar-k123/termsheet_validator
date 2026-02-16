"""
Batch processor for PDF files in the files directory.
"""

from __future__ import annotations

import os

from config import FILES_DIR, get_logger
from pdf_kv import PDFExtractor

logger = get_logger(__name__)


def process_pdf_files() -> None:
    """Find all PDFs in the files directory and process them."""
    try:
        extractor = PDFExtractor()

        if not os.path.exists(FILES_DIR):
            logger.error("Files directory not found: %s", FILES_DIR)
            return

        pdf_files = [f for f in os.listdir(FILES_DIR) if f.lower().endswith(".pdf")]

        if not pdf_files:
            logger.info("No PDF files found in %s", FILES_DIR)
            return

        logger.info("Found %d PDF files to process.", len(pdf_files))

        for filename in pdf_files:
            try:
                logger.info("Processing %s...", filename)
                result = extractor.process_new_document(filename)
                logger.info(
                    "[OK] %s — saved in metadata/%s/ (version %s)",
                    result["message"],
                    result["trade_id"],
                    result["version"],
                )
                if result["status"] == "updated":
                    logger.info("Changes file created with modifications")
            except Exception:
                logger.exception("Error processing %s", filename)
                continue

        logger.info("All files processed successfully!")

    except Exception:
        logger.exception("Error during PDF batch processing")