# Flowinquiry POC Deployment Plan (AWS EC2, Single Node)

## Goal
Deploy the full Flowinquiry stack (frontend, backend, database, MCP, CLI integration, Caddy) to a single EC2 instance in `us-east-1`, using Docker/Compose, no public domain, and environment secrets from local `.env`. The result should be easy for a customer to replicate in a federal AWS environment.

## Instance sizing recommendation
- Default: `t3.medium` (2 vCPU, 4 GB RAM) for balanced POC.
- Low-cost minimal: `t3.small` (2 vCPU, 2 GB RAM); risk of memory pressure.
- Headroom: `t3.large` or `m6i.large` (2 vCPU, 8 GB RAM).

## EBS sizing recommendation
- POC size: 30–50 GB (gp3).
- Default: 50 GB gp3.

## Required security group ports
- 22/tcp: SSH (restrict to your IP).
- 1234/tcp: HTTP mode (services_http.yml).
- 443/tcp: HTTPS mode (services_https.yml).

Do not expose database ports publicly. Use SSH tunneling if admin access is required.

## Caddy / TLS note (no public domain)
Caddy's default ACME TLS needs a public domain. With no domain:
- Use HTTP only on port 80, or
- Use internal TLS via `tls internal` in the Caddyfile.

## Port mappings
- HTTP mode (`services_http.yml`): host `1234` → container `80`
- HTTPS mode (`services_https.yml`): host `443` → container `443`

## Prerequisites on instance
- Docker + Docker Compose v2
- Bun (for building fi-mcp)
- CHAI Universe binary (MCP host)

## Deployment plan

### Step A — Preflight (local)
- Confirm AWS CLI is configured for `us-east-1`.
- Identify repo branch/tag to deploy.
- Validate local `.env` contains required values.
- Identify docker compose file(s) and config files.

### Step B — Provision AWS resources
- Create a new key pair.
- Create a security group with ports 22/1234/443.
- Launch EC2 instance:
  - AMI: Ubuntu latest LTS (22.04 LTS unless 24.04 is approved)
  - Instance type: `t3.medium`
  - Disk: 50 GB gp3
  - Attach security group and key pair
- Record instance ID, public IPv4, and public DNS.

### Step C — Bootstrap instance
- SSH into instance.
- Update OS packages.
- Install Docker and Docker Compose (v2 plugin).
- Add `ubuntu` user to `docker` group.
- Optional: enable UFW for 22/1234/443.

### Step D — Deploy application
- Clone repo onto instance.
- Securely copy `.env` to instance (or create from template).
- Set file permissions on secrets (`chmod 600 .env .backend.env .frontend.env`).
- Update compose/Caddy config for:
  - TLS mode (HTTP or internal TLS)
  - Persistent volumes
- Note: Compose files are `services_http.yml` / `services_https.yml`.
- Start services:
  ```bash
  cd ~/flowinquiry/apps/ops/flowinquiry-docker
  docker compose -f services_http.yml up -d
  ```
- Verify all containers running: `docker compose -f services_http.yml ps`

### Step E — Configure CLI and MCP
- Configure CLI to point to deployed backend.
- Install Bun runtime:
  ```bash
  curl -fsSL https://bun.sh/install | bash
  source ~/.bashrc
  ```
- Build fi-mcp on instance:
  ```bash
  cd ~/flowinquiry/apps/mcp
  bun install
  bun run build
  ```
- Install CHAI Universe (MCP host binary).
- Configure CHAI Universe with fi-mcp:
  - Binary path: `~/flowinquiry/apps/mcp/dist/fi-mcp`
  - Env: `FLOWINQUIRY_BASE_URL=http://localhost:8080`
  - Env: `FLOWINQUIRY_TOKEN=<jwt_token_from_auth>`
- Note: fi-mcp connects to backend internally via localhost, bypassing Caddy.

### Step F — Validate
- Check container status and logs.
- Verify:
  - Frontend reachable via instance IP
  - Backend health endpoint responds (`curl http://localhost:8080/api/actuator/health`)
  - DB running and initialized
  - fi-mcp responds via CHAI Universe (test `tools/list` JSON-RPC call)
  - CLI can authenticate and run a basic command (`fi auth login`, `fi me`)

### Step G — Hardening and handoff
- Ensure docker services start on reboot.
- Document:
  - Instance details
  - SSH access steps
  - Start/stop commands
  - `.env` location
  - Logs and troubleshooting
- Optional: bake an AMI for repeatable installs.

## Customer deliverables
- A short runbook mirroring Steps B–F.
- An `.env` template (without secrets).
- A post-install validation checklist.
