# FlowInquiry MCP Server (fi-mcp)

Bun-based MCP server that exposes FlowInquiry CLI operations over **stdio**.

## Build

```bash
cd apps/mcp
bun run build
```

Binary output:

```
apps/mcp/dist/fi-mcp
```

## Run (stdio)

```bash
export FLOWINQUIRY_TOKEN="your_jwt_token"
export FLOWINQUIRY_BASE_URL="http://localhost:8080"  # optional

./apps/mcp/dist/fi-mcp
```

The server reads JSON-RPC requests from stdin and writes responses to stdout.

## Example JSON-RPC

List tools:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list"}
```

Call a tool (current user):

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "fi_get_current_user",
    "arguments": {}
  }
}
```

Call a tool with inputs (create ticket):

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "fi_create_ticket",
    "arguments": {
      "teamId": 1,
      "workflowId": 2,
      "stateId": 3,
      "requesterId": 4,
      "priority": "High",
      "title": "Login fails",
      "description": "Users cannot login"
    }
  }
}
```

## Notes

- Auth is **token-only** via `FLOWINQUIRY_TOKEN` (no login flow in MCP).
- `baseUrl` can be passed per-tool to override `FLOWINQUIRY_BASE_URL`.
- File tools use **local paths** on the MCP host.
- `tools/list` returns the full tool set (large by design).

## Troubleshooting

- Missing token: set `FLOWINQUIRY_TOKEN` before starting the server.
- API base URL: set `FLOWINQUIRY_BASE_URL` if the API is not on `http://localhost:8080`.
