#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

PROJECT_NAME="${SMOKE_COMPOSE_PROJECT_NAME:-gin-der-smoke}"
APP_HOST_PORT="${SMOKE_APP_HOST_PORT:-3123}"
DB_HOST_PORT="${SMOKE_DB_HOST_PORT:-5543}"
SMOKE_RETRIES="${SMOKE_RETRIES:-40}"
SMOKE_DELAY_SECONDS="${SMOKE_DELAY_SECONDS:-2}"
BASE_URL="http://127.0.0.1:${APP_HOST_PORT}"
API_BASE_URL="${BASE_URL}/api"

compose_cmd=(
  docker compose
  -p "$PROJECT_NAME"
  -f docker-compose.yml
  -f docker-compose.local.yml
  --profile dev
)
admin_cookie_jar="$(mktemp)"
participant_cookie_jar="$(mktemp)"

cleanup() {
  "${compose_cmd[@]}" down -v --remove-orphans >/dev/null 2>&1 || true
  rm -f "$admin_cookie_jar" "$participant_cookie_jar"
}

trap cleanup EXIT

APP_HOST_PORT="$APP_HOST_PORT" DB_HOST_PORT="$DB_HOST_PORT" "${compose_cmd[@]}" up -d --build db web-dev

for attempt in $(seq 1 "$SMOKE_RETRIES"); do
  if curl --fail --silent --show-error "${API_BASE_URL}/health" >/dev/null 2>&1; then
    break
  fi

  if [[ "$attempt" -eq "$SMOKE_RETRIES" ]]; then
    curl --fail --silent --show-error "${API_BASE_URL}/health"
    exit 1
  fi

  sleep "$SMOKE_DELAY_SECONDS"
done

create_response="$(
  curl --fail --silent --show-error \
    --cookie-jar "$admin_cookie_jar" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Smoke Flight",
      "gins": [
        {
          "name": "Smoke Gin",
          "abv": 43
        }
      ]
    }' \
    "${API_BASE_URL}/sessions"
)"

session_id="$(printf '%s' "$create_response" | node -e 'let input=""; process.stdin.on("data", (chunk) => input += chunk); process.stdin.on("end", () => { const data = JSON.parse(input); process.stdout.write(data.session.id); });')"
admin_pin="$(printf '%s' "$create_response" | node -e 'let input=""; process.stdin.on("data", (chunk) => input += chunk); process.stdin.on("end", () => { const data = JSON.parse(input); process.stdout.write(data.adminPin); });')"
join_code="$(printf '%s' "$create_response" | node -e 'let input=""; process.stdin.on("data", (chunk) => input += chunk); process.stdin.on("end", () => { const data = JSON.parse(input); process.stdout.write(data.session.joinCode); });')"
gin_id="$(printf '%s' "$create_response" | node -e 'let input=""; process.stdin.on("data", (chunk) => input += chunk); process.stdin.on("end", () => { const data = JSON.parse(input); process.stdout.write(data.session.gins[0].id); });')"

grep -q "gin-der-admin-${session_id}" "$admin_cookie_jar"

empty_results="$(
  curl --fail --silent --show-error \
    "${API_BASE_URL}/sessions/${session_id}/results"
)"
empty_top_rated="$(printf '%s' "$empty_results" | node -e 'let input=""; process.stdin.on("data", (chunk) => input += chunk); process.stdin.on("end", () => { const data = JSON.parse(input); process.stdout.write(data.results.topRatedGin === null ? "null" : data.results.topRatedGin.id); });')"

if [[ "$empty_top_rated" != "null" ]]; then
  echo "Expected no top-rated gin before notes were submitted." >&2
  exit 1
fi

join_response="$(
  curl --fail --silent --show-error \
    --cookie-jar "$participant_cookie_jar" \
    -H "Content-Type: application/json" \
    -d '{"name":"Smoke Tester"}' \
    "${API_BASE_URL}/sessions/${session_id}/join"
)"
participant_token="$(printf '%s' "$join_response" | node -e 'let input=""; process.stdin.on("data", (chunk) => input += chunk); process.stdin.on("end", () => { const data = JSON.parse(input); process.stdout.write(data.participant.accessToken); });')"

grep -q "gin-der-participant-${session_id}" "$participant_cookie_jar"

advance_session() {
  curl --fail --silent --show-error \
    -H "Content-Type: application/json" \
    -d "{\"adminPin\":\"${admin_pin}\"}" \
    "${API_BASE_URL}/sessions/${session_id}/advance" >/dev/null
}

advance_session
advance_session

curl --fail --silent --show-error \
  -H "Content-Type: application/json" \
  -d "{
    \"participantToken\":\"${participant_token}\",
    \"ginId\":\"${gin_id}\",
    \"overallScore\":8,
    \"juniper\":4,
    \"citrus\":3,
    \"floral\":2,
    \"spice\":3,
    \"herbal\":4,
    \"sweetness\":2,
    \"customNotes\":\"Smoke test note\"
  }" \
  "${API_BASE_URL}/sessions/${session_id}/notes" >/dev/null

advance_session
advance_session

results_response="$(
  curl --fail --silent --show-error \
    "${API_BASE_URL}/sessions/${session_id}/results?participantToken=${participant_token}"
)"
top_rated_gin_id="$(printf '%s' "$results_response" | node -e 'let input=""; process.stdin.on("data", (chunk) => input += chunk); process.stdin.on("end", () => { const data = JSON.parse(input); process.stdout.write(data.results.topRatedGin?.id ?? "null"); });')"

if [[ "$top_rated_gin_id" != "$gin_id" ]]; then
  echo "Expected the submitted gin to become top rated after one note." >&2
  exit 1
fi

advance_session

late_join_status="$(
  curl --silent \
    --output /dev/null \
    --write-out "%{http_code}" \
    -H "Content-Type: application/json" \
    -d '{"name":"Late Guest"}' \
    "${API_BASE_URL}/sessions/${session_id}/join"
)"

if [[ "$late_join_status" != "400" ]]; then
  echo "Expected completed sessions to reject new joins." >&2
  exit 1
fi

printf '{"ok":true,"sessionId":"%s","joinCode":"%s","appUrl":"%s"}\n' \
  "$session_id" \
  "$join_code" \
  "$BASE_URL"
