#!/bin/bash

# Test script to check API health endpoint
API_URL="https://alera-gamma.vercel.app"

echo "Testing ALERA API Health Endpoint..."
echo "URL: $API_URL/api/health"
echo ""

# Test with curl and show response
curl -X GET "$API_URL/api/health" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "Test complete. Status should be 200 if healthy."
