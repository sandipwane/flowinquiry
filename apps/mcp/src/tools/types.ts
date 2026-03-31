import type { CliConfig } from "../../../cli/src/config";

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

export type ToolHandler = (
  args: Record<string, unknown>,
  config: CliConfig,
) => Promise<unknown>;
