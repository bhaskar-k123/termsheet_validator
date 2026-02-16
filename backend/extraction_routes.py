"""
Termsheet extraction routes using Groq LLM.

Classifies uploaded termsheets by derivative type and extracts
structured parameters using chunked LLM processing.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, List, Tuple

import groq
from flask import Blueprint, jsonify, request
from markitdown import MarkItDown

from config import GROQ_API_KEY, UPLOAD_FOLDER, get_logger
from json_store import get_collection

logger = get_logger(__name__)

# Initialize Groq client (only if API key is configured)
_client = None
if GROQ_API_KEY:
    _client = groq.Client(api_key=GROQ_API_KEY)

extraction_bp = Blueprint("extraction_bp", __name__)

termsheet_collection = get_collection("termsheets")

# Define the characteristic parameters for each derivative type
DERIVATIVE_PARAMETERS: Dict[str, List[str]] = {
    "Interest Rate Swap": [
        "Effective Date", "Termination Date/Maturity", "Notional Amount",
        "Fixed Rate", "Floating Rate Index", "Payment Frequency",
        "Day Count Convention", "Reset Dates", "Discount Curve",
        "Counterparty Details",
    ],
    "Cross Currency Swap": [
        "Effective Date", "Termination Date", "Notional Amount (Currency 1)",
        "Notional Amount (Currency 2)", "Exchange Rate", "Fixed Rate (Currency 1)",
        "Fixed Rate (Currency 2)", "Payment Frequency", "Day Count Convention",
        "Initial Exchange", "Final Exchange", "Counterparty Details",
    ],
    "Amortised Schedule Swap": [
        "Effective Date", "Termination Date", "Initial Notional Amount",
        "Amortization Schedule", "Fixed Rate", "Floating Rate Index",
        "Payment Frequency", "Day Count Convention", "Reset Dates",
        "Counterparty Details",
    ],
    "Money Market Deposit": [
        "Value Date", "Maturity Date", "Principal Amount", "Currency",
        "Interest Rate", "Day Count Convention", "Interest Payment Date",
        "Counterparty Details",
    ],
    "Single Spread Options": [
        "Trade Date", "Option Style", "Option Type", "Expiry Date",
        "Strike Price", "Underlying", "Notional Amount", "Premium",
        "Settlement Method", "Counterparty Details",
    ],
    "FX Digital": [
        "Trade Date", "Expiry Date", "Settlement Date", "Currency Pair",
        "Strike Rate", "Notional Amount", "Payout Amount", "Payout Currency",
        "Barrier Type", "Counterparty Details",
    ],
}


def _get_client() -> groq.Client:
    """Return the Groq client, raising if not configured."""
    if _client is None:
        raise RuntimeError(
            "Groq API key not configured. Set GROQ_API_KEY in your .env file."
        )
    return _client


def classify_termsheet(text: str) -> str:
    """Classify a termsheet into one of the six derivative types."""
    client = _get_client()

    classification_prompt = """
    Analyze this financial termsheet and classify it as ONE of the following derivative types:

    1. Interest Rate Swap - Exchanges fixed interest payments for floating interest payments
    2. Cross Currency Swap - Exchanges principal and interest payments in one currency for another
    3. Amortised Schedule Swap - An interest rate swap where the notional amount decreases over time according to a schedule
    4. Money Market Deposit - A short-term loan or deposit between banks
    5. Single Spread Options - Option contracts based on the spread between two financial instruments
    6. FX Digital - A binary option that pays a fixed amount if a specified FX rate condition is met

    Return ONLY the name of the derivative type that best matches this termsheet. Do not explain your reasoning or provide any other text.

    Termsheet:
    """

    # For very long texts, summarise key sections first
    if len(text) > 10000:
        sections_prompt = (
            "Extract only the most relevant sections from this termsheet that would help classify it "
            "as one of these derivative types: Interest Rate Swap, Cross Currency Swap, Amortised Schedule Swap, "
            "Money Market Deposit, Single Spread Options, FX Digital.\n"
            "Focus on headings, transaction type descriptions, and key parameters.\n\nTermsheet:\n" + text
        )
        sections_resp = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": sections_prompt}],
            temperature=0.0,
            max_tokens=2000,
        )
        classification_text = sections_resp.choices[0].message.content
    else:
        classification_text = text

    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": classification_prompt + classification_text}],
        temperature=0.0,
        max_tokens=20,
    )

    derivative_type = response.choices[0].message.content.strip()

    # Normalize to known type names
    for defined_type in DERIVATIVE_PARAMETERS:
        if defined_type.lower() in derivative_type.lower():
            return defined_type

    logger.warning("Unrecognized derivative type from LLM: %s", derivative_type)
    return derivative_type


def extract_parameters_by_chunks(
    text: str,
    derivative_type: str,
    chunk_size: int = 6000,
    overlap: int = 1000,
) -> Dict[str, Any]:
    """Extract parameters by processing text in overlapping chunks."""
    parameters = DERIVATIVE_PARAMETERS.get(derivative_type, [])

    if len(text) <= chunk_size:
        return _extract_parameters_from_chunk(text, derivative_type, parameters)

    chunks = [text[i : i + chunk_size] for i in range(0, len(text), chunk_size - overlap)]

    merged: Dict[str, Any] = {}
    for chunk in chunks:
        result = _extract_parameters_from_chunk(chunk, derivative_type, parameters)
        for key, value in result.items():
            if key not in merged or (value is not None and merged[key] is None):
                merged[key] = value

    return {param: merged.get(param) for param in parameters}


def _extract_parameters_from_chunk(
    text: str,
    derivative_type: str,
    parameters: List[str],
) -> Dict[str, Any]:
    """Extract parameters from a single text chunk via LLM."""
    client = _get_client()

    prompt = (
        f"Extract the following parameters from this {derivative_type} termsheet:\n\n"
        f"{', '.join(parameters)}\n\n"
        "Format your response as a JSON object with these parameters as keys. "
        "If a parameter isn't found, use null.\n"
        "Only include these exact parameters in your response, no additional information or explanation.\n\n"
        f"Termsheet chunk:\n{text}"
    )

    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
        max_tokens=1500,
    )

    result_text = response.choices[0].message.content

    try:
        return json.loads(result_text)
    except json.JSONDecodeError:
        json_match = re.search(r"```(?:json)?\n(.*?)\n```", result_text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

    logger.warning("Could not parse LLM response as JSON for %s", derivative_type)
    return {param: None for param in parameters}


def process_termsheet(path: str) -> Tuple[str, Dict[str, Any]]:
    """Full pipeline: convert PDF → classify → extract → store."""
    md = MarkItDown(enablePlugins=False)
    termsheet_text = md.convert(path).text_content
    termsheet_text = termsheet_text.replace("\n", " ").replace("\r", " ").strip()

    derivative_type = classify_termsheet(termsheet_text)
    parameters = extract_parameters_by_chunks(termsheet_text, derivative_type)

    document = {
        "derivative_type": derivative_type,
        **parameters,
        "file_path": path,
        "status": "processing",
    }

    result = termsheet_collection.insert_one(document)
    logger.info("Document inserted with ID: %s", result.inserted_id)

    return derivative_type, parameters


# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------

@extraction_bp.route("/extract", methods=["POST"])
def extract_termsheet():
    """Extract and classify an uploaded termsheet PDF."""
    try:
        file = request.files.get("file")
        if not file or not file.filename or not file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Invalid or no PDF uploaded"}), 400

        save_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(save_path)

        derivative_type, parameters = process_termsheet(save_path)

        return jsonify({
            "message": "Termsheet processed successfully",
            "derivative_type": derivative_type,
            "parameters": parameters,
        }), 200
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception as exc:
        logger.exception("Error processing termsheet")
        return jsonify({"error": str(exc)}), 500


@extraction_bp.route("/classify", methods=["POST"])
def classify_only():
    """Classify a termsheet without full extraction."""
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "JSON body with 'text' field required"}), 400

        derivative_type = classify_termsheet(data["text"])
        return jsonify({"derivative_type": derivative_type}), 200
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception as exc:
        logger.exception("Error classifying termsheet")
        return jsonify({"error": str(exc)}), 500
