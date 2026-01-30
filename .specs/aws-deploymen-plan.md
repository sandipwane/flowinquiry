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
- 80/tcp: HTTP (if Caddy serves HTTP).
- 443/tcp: HTTPS (if Caddy serves TLS).

Do not expose database ports publicly. Use SSH tunneling if admin access is required.

## Caddy / TLS note (no public domain)
Caddy's default ACME TLS needs a public domain. With no domain:
- Use HTTP only on port 80, or
- Use internal TLS via `tls internal` in the Caddyfile.

## Deployment plan

### Step A — Preflight (local)
- Confirm AWS CLI is configured for `us-east-1`.
- Identify repo branch/tag to deploy.
- Validate local `.env` contains required values.
- Identify docker compose file(s) and config files.

### Step B — Provision AWS resources
- Create a new key pair.
- Create a security group with ports 22/80/443.
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
- Optional: enable UFW for 22/80/443.

### Step D — Deploy application
- Clone repo onto instance.
- Securely copy `.env` to instance.
- Set file permissions on secrets.
- Update compose/Caddy config for:
  - TLS mode (HTTP or internal TLS)
  - MCP/CLI env vars
  - Persistent volumes
- Start services with docker compose.

### Step E — Configure CLI and MCP
- Configure CLI to point to deployed backend.
- Validate MCP service is running and reachable.
- If auth tokens or config files are needed, place them from local environment.

### Step F — Validate
- Check container status and logs.
- Verify:
  - Frontend reachable via instance IP
  - Backend health endpoint responds
  - DB running and initialized
  - MCP endpoints reachable
  - CLI can authenticate and run a basic command

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
