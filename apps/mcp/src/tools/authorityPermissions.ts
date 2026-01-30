import * as authorityPermissions from "../../../cli/src/commands/authorityPermissions";
import { buildSchema, authorityPermissionsJsonSchema } from "./schema";
import { asJson, asString } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_get_authority_permissions",
    description: "Get permissions assigned to an authority/role",
    inputSchema: buildSchema({
      name: { type: "string", description: "Authority name (e.g., 'ROLE_ADMIN')" },
    }, ["name"]),
  },
  {
    name: "fi_save_authority_permissions",
    description: "Save/update permissions for an authority. Required: authorityName, permissions array",
    inputSchema: buildSchema({
      permissions: authorityPermissionsJsonSchema,
    }, ["permissions"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_get_authority_permissions(args, config) {
    const name = asString(args.name, "name", true) as string;
    return authorityPermissions.getAuthorityPermissions(config, name);
  },
  async fi_save_authority_permissions(args, config) {
    const payload = asJson(args.permissions, "permissions", true);
    return authorityPermissions.saveAuthorityPermissions(config, payload);
  },
};
