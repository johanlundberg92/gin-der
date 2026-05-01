#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
docker compose -f docker-compose.yml -f docker-compose.local.yml --profile dev down --remove-orphans
