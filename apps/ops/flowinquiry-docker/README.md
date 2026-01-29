# FlowInquiry Docker Quick Start

## Prerequisites

Only **Docker** with Docker Compose V2 required.

```bash
# Verify Docker
docker -v
docker compose version
```

---

## Option 1: One-liner Install (Recommended)

```bash
curl -sSL https://raw.githubusercontent.com/flowinquiry/flowinquiry/refs/heads/main/apps/ops/flowinquiry-docker/scripts/install-flowinquiry.sh -o install-flowinquiry.sh && chmod +x install-flowinquiry.sh && ./install-flowinquiry.sh
```

**What this does:**
1. Checks Docker installation
2. Creates `~/flowinquiry-docker/` directory
3. Downloads docker-compose files & scripts
4. Prompts for database password
5. Generates env files (`.backend.env`, `.frontend.env`)
6. Starts all services

---

## Option 2: Manual Docker Setup

```bash
# 1. Navigate to docker directory
cd apps/ops/flowinquiry-docker

# 2. Run setup (creates env files, prompts for DB password)
scripts/all.sh

# 3. Start services
docker compose -f services_http.yml up -d
```

---

## Services Started

| Service | Container | Description |
|---------|-----------|-------------|
| postgresql | postgres:16.3 | Database |
| back-end | flowinquiry-server:1.2.3 | Spring Boot API |
| front-end | flowinquiry-frontend:1.2.3 | Next.js UI |
| caddy | caddy:alpine | Reverse proxy |

---

## Access

| URL | Description |
|-----|-------------|
| http://localhost:1234 | FlowInquiry App (HTTP) |
| https://localhost | FlowInquiry App (HTTPS) |

**Default login**: `admin@flowinquiry.io` / `admin`

---

## Data Persistence

Data stored in `~/flowinquiry-docker/volumes/` (one-liner install) or `./volumes/` (manual):
- `postgresql/` - Database files
- `storage/` - Uploaded files

---

## Common Commands

```bash
# View logs
docker compose -f services_http.yml logs -f

# Stop services
docker compose -f services_http.yml down

# Restart
docker compose -f services_http.yml restart

# Remove all (including data)
docker compose -f services_http.yml down -v
```

---

## HTTPS Setup (Optional)

For HTTPS with auto SSL:
```bash
docker compose -f services_https.yml up -d
```
Access at https://localhost

---

## Verification Steps

1. Run install script
2. Wait for all containers to start
3. Open http://localhost:1234 (or https://localhost for SSL)
4. Login with `admin@flowinquiry.io` / `admin`
5. Verify dashboard loads

---

## Troubleshooting

### Check container status
```bash
docker compose -f services_http.yml ps
```

### View specific service logs
```bash
docker compose -f services_http.yml logs back-end
docker compose -f services_http.yml logs front-end
docker compose -f services_http.yml logs postgresql
```

### Reset and start fresh
```bash
docker compose -f services_http.yml down -v
rm -rf volumes/
scripts/all.sh
docker compose -f services_http.yml up -d
```
