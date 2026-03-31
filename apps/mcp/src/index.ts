#!/usr/bin/env bun

import { resolveConfig } from "./config";
import { McpError } from "./errors";
import { asObject, asString } from "./validation";
import { handlers, tools } from "./tools";

export type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: unknown;
};

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
};

function jsonRpcResult(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

function normalizeHttpError(error: Error): McpError | null {
  if (!error.message.startsWith("HTTP ")) return null;
  const rest = error.message.slice(5);
  const spaceIndex = rest.indexOf(" ");
  if (spaceIndex === -1) return null;
  const status = Number(rest.slice(0, spaceIndex));
  if (!Number.isFinite(status)) return null;
  const body = rest.slice(spaceIndex + 1).trim();

  // Try to extract meaningful error message from JSON response
  let errorMessage = `HTTP ${status}`;
  let parsedBody: unknown = body;

  if (body) {
    // Find JSON in the body (format is: "statusText {json}")
    const jsonStart = body.indexOf("{");
    if (jsonStart !== -1) {
      try {
        parsedBody = JSON.parse(body.slice(jsonStart));
        const obj = parsedBody as Record<string, unknown>;
        // Common error message fields in APIs
        const msg = obj.message || obj.error || obj.detail || obj.title || obj.errorMessage;
        if (typeof msg === "string") {
          errorMessage = `HTTP ${status}: ${msg}`;
        } else if (typeof msg === "object" && msg !== null) {
          errorMessage = `HTTP ${status}: ${JSON.stringify(msg)}`;
        }
      } catch {
        // Not JSON, use raw body
        errorMessage = `HTTP ${status}: ${body.slice(0, 200)}`;
      }
    } else {
      errorMessage = `HTTP ${status}: ${body.slice(0, 200)}`;
    }
  }

  return new McpError(-32002, errorMessage, {
    status,
    body: parsedBody,
  });
}

function toMcpError(error: unknown): McpError {
  if (error instanceof McpError) {
    return error;
  }
  if (error instanceof Error) {
    const httpError = normalizeHttpError(error);
    if (httpError) return httpError;
    return new McpError(-32099, error.message || "Unexpected error");
  }
  return new McpError(-32099, "Unexpected error");
}

function jsonRpcError(id: JsonRpcId, error: unknown): JsonRpcResponse {
  const mcpError = toMcpError(error);
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: mcpError.code,
      message: mcpError.message,
      data: mcpError.data,
    },
  };
}

function formatResult(result: unknown): string {
  const normalized = result === undefined ? { ok: true } : result;
  if (typeof normalized === "string") return normalized;
  return JSON.stringify(normalized, null, 2);
}

async function handleToolCall(name: string, args: Record<string, unknown>) {
  const baseUrl = asString(args.baseUrl, "baseUrl");
  const config = resolveConfig(baseUrl);
  const handler = handlers[name];
  if (!handler) {
    throw new McpError(-32601, `Unknown tool: ${name}`);
  }
  return handler(args, config);
}

async function handleRpcMessage(message: JsonRpcRequest): Promise<JsonRpcResponse | undefined> {
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    const id = (message && "id" in message) ? (message.id ?? null) : null;
    return jsonRpcError(id, new McpError(-32600, "Invalid JSON-RPC request"));
  }

  const id = message.id ?? null;

  try {
    switch (message.method) {
      case "initialize":
        return jsonRpcResult(id, {
          protocolVersion: "2024-11-05",
          serverInfo: { name: "flowinquiry-mcp", version: "1.0.0" },
          capabilities: { tools: {} },
        });
      case "notifications/initialized":
        return undefined;
      case "tools/list":
        return jsonRpcResult(id, { tools });
      case "tools/call": {
        const params = asObject(message.params ?? {}, "tools/call params");
        const name = asString(params.name, "name", true) as string;
        const args = params.arguments ? asObject(params.arguments, "arguments") : {};
        const result = await handleToolCall(name, args);
        return jsonRpcResult(id, { content: [{ type: "text", text: formatResult(result) }] });
      }
      case "ping":
        return jsonRpcResult(id, {});
      default:
        if (message.id === undefined) {
          return undefined;
        }
        return jsonRpcError(id, new McpError(-32601, `Method not found: ${message.method}`));
    }
  } catch (error) {
    return jsonRpcError(id, error);
  }
}

function write(data: string) {
  Bun.write(Bun.stdout, data);
}

let buffer = "";
const decoder = new TextDecoder();

for await (const chunk of Bun.stdin.stream()) {
  buffer += decoder.decode(chunk, { stream: true });

  let newlineIndex: number;
  while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, newlineIndex);
    buffer = buffer.slice(newlineIndex + 1);

    if (!line.trim()) continue;

    try {
      const request = JSON.parse(line) as JsonRpcRequest;
      const response = await handleRpcMessage(request);
      if (response) {
        write(JSON.stringify(response) + "\n");
      }
    } catch (e) {
      console.error("Parse error:", e);
    }
  }
}
