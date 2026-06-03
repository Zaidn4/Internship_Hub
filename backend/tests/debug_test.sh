#!/bin/bash
cd /home/zaid/projects/internship-platform/backend

php artisan serve --port=8000 &>/tmp/artisan-serve.log &
SERVER_PID=$!
sleep 4

echo "=== Register Student (full output) ==="
curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d @tests/register_student.json

kill $SERVER_PID 2>/dev/null
