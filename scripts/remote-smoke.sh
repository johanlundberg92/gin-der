#!/usr/bin/env bash
set -euo pipefail

REMOTE_HTTP_HOST="${REMOTE_HTTP_HOST:-192.168.1.57}"
APP_HOST_PORT="${APP_HOST_PORT:-3000}"
SMOKE_RETRIES="${SMOKE_RETRIES:-30}"
SMOKE_DELAY_SECONDS="${SMOKE_DELAY_SECONDS:-2}"

for attempt in $(seq 1 "$SMOKE_RETRIES"); do
  if response="$(curl --fail --silent --show-error "http://${REMOTE_HTTP_HOST}:${APP_HOST_PORT}/api/health" 2>/dev/null)"; then
    printf '%s\n' "$response"
    exit 0
  fi

  if [ "$attempt" -lt "$SMOKE_RETRIES" ]; then
    sleep "$SMOKE_DELAY_SECONDS"
  fi
done

curl --fail --silent --show-error "http://${REMOTE_HTTP_HOST}:${APP_HOST_PORT}/api/health"
echo
