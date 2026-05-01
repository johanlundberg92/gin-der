#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

container_health() {
  docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' "$1"
}

wait_for_db() {
  local container_id
  docker compose -f docker-compose.yml -f docker-compose.local.yml up -d db >/dev/null
  container_id="$(docker compose -f docker-compose.yml -f docker-compose.local.yml ps -q db)"

  until [[ -n "$container_id" ]] && [[ "$(container_health "$container_id")" == "healthy" ]]; do
    sleep 1
    container_id="$(docker compose -f docker-compose.yml -f docker-compose.local.yml ps -q db)"
  done
}

wait_for_db

if [[ -n "$(docker compose -f docker-compose.yml -f docker-compose.local.yml --profile dev ps -q web-dev)" ]]; then
  docker compose -f docker-compose.yml -f docker-compose.local.yml --profile dev exec -T web-dev npm run prisma:seed
else
  docker compose -f docker-compose.yml -f docker-compose.local.yml --profile dev run --rm web-dev npm run prisma:seed
fi
