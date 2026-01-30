# FlowInquiry CLI (fi) Usage Guide

## Overview
- CLI for FlowInquiry backend API
- Built with Bun + Commander.js
- JWT token-based auth

## Quick Start

```bash
# 1. Auth (uses fi-auth.sh script)
source apps/cli/scripts/fi-auth.sh

# 2. Run commands
bun apps/cli/src/index.ts <command> [options]
```

## Configuration

| Env Variable | Default | Description |
|--------------|---------|-------------|
| `FLOWINQUIRY_TOKEN` | - | JWT token (required for most commands) |
| `FLOWINQUIRY_BASE_URL` | `http://localhost:8080` | API base URL |

**Note:** When using Docker setup, use `http://localhost:1234` (Caddy proxy)

### Global Options
```bash
--base-url <url>   # Override base URL
```

## Build & Development

```bash
cd apps/cli

# Run CLI
bun src/index.ts <command>

# Dev mode
bun dev

# Type check
bun typecheck

# Regenerate API types from OpenAPI spec
bun gen:api
```

## Command Groups

```
fi
├── auth          # Authentication
├── user          # User management
├── authority     # Role/authority management
├── authority-permission  # Permission management
├── resource      # Resource operations
├── team          # Team operations
├── org           # Organization operations
├── workflow      # Workflow operations
├── project       # Project operations
├── iteration     # Sprint/iteration operations
├── epic          # Epic operations
├── project-setting  # Project settings
├── ticket        # Ticket operations
├── report        # Reports
├── comment       # Comments
├── notification  # Notifications
├── activity      # Activity logs
├── watcher       # Entity watchers
├── setting       # App settings
├── file          # File uploads/downloads
├── timezone      # Timezone data
├── version       # Version info
├── ai            # AI helpers
├── sse           # Server-sent events
└── help          # Show help
```

## Common Patterns

### Pagination
```bash
--page <n>           # Page number (default: 1)
--size <n>           # Page size (default: 20)
--sort-field <field> # Sort by field
--sort-direction <asc|desc>  # Sort direction
```

### Filtering
```bash
--filter <field:op:value>   # Filter (repeatable)
--filter-json '<json>'      # Raw QueryDTO JSON
```

### JSON Payloads
```bash
--json '<json>'   # Pass JSON data for create/update
```

## Command Reference

### Auth Commands
```bash
# Get JWT token (no token required)
fi auth authenticate --email <email> --password <pass>

# Login + get user profile
fi auth login --email <email> --password <pass>

# Check session
fi auth session

# Current user info
fi auth whoami

# Register new account
fi auth register --json '{"email":"...","password":"..."}'

# Change password
fi auth change-password --current <old> --new <new>

# Password reset flow
fi auth reset-password-init --email <email>
fi auth reset-password-finish --key <key> --new <pass>
```

### User Commands
```bash
fi user search [--page 1] [--size 20] [--filter ...]
fi user get --user-id <id>
fi user create --json '<user_json>'
fi user update --json '<user_json>' [--avatar <path>]
fi user delete --user-id <id>
fi user permissions --user-id <id>
fi user direct-reports --manager-id <id>
fi user hierarchy --user-id <id>
fi user org-chart
fi user search-term --term <term>
fi user locale --lang <langKey>
```

### Team Commands
```bash
fi team list [--page 1] [--size 20]
fi team get --team-id <id>
fi team create --json '<team_json>' [--logo <path>]
fi team update --json '<team_json>' [--logo <path>]
fi team delete --team-id <id>
fi team delete-bulk --team-ids <id1,id2,...>
fi team users --team-id <id>
fi team by-user --user-id <id>
fi team add-users --team-id <id> --user-ids <ids> --role <role>
fi team remove-user --team-id <id> --user-id <id>
fi team search-users-not-in --team-id <id> --term <term>
fi team user-role --team-id <id> --user-id <id>
fi team has-manager --team-id <id>
```

