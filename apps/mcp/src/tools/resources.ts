import * as resources from "../../../cli/src/commands/resources";
import { buildSchema } from "./schema";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_list_resources",
    description: "List resources",
    inputSchema: buildSchema({}),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_list_resources(_args, config) {
    return resources.listResources(config);
  },
};
