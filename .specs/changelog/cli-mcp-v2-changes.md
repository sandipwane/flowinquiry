# MCP v2 (CLI Parity) — Change Summary

This document summarizes the changes made to bring the MCP server to full CLI parity (stdio).

## What changed

- Added a per-group MCP tool registry under `apps/mcp/src/tools/` with handlers for all CLI commands.
- Refactored the MCP stdio server to dispatch via the registry and normalize outputs/errors.
- Added shared validation/config helpers and bounded SSE tool support.
- Updated MCP README to document stdio usage and tool examples.

## Session Flow (stdio)

```mermaid
flowchart LR
  Client["MCP Client"] -->|JSON-RPC line| Stdio["MCP stdio server"]
  Stdio -->|tools/list| Registry["Tool registry"]
  Stdio -->|tools/call| Handler["Tool handler"]
  Handler -->|resolveConfig| Config["FLOWINQUIRY_TOKEN/baseUrl"]
  Handler -->|call CLI command| Cli["CLI command module"]
  Cli -->|HTTP request| Api["FlowInquiry API"]
  Api -->|JSON/text| Cli
  Cli --> Handler
  Handler -->|result| Stdio
  Stdio -->|JSON-RPC response| Client
```