### Ticket Commands
```bash
# Create ticket
fi ticket create \
  --team-id <id> \
  --workflow-id <id> \
  --state-id <id> \
  --requester-id <id> \
  --priority <Critical|High|Medium|Low> \
  --title "<title>" \
  --description "<desc>"

# Search/CRUD
fi ticket search [--filter teamId:eq:1]
fi ticket get --ticket-id <id>
fi ticket update --ticket-id <id> --json '<json>'
fi ticket delete --ticket-id <id>

# Navigation
fi ticket next --ticket-id <id> [--project-id <id>]
fi ticket previous --ticket-id <id> [--project-id <id>]

# State management
fi ticket state-history --ticket-id <id>
fi ticket update-state --ticket-id <id> --new-state-id <id>

# Team analytics
fi ticket team distribution --team-id <id> [--from <iso>] [--to <iso>]
fi ticket team priority-distribution --team-id <id>
fi ticket team statistics --team-id <id>
fi ticket team overdue --team-id <id>
fi ticket team unassigned --team-id <id>
fi ticket team creation-series --team-id <id> [--days 7]

# User analytics
fi ticket user overdue --user-id <id>
fi ticket user team-priority-distribution --user-id <id>
```

### Project Commands
```bash
fi project search [--filter teamId:eq:1]
fi project get --project-id <id>
fi project create --json '<json>'
fi project update --project-id <id> --json '<json>'
fi project delete --project-id <id>
fi project export --format csv|xlsx --out <path>
fi project iterations --project-id <id>
fi project epics --project-id <id>
fi project short-name --short-name <name>
fi project by-user --user-id <id>
```

### Workflow Commands
```bash
fi workflow search
fi workflow get --workflow-id <id>
fi workflow list --team-id <id> [--used-for-project true|false]
fi workflow transitions --workflow-id <id> --state-id <id>
fi workflow initial-states --workflow-id <id>
fi workflow details --workflow-id <id>
fi workflow details-create --json '<json>'
fi workflow details-update --workflow-id <id> --json '<json>'
```

### File Commands
```bash
fi file upload --path <local_path> --type <storage_type>
fi file attach --entity-type <type> --entity-id <id> --files <paths>
fi file attachments --entity-type <type> --entity-id <id>
fi file delete-attachment --attachment-id <id>
fi file download --remote-path <path> --out <local_path>
```

### Other Commands
```bash
# Comments
fi comment save --json '<json>'
fi comment list --entity-type <type> --entity-id <id>
fi comment delete --comment-id <id>

# Notifications
fi notification list --user-id <id>
fi notification mark-read --notification-ids <ids>
fi notification unread --user-id <id>

# Activity logs
fi activity list --entity-type <type> --entity-id <id>
fi activity user --user-id <id>

# Watchers
fi watcher add --entity-type <type> --entity-id <id> --user-ids <ids>
fi watcher remove --entity-type <type> --entity-id <id> --user-ids <ids>
fi watcher list --entity-type <type> --entity-id <id>

# Settings
fi setting get --key <key>
fi setting list [--group <group>]
fi setting update --json '[...]'

# Misc
fi timezone list
fi version get
fi version check
fi ai summary --text "<text>"
fi sse listen --user-id <id>
```

## Examples

### Full workflow: Create a ticket
```bash
# 1. Auth
source fi-auth.sh

# 2. Find team
bun apps/cli/src/index.ts team list

# 3. Get workflow for team
bun apps/cli/src/index.ts workflow list --team-id 1

# 4. Get initial states
bun apps/cli/src/index.ts workflow initial-states --workflow-id 1

# 5. Create ticket
bun apps/cli/src/index.ts ticket create \
  --team-id 1 \
  --workflow-id 1 \
  --state-id 1 \
  --requester-id 1 \
  --priority Medium \
  --title "Fix login bug" \
  --description "Users cannot login with SSO"
```

### Export projects to CSV
```bash
bun apps/cli/src/index.ts project export \
  --format csv \
  --out ./projects.csv \
  --filter teamId:eq:1
```

## File Structure

```
apps/cli/
├── src/
│   ├── index.ts          # Entry point
│   ├── cli.ts            # Command definitions
│   ├── config.ts         # Config loader
│   ├── http.ts           # HTTP client
│   ├── output.ts         # Output formatting
│   ├── utils.ts          # Utilities
│   ├── types.ts          # Type definitions
│   ├── gen/
│   │   └── api.ts        # Generated OpenAPI types
│   └── commands/
│       ├── auth.ts
│       ├── users.ts
│       ├── teams.ts
│       ├── tickets.ts
│       └── ... (20+ command modules)
├── package.json
└── tsconfig.json
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `FLOWINQUIRY_TOKEN is required` | Run `source fi-auth.sh` |
| Connection refused on 8080 | Use `http://localhost:1234` with Docker |
| Token expired | Re-run `source fi-auth.sh` |
| Invalid JSON | Escape quotes properly in shell |
