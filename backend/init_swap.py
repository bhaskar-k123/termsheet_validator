"""
Initialize swap validation directory structure and templates.
"""

from __future__ import annotations

from config import get_logger

logger = get_logger(__name__)


def initialize_swap_validation() -> None:
    """Generate the risk system template file."""
    try:
        from validators.generate_risk_template import generate_risk_template

        generate_risk_template()
        logger.info("Risk system template generated successfully")
    except Exception:
        logger.exception("Error generating risk template")


if __name__ == "__main__":
    initialize_swap_validation()