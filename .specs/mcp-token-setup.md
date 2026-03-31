# MCP Token Setup for Claude Desktop

## Overview
Configure FlowInquiry MCP server in Claude Desktop with auth token.

## Prerequisites
- Backend running on `http://localhost:1234`
- Valid user credentials (default: admin@flowinquiry.io / admin)

## Steps

### 1. Generate Token
```bash
curl -s -X POST "http://localhost:1234/api/authenticate" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flowinquiry.io","password":"admin"}'
```

Response:
```json
{"id_token":"eyJhbGciOiJIUzUxMiJ9..."}
```

### 2. Update Claude Desktop Config

Location: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "flowinquiry": {
      "command": "/path/to/flowinquiry/apps/mcp/dist/fi-mcp",
      "env": {
        "FLOWINQUIRY_TOKEN": "<paste id_token here>",
        "FLOWINQUIRY_BASE_URL": "http://localhost:1234"
      }
    }
  }
}
```

### 3. Restart Claude Desktop
Quit and reopen Claude Desktop to load new token.

## Token Details
- Expires: ~24 hours
- Role: Matches user's role (ROLE_ADMIN for admin user)
- Refresh: Repeat steps when token expires

## Quick Script
Use `apps/cli/scripts/fi-auth.sh` for CLI token setup:
```bash
source apps/cli/scripts/fi-auth.sh
```
