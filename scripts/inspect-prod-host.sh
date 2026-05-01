#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-johan@192.168.1.57}"

ssh "$REMOTE_HOST" '
  echo "== docker compose =="
  docker compose version || true
  echo
  echo "== docker ps =="
  docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
  echo
  echo "== listeners =="
  ss -tuln
'
