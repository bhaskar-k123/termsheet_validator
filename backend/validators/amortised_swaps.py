"""
Amortised Schedule Swap validator.

Uses shared utilities from ``base_validator`` for reference data lookup and
adds amortisation-specific validations (schedule consistency, rate specs,
payment adjustment rules).
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List

from config import SHEET_AMORTISED, get_logger
from validators.base_validator import (
    compare_economic_factors,
    extract_trade_id_field,
    load_reference_swap,
)

logger = get_logger(__name__)

ECONOMIC_FIELDS = [
    "amortization_profile",
    "initial_notional",
    "reduction_dates",
    "reduction_amounts",
    "fixed_rate",
    "floating_rate",
    "rate_type",
    "reference_rate",
    "payment_adjustment_rule",
    "residual_notional",
    "effective_date",
    "maturity_date",
    "payment_frequency",
    "day_count_convention",
    "reset_frequency",
    "spread",
]

HIGH_SEVERITY_FIELDS = [
    "amortization_profile",
    "initial_notional",
    "reduction_dates",
    "reduction_amounts",
    "effective_date",
    "maturity_date",
]


# ---------------------------------------------------------------------------
# Amortised-specific comparison override
# ---------------------------------------------------------------------------

def _compare_amortised_economic_factors(
    current_swap: Dict[str, Any],
    reference_swap: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """Compare economic factors with special handling for JSON-array fields."""
    anomalies: List[Dict[str, Any]] = []
    json_fields = {"reduction_dates", "reduction_amounts"}

    for field in ECONOMIC_FIELDS:
        cur_key = _ci_key(current_swap, field)
        ref_key = _ci_key(reference_swap, field)

        if field in json_fields:
            cur_val = _maybe_parse_json(current_swap.get(cur_key, ""))
            ref_val = _maybe_parse_json(reference_swap.get(ref_key, ""))

            if isinstance(cur_val, (list, dict)) and isinstance(ref_val, (list, dict)):
                cur_str = json.dumps(cur_val, sort_keys=True)
                ref_str = json.dumps(ref_val, sort_keys=True)
            else:
                cur_str = str(cur_val).strip()
                ref_str = str(ref_val).strip()
        else:
            cur_str = str(current_swap.get(cur_key, "")).strip()
            ref_str = str(reference_swap.get(ref_key, "")).strip()

        if cur_str != ref_str:
            severity = "high" if field in HIGH_SEVERITY_FIELDS else "medium"
            anomalies.append({
                "field": field,
                "current_value": cur_str,
                "reference_value": ref_str,
                "issue": f"Mismatch in {field}",
                "severity": severity,
            })

    return anomalies


def _ci_key(data: Dict[str, Any], target: str) -> str:
    for k in data:
        if k.lower() == target.lower():
            return k
    return target


def _maybe_parse_json(val: Any) -> Any:
    if isinstance(val, str) and val.startswith(("[", "{")):
        try:
            return json.loads(val)
        except (json.JSONDecodeError, ValueError):
            pass
    return val


# ---------------------------------------------------------------------------
# Domain-specific validations
# ---------------------------------------------------------------------------

def validate_amortization_schedule(current_swap: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Validate that the amortization schedule is internally consistent."""
    anomalies: List[Dict[str, Any]] = []
    profile = str(current_swap.get("amortization_profile", "")).strip().lower()

    # Initial notional
    try:
        initial_notional = float(current_swap.get("initial_notional", 0))
        if initial_notional <= 0:
            anomalies.append({
                "field": "initial_notional",
                "current_value": str(initial_notional),
                "issue": "Initial notional must be positive",
                "severity": "high",
            })
    except (ValueError, TypeError):
        anomalies.append({
            "field": "initial_notional",
            "current_value": str(current_swap.get("initial_notional", "")),
            "issue": "Invalid initial notional format",
            "severity": "high",
        })
        initial_notional = 0

    # Residual notional
    if "residual_notional" in current_swap:
        try:
            residual = float(current_swap.get("residual_notional", 0))
            if residual < 0:
                anomalies.append({
                    "field": "residual_notional",
                    "current_value": str(residual),
                    "issue": "Residual notional cannot be negative",
                    "severity": "high",
                })
            if residual > initial_notional:
                anomalies.append({
                    "field": "residual_notional",
                    "current_value": str(residual),
                    "reference_value": str(initial_notional),
                    "issue": "Residual notional cannot be greater than initial notional",
                    "severity": "high",
                })
        except (ValueError, TypeError):
            anomalies.append({
                "field": "residual_notional",
                "current_value": str(current_swap.get("residual_notional", "")),
                "issue": "Invalid residual notional format",
                "severity": "high",
            })

    # Custom schedule checks
    if profile in ("custom", "custom schedule"):
        anomalies.extend(_validate_custom_schedule(current_swap, initial_notional))
    elif profile == "linear":
        if not current_swap.get("payment_frequency"):
            anomalies.append({
                "field": "payment_frequency",
                "issue": "Payment frequency required for linear amortization",
                "severity": "medium",
            })

    return anomalies


