"""
Shared validation utilities used by all swap/instrument validators.

Eliminates the copy-pasted ``load_reference_swap`` and
``compare_economic_factors`` functions that were duplicated across
swap_validator, amortised_swaps, and cross_currency modules.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, Sequence, Tuple

import pandas as pd

from config import RISK_FILE, get_logger

logger = get_logger(__name__)

# Cached DataFrames keyed by (risk_file, sheet_name) → (mtime, DataFrame)
_risk_cache: Dict[Tuple[str, str], Tuple[float, "pd.DataFrame"]] = {}


# ---------------------------------------------------------------------------
# Trade-ID helpers
# ---------------------------------------------------------------------------

def extract_trade_id_field(swap_data: Dict[str, Any]) -> Optional[str]:
    """Return the key name that contains the trade ID (case-insensitive)."""
    for field in swap_data:
        if field.lower() == "tradeid":
            return field
    return None


# ---------------------------------------------------------------------------
# Reference swap lookup (previously copy-pasted 3×)
# ---------------------------------------------------------------------------

def load_reference_swap(
    trade_id: Any,
    risk_file: str = RISK_FILE,
    sheet_name: str = "interest_risk_swap",
) -> Optional[Dict[str, Any]]:
    """
    Load a reference swap row from the risk Excel file by *trade_id*.

    Parameters
    ----------
    trade_id : Any
        Trade identifier to search for.
    risk_file : str
        Path to the risk system Excel workbook.
    sheet_name : str
        Name of the worksheet to read.

    Returns
    -------
    dict or None
        The matching row as a dict, or ``None`` if not found.
    """
    if not os.path.exists(risk_file):
        logger.warning("Risk file not found: %s", risk_file)
        return None

    df = _read_risk_sheet(risk_file, sheet_name)
    if df is None:
        return None

    # Locate the trade-ID column (case-insensitive)
    trade_id_col = _find_trade_id_column(df)
    if trade_id_col is None:
        logger.warning("No tradeId column found. Available columns: %s", df.columns.tolist())
        return None

    df[trade_id_col] = df[trade_id_col].astype(str).str.strip()
    trade_id_str = str(trade_id).strip()

    # Exact match first, then case-insensitive fallback
    match = df[df[trade_id_col] == trade_id_str]
    if match.empty:
        match = df[df[trade_id_col].str.lower() == trade_id_str.lower()]

    if match.empty:
        logger.info("No reference swap found for tradeId '%s' in sheet '%s'", trade_id_str, sheet_name)
        return None

    return match.iloc[0].to_dict()


def _find_trade_id_column(df: pd.DataFrame) -> Optional[str]:
    """Return the column name that represents the trade ID, or None."""
    for col in df.columns:
        if col.lower() == "tradeid":
            return col
    for col in df.columns:
        if "trade" in col.lower() and "id" in col.lower():
            return col
    return None


def _read_risk_sheet(risk_file: str, sheet_name: str) -> Optional["pd.DataFrame"]:
    """Read *sheet_name* from the risk Excel file, caching by file mtime."""
    cache_key = (risk_file, sheet_name)
    try:
        current_mtime = os.path.getmtime(risk_file)
    except OSError:
        logger.warning("Cannot stat risk file: %s", risk_file)
        return None

    cached = _risk_cache.get(cache_key)
    if cached is not None and cached[0] == current_mtime:
        logger.debug("Using cached risk sheet %s/%s", risk_file, sheet_name)
        return cached[1]

    try:
        df = pd.read_excel(risk_file, sheet_name=sheet_name)
    except Exception:
        logger.exception("Error reading risk file %s (sheet=%s)", risk_file, sheet_name)
        return None

    _risk_cache[cache_key] = (current_mtime, df)
    logger.debug("Cached risk sheet %s/%s (mtime=%.2f)", risk_file, sheet_name, current_mtime)
    return df


# ---------------------------------------------------------------------------
# Economic factor comparison (previously copy-pasted 3×)
# ---------------------------------------------------------------------------

def compare_economic_factors(
    current_swap: Dict[str, Any],
    reference_swap: Dict[str, Any],
    economic_fields: Sequence[str],
    high_severity_fields: Sequence[str] | None = None,
) -> List[Dict[str, Any]]:
    """
    Compare *current_swap* against *reference_swap* for each field in
    *economic_fields* and return a list of anomaly dicts.

    Parameters
    ----------
    current_swap : dict
    reference_swap : dict
    economic_fields : sequence of str
        The field names to compare.
    high_severity_fields : sequence of str, optional
        Fields whose mismatch is ``"high"`` severity.  Fields not in this
        list default to ``"medium"`` severity.  If *None*, all mismatches
        are ``"high"``.
    """
    high_set = set(high_severity_fields) if high_severity_fields else None
    anomalies: List[Dict[str, Any]] = []

    for field in economic_fields:
        cur_key = _case_insensitive_key(current_swap, field)
        ref_key = _case_insensitive_key(reference_swap, field)

        cur_val = str(current_swap.get(cur_key, "")).strip()
        ref_val = str(reference_swap.get(ref_key, "")).strip()

        if cur_val != ref_val:
            severity = "high" if (high_set is None or field in high_set) else "medium"
            anomalies.append({
                "field": field,
                "current_value": cur_val,
                "reference_value": ref_val,
                "issue": f"Mismatch in {field}",
                "severity": severity,
            })

    return anomalies


def _case_insensitive_key(data: Dict[str, Any], target: str) -> str:
    """Return the actual key in *data* matching *target* (case-insensitive)."""
    target_lower = target.lower()
    for key in data:
        if key.lower() == target_lower:
            return key
    return target


# ---------------------------------------------------------------------------
# Validation entry-point helper
# ---------------------------------------------------------------------------

def validate_against_risk_file(
    current_swap: Dict[str, Any],
    economic_fields: Sequence[str],
    high_severity_fields: Sequence[str] | None,
    sheet_name: str,
    internal_anomalies: List[Dict[str, Any]] | None = None,
    instrument_label: str = "swap",
):
    """
    Shared validation flow: extract trade ID → load reference → compare.

    Returns (result_dict, http_status).
    """
    tid_field = extract_trade_id_field(current_swap)
    if tid_field is None:
        return {"error": "tradeId is required"}, 400

    trade_id = current_swap.get(tid_field)
    if not trade_id:
        return {"error": "tradeId is required"}, 400

    logger.info("Validating %s with tradeId: %s", instrument_label, trade_id)

    all_anomalies = list(internal_anomalies or [])

    reference_swap = load_reference_swap(trade_id, sheet_name=sheet_name)
    if reference_swap is None:
        msg = f"No reference {instrument_label} found in risk file for tradeId {trade_id}."
        if all_anomalies:
            return {"valid": False, "anomalies": all_anomalies, "message": msg + " Internal validation also found issues."}, 404
        return {"valid": False, "message": msg}, 404

    ref_anomalies = compare_economic_factors(current_swap, reference_swap, economic_fields, high_severity_fields)
    all_anomalies.extend(ref_anomalies)

    if all_anomalies:
        return {
            "valid": False,
            "anomalies": all_anomalies,
            "message": f"{instrument_label.capitalize()} validation found issues",
        }, 200

    return {
        "valid": True,
        "message": f"{instrument_label.capitalize()} matches reference in risk file on all economic factors",
    }, 200
