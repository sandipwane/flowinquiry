import * as authorityPermissions from "../../../cli/src/commands/authorityPermissions";
import { buildSchema, jsonProperty } from "./schema";
import { asJson, asString } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_get_authority_permissions",
    description: "Get permissions for authority",
    inputSchema: buildSchema({
      name: { type: "string" },
    }, ["name"]),
  },
  {
    name: "fi_save_authority_permissions",
    description: "Save authority permissions",
    inputSchema: buildSchema({
      json: jsonProperty,
    }, ["json"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_get_authority_permissions(args, config) {
    const name = asString(args.name, "name", true) as string;
    return authorityPermissions.getAuthorityPermissions(config, name);
  },
  async fi_save_authority_permissions(args, config) {
    const payload = asJson(args.json, "json", true);
    return authorityPermissions.saveAuthorityPermissions(config, payload);
  },
};