def _validate_custom_schedule(current_swap: Dict[str, Any], initial_notional: float) -> List[Dict[str, Any]]:
    """Validate reduction dates/amounts for custom amortization schedules."""
    anomalies: List[Dict[str, Any]] = []

    reduction_dates = _maybe_parse_json(current_swap.get("reduction_dates", []))
    reduction_amounts = _maybe_parse_json(current_swap.get("reduction_amounts", []))

    if not isinstance(reduction_dates, list):
        anomalies.append({"field": "reduction_dates", "current_value": str(reduction_dates), "issue": "Reduction dates must be a list", "severity": "high"})
        reduction_dates = []

    if not isinstance(reduction_amounts, list):
        anomalies.append({"field": "reduction_amounts", "current_value": str(reduction_amounts), "issue": "Reduction amounts must be a list", "severity": "high"})
        reduction_amounts = []

    if len(reduction_dates) != len(reduction_amounts):
        anomalies.append({
            "field": "amortization_schedule",
            "current_value": f"Dates: {len(reduction_dates)}, Amounts: {len(reduction_amounts)}",
            "issue": "Reduction dates and amounts must have the same length",
            "severity": "high",
        })

    # Chronological order
    if isinstance(reduction_dates, list) and len(reduction_dates) > 1:
        try:
            dates = [datetime.strptime(d, "%Y-%m-%d") if isinstance(d, str) else d for d in reduction_dates]
            if not all(dates[i] < dates[i + 1] for i in range(len(dates) - 1)):
                anomalies.append({"field": "reduction_dates", "current_value": str(reduction_dates), "issue": "Reduction dates must be in chronological order", "severity": "high"})
        except (ValueError, TypeError):
            anomalies.append({"field": "reduction_dates", "current_value": str(reduction_dates), "issue": "Invalid date format in reduction dates", "severity": "high"})

    # Positive amounts
    if isinstance(reduction_amounts, list):
        try:
            if not all(float(a) > 0 for a in reduction_amounts):
                anomalies.append({"field": "reduction_amounts", "current_value": str(reduction_amounts), "issue": "All reduction amounts must be positive", "severity": "high"})
        except (ValueError, TypeError):
            anomalies.append({"field": "reduction_amounts", "current_value": str(reduction_amounts), "issue": "Invalid amount format in reduction amounts", "severity": "high"})

    # Total reduction vs initial notional
    if isinstance(reduction_amounts, list) and initial_notional > 0:
        try:
            total = sum(float(a) for a in reduction_amounts)
            if total > initial_notional:
                anomalies.append({
                    "field": "amortization_schedule",
                    "current_value": f"Total reduction: {total}, Initial notional: {initial_notional}",
                    "issue": "Total reduction amount exceeds initial notional",
                    "severity": "high",
                })
        except (ValueError, TypeError):
            pass  # Already handled above

    return anomalies


