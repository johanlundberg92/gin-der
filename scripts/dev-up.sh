#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

compose_cmd=(docker compose -f docker-compose.yml -f docker-compose.local.yml --profile dev)

port_in_use() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

preferred_port="${APP_HOST_PORT:-}"
if [[ -z "$preferred_port" ]] && [[ -f .env ]]; then
  preferred_port="$(awk -F= '/^APP_HOST_PORT=/{print $2; exit}' .env)"
fi
preferred_port="${preferred_port:-3000}"

if "${compose_cmd[@]}" ps --status running web-dev | grep -q web-dev; then
  selected_port="$("${compose_cmd[@]}" port web-dev 3000 | sed 's/.*://')"
else
  selected_port="$preferred_port"
  while port_in_use "$selected_port"; do
    selected_port=$((selected_port + 1))
  done
fi

echo "Starting local dev on http://localhost:${selected_port}"
APP_HOST_PORT="$selected_port" "${compose_cmd[@]}" up --build --force-recreate --renew-anon-volumes web-dev db
