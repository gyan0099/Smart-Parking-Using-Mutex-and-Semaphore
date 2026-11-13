#!/usr/bin/env bash
# Startup script for React Frontend
cd "$(dirname "$0")/frontend"
echo "Starting Smart Parking Frontend on http://localhost:5173..."
npm run dev
