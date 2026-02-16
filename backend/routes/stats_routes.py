"""
Trader statistics routes.
"""

from flask import Blueprint, jsonify, request

from config import get_logger
from json_store import get_collection

logger = get_logger(__name__)

termsheet_collection = get_collection("termsheets")
stats_bp = Blueprint("stats_bp", __name__)


@stats_bp.route("/trader_stats", methods=["GET"])
def trader_statistics():
    """Return validation statistics for a specific trader."""
    try:
        trader_email = request.args.get("email")
        if not trader_email:
            return jsonify({"error": "Trader email is required"}), 400

        trader_termsheets = list(termsheet_collection.find({"traderId": trader_email}))
        total_documents = len(trader_termsheets)

        fully_validated_count = 0
        total_unvalidated_fields = 0

        for sheet in trader_termsheets:
            validated = True
            for value in sheet.values():
                if isinstance(value, dict) and "validated" in value:
                    if not value["validated"]:
                        validated = False
                        total_unvalidated_fields += 1
            if validated:
                fully_validated_count += 1

        validation_rate = (fully_validated_count * 100.0 / total_documents) if total_documents else 0

        return jsonify({
            "total_documents": total_documents,
            "validation_rate": round(validation_rate, 2),
            "total_unvalidated_fields": total_unvalidated_fields,
        }), 200

    except Exception as exc:
        logger.exception("Error computing trader statistics")
        return jsonify({"error": str(exc)}), 500
