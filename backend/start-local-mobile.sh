#!/bin/bash

set -e

cd "$(dirname "$0")"

echo "Starting MongoDB (Docker)..."
docker compose up -d mongodb

echo "Starting FastAPI backend..."
DEBUG=true ./venv/bin/python main.py
