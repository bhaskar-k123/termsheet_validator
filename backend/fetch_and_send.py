"""
Email PDF attachment fetcher.

Fetches unread emails from one or more IMAP accounts, downloads PDF
attachments, and forwards them to the Flask upload endpoint.

Supports multiple email configurations via ``fetch_pdfs_from_account``.
"""

from __future__ import annotations

import os

import requests
from imap_tools import AND, MailBox

from config import (
    DOWNLOAD_DIR,
    EMAIL_ADDRESS,
    EMAIL_PASSWORD,
    FILES_DIR,
    FLASK_SERVER_URL,
    IMAP_SERVER,
    IMAP_SERVER_2,
    OUTLOOK_EMAIL,
    OUTLOOK_PASSWORD,
    get_logger,
)

logger = get_logger(__name__)

os.makedirs(FILES_DIR, exist_ok=True)
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


def send_to_flask(file_path: str, upload_url: str = FLASK_SERVER_URL) -> None:
    """Upload a PDF file to the Flask server."""
    try:
        with open(file_path, "rb") as fh:
            files = {"file": (os.path.basename(file_path), fh, "application/pdf")}
            response = requests.post(upload_url, files=files, timeout=60)
        logger.info("Sent %s → %d", file_path, response.status_code)
    except requests.RequestException:
        logger.exception("Failed to send %s", file_path)


def fetch_pdfs_from_account(
    email: str | None,
    password: str | None,
    imap_server: str | None,
    download_dir: str = FILES_DIR,
    upload_url: str = FLASK_SERVER_URL,
) -> None:
    """Fetch PDF attachments from a single IMAP account."""
    if not all([email, password, imap_server]):
        logger.warning("Skipping account — missing email/password/IMAP config")
        return

    logger.info("Fetching PDFs from %s...", email)
    try:
        with MailBox(imap_server).login(email, password, "INBOX") as mailbox:
            for msg in mailbox.fetch(AND(seen=False)):
                for att in msg.attachments:
                    if att.filename and att.filename.lower().endswith(".pdf"):
                        filepath = os.path.join(download_dir, att.filename)
                        with open(filepath, "wb") as fh:
                            fh.write(att.payload)
                        logger.info("Downloaded: %s", att.filename)
                        send_to_flask(filepath, upload_url)
    except Exception:
        logger.exception("Error fetching PDFs from %s", email)


def fetch_and_send_pdfs() -> None:
    """Fetch PDFs from the primary email account."""
    fetch_pdfs_from_account(EMAIL_ADDRESS, EMAIL_PASSWORD, IMAP_SERVER)


def fetch_and_send_pdfs_outlook() -> None:
    """Fetch PDFs from the Outlook email account."""
    fetch_pdfs_from_account(
        OUTLOOK_EMAIL,
        OUTLOOK_PASSWORD,
        IMAP_SERVER_2,
        download_dir=DOWNLOAD_DIR,
    )
