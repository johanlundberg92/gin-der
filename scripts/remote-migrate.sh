#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-johan@192.168.1.57}"
REMOTE_DIR="${REMOTE_DIR:-/home/johan/apps/gin-der}"
APP_HOST_PORT="${APP_HOST_PORT:-3000}"

ssh "$REMOTE_HOST" "
  set -euo pipefail
  cd '$REMOTE_DIR'
  APP_HOST_PORT='$APP_HOST_PORT' docker compose up -d db
  container_id=\$(APP_HOST_PORT='$APP_HOST_PORT' docker compose ps -q db)
  until [ -n \"\$container_id\" ] && [ \"\$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' \"\$container_id\")\" = healthy ]; do
    sleep 1
    container_id=\$(APP_HOST_PORT='$APP_HOST_PORT' docker compose ps -q db)
  done
  APP_HOST_PORT='$APP_HOST_PORT' docker compose run --rm web npm run prisma:migrate:deploy
"
