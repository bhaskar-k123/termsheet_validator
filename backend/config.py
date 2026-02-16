"""
Centralized configuration for the Termsheet Validator backend.

All constants, directory paths, and environment-driven settings live here.
Import from this module instead of hardcoding values in individual files.
"""

import os
import logging
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"

logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO), format=LOG_FORMAT)

def get_logger(name: str) -> logging.Logger:
    """Return a named logger configured with the application log level."""
    return logging.getLogger(name)

# ---------------------------------------------------------------------------
# Paths  (resolve relative to the backend/ directory)
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", str(BASE_DIR / "uploads"))
TEXT_FOLDER = os.getenv("TEXT_FOLDER", str(BASE_DIR / "texts"))
FILES_DIR = os.getenv("FILES_DIR", str(BASE_DIR / "files"))
METADATA_DIR = os.getenv("METADATA_DIR", str(BASE_DIR / "metadata"))
EMAIL_METADATA_DIR = os.getenv("EMAIL_METADATA_DIR", str(BASE_DIR / "email_metadata"))
DOWNLOAD_DIR = os.getenv("DOWNLOAD_DIR", str(BASE_DIR / "downloads"))

# Risk system file — used by all validators
RISK_FILE = os.getenv("RISK_FILE", str(BASE_DIR / "risk_system.xlsx"))

# Validator Excel sheet names
SHEET_IRS = "interest_risk_swap"
SHEET_AMORTISED = "amortized_schedule_swap"
SHEET_CROSS_CURRENCY = "currency_risk_swap"

# ---------------------------------------------------------------------------
# MongoDB
# ---------------------------------------------------------------------------
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "mydatabase")

# ---------------------------------------------------------------------------
# External API keys
# ---------------------------------------------------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# ---------------------------------------------------------------------------
# Email (IMAP)
# ---------------------------------------------------------------------------
EMAIL_ADDRESS = os.getenv("EMAIL")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
IMAP_SERVER = os.getenv("IMAP_SERVER")

OUTLOOK_EMAIL = os.getenv("OUTLOOK_EMAIL")
OUTLOOK_PASSWORD = os.getenv("OUTLOOK_PASSWORD")
IMAP_SERVER_2 = os.getenv("IMAP_SERVER2")

# ---------------------------------------------------------------------------
# Flask upload URLs
# ---------------------------------------------------------------------------
FLASK_SERVER_URL = os.getenv("FLASK_SERVER_URL", "http://localhost:5000/upload")
FLASK_TEXT_UPLOAD_URL = os.getenv("FLASK_TEXT_UPLOAD_URL", "http://localhost:5000/upload_text")

# ---------------------------------------------------------------------------
# Scheduler
# ---------------------------------------------------------------------------
SCHEDULER_INTERVAL_MINUTES = int(os.getenv("SCHEDULER_INTERVAL_MINUTES", "5"))
