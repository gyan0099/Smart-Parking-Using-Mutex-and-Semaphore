#!/usr/bin/env bash
# Startup script for FastAPI Backend
cd "$(dirname "$0")/backend"
echo "Starting Smart Parking Backend on http://127.0.0.1:8000..."
source venv/bin/activate
export PYTHONPATH=.
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
