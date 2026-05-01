#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-johan@192.168.1.57}"
REMOTE_DIR="${REMOTE_DIR:-/home/johan/apps/gin-der}"

ssh "$REMOTE_HOST" "
  set -euo pipefail
  cd '$REMOTE_DIR'
  docker compose logs --tail=200 -f web
"
