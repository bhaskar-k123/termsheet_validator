"""
Interest Rate Swap validator.

Uses shared utilities from ``base_validator`` for reference data lookup
and economic factor comparison.
"""

from __future__ import annotations

from typing import Any, Dict

from config import SHEET_IRS, get_logger
from validators.base_validator import validate_against_risk_file

logger = get_logger(__name__)

ECONOMIC_FIELDS = [
    "effective_date",
    "maturity_date",
    "notional_amount",
    "fixed_rate",
    "floating_rate_index",
    "payment_frequency",
    "day_count_convention",
    "reset_dates",
    "discount_curve",
]


def validate_swap_against_risk_file(current_swap: Dict[str, Any]):
    """Validate an Interest Rate Swap against the risk system file.

    Returns ``(result_dict, http_status)``.
    """
    return validate_against_risk_file(
        current_swap=current_swap,
        economic_fields=ECONOMIC_FIELDS,
        high_severity_fields=None,  # all mismatches are high severity
        sheet_name=SHEET_IRS,
        instrument_label="swap",
    )