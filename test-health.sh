#!/bin/bash

set -e

API_URL="${1:-https://alera-gamma.vercel.app}"

echo "Testing ALERA deployment health..."
echo "Base URL: $API_URL"
echo ""

echo "Checking /api/health"
curl -X GET "$API_URL/api/health" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n\n" \
  -s

echo "Checking /api/ready"
curl -X GET "$API_URL/api/ready" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n\n" \
  -s

echo "Deployment health checks complete."
