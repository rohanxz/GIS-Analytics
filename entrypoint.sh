#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Load Environment Variables ---
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  set -a # Automatically export all variables
  source ./.env
  set +a # Turn off auto-export
else
  echo "Warning: .env file not found. Ensure necessary environment variables are set."
fi

# --- Database Initialization (Placeholder) ---
echo "Initializing SQLite database..."
if [ ! -f my_agent_data.db ]; then
  touch my_agent_data.db
  echo "SQLite database file created."
else
  echo "SQLite database file already exists."
fi

# --- Backend Server Start ---
echo "Starting FastAPI backend server with Gunicorn and Uvicorn workers..."

# Verify backend directory and app file exist
if [ ! -d "backend" ] || [ ! -f "backend/app.py" ]; then
  echo "ERROR: 'backend/app.py' not found. Cannot start Gunicorn."
  exit 1
fi

# Default port, can be overridden by PORT environment variable
PORT="${PORT:-8080}"

echo "Attempting to start Gunicorn on port $PORT..."

# --- Execute Gunicorn with Uvicorn Worker ---
# This command is designed to run our FastAPI application.
# --worker-class uvicorn.workers.UvicornWorker is essential for FastAPI.
# The app entry point is now 'app:app'.
exec gunicorn \
    --chdir backend \
    -w 1 \
    -k uvicorn.workers.UvicornWorker \
    -b 0.0.0.0:$PORT \
    --timeout 2790 \
    app:app \
    --log-level info \
    --access-logfile - \
    --error-logfile -

echo "Gunicorn started."