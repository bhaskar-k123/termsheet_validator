"""
Risk system template generator.
"""

from __future__ import annotations

import os

import pandas as pd

from config import BASE_DIR, get_logger

logger = get_logger(__name__)


def generate_risk_template(output_path: str | None = None) -> None:
    """Generate a template Excel file for the risk system."""
    if output_path is None:
        output_path = str(BASE_DIR / "validators" / "risk_system_template.xlsx")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    risk_data = {
        "Parameters": pd.DataFrame({
            "parameter": ["min_notional", "max_notional", "min_fixed_rate", "max_fixed_rate"],
            "value": [100000, 1000000000, 0, 10],
        }),
        "Tenors": pd.DataFrame({
            "common_tenors": [1, 2, 3, 5, 7, 10, 15, 20, 30],
        }),
        "Indices": pd.DataFrame({
            "allowed_indices": ["SOFR", "EURIBOR", "€STR", "SONIA", "LIBOR", "EONIA"],
        }),
        "Frequencies": pd.DataFrame({
            "allowed_frequencies": ["Monthly", "Quarterly", "Semi-annual", "Annual"],
        }),
        "DayCounts": pd.DataFrame({
            "allowed_day_counts": ["30/360", "ACT/365", "ACT/360", "ACT/ACT"],
        }),
        "Counterparties": pd.DataFrame({
            "approved_counterparties": [
                "Bank of America", "JPMorgan Chase", "Goldman Sachs",
                "Morgan Stanley", "Citigroup", "Wells Fargo",
                "Deutsche Bank", "HSBC", "Barclays", "BNP Paribas",
            ],
        }),
    }

    with pd.ExcelWriter(output_path) as writer:
        for sheet_name, df in risk_data.items():
            df.to_excel(writer, sheet_name=sheet_name, index=False)

    logger.info("Risk system template generated at: %s", output_path)


if __name__ == "__main__":
    generate_risk_template()