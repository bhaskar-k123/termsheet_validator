"""
Term sheet classifier using key-matching heuristics.

Classifies extracted JSON term sheet data against known derivative type
structures by comparing mandatory key coverage and Jaccard similarity.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

from config import METADATA_DIR, get_logger

logger = get_logger(__name__)

# --- Configuration ---

TERM_SHEET_STRUCTURES: Dict[str, Set[str]] = {
    "InterestRateSwap": {
        "instrumentType", "tradeId", "firmId", "accountId", "currency",
        "effectiveDate", "maturityDate", "notional", "direction",
        "payLeg", "receiveLeg", "dayCountConvention",
        "businessDayConvention",
    },
    "CrossCurrencySwap": {
        "instrumentType", "tradeId", "firmId", "accountId", "payCurrency",
        "receiveCurrency", "effectiveDate", "maturityDate", "payNotional",
        "receiveNotional", "payLeg", "receiveLeg", "exchangeRates",
        "businessDayConvention",
    },
    "AmortisedScheduleSwap": {
        "instrumentType", "tradeId", "firmId", "accountId", "currency",
        "effectiveDate", "maturityDate", "notionalSchedule",
        "amortizationMethod", "payLeg", "receiveLeg",
        "businessDayConvention",
    },
    "MoneyMarketDeposit": {
        "instrumentType", "tradeId", "firmId", "accountId", "currency",
        "depositDate", "maturityDate", "principal", "interestRate",
        "interestCalculation", "dayCountConvention", "businessDayConvention",
    },
    "SingleSpreadOption": {
        "instrumentType", "tradeId", "firmId", "accountId", "underlying",
        "optionType", "strike", "spread", "notional", "currency",
        "expiryDate", "settlementDate", "dayCountConvention",
        "businessDayConvention",
    },
    "FXDigital": {
        "instrumentType", "tradeId", "firmId", "accountId", "payCurrency",
        "receiveCurrency", "payAmount", "receiveAmount", "strikeRate",
        "expiryDate", "settlementDate", "optionType", "dayCountConvention",
        "businessDayConvention",
    },
}

MANDATORY_KEYS_DEF: Dict[str, Set[str]] = {
    "InterestRateSwap": {
        "effectiveDate", "maturityDate", "notional", "payLeg", "receiveLeg",
        "dayCountConvention", "firmId",
    },
    "CrossCurrencySwap": {
        "payCurrency", "receiveCurrency", "payNotional", "receiveNotional",
        "effectiveDate", "maturityDate", "payLeg", "receiveLeg", "exchangeRates",
    },
    "AmortisedScheduleSwap": {
        "amortizationMethod", "notionalSchedule", "effectiveDate", "maturityDate",
        "payLeg", "receiveLeg",
    },
    "MoneyMarketDeposit": {
        "principal", "depositDate", "maturityDate", "interestRate",
        "dayCountConvention",
    },
    "SingleSpreadOption": {
        "underlying", "strike", "spread", "expiryDate", "optionType",
    },
    "FXDigital": {
        "payCurrency", "receiveCurrency", "strikeRate", "expiryDate",
        "payAmount", "receiveAmount", "optionType",
    },
}

KEY_ALIASES: Dict[str, str] = {
    "termination date": "maturityDate",
    "end date": "maturityDate",
    "maturity": "maturityDate",
    "start date": "effectiveDate",
    "value date": "effectiveDate",
    "effective start date": "effectiveDate",
    "trade date": "tradeDate",
    "notional amount": "notional",
    "business day convention": "businessDayConvention",
    "day count basis": "dayCountConvention",
    "day count fraction": "dayCountConvention",
    "payment frequency": "paymentFrequency",
    "fixed rate": "payLeg",
    "floating rate index": "receiveLeg",
    "principal amount": "principal",
    "issue date": "depositDate",
    "rate": "interestRate",
    "expiration date": "expiryDate",
    "option expiry": "expiryDate",
    "expiry": "expiryDate",
    "settlement": "settlementDate",
    "underlying asset": "underlying",
    "strike price": "strike",
    "payment currency": "payCurrency",
    "receipt currency": "receiveCurrency",
    "fx rate": "exchangeRates",
    "spot rate": "exchangeRates",
    "barrier level": "strikeRate",
    "payout amount": "payAmount",
    "party a": "firmId",
    "party b": "counterpartyId",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def normalize_key(key: str) -> str:
    """Normalise a key for comparison (lowercase, stripped)."""
    if not isinstance(key, str):
        return ""
    return key.lower().strip()


def build_normalized_structures(
    structures: Dict[str, Set[str]],
    mandatory_defs: Dict[str, Set[str]],
    aliases: Dict[str, str],
) -> tuple:
    """Normalise keys in structures, mandatory sets, and aliases."""
    normalized_structures = {
        term_type: {normalize_key(k) for k in keyset}
        for term_type, keyset in structures.items()
    }
    normalized_mandatory = {
        term_type: {normalize_key(k) for k in keyset}
        for term_type, keyset in mandatory_defs.items()
    }
    normalized_aliases = {
        normalize_key(alias): normalize_key(canonical)
        for alias, canonical in aliases.items()
    }
    reverse_aliases: Dict[str, Set[str]] = {}
    for alias_norm, canonical_norm in normalized_aliases.items():
        reverse_aliases.setdefault(canonical_norm, set()).add(alias_norm)

    return normalized_structures, normalized_mandatory, normalized_aliases, reverse_aliases


# Pre-normalise once at import time
NORMALIZED_TERM_STRUCTURES, NORMALIZED_MANDATORY_KEYS, NORMALIZED_ALIASES, REVERSE_ALIASES = (
    build_normalized_structures(TERM_SHEET_STRUCTURES, MANDATORY_KEYS_DEF, KEY_ALIASES)
)


# ---------------------------------------------------------------------------
# JSON / key extraction
# ---------------------------------------------------------------------------

def load_json_data(file_path: Path) -> Any:
    """Load JSON from *file_path*, raising on errors."""
    if not file_path.is_file():
        raise FileNotFoundError(f"Input file not found at {file_path}")
    try:
        with open(file_path, "r", encoding="utf-8") as fh:
            content = fh.read()
            if not content:
                raise ValueError("Input JSON file is empty.")
            data = json.loads(content)
        if not isinstance(data, (dict, list)):
            raise ValueError(f"Expected JSON root to be object or array, got {type(data).__name__}")
        return data
    except json.JSONDecodeError:
        logger.exception("Invalid JSON in %s", file_path)
        raise


def extract_all_keys_normalized(data: Any) -> Set[str]:
    """Recursively extract and normalise all string keys from nested JSON."""
    keys: Set[str] = set()
    if isinstance(data, dict):
        for key, value in data.items():
            normalized = normalize_key(key)
            if normalized:
                keys.add(normalized)
            keys.update(extract_all_keys_normalized(value))
    elif isinstance(data, list):
        for item in data:
            keys.update(extract_all_keys_normalized(item))
    return keys


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

def calculate_scores(normalized_input_keys: Set[str]) -> Dict[str, Dict[str, Any]]:
    """Calculate mandatory coverage and Jaccard scores for each term type."""
    results: Dict[str, Dict[str, Any]] = {}

    if not normalized_input_keys:
        logger.warning("No keys extracted from input JSON.")
        for term_type, norm_mand_keys in NORMALIZED_MANDATORY_KEYS.items():
            norm_all_keys = NORMALIZED_TERM_STRUCTURES.get(term_type, set())
            results[term_type] = {
                "mandatory_coverage": 0.0,
                "jaccard_score": 0.0,
                "matched_mandatory_keys": [],
                "missing_mandatory_keys": sorted(norm_mand_keys),
                "matched_all_keys": [],
                "missing_all_keys": sorted(norm_all_keys),
                "extra_input_keys": [],
            }
        return results

    for term_type, norm_mand_keys in NORMALIZED_MANDATORY_KEYS.items():
        norm_all_expected_keys = NORMALIZED_TERM_STRUCTURES.get(term_type, set())

        matched_canonical_keys_found: Set[str] = set()
        contributing_input_keys: Set[str] = set()

        for input_key in normalized_input_keys:
            if input_key in norm_all_expected_keys:
                matched_canonical_keys_found.add(input_key)
                contributing_input_keys.add(input_key)
            elif input_key in NORMALIZED_ALIASES:
                canonical_key = NORMALIZED_ALIASES[input_key]
                if canonical_key in norm_all_expected_keys:
                    matched_canonical_keys_found.add(canonical_key)
                    contributing_input_keys.add(input_key)

        matched_mandatory = matched_canonical_keys_found.intersection(norm_mand_keys)
        mandatory_coverage = len(matched_mandatory) / len(norm_mand_keys) if norm_mand_keys else 1.0

        jaccard_intersection = matched_canonical_keys_found
        jaccard_union = normalized_input_keys.union(norm_all_expected_keys)
        jaccard_score = len(jaccard_intersection) / len(jaccard_union) if jaccard_union else 0.0

        results[term_type] = {
            "mandatory_coverage": round(mandatory_coverage, 4),
            "jaccard_score": round(jaccard_score, 4),
            "matched_mandatory_keys": sorted(matched_mandatory),
            "missing_mandatory_keys": sorted(norm_mand_keys - matched_mandatory),
            "matched_all_keys": sorted(matched_canonical_keys_found),
            "missing_all_keys": sorted(norm_all_expected_keys - matched_canonical_keys_found),
            "extra_input_keys": sorted(normalized_input_keys - contributing_input_keys),
        }
    return results


def rank_results(scores: Dict[str, Dict[str, Any]], sort_key: str) -> List[Tuple[str, Dict[str, Any]]]:
    """Sort classification results by *sort_key* descending."""
    if not scores:
        return []
    first_score_dict = next(iter(scores.values()), None)
    if first_score_dict is None or sort_key not in first_score_dict:
        logger.warning("Sort key '%s' not found in score data — cannot rank.", sort_key)
        return list(scores.items())
    return sorted(scores.items(), key=lambda item: (item[1].get(sort_key, 0.0), item[0]), reverse=True)


def display_results(ranked_lists: Dict[str, Any]) -> None:
    """Log classification results at INFO level."""
    logger.info("--- Classification Results ---")

    top_mandatory_match = None
    mandatory_ranked = ranked_lists.get("ranked_by_mandatory", [])

    if mandatory_ranked:
        top_mandatory_match = mandatory_ranked[0]
        confidence_score = top_mandatory_match[1].get("mandatory_coverage", 0.0) * 100
        logger.info("Primary Classification: %s", top_mandatory_match[0])
        logger.info("Confidence Score: %.2f%% (based on mandatory keys found)", confidence_score)
    else:
        logger.info("No classification possible based on mandatory key coverage.")

    logger.info("Ranked by Mandatory Key Coverage:")
    for rank, (term_type, metrics) in enumerate(mandatory_ranked, 1):
        mand_cov = metrics.get("mandatory_coverage", 0.0)
        jacc_score = metrics.get("jaccard_score", 0.0)
        matched_mand = metrics.get("matched_mandatory_keys", [])
        missing_mand = metrics.get("missing_mandatory_keys", [])

        logger.info(
            "  %d. %s (Mandatory: %.2f%%, Jaccard: %.4f) — Matched: %s, Missing: %s",
            rank, term_type, mand_cov * 100, jacc_score, matched_mand, missing_mand,
        )

    jaccard_ranked = ranked_lists.get("ranked_by_jaccard", [])
    logger.info("Ranked by Jaccard Score:")
    for rank, (term_type, metrics) in enumerate(jaccard_ranked, 1):
        jacc_score = metrics.get("jaccard_score", 0.0)
        mand_cov = metrics.get("mandatory_coverage", 0.0)
        logger.info("  %d. %s (Jaccard: %.4f, Mandatory: %.2f%%)", rank, term_type, jacc_score, mand_cov * 100)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def classify_term_sheet_from_file(file_path_str: str) -> Optional[Dict[str, List[Tuple[str, Dict[str, Any]]]]]:
    """Load, classify, and return results for a single JSON file."""
    file_path = Path(file_path_str)
    logger.info("Loading JSON from: %s", file_path.resolve())

    input_data = load_json_data(file_path)
    normalized_input_keys = extract_all_keys_normalized(input_data)

    if not normalized_input_keys:
        logger.error("Could not extract any keys from %s — cannot classify.", file_path)
        return None

    logger.info("Found %d unique normalised keys.", len(normalized_input_keys))
    logger.debug("Keys: %s", sorted(normalized_input_keys))

    scores = calculate_scores(normalized_input_keys)

    return {
        "ranked_by_mandatory": rank_results(scores, "mandatory_coverage"),
        "ranked_by_jaccard": rank_results(scores, "jaccard_score"),
    }


def classify_termsheet() -> list:
    """Process all version files in the metadata folder structure."""
    base_path = Path(METADATA_DIR)
    results: list = []
    logger.info("Base directory: %s", base_path.resolve())

    if not base_path.exists():
        logger.warning("Base directory not found: %s", base_path.resolve())
        return results

    for trade_id_folder in base_path.iterdir():
        if not trade_id_folder.is_dir():
            continue

        versions_folder = trade_id_folder / "versions"
        if not versions_folder.exists() or not versions_folder.is_dir():
            continue

        for version_file in versions_folder.glob("*.json"):
            try:
                logger.info("Processing: %s", version_file)
                classification_result = classify_term_sheet_from_file(str(version_file))

                if classification_result:
                    classification_result["trade_id"] = trade_id_folder.name
                    classification_result["version"] = version_file.stem
                    display_results(classification_result)
                    results.append(classification_result)
            except Exception:
                logger.exception("Error processing %s", version_file)

    for result in results:
        logger.info(
            "Final Classification — Trade ID %s, Version %s",
            result["trade_id"], result["version"],
        )
        display_results(result)

    return results
