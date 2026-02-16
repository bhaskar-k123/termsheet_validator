# Termsheet Validator

A tool for validating financial derivative term sheets (Interest Rate Swaps, Cross-Currency Swaps, Amortised Schedule Swaps, and more).

It extracts structured data from PDFs and emails, classifies the derivative type, and validates parameters against a risk system reference file.

---

## Quick Start

### 1. Backend

```bash
cd backend

# Create virtual environment & install dependencies
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

pip install -r requirements.txt

# Configure environment
copy .env.example .env       # Windows
# cp .env.example .env       # macOS / Linux
# Edit .env to add your GROQ_API_KEY (optional — only needed for LLM extraction)

# Run the server
python server.py
```

The backend will start at **http://localhost:5000**. Verify with:
```
GET http://localhost:5000/health  →  {"status": "ok"}
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at **http://localhost:5173** (default Vite port).

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/upload` | Upload a PDF termsheet |
| `POST` | `/upload_text` | Upload termsheet data as JSON |
| `POST` | `/extract` | Extract & classify a PDF (requires Groq API key) |
| `POST` | `/classify` | Classify termsheet text (requires Groq API key) |
| `POST` | `/add_termsheet` | Add a termsheet record |
| `GET` | `/termsheets` | List all termsheets |
| `POST` | `/validate_swap` | Validate a swap against the risk file |
| `POST` | `/traders` | Create a trader |
| `GET` | `/traders` | List all traders |
| `GET` | `/trader/<id>` | Get a trader |
| `PUT` | `/trader/<id>` | Update a trader |
| `DELETE` | `/trader/<id>` | Delete a trader |
| `GET` | `/trader_stats?email=` | Get trader validation stats |

---

## Project Structure

```
backend/
├── server.py                  # Flask entry point
├── config.py                  # Centralized configuration
├── json_store.py              # JSON file-based data store
├── pdf_kv.py                  # PDF key-value extraction
├── base_extractor.py          # Versioned extraction base class
├── gemini_classify.py         # Heuristic term sheet classifier
├── extraction_routes.py       # LLM-based extraction (Groq)
├── fetch_and_send.py          # Email PDF attachment fetcher
├── fetch_and_send_text.py     # Email text extractor
├── main.py                    # Batch PDF processor
├── init_swap.py               # Risk template generator
├── validators/
│   ├── base_validator.py      # Shared validation logic
│   ├── swap_validator.py      # Interest Rate Swap validator
│   ├── amortised_swaps.py     # Amortised Schedule Swap validator
│   ├── cross_currency.py      # Cross-Currency Swap validator
│   └── generate_risk_template.py
├── routes/
│   ├── termsheet_routes.py
│   ├── trader_routes.py
│   └── stats_routes.py
├── data/                      # JSON data store (auto-created)
├── uploads/                   # Uploaded PDFs
└── .env.example               # Environment config template

frontend/                      # Vite + React + TypeScript + ShadCN UI
```

---

## Tech Stack

- **Backend:** Python, Flask, PyMuPDF, Groq LLM, pandas
- **Frontend:** React, TypeScript, Vite, ShadCN UI, TailwindCSS
- **Storage:** JSON files (no database required)
