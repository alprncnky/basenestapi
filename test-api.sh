#!/bin/bash

# Clean Architecture NestJS API - Test Script
# This script demonstrates the Payment module endpoints

BASE_URL="http://localhost:3000/api/v1"
CONTENT_TYPE="Content-Type: application/json"

echo "======================================"
echo "Testing Payment API Endpoints"
echo "======================================"
echo ""

# Test 1: Create a new payment
echo "1️⃣  Creating a new payment..."
echo "POST ${BASE_URL}/payments"
curl -X POST "${BASE_URL}/payments" \
  -H "${CONTENT_TYPE}" \
  -d '{
    "amount": 149.99,
    "currency": "USD",
    "customerEmail": "alice@example.com",
    "customerName": "Alice Johnson",
    "description": "Payment for premium subscription"
  }' \
  -s | jq '.'
echo ""
echo ""

# Test 2: Get all payments
echo "2️⃣  Getting all payments..."
echo "GET ${BASE_URL}/payments"
curl -X GET "${BASE_URL}/payments" -s | jq '.'
echo ""
echo ""

# Test 3: Get payment by ID
echo "3️⃣  Getting payment by ID (ID: 1)..."
echo "GET ${BASE_URL}/payments/1"
curl -X GET "${BASE_URL}/payments/1" -s | jq '.'
echo ""
echo ""

# Test 4: Filter payments by status
echo "4️⃣  Getting pending payments..."
echo "GET ${BASE_URL}/payments?status=pending"
curl -X GET "${BASE_URL}/payments?status=pending" -s | jq '.'
echo ""
echo ""

# Test 5: Process a payment
echo "5️⃣  Processing a pending payment (ID: 1)..."
echo "POST ${BASE_URL}/payments/1/process"
curl -X POST "${BASE_URL}/payments/1/process" -s | jq '.'
echo ""
echo ""

# Test 6: Update a payment
echo "6️⃣  Updating payment (ID: 2)..."
echo "PATCH ${BASE_URL}/payments/2"
curl -X PATCH "${BASE_URL}/payments/2" \
  -H "${CONTENT_TYPE}" \
  -d '{
    "description": "Updated: Payment for premium annual subscription"
  }' \
  -s | jq '.'
echo ""
echo ""

# Test 7: Get payments by status
echo "7️⃣  Getting completed payments..."
echo "GET ${BASE_URL}/payments/status/completed"
curl -X GET "${BASE_URL}/payments/status/completed" -s | jq '.'
echo ""
echo ""

echo "======================================"
echo "✅ Testing Complete!"
echo "======================================"
echo ""
echo "🌐 Swagger Documentation: http://localhost:3000/api/docs"
echo ""