def validate_rate_specifications(current_swap: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Validate fixed/floating rate specifications."""
    anomalies: List[Dict[str, Any]] = []
    rate_type = str(current_swap.get("rate_type", "")).strip().lower()

    if rate_type == "fixed":
        fixed_rate = current_swap.get("fixed_rate")
        if not fixed_rate:
            anomalies.append({"field": "fixed_rate", "issue": "Fixed rate is required for fixed rate swaps", "severity": "high"})
        else:
            try:
                if float(fixed_rate) < 0:
                    anomalies.append({"field": "fixed_rate", "current_value": str(fixed_rate), "issue": "Fixed rate cannot be negative", "severity": "medium"})
            except (ValueError, TypeError):
                anomalies.append({"field": "fixed_rate", "current_value": str(fixed_rate), "issue": "Invalid fixed rate format", "severity": "high"})
    elif rate_type == "floating":
        if not current_swap.get("reference_rate"):
            anomalies.append({"field": "reference_rate", "issue": "Reference rate is required for floating rate swaps", "severity": "high"})
        if not current_swap.get("reset_frequency"):
            anomalies.append({"field": "reset_frequency", "issue": "Reset frequency is required for floating rate swaps", "severity": "medium"})
        spread = current_swap.get("spread")
        if spread:
            try:
                float(spread)
            except (ValueError, TypeError):
                anomalies.append({"field": "spread", "current_value": str(spread), "issue": "Invalid spread format", "severity": "medium"})
    elif rate_type:
        anomalies.append({"field": "rate_type", "current_value": rate_type, "issue": "Invalid rate type (should be 'fixed' or 'floating')", "severity": "high"})
    else:
        anomalies.append({"field": "rate_type", "issue": "Rate type is required", "severity": "high"})

    return anomalies


def validate_payment_adjustment(current_swap: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Validate payment adjustment rules."""
    valid_rules = {"following", "modified following", "preceding", "modified preceding", "unadjusted"}
    rule = str(current_swap.get("payment_adjustment_rule", "")).strip().lower()

    if rule and rule not in valid_rules:
        return [{
            "field": "payment_adjustment_rule",
            "current_value": rule,
            "issue": f"Invalid payment adjustment rule. Valid rules are: {', '.join(sorted(valid_rules))}",
            "severity": "medium",
        }]
    return []


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def validate_amortized_swap_against_risk_file(current_swap: Dict[str, Any]):
    """Validate an Amortised Schedule Swap. Returns ``(result_dict, http_status)``."""
    tid_field = extract_trade_id_field(current_swap)
    if tid_field is None:
        return {"error": "tradeId is required"}, 400

    trade_id = current_swap.get(tid_field)
    if not trade_id:
        return {"error": "tradeId is required"}, 400

    logger.info("Validating amortized schedule swap with tradeId: %s", trade_id)

    # Internal validations
    internal_anomalies = (
        validate_amortization_schedule(current_swap)
        + validate_rate_specifications(current_swap)
        + validate_payment_adjustment(current_swap)
    )

    # Reference comparison
    reference_swap = load_reference_swap(trade_id, sheet_name=SHEET_AMORTISED)

    if reference_swap is None:
        msg = f"No reference amortized swap found in risk file for tradeId {trade_id}."
        if internal_anomalies:
            return {"valid": False, "anomalies": internal_anomalies, "message": msg + " Internal validation also found issues."}, 404
        return {"valid": False, "message": msg}, 404

    ref_anomalies = _compare_amortised_economic_factors(current_swap, reference_swap)
    all_anomalies = internal_anomalies + ref_anomalies

    if all_anomalies:
        return {"valid": False, "anomalies": all_anomalies, "message": "Amortized schedule swap validation found issues"}, 200

    return {"valid": True, "message": "Amortized schedule swap matches reference in risk file on all economic factors"}, 200