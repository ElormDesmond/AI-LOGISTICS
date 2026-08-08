#!/bin/bash
set -e

echo "🚀 Starting Production Hardening & Deployment Packaging for PharmaShield AI..."

echo "1. Validating Frontend Production Build..."
cd frontend
npm run build
cd ..

echo "2. Running Backend Pytest Automated Verification Suite..."
docker-compose exec -T api pytest tests/test_end_to_end.py

echo "3. Validating API Health Endpoint..."
curl -f http://localhost:8001/health || exit 1

echo "4. Validating Prometheus Metrics Scrape Endpoint..."
curl -f http://localhost:8001/metrics || exit 1

echo "✅ Production Deployment Packaging & System Hardening Verification Complete!"
