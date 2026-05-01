#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

export PRISMA_HIDE_UPDATE_MESSAGE=1

npm run prisma:generate
npm run check
