#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_HOST="${REMOTE_HOST:-johan@192.168.1.57}"
REMOTE_DIR="${REMOTE_DIR:-/home/johan/apps/gin-der}"
APP_HOST_PORT="${APP_HOST_PORT:-3000}"

cd "$ROOT_DIR"

tar \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='coverage' \
  --exclude='.env' \
  --exclude='.env.*' \
  -czf - . | ssh "$REMOTE_HOST" "mkdir -p '$REMOTE_DIR' && tar -xzf - -C '$REMOTE_DIR'"

ssh "$REMOTE_HOST" "
  set -euo pipefail
  cd '$REMOTE_DIR'
  APP_HOST_PORT='$APP_HOST_PORT' docker compose build web
  APP_HOST_PORT='$APP_HOST_PORT' docker compose up -d db
  container_id=\$(APP_HOST_PORT='$APP_HOST_PORT' docker compose ps -q db)
  until [ -n \"\$container_id\" ] && [ \"\$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' \"\$container_id\")\" = healthy ]; do
    sleep 1
    container_id=\$(APP_HOST_PORT='$APP_HOST_PORT' docker compose ps -q db)
  done
  APP_HOST_PORT='$APP_HOST_PORT' docker compose run --rm web npm run prisma:migrate:deploy
  APP_HOST_PORT='$APP_HOST_PORT' docker compose up -d web
"

"$ROOT_DIR/scripts/remote-smoke.sh"
