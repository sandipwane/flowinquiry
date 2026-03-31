import { existsSync } from "node:fs";
import { McpError } from "./errors";

export function asObject(value: unknown, context: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new McpError(-32602, `${context} must be an object`);
  }
  return value as Record<string, unknown>;
}

export function asOptionalObject(value: unknown, context: string): Record<string, unknown> | undefined {
  if (value === undefined || value === null) return undefined;
  return asObject(value, context);
}

export function asString(value: unknown, field: string, required = false): string | undefined {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new McpError(-32602, `Missing required field: ${field}`);
    }
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  throw new McpError(-32602, `Field ${field} must be a string`);
}

export function asNumber(value: unknown, field: string, required = false): number | undefined {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new McpError(-32602, `Missing required field: ${field}`);
    }
    return undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  throw new McpError(-32602, `Field ${field} must be a number`);
}

export function asBoolean(value: unknown, field: string, required = false): boolean | undefined {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new McpError(-32602, `Missing required field: ${field}`);
    }
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  throw new McpError(-32602, `Field ${field} must be a boolean`);
}

export function asStringArray(value: unknown, field: string, required = false): string[] | undefined {
  if (value === undefined || value === null) {
    if (required) {
      throw new McpError(-32602, `Missing required field: ${field}`);
    }
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new McpError(-32602, `Field ${field} must be an array of strings`);
  }
  const result = value.map((entry) => {
    if (typeof entry !== "string") {
      throw new McpError(-32602, `Field ${field} must be an array of strings`);
    }
    return entry;
  });
  if (required && result.length === 0) {
    throw new McpError(-32602, `Field ${field} must not be empty`);
  }
  return result;
}

export function asNumberArray(value: unknown, field: string, required = false): number[] | undefined {
  if (value === undefined || value === null) {
    if (required) {
      throw new McpError(-32602, `Missing required field: ${field}`);
    }
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new McpError(-32602, `Field ${field} must be an array of numbers`);
  }
  const result = value.map((entry) => {
    if (typeof entry === "number" && Number.isFinite(entry)) {
      return entry;
    }
    if (typeof entry === "string" && entry.trim() !== "") {
      const parsed = Number(entry);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    throw new McpError(-32602, `Field ${field} must be an array of numbers`);
  });
  if (required && result.length === 0) {
    throw new McpError(-32602, `Field ${field} must not be empty`);
  }
  return result;
}

export function asJson(value: unknown, field: string, required = false): unknown {
  if (value === undefined || value === null) {
    if (required) {
      throw new McpError(-32602, `Missing required field: ${field}`);
    }
    return undefined;
  }
  if (typeof value === "object") {
    return value;
  }
  throw new McpError(-32602, `Field ${field} must be an object or array`);
}

export function asSortDirection(value: unknown): "asc" | "desc" | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (value === "asc" || value === "desc") {
    return value;
  }
  throw new McpError(-32602, "sortDirection must be 'asc' or 'desc'");
}

export function ensureFileExists(filePath: string, field: string) {
  if (!existsSync(filePath)) {
    throw new McpError(-32602, `File not found for ${field}: ${filePath}`);
  }
}

export function ensureFilesExist(files: string[], field: string) {
  for (const filePath of files) {
    ensureFileExists(filePath, field);
  }
}
