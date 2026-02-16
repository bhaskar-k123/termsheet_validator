"""
Termsheet CRUD and validation routes.
"""

from flask import Blueprint, jsonify, request

from config import get_logger
from json_store import get_collection
from validators.swap_validator import validate_swap_against_risk_file

logger = get_logger(__name__)

termsheet_collection = get_collection("termsheets")
termsheet_bp = Blueprint("termsheet_bp", __name__)


@termsheet_bp.route("/add_termsheet", methods=["POST"])
def add_termsheet():
    """Insert a new termsheet document."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        result = termsheet_collection.insert_one(data)
        return jsonify({
            "message": "Termsheet added successfully!",
            "termsheet_id": str(result.inserted_id),
        }), 201
    except Exception as exc:
        logger.exception("Error adding termsheet")
        return jsonify({"error": str(exc)}), 500


@termsheet_bp.route("/termsheets", methods=["GET"])
def get_all_termsheets():
    """Return all termsheets."""
    try:
        termsheets = list(termsheet_collection.find())
        for ts in termsheets:
            ts["_id"] = str(ts["_id"])
        return jsonify(termsheets), 200
    except Exception as exc:
        logger.exception("Error fetching termsheets")
        return jsonify({"error": str(exc)}), 500


@termsheet_bp.route("/validate_swap", methods=["POST"])
def validate_swap():
    """Validate an Interest Rate Swap against the risk system."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        result, status = validate_swap_against_risk_file(data)
        return jsonify(result), status
    except Exception as exc:
        logger.exception("Error validating swap")
        return jsonify({"error": str(exc)}), 500