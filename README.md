# gin-der

`gin-der` is a local-network gin tasting app built with Next.js, Prisma, PostgreSQL, and Docker Compose. It is designed mobile-first for participant phones, while the admin dashboard runs the room from a second device.

The UI supports **Swedish and English**, with **Swedish as the default**. Users can switch language from the header on any page.

## Stack

- Next.js App Router + TypeScript
- Prisma + PostgreSQL
- Framer Motion, Lucide, Recharts
- Docker Compose for local parity and production deployment

## Local development on macOS (M1)

1. Copy env defaults:

   ```bash
   cp .env.example .env
   ```

2. Start the Dockerized local development stack:

   ```bash
   ./scripts/dev-up.sh
   ```

   This runs both **PostgreSQL and the Next.js dev server in Docker**, and automatically uses the first free host port starting at `3000`.

   It prints the chosen URL when it starts. You can still override the default start port if you want:

   ```bash
   APP_HOST_PORT=3011 ./scripts/dev-up.sh
   ```

   Local-only Docker overrides live in `docker-compose.local.yml`, including the published Postgres port on `5433`.

3. Stop local services:

   ```bash
   ./scripts/dev-down.sh
   ```

The default local app URL is `http://localhost:3000`.

## Demo data

Seed a sample tasting session into the Dockerized local database:

```bash
./scripts/seed-demo.sh
```

## Checks

Run the local verification flow:

```bash
./scripts/test-local.sh
```

## Docker

Bring up the production-style stack locally:

```bash
docker compose up --build
```

For live-reload local development specifically, prefer:

```bash
./scripts/dev-up.sh
```

## Production host

The production host is `johan@192.168.1.57`. A survey of the host showed common web ports already in use, while `3000` was available, so the default published app port is `3000`.

Production does **not** publish PostgreSQL on the host. The database stays on the internal Compose network and is only used by the app container.

Participant QR codes use `PUBLIC_BASE_URL`, which defaults to `http://192.168.1.57:3000`.

## Script reference

### Local Docker workflow

| When | Command |
|---|---|
| Start the local Docker dev stack | `./scripts/dev-up.sh` |
| Stop the local Docker dev stack | `./scripts/dev-down.sh` |
| Rebuild/restart local dev after app or Docker changes | `./scripts/dev-rebuild.sh` |
| Seed demo data into the local Docker database | `./scripts/seed-demo.sh` |
| Run local checks | `./scripts/test-local.sh` |
| Run the production-style stack locally | `docker compose up --build` |

If local port `3000` is already in use, prefix commands with something like:

```bash
APP_HOST_PORT=3011 ./scripts/dev-up.sh
```

### Production workflow

| When | Command |
|---|---|
| Inspect current host services and ports | `./scripts/inspect-prod-host.sh` |
| First deploy or normal redeploy to prod | `./scripts/deploy-ssh.sh` |
| Run production migrations only | `./scripts/remote-migrate.sh` |
| Tail production app logs | `./scripts/remote-logs.sh` |
| Smoke-check the deployed production app | `./scripts/remote-smoke.sh` |

### Inspect the host again

```bash
./scripts/inspect-prod-host.sh
```

### Deploy over SSH

```bash
./scripts/deploy-ssh.sh
```

### Run migrations remotely

```bash
./scripts/remote-migrate.sh
```

### Tail production logs

```bash
./scripts/remote-logs.sh
```

### Smoke-check the deployed app

```bash
./scripts/remote-smoke.sh
```

## Routes

- `/` landing page
- `/join` join-code lookup
- `/session/[joinCode]` participant flow
- `/admin` session creation and list
- `/admin/session/[sessionId]` live admin conductor view

## API routes

- `GET /api/health`
- `GET|POST /api/sessions`
- `GET /api/sessions/:id`
- `POST /api/sessions/:id/join`
- `POST /api/sessions/:id/advance`
- `POST /api/sessions/:id/notes`
- `GET /api/sessions/:id/results`
- `GET /api/sessions/:id/events`
