import * as shared from "../../../cli/src/commands/shared";
import { buildSchema } from "./schema";
import { asString } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_list_timezones",
    description: "List timezones",
    inputSchema: buildSchema({}),
  },
  {
    name: "fi_get_version",
    description: "Get current version",
    inputSchema: buildSchema({}),
  },
  {
    name: "fi_check_version",
    description: "Check latest version",
    inputSchema: buildSchema({}),
  },
  {
    name: "fi_ai_summary",
    description: "Summarize ticket description",
    inputSchema: buildSchema({
      text: { type: "string" },
    }, ["text"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_list_timezones(_args, config) {
    return shared.listTimezones(config);
  },
  async fi_get_version(_args, config) {
    return shared.getVersion(config);
  },
  async fi_check_version(_args, config) {
    return shared.checkVersion(config);
  },
  async fi_ai_summary(args, config) {
    const text = asString(args.text, "text", true) as string;
    return shared.aiSummary(config, text);
  },
};
