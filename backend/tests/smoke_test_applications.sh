#!/bin/bash
# =============================================================================
# Application API Smoke Test Suite
# =============================================================================

cd /home/zaid/projects/internship-platform/backend

php artisan serve --port=8000 &>/tmp/artisan-serve.log &
SERVER_PID=$!
sleep 4

PASS=0; FAIL=0
BASE="http://localhost:8000/api"

check() {
  local desc="$1"; local expected="$2"; local actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    echo "  ✓ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $desc"
    echo "    Expected: $expected"
    echo "    Got: $(echo "$actual" | head -c 300)"
    FAIL=$((FAIL + 1))
  fi
}

check_code() {
  local desc="$1"; local expected="$2"; local actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  ✓ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $desc (expected HTTP $expected, got $actual)"
    FAIL=$((FAIL + 1))
  fi
}

# ── Setup: Get tokens ─────────────────────────────────────────────────────────
echo ""
echo "=== Setup: Login as company ==="
COMPANY_RESP=$(curl -s -X POST $BASE/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"hr@techcorp.com","password":"password123"}')
COMPANY_TOKEN=$(echo "$COMPANY_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
echo "  Token: ${COMPANY_TOKEN:0:25}..."

echo ""
echo "=== Setup: Login as student ==="
STUDENT_RESP=$(curl -s -X POST $BASE/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"bob@fresh.com","password":"password123"}')
STUDENT_TOKEN=$(echo "$STUDENT_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
echo "  Token: ${STUDENT_TOKEN:0:25}..."

# ── Setup: Create a fresh internship to apply to ─────────────────────────────
echo ""
echo "=== Setup: Create test internship ==="
INT_RESP=$(curl -s -X POST $BASE/internships \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -d '{"title":"Smoke Test Role","description":"Testing the application flow","type":"remote","deadline":"2026-12-01"}')
INT_ID=$(echo "$INT_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('internship',{}).get('id',''))" 2>/dev/null)
echo "  Internship ID: $INT_ID"

# ── Test 1: Company tries to apply → 403 ─────────────────────────────────────
echo ""
echo "=== Test 1: Company applies to internship (expect 403) ==="
RESP=$(curl -s -X POST $BASE/internships/$INT_ID/apply \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN")
check "Returns 403 - only students may apply" 'Only students may apply' "$RESP"

# ── Test 2: Student applies → 201 ────────────────────────────────────────────
echo ""
echo "=== Test 2: Student applies (expect 201) ==="
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/internships/$INT_ID/apply \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
BODY=$(echo "$RESP" | head -n -1)
CODE=$(echo "$RESP" | tail -n 1)
check_code "Returns HTTP 201" "201" "$CODE"
check "Returns success message"   'Application submitted successfully' "$BODY"
check "Status is pending"         '"pending"'                          "$BODY"
check "Internship is eager-loaded" '"internship"'                      "$BODY"

APP_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('application',{}).get('id',''))" 2>/dev/null)
echo "  Application ID: $APP_ID"

# ── Test 3: Student applies again → 409 Conflict ─────────────────────────────
echo ""
echo "=== Test 3: Student applies again (expect 409) ==="
RESP=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/internships/$INT_ID/apply \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
check_code "Returns HTTP 409 Conflict" "409" "$RESP"

# ── Test 4: Company views applications for own internship → 200 ───────────────
echo ""
echo "=== Test 4: Company views applications (expect 200) ==="
RESP=$(curl -s $BASE/internships/$INT_ID/applications \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN")
check "Returns array of applications" '"data"'        "$RESP"
check "Application has student info"  '"student"'     "$RESP"
check "Student has name"              '"name"'        "$RESP"

# ── Test 5: Student tries to view company applications → 403 ─────────────────
echo ""
echo "=== Test 5: Student views company applications (expect 403) ==="
RESP=$(curl -s $BASE/internships/$INT_ID/applications \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
check "Returns 403 unauthorized" 'unauthorized' "$RESP"

# ── Test 6: Company updates status → accepted ─────────────────────────────────
echo ""
echo "=== Test 6: Company accepts application ==="
RESP=$(curl -s -X PATCH $BASE/applications/$APP_ID/status \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -d '{"status":"accepted"}')
check "Returns accepted status"    '"accepted"'    "$RESP"
check "Returns success message"    'Application accepted' "$RESP"

# ── Test 7: Invalid status → 422 ─────────────────────────────────────────────
echo ""
echo "=== Test 7: Invalid status value (expect 422) ==="
RESP=$(curl -s -X PATCH $BASE/applications/$APP_ID/status \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -d '{"status":"pending"}')
check "Returns 422 validation error" '"status"' "$RESP"

# ── Test 8: Student updates status → 403 ─────────────────────────────────────
echo ""
echo "=== Test 8: Student updates status (expect 403) ==="
RESP=$(curl -s -X PATCH $BASE/applications/$APP_ID/status \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{"status":"rejected"}')
check "Returns 403 unauthorized" 'unauthorized' "$RESP"

# ── Test 9: Student views own applications → 200 ─────────────────────────────
echo ""
echo "=== Test 9: Student views own applications ==="
RESP=$(curl -s $BASE/student/applications \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
check "Returns data array"          '"data"'        "$RESP"
check "Application has internship"  '"internship"'  "$RESP"
check "Internship has company info" '"company"'     "$RESP"
check "Status is accepted"          '"accepted"'    "$RESP"

# ── Test 10: Company views student applications → 403 ─────────────────────────
echo ""
echo "=== Test 10: Company views student applications (expect 403) ==="
RESP=$(curl -s $BASE/student/applications \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN")
check "Returns 403" 'Only students' "$RESP"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "============================================"
echo " Results: $PASS passed, $FAIL failed"
echo "============================================"

kill $SERVER_PID 2>/dev/null
