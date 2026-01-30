# Development Environment Setup

## Quick Start (Docker - Recommended)
```bash
# From repo root
docker compose -f apps/ops/flowinquiry-docker/services_http.yml up -d
```
Access at: http://localhost:1234

## Services Started
| Container  | Port | Description          |
|------------|------|----------------------|
| postgresql | 5432 | Database             |
| back-end   | 8080 | Java Spring backend  |
| front-end  | 3000 | Next.js frontend     |
| caddy      | 1234 | Reverse proxy        |

## Prerequisites
Files in `apps/ops/flowinquiry-docker/`:

### `.env` - Docker Compose variables
```
POSTGRES_PASSWORD=<your_password>
JWT_BASE64_SECRET=<your_jwt_secret>
```

### `.backend.env` - Backend secrets
```
POSTGRES_PASSWORD=<your_password>
JWT_BASE64_SECRET=<your_jwt_secret>
```

### `.frontend.env` - Frontend secrets
```
AUTH_SECRET=<your_auth_secret>
AUTH_TRUST_HOST=true
```

## Useful Commands
```bash
# Start all services
docker compose -f apps/ops/flowinquiry-docker/services_http.yml up -d

# Check status
docker ps --filter name=flowinquiry

# View backend logs
docker logs flowinquiry-back-end-1 -f

# Stop all services
docker compose -f apps/ops/flowinquiry-docker/services_http.yml down

# Restart specific service
docker compose -f apps/ops/flowinquiry-docker/services_http.yml restart back-end
```

## Troubleshooting

### Backend exits immediately
- Check logs: `docker logs flowinquiry-back-end-1`
- Common issue: Missing `JWT_BASE64_SECRET` in environment
- Ensure `.env` file exists with both `POSTGRES_PASSWORD` and `JWT_BASE64_SECRET`

### Container name conflict
```bash
docker rm flowinquiry-back-end-1
docker compose -f apps/ops/flowinquiry-docker/services_http.yml up -d
```

### Local development (requires Java 21)
```bash
npm run docker:up      # Start only PostgreSQL
npm run backend:dev    # Start backend (needs Java 21)
npm run frontend:dev   # Start frontend
```

**Note:** `npm run backend:setup` has sed compatibility issues on macOS. Use Docker instead.
