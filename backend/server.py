"""
Termsheet Validator — Flask application entry point.

Registers blueprints, sets up scheduled jobs, and configures upload routes.
"""

from __future__ import annotations

import json
import os

from flask import Flask, jsonify, request
from flask_apscheduler import APScheduler
from flask_cors import CORS

from config import (
    SCHEDULER_INTERVAL_MINUTES,
    TEXT_FOLDER,
    UPLOAD_FOLDER,
    get_logger,
)

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Ensure directories exist
# ---------------------------------------------------------------------------
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEXT_FOLDER, exist_ok=True)

# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------


class _SchedulerConfig:
    SCHEDULER_API_ENABLED = True


app = Flask(__name__)
app.config.from_object(_SchedulerConfig())
CORS(app)

# ---------------------------------------------------------------------------
# Scheduler
# ---------------------------------------------------------------------------
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()


@scheduler.task("interval", id="fetch_and_send_pdfs", minutes=SCHEDULER_INTERVAL_MINUTES)
def _scheduled_fetch_pdfs():
    from fetch_and_send import fetch_and_send_pdfs

    fetch_and_send_pdfs()


@scheduler.task("interval", id="fetch_and_process_emails", minutes=SCHEDULER_INTERVAL_MINUTES)
def _scheduled_fetch_emails():
    from fetch_and_send_text import fetch_and_process_emails

    fetch_and_process_emails()


@scheduler.task("interval", id="process_pdf_files", minutes=SCHEDULER_INTERVAL_MINUTES)
def _scheduled_process_pdfs():
    from main import process_pdf_files

    process_pdf_files()


# ---------------------------------------------------------------------------
# Blueprints
# ---------------------------------------------------------------------------
from routes.termsheet_routes import termsheet_bp  # noqa: E402
from routes.trader_routes import trader_bp  # noqa: E402
from routes.stats_routes import stats_bp  # noqa: E402

app.register_blueprint(termsheet_bp)
app.register_blueprint(trader_bp)
app.register_blueprint(stats_bp)

# ---------------------------------------------------------------------------
# Upload routes
# ---------------------------------------------------------------------------


@app.route("/upload", methods=["POST"])
def upload_file():
    """Accept a PDF file upload and save to the uploads directory."""
    file = request.files.get("file")
    if not file or not file.filename or not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Invalid or no PDF uploaded"}), 400

    save_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(save_path)
    logger.info("Saved uploaded file: %s", save_path)

    return jsonify({"message": "File received and saved"}), 200


@app.route("/upload_text", methods=["POST"])
def upload_text():
    """Accept termsheet text data (subject + key-value pairs) as JSON."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    subject = data.get("subject")
    key_value_pairs = data.get("key_value_pairs")

    if not subject or not key_value_pairs:
        return jsonify({"error": "Both 'subject' and 'key_value_pairs' are required"}), 400

    safe_subject = "".join(c if c.isalnum() or c in (" ", "-", "_") else "_" for c in subject)
    save_path = os.path.join(TEXT_FOLDER, f"{safe_subject}.json")

    with open(save_path, "w") as fh:
        json.dump(key_value_pairs, fh, indent=4)

    logger.info("Saved text key-values for: %s", subject)
    return jsonify({"message": "Text data received and saved"}), 200


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
