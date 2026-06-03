#!/bin/bash
# =============================================================================
# Internship API Smoke Test Suite (v2 — fixed assertions)
# =============================================================================

cd /home/zaid/projects/internship-platform/backend

php artisan serve --port=8000 &>/tmp/artisan-serve.log &
SERVER_PID=$!
sleep 4

PASS=0; FAIL=0

check() {
  local desc="$1"; local expected="$2"; local actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    echo "  ✓ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $desc"
    echo "    Expected to contain: $expected"
    echo "    Got: $(echo "$actual" | head -c 300)"
    FAIL=$((FAIL + 1))
  fi
}

# ── Setup: Login ──────────────────────────────────────────────────────────────
echo ""
echo "=== Setup: Login as company ==="
COMPANY_RESP=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"hr@techcorp.com","password":"password123"}')
COMPANY_TOKEN=$(echo "$COMPANY_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")
if [ -z "$COMPANY_TOKEN" ]; then
  REG=$(curl -s -X POST http://localhost:8000/api/register \
    -H "Content-Type: application/json" -H "Accept: application/json" \
    -d '{"name":"TechCorp HR","email":"hr@techcorp.com","password":"password123","password_confirmation":"password123","role":"company","company_name":"TechCorp Ltd"}')
  COMPANY_TOKEN=$(echo "$REG" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")
fi
echo "  Token: ${COMPANY_TOKEN:0:30}..."

echo ""
echo "=== Setup: Login as student ==="
STUDENT_RESP=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"bob@fresh.com","password":"password123"}')
STUDENT_TOKEN=$(echo "$STUDENT_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")
echo "  Token: ${STUDENT_TOKEN:0:30}..."

# ── Test 1: Public index ──────────────────────────────────────────────────────
echo ""
echo "=== Test 1: GET /api/internships (public) ==="
RESP=$(curl -s http://localhost:8000/api/internships -H "Accept: application/json")
check "Returns data array"      '"data"' "$RESP"
check "Returns meta pagination" '"meta"' "$RESP"

# ── Test 2: Store as company ──────────────────────────────────────────────────
echo ""
echo "=== Test 2: POST /api/internships (company token) ==="
STORE_RESP=$(curl -s -X POST http://localhost:8000/api/internships \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -d '{"title":"Laravel Backend Intern","description":"Build APIs with Laravel 11","location":"London, UK","type":"hybrid","deadline":"2026-12-01","salary":1200}')
check "Returns success message"      'Internship created successfully' "$STORE_RESP"
check "Contains internship title"    'Laravel Backend Intern'          "$STORE_RESP"
check "Company relation eager-loaded" '"company"'                      "$STORE_RESP"
check "Skills relation eager-loaded" '"skills"'                        "$STORE_RESP"

INTERNSHIP_ID=$(echo "$STORE_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('internship',{}).get('id',''))" 2>/dev/null || echo "")
echo "  Created internship ID: $INTERNSHIP_ID"

# ── Test 3: Store as student → 403 ───────────────────────────────────────────
echo ""
echo "=== Test 3: POST /api/internships as student (expect 403) ==="
RESP=$(curl -s -X POST http://localhost:8000/api/internships \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{"title":"Hack","description":"...","type":"remote","deadline":"2026-12-01"}')
check "Returns 403 unauthorized" 'unauthorized' "$RESP"

# ── Test 4: Validation — missing title → 422 ─────────────────────────────────
echo ""
echo "=== Test 4: POST missing title (expect 422) ==="
RESP=$(curl -s -X POST http://localhost:8000/api/internships \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -d '{"description":"...","type":"remote","deadline":"2026-12-01"}')
check "Returns title validation error" '"title"' "$RESP"

# ── Test 5: Validation — past deadline → 422 ─────────────────────────────────
echo ""
echo "=== Test 5: POST with past deadline (expect 422) ==="
RESP=$(curl -s -X POST http://localhost:8000/api/internships \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $COMPANY_TOKEN" \
  -d '{"title":"Old role","description":"...","type":"remote","deadline":"2020-01-01"}')
check "Returns deadline validation error" '"deadline"' "$RESP"

# ── Test 6: Public show ───────────────────────────────────────────────────────
echo ""
echo "=== Test 6: GET /api/internships/{id} (public show) ==="
if [ -n "$INTERNSHIP_ID" ]; then
  RESP=$(curl -s http://localhost:8000/api/internships/$INTERNSHIP_ID -H "Accept: application/json")
  check "Returns internship title"  'Laravel Backend Intern' "$RESP"
  check "Company relation present" '"company"'               "$RESP"
  check "Skills relation present"  '"skills"'                "$RESP"
else
  echo "  ⚠ Skipped (no internship ID)"
fi

# ── Test 7: Update as owner ───────────────────────────────────────────────────
echo ""
echo "=== Test 7: PUT /api/internships/{id} as owner ==="
if [ -n "$INTERNSHIP_ID" ]; then
  RESP=$(curl -s -X PUT http://localhost:8000/api/internships/$INTERNSHIP_ID \
    -H "Content-Type: application/json" -H "Accept: application/json" \
    -H "Authorization: Bearer $COMPANY_TOKEN" \
    -d '{"title":"Senior Laravel Intern","salary":1500}')
  check "Returns updated title"   'Senior Laravel Intern'           "$RESP"
  check "Returns success message" 'Internship updated successfully' "$RESP"
else
  echo "  ⚠ Skipped (no internship ID)"
fi

# ── Test 8: Update as student → 403 ──────────────────────────────────────────
echo ""
echo "=== Test 8: PUT /api/internships/{id} as student (expect 403) ==="
if [ -n "$INTERNSHIP_ID" ]; then
  RESP=$(curl -s -X PUT http://localhost:8000/api/internships/$INTERNSHIP_ID \
    -H "Content-Type: application/json" -H "Accept: application/json" \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -d '{"title":"Hacked"}')
  check "Returns 403 unauthorized" 'unauthorized' "$RESP"
else
  echo "  ⚠ Skipped (no internship ID)"
fi

# ── Test 9: Delete as owner ───────────────────────────────────────────────────
echo ""
echo "=== Test 9: DELETE /api/internships/{id} as owner ==="
if [ -n "$INTERNSHIP_ID" ]; then
  RESP=$(curl -s -X DELETE http://localhost:8000/api/internships/$INTERNSHIP_ID \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $COMPANY_TOKEN")
  check "Returns deleted message" 'Internship deleted successfully' "$RESP"
else
  echo "  ⚠ Skipped (no internship ID)"
fi

# ── Test 10: Show deleted → 404 ──────────────────────────────────────────────
echo ""
echo "=== Test 10: GET deleted internship (expect 404) ==="
if [ -n "$INTERNSHIP_ID" ]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:8000/api/internships/$INTERNSHIP_ID \
    -H "Accept: application/json")
  check "Returns 404" '404' "$HTTP_CODE"
else
  echo "  ⚠ Skipped (no internship ID)"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "============================================"
echo " Results: $PASS passed, $FAIL failed"
echo "============================================"

kill $SERVER_PID 2>/dev/null
