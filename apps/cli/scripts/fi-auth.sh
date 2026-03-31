#!/bin/bash
# FlowInquiry CLI Authentication Script
# Usage: source fi-auth.sh [email] [password]

BASE_URL="${FLOWINQUIRY_BASE_URL:-http://localhost:1234}"
EMAIL="${1:-admin@flowinquiry.io}"
PASSWORD="${2:-admin}"

echo ""
echo "  +---------------------------------+"
echo "  |   FlowInquiry CLI Auth          |"
echo "  +---------------------------------+"
echo ""
echo "  [*] Authenticating to $BASE_URL"
echo "  [*] User: $EMAIL"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/api/authenticate" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$RESPONSE" | grep -o '"id_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "  [X] FAILED: $RESPONSE"
  echo ""
  return 1 2>/dev/null || exit 1
fi

export FLOWINQUIRY_TOKEN="$TOKEN"
export FLOWINQUIRY_BASE_URL="$BASE_URL"

echo "  [OK] Token exported to FLOWINQUIRY_TOKEN"
echo "  [OK] Base URL: $FLOWINQUIRY_BASE_URL"
echo ""

# Verify
echo "  [*] Verifying auth..."
WHOAMI=$(bun apps/cli/src/index.ts auth whoami 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "  [OK] Logged in as: $(echo "$WHOAMI" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)"
  echo ""
  echo "  +---------------------------------+"
  echo "  |   Ready to use fi cli!          |"
  echo "  +---------------------------------+"
  echo ""
else
  echo "  [!] Token set but verify failed"
fi
