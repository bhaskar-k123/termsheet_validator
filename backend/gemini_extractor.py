"""
Termsheet extraction routes using Google Gemini LLM.

Classifies uploaded termsheets by derivative type and extracts
structured parameters using Google's Generative AI.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, List, Tuple

import google.generativeai as genai
import fitz  # PyMuPDF
from flask import Blueprint, jsonify, request

from config import GEMINI_API_KEY, UPLOAD_FOLDER, get_logger
from json_store import get_collection

logger = get_logger(__name__)

# Initialize Gemini (only if API key is configured)
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

gemini_extractor_bp = Blueprint("gemini_extractor_bp", __name__)
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

def _get_model():
    """Return the Gemini model, raising if not configured."""
    if not GEMINI_API_KEY:
        raise RuntimeError(
            "Gemini API key not configured. Set GEMINI_API_KEY in your .env file."
        )
    return genai.GenerativeModel('gemini-1.5-pro')

def classify_termsheet(text: str) -> str:
    """Classify a termsheet into one of the six derivative types."""
    model = _get_model()

    classification_prompt = f"""
    Analyze this financial termsheet and classify it as ONE of the following derivative types:
    {', '.join(DERIVATIVE_PARAMETERS.keys())}

    Return ONLY the name of the derivative type that best matches. No explanation.

    Termsheet:
    {text[:15000]}  # Gemini pro has a large context, but let's keep it reasonable
    """

    response = model.generate_content(classification_prompt)
    derivative_type = response.text.strip()

    # Normalize to known type names
    for defined_type in DERIVATIVE_PARAMETERS:
        if defined_type.lower() in derivative_type.lower():
            return defined_type

    logger.warning("Unrecognized derivative type from Gemini: %s", derivative_type)
    return derivative_type

def extract_parameters(text: str, derivative_type: str) -> Dict[str, Any]:
    """Extract parameters from text via Gemini."""
    model = _get_model()
    parameters = DERIVATIVE_PARAMETERS.get(derivative_type, [])

    prompt = (
        f"Extract the following parameters from this {derivative_type} termsheet:\n\n"
        f"{', '.join(parameters)}\n\n"
        "Format your response as a JSON object with these parameters as keys. "
        "If a parameter isn't found, use null.\n"
        "Only include these exact parameters in your response, no additional explanation.\n\n"
        f"Termsheet text:\n{text}"
    )

    response = model.generate_content(prompt)
    result_text = response.text

    # Clean up markdown JSON formatting if present
    json_match = re.search(r"\{.*\}", result_text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass

    try:
        return json.loads(result_text)
    except json.JSONDecodeError:
        logger.warning("Could not parse Gemini response as JSON for %s", derivative_type)
        return {param: None for param in parameters}

def process_termsheet(path: str) -> Tuple[str, Dict[str, Any]]:
    """Full pipeline: convert PDF → classify → extract → store."""
    doc = fitz.open(path)
    termsheet_text = " ".join(page.get_text() for page in doc)
    doc.close()
    
    # Pre-clean text
    termsheet_text = re.sub(r'\s+', ' ', termsheet_text).strip()

    derivative_type = classify_termsheet(termsheet_text)
    parameters = extract_parameters(termsheet_text, derivative_type)

    document = {
        "id": os.path.basename(path),
        "name": os.path.basename(path),
        "uploadDate": os.path.getmtime(path),
        "derivative_type": derivative_type,
        "parameters": parameters,
        "file_path": path,
        "status": "validated",
        "extractedText": termsheet_text[:5000], # Store preview
        "highlightedTerms": [{"term": k, "value": str(v)} for k, v in parameters.items() if v],
        "expectedTerms": [{"term": k, "value": "TBD"} for k in parameters] 
    }

    # Use insert_one for live storage
    termsheet_collection.insert_one(document)
    logger.info("Document inserted with ID: %s", document["id"])

    return derivative_type, parameters

@gemini_extractor_bp.route("/extract", methods=["POST"])
def extract_termsheet():
    """Extract and classify an uploaded termsheet PDF using Gemini."""
    try:
        file = request.files.get("file")
        if not file or not file.filename or not file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Invalid or no PDF uploaded"}), 400

        save_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(save_path)

        derivative_type, parameters = process_termsheet(save_path)

        return jsonify({
            "message": "Termsheet processed successfully via Gemini",
            "derivative_type": derivative_type,
            "parameters": parameters,
        }), 200
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception as exc:
        logger.exception("Error processing termsheet with Gemini")
        return jsonify({"error": str(exc)}), 500
