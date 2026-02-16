"""
Email-based term sheet extractor with version management.

Fetches unread emails via IMAP, extracts key-value pairs from
termsheet-related messages, and manages versioned metadata.
"""

from __future__ import annotations

import os
import re
from datetime import datetime
from typing import Any, Dict

import requests
from imap_tools import AND, MailBox

from base_extractor import BaseVersionedExtractor
from config import (
    EMAIL_ADDRESS,
    EMAIL_METADATA_DIR,
    EMAIL_PASSWORD,
    FLASK_TEXT_UPLOAD_URL,
    IMAP_SERVER,
    get_logger,
)

logger = get_logger(__name__)


class EmailExtractor(BaseVersionedExtractor):
    """Extract key-value pairs from emails and manage versioned metadata."""

    def __init__(self) -> None:
        super().__init__(metadata_dir=EMAIL_METADATA_DIR)

    def extract_trade_id(self, key_value_pairs: Dict[str, Any], subject: str) -> str:
        """Extract trade ID from data or generate a timestamp-based fallback."""
        for key, value in key_value_pairs.items():
            if "trade" in key.lower() and "id" in key.lower():
                return str(value)

        match = re.search(r"(TRADE-[^\s]+)", subject)
        if match:
            return match.group(1)

        return f"EMAIL-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    def process_email_data(self, subject: str, key_value_pairs: Dict[str, Any]) -> Dict[str, Any]:
        """Process an email's KV pairs and store a new version."""
        trade_id = self.extract_trade_id(key_value_pairs, subject)

        version_info = {
            "version": 0,  # will be set by save_version
            "timestamp": "",
            "subject": subject,
            "data": key_value_pairs,
        }

        return self.save_version(
            trade_id=trade_id,
            extracted_data=key_value_pairs,
            version_info=version_info,
            version_filename_stem=subject.replace(" ", "_"),
        )


# ---------------------------------------------------------------------------
# Email text processing
# ---------------------------------------------------------------------------

def clean_and_extract_relevant_text(body_text: str) -> str:
    """Extract only the termsheet-relevant block from an email body."""
    # Remove quoted reply text
    body_text = re.sub(r"(?<=\n)[>].*", "", body_text)
    body_text = re.sub(r"(?<=\n)--.*", "", body_text)

    # Find termsheet content start
    ts_start = re.search(
        r"(termsheet details|termsheet|key highlights|below are.*details)",
        body_text,
        re.IGNORECASE,
    )
    start_idx = ts_start.end() if ts_start else 0

    body_text = body_text[start_idx:]
    body_text = re.split(
        r"(thank you|thanks|regards|warm regards|best regards|sincerely)",
        body_text,
        flags=re.IGNORECASE,
    )[0]

    return body_text.strip()


def extract_key_value_pairs(text: str) -> Dict[str, str]:
    """Parse simple key:value or key-value lines from cleaned email text."""
    pairs: Dict[str, str] = {}
    for line in text.split("\n"):
        line = line.strip()
        if ":" in line:
            key, value = line.split(":", 1)
        elif "-" in line:
            key, value = line.split("-", 1)
        else:
            continue
        key, value = key.strip(), value.strip()
        if key and value:
            pairs[key] = value
    return pairs


def send_text_to_flask(subject: str, key_value_pairs: Dict[str, str], processing_result: Dict[str, Any]) -> None:
    """Forward extracted data to the Flask upload endpoint."""
    data = {
        "subject": subject,
        "key_value_pairs": key_value_pairs,
        "processing_info": processing_result,
    }
    try:
        response = requests.post(FLASK_TEXT_UPLOAD_URL, json=data, timeout=30)
        logger.info("Sent text for '%s' → %d", subject, response.status_code)
    except requests.RequestException:
        logger.exception("Failed to send text for '%s'", subject)


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def fetch_and_process_emails() -> None:
    """Fetch unread termsheet emails and process them."""
    extractor = EmailExtractor()
    logger.info("Fetching emails...")

    try:
        with MailBox(IMAP_SERVER).login(EMAIL_ADDRESS, EMAIL_PASSWORD, "INBOX") as mailbox:
            for msg in mailbox.fetch(AND(seen=False)):
                if msg.attachments:
                    continue

                subject = msg.subject or ""
                if "termsheet" not in subject.lower():
                    logger.debug("Skipping email (no 'termsheet' in subject): %s", subject)
                    continue

                body = msg.text or ""
                clean_text = clean_and_extract_relevant_text(body)
                kv_pairs = extract_key_value_pairs(clean_text)

                if not kv_pairs:
                    logger.info("No key-value pairs found in email: %s", subject)
                    continue

                result = extractor.process_email_data(subject, kv_pairs)
                send_text_to_flask(subject, kv_pairs, result)
                logger.info("%s: %s", result["status"].capitalize(), result["message"])
    except Exception:
        logger.exception("Error fetching/processing emails")