# FlowInquiry MCP v2 — Full CLI Parity (stdio)

Owner: Sandip Wane  
Status: Draft  
Last updated: 2026-01-30

## Context
- The CLI (`apps/cli`) now exposes a comprehensive set of commands across auth, users, teams, workflows, projects, tickets, files, etc.
- The MCP server (`apps/mcp/src/index.ts`) currently exposes only a small subset of tools.
- Goal is to make MCP a full mirror of the CLI so AI agents can perform every CLI action through MCP.

## Goals
- Expose **every CLI command** as an MCP tool with structured JSON inputs.
- Keep MCP transport **stdio only** (no SSE server).
- Tool names must **not** include dots (`.`); use snake_case with a `fi_` prefix.
- Use **token-only auth** via `FLOWINQUIRY_TOKEN` (no login flow in MCP).
- Return raw JSON outputs where possible, with consistent handling for void endpoints.

## Non-Goals
- No backend changes.
- No shared command registry between CLI and MCP yet (possible future improvement).
- No new auth mechanisms or token caching.
- No transport expansion to SSE.

## Decisions / Constraints
- **Tool list:** full tool list returned by `tools/list` even if large.
- **Input format:** structured JSON objects only (no CLI-style string parsing).
- **Auth:** environment variable only (`FLOWINQUIRY_TOKEN`).
- **Naming:** `fi_<group>_<command>`; hyphens become underscores.
- **Base URL:** optional per-tool `baseUrl` overrides `FLOWINQUIRY_BASE_URL`.

## Current State (as of 2026-01-30)
- CLI commands live in `apps/cli/src/commands/*.ts` and are wired in `apps/cli/src/cli.ts`.
- MCP server in `apps/mcp/src/index.ts` only exposes 7 tools.
- CLI already has HTTP helpers, multipart support, downloads, and SSE client.

## Design

### 1) Tool Naming Convention (LLM-friendly)
Use **verb-first** human-readable names:
- `fi_<verb>_<noun>[_<context>]`
- Avoid dots and hyphens.
- Prefer plain English over internal group names when possible.
- Use consistent verbs: `get`, `list`, `search`, `create`, `update`, `delete`, `add`, `remove`, `download`, `upload`, `check`, `request`, `activate`, `reset`.

Examples:
- CLI: `auth whoami` → MCP: `fi_get_current_user`
- CLI: `team list` → MCP: `fi_list_teams`
- CLI: `project-settings get` → MCP: `fi_get_project_settings`
- CLI: `reset-password-init` → MCP: `fi_request_password_reset`

Collision rule:
- If two tools would share a name, add a short context suffix:
  - `fi_list_users` (global list)
  - `fi_list_team_users` (users scoped to a team)

### 2) Input Schema Rules
Each tool accepts a single JSON object:
- **Required fields** map to CLI required options.
- **Optional fields** map to optional flags.
- **`baseUrl`** is optional on every tool.
- For `--json` inputs in CLI, MCP accepts **structured JSON object** directly.
- For search endpoints, MCP accepts a `query` object of type `QueryDTO`.

QueryDTO format:
```json
{
  "filters": [
    { "field": "status", "operator": "eq", "value": "OPEN" }
  ]
}
```

Pagination inputs (standardized):
```json
{
  "page": 1,
  "size": 20,
  "sortField": "name",
  "sortDirection": "asc"
}
```

### 3) Auth + Config Resolution
- Token **must** come from `FLOWINQUIRY_TOKEN`.
- Base URL resolution:
  1) tool argument `baseUrl`
  2) `FLOWINQUIRY_BASE_URL`
  3) default `http://localhost:8080`
- Missing token → JSON-RPC error `code = -32001`.

### 4) Output Rules
- Return **raw JSON** from CLI functions.
- If CLI returns `undefined` (void), MCP should return:
  ```json
  { "ok": true }
  ```
- For text-only endpoints (e.g. AI summary), return a string.

### 5) Error Handling
- Keep `McpError` codes:
  - Validation: `-32602`
  - Missing token: `-32001`
  - HTTP errors: `-32002` (include status + body summary)
  - Unexpected: `-32099`

### 6) File Handling
MCP runs locally, so file paths are local paths on the MCP host.

Upload tools:
- Accept `filePath` (string) or `files` (string[]).
- Validate that files exist before calling CLI helper.

Download tools:
- Accept `path` (server path) and `outputPath` (local path).
- Return `{ path, contentType }` (same as CLI download result).

### 7) Streaming / SSE (Parity Note)
CLI supports `sse listen` which is streaming.
For MCP:
- Implement a **bounded** tool: `fi_sse_listen`.
- Inputs: `userId`, `maxMessages` (default 50), `timeoutMs` (default 30000).
- Collect messages until max or timeout, then return `string[]`.
- This keeps tool results finite and MCP-compatible.

## Implementation Plan

1) **Inventory CLI commands**
   - Use `apps/cli/src/cli.ts` as the source of truth.
   - For each command, record:
     - group name
     - command name
     - required options
     - optional options
     - backing function in `apps/cli/src/commands/*.ts`

2) **Create MCP tool registry (local to MCP)**
   - New folder: `apps/mcp/src/tools/`
   - One file per group (auth, users, teams, workflows, projects, tickets, files, etc).
   - Each file exports:
     - `tools: ToolDefinition[]`
     - `handlers: Record<string, (args) => Promise<unknown>>`
   - Aggregate in `apps/mcp/src/tools/index.ts`.

3) **Refactor MCP server**
   - `apps/mcp/src/index.ts`:
     - import tool registry
     - use shared validation helpers (`asString`, `asNumber`, etc)
     - implement `tools/list` using registry
     - dispatch `tools/call` via handler map
   - Keep stdio transport unchanged.

4) **Implement tools group-by-group**
   - Auth + Users
   - Authorities + Authority Permissions + Resources
   - Teams + Orgs + Workflows
   - Projects + Iterations + Epics + Project Settings
   - Tickets + Reports
   - Comments + Notifications + Activity + Watchers + App Settings
   - Files + Shared/AI + SSE

5) **Update MCP README**
   - List all tools (or link to generated list).
   - Provide usage examples for structured JSON inputs.

6) **Smoke tests**
   - Run MCP locally with `FLOWINQUIRY_TOKEN`.
   - Verify `tools/list` contains full set.
   - Call representative tools per group.

## Acceptance Criteria
- Every CLI command has a corresponding MCP tool.
- `tools/list` returns the full tool list.
- All tools accept structured JSON inputs (no CLI string parsing).
- Token-only auth enforced; missing token produces correct error.
- File upload/download works with local paths.
- SSE tool returns bounded list of messages.
- MCP README updated with usage examples.

## Risk / Notes
- Large tool list may be heavy but is the chosen approach.
- Manual registry means more maintenance; consider shared registry later.
