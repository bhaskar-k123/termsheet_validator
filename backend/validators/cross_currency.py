"""
Cross-Currency Swap validator.

Uses shared utilities from ``base_validator`` and adds currency-specific
validations (notional consistency, principal exchange, leg rate types).
"""

from __future__ import annotations

from typing import Any, Dict, List

from config import SHEET_CROSS_CURRENCY, get_logger
from validators.base_validator import (
    compare_economic_factors,
    extract_trade_id_field,
    load_reference_swap,
)

logger = get_logger(__name__)

ECONOMIC_FIELDS = [
    "base_currency",
    "quote_currency",
    "base_notional_amount",
    "quote_notional_amount",
    "principal_exchange_initial",
    "principal_exchange_final",
    "amortization_schedule",
    "base_leg_rate_type",
    "quote_leg_rate_type",
    "base_leg_fixed_rate",
    "quote_leg_fixed_rate",
    "base_leg_floating_index",
    "quote_leg_floating_index",
    "basis_spread",
    "base_payment_frequency",
    "quote_payment_frequency",
    "fx_spot_rate",
    "base_holiday_calendar",
    "quote_holiday_calendar",
    "collateral_agreement",
    "effective_date",
    "maturity_date",
]

HIGH_SEVERITY_FIELDS = [
    "base_currency",
    "quote_currency",
    "base_notional_amount",
    "quote_notional_amount",
    "fx_spot_rate",
    "effective_date",
    "maturity_date",
]


# ---------------------------------------------------------------------------
# Domain-specific validations
# ---------------------------------------------------------------------------

def validate_currency_notionals(current_swap: Dict[str, Any], fx_tolerance: float = 0.0001) -> List[Dict[str, Any]]:
    """Validate that notional amounts are consistent with the FX spot rate."""
    try:
        base_notional = float(current_swap.get("base_notional_amount", 0))
        quote_notional = float(current_swap.get("quote_notional_amount", 0))
        fx_rate = float(current_swap.get("fx_spot_rate", 0))

        if base_notional <= 0 or quote_notional <= 0 or fx_rate <= 0:
            return [{
                "field": "notional_amounts",
                "issue": "Invalid notional amounts or FX rate (must be positive)",
                "severity": "high",
            }]

        expected_quote = base_notional * fx_rate
        relative_diff = abs(expected_quote - quote_notional) / quote_notional

        if relative_diff > fx_tolerance:
            return [{
                "field": "notional_amounts",
                "current_value": f"Base: {base_notional}, Quote: {quote_notional}, FX: {fx_rate}",
                "expected_value": f"Expected Quote Notional: {expected_quote}",
                "issue": "Notional amounts inconsistent with FX spot rate",
                "severity": "high",
            }]

        return []
    except (ValueError, TypeError, ZeroDivisionError) as exc:
        return [{
            "field": "notional_amounts",
            "issue": f"Error validating notional amounts: {exc}",
            "severity": "high",
        }]


def validate_principal_exchange_consistency(current_swap: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Validate that principal exchange flags are consistent with amortization."""
    has_amortization = current_swap.get("amortization_schedule", "").strip().lower() not in ["", "none", "bullet"]
    initial_exchange = str(current_swap.get("principal_exchange_initial", "")).strip().lower() == "true"
    final_exchange = str(current_swap.get("principal_exchange_final", "")).strip().lower() == "true"

    anomalies: List[Dict[str, Any]] = []

    if has_amortization and not initial_exchange:
        anomalies.append({
            "field": "principal_exchange_initial",
            "current_value": str(current_swap.get("principal_exchange_initial", "")),
            "issue": "Amortizing swap should have initial principal exchange",
            "severity": "medium",
        })

    if has_amortization and not final_exchange:
        anomalies.append({
            "field": "principal_exchange_final",
            "current_value": str(current_swap.get("principal_exchange_final", "")),
            "issue": "Amortizing swap should have final principal exchange",
            "severity": "medium",
        })

    return anomalies


def validate_leg_rate_types(current_swap: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Validate that rate types are properly specified for both legs."""
    anomalies: List[Dict[str, Any]] = []

    for prefix, label in [("base_leg", "Base leg"), ("quote_leg", "Quote leg")]:
        rate_type = str(current_swap.get(f"{prefix}_rate_type", "")).strip().lower()
        if rate_type == "fixed":
            if not current_swap.get(f"{prefix}_fixed_rate"):
                anomalies.append({
                    "field": f"{prefix}_fixed_rate",
                    "issue": f"{label} is fixed but no fixed rate specified",
                    "severity": "high",
                })
        elif rate_type == "floating":
            if not current_swap.get(f"{prefix}_floating_index"):
                anomalies.append({
                    "field": f"{prefix}_floating_index",
                    "issue": f"{label} is floating but no floating index specified",
                    "severity": "high",
                })
        elif rate_type:
            anomalies.append({
                "field": f"{prefix}_rate_type",
                "current_value": rate_type,
                "issue": f"Invalid {label.lower()} rate type (should be 'fixed' or 'floating')",
                "severity": "high",
            })

    return anomalies


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def validate_currency_swap_against_risk_file(current_swap: Dict[str, Any]):
    """Validate a Cross-Currency Swap. Returns ``(result_dict, http_status)``."""
    tid_field = extract_trade_id_field(current_swap)
    if tid_field is None:
        return {"error": "tradeId is required"}, 400

    trade_id = current_swap.get(tid_field)
    if not trade_id:
        return {"error": "tradeId is required"}, 400

    logger.info("Validating currency swap with tradeId: %s", trade_id)

    # Internal validations
    notional_anomalies = validate_currency_notionals(current_swap)

    # Reference comparison
    reference_swap = load_reference_swap(trade_id, sheet_name=SHEET_CROSS_CURRENCY)

    if reference_swap is None:
        msg = f"No reference currency swap found in risk file for tradeId {trade_id}."
        if notional_anomalies:
            return {"valid": False, "anomalies": notional_anomalies, "message": msg + " Internal validation also found issues."}, 404
        return {"valid": False, "message": msg}, 404

    economic_anomalies = compare_economic_factors(
        current_swap, reference_swap, ECONOMIC_FIELDS, HIGH_SEVERITY_FIELDS
    )

    all_anomalies = notional_anomalies + economic_anomalies
    if all_anomalies:
        return {"valid": False, "anomalies": all_anomalies, "message": "Currency swap validation found issues"}, 200

    return {"valid": True, "message": "Currency swap matches reference swap in risk file on all economic factors"}, 200