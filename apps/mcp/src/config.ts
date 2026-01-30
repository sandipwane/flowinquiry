import type { CliConfig } from "../../cli/src/config";
import { McpError } from "./errors";

const DEFAULT_BASE_URL = "http://localhost:8080";

export function resolveConfig(baseUrl?: string): CliConfig {
  const token = process.env.FLOWINQUIRY_TOKEN;
  if (!token) {
    throw new McpError(-32001, "Missing FLOWINQUIRY_TOKEN");
  }

  const resolvedBaseUrl = baseUrl || process.env.FLOWINQUIRY_BASE_URL || DEFAULT_BASE_URL;

  return { baseUrl: resolvedBaseUrl, token };
}
