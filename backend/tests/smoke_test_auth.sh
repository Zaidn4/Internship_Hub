#!/bin/bash
cd /home/zaid/projects/internship-platform/backend

php artisan serve --port=8000 &>/tmp/artisan-serve.log &
SERVER_PID=$!
sleep 4

echo ""
echo "=== Test 1: Register Student ==="
curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Bob Fresh","email":"bob@fresh.com","password":"password123","password_confirmation":"password123","role":"student"}'
echo ""

echo ""
echo "=== Test 2: Register Company ==="
curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"NewCorp HR","email":"newcorp@fresh.com","password":"password123","password_confirmation":"password123","role":"company","company_name":"NewCorp Ltd"}'
echo ""

echo ""
echo "=== Test 3: Login (valid) ==="
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"bob@fresh.com","password":"password123"}')
echo "$LOGIN_RESPONSE"
echo ""

echo ""
echo "=== Test 4: Login (invalid password - expect 401) ==="
curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"bob@fresh.com","password":"wrongpassword"}'
echo ""

echo ""
echo "=== Test 5: GET /api/user with token ==="
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
curl -s -X GET http://localhost:8000/api/user \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo ""
echo "=== Test 6: GET /api/user without token (expect 401) ==="
curl -s -X GET http://localhost:8000/api/user \
  -H "Accept: application/json"
echo ""

echo ""
echo "=== Test 7: Logout ==="
curl -s -X POST http://localhost:8000/api/logout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo ""
echo "=== Test 8: GET /api/user after logout (expect 401) ==="
curl -s -X GET http://localhost:8000/api/user \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo ""
echo "=== Test 9: Company register without company_name (expect 422) ==="
curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Bad Corp","email":"bad@corp.com","password":"password123","password_confirmation":"password123","role":"company"}'
echo ""

kill $SERVER_PID 2>/dev/null
echo ""
echo "=== All tests complete ==="
