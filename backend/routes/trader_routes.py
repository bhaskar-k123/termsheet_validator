"""
Trader CRUD routes.
"""

from flask import Blueprint, jsonify, request
from bson import ObjectId

from config import get_logger
from db import db

logger = get_logger(__name__)

trader_collection = db["traders"]
trader_bp = Blueprint("trader_bp", __name__)


@trader_bp.route("/traders", methods=["POST"])
def create_trader():
    """Create a new trader (rejects duplicate emails)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        if trader_collection.find_one({"email": data.get("email")}):
            return jsonify({"error": "Trader with this email already exists"}), 400

        result = trader_collection.insert_one(data)
        return jsonify({
            "message": "Trader created successfully!",
            "trader_id": str(result.inserted_id),
        }), 201
    except Exception as exc:
        logger.exception("Error creating trader")
        return jsonify({"error": str(exc)}), 500


@trader_bp.route("/traders", methods=["GET"])
def get_all_traders():
    """Return all traders."""
    try:
        traders = list(trader_collection.find())
        for t in traders:
            t["_id"] = str(t["_id"])
        return jsonify(traders), 200
    except Exception as exc:
        logger.exception("Error fetching traders")
        return jsonify({"error": str(exc)}), 500


@trader_bp.route("/trader/<trader_id>", methods=["GET"])
def get_trader(trader_id):
    """Return a single trader by ID."""
    try:
        trader = trader_collection.find_one({"_id": ObjectId(trader_id)})
        if not trader:
            return jsonify({"error": "Trader not found"}), 404
        trader["_id"] = str(trader["_id"])
        return jsonify(trader), 200
    except Exception as exc:
        logger.exception("Error fetching trader %s", trader_id)
        return jsonify({"error": str(exc)}), 500


@trader_bp.route("/trader/<trader_id>", methods=["PUT"])
def update_trader(trader_id):
    """Update a trader by ID."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        result = trader_collection.update_one(
            {"_id": ObjectId(trader_id)},
            {"$set": data},
        )
        if result.matched_count == 0:
            return jsonify({"error": "Trader not found"}), 404
        return jsonify({"message": "Trader updated successfully!"}), 200
    except Exception as exc:
        logger.exception("Error updating trader %s", trader_id)
        return jsonify({"error": str(exc)}), 500


@trader_bp.route("/trader/<trader_id>", methods=["DELETE"])
def delete_trader(trader_id):
    """Delete a trader by ID."""
    try:
        result = trader_collection.delete_one({"_id": ObjectId(trader_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Trader not found"}), 404
        return jsonify({"message": "Trader deleted successfully!"}), 200
    except Exception as exc:
        logger.exception("Error deleting trader %s", trader_id)
        return jsonify({"error": str(exc)}), 500
