#!/usr/bin/env bash
set -euo pipefail

REMOTE_HTTP_HOST="${REMOTE_HTTP_HOST:-192.168.1.57}"
APP_HOST_PORT="${APP_HOST_PORT:-3000}"

curl --fail --silent --show-error "http://${REMOTE_HTTP_HOST}:${APP_HOST_PORT}/api/health"
echo
