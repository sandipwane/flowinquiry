import * as authorities from "../../../cli/src/commands/authorities";
import { buildSchema, paginationProperties, authorityJsonSchema } from "./schema";
import { asJson, asNumber, asNumberArray, asString } from "../validation";
import { buildPagination } from "./utils";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_create_authority",
    description: "Create authority/role. Required: name",
    inputSchema: buildSchema({
      authority: authorityJsonSchema,
    }, ["authority"]),
  },
  {
    name: "fi_list_authorities",
    description: "List all authorities/roles with pagination",
    inputSchema: buildSchema({
      ...paginationProperties,
    }),
  },
  {
    name: "fi_get_authority",
    description: "Get authority/role by name",
    inputSchema: buildSchema({
      name: { type: "string", description: "Authority name (e.g., 'ROLE_ADMIN')" },
    }, ["name"]),
  },
  {
    name: "fi_delete_authority",
    description: "Delete authority/role",
    inputSchema: buildSchema({
      id: { type: "string", description: "Authority ID to delete" },
    }, ["id"]),
  },
  {
    name: "fi_list_authority_users",
    description: "List users assigned to an authority/role",
    inputSchema: buildSchema({
      name: { type: "string", description: "Authority name" },
      ...paginationProperties,
    }, ["name"]),
  },
  {
    name: "fi_search_users_not_in_authority",
    description: "Search users not assigned to an authority",
    inputSchema: buildSchema({
      name: { type: "string", description: "Authority name" },
      term: { type: "string", description: "Search term (name or email)" },
    }, ["name", "term"]),
  },
  {
    name: "fi_add_users_to_authority",
    description: "Add users to an authority/role",
    inputSchema: buildSchema({
      name: { type: "string", description: "Authority name" },
      userIds: { type: "array", items: { type: "number" }, description: "Array of user IDs to add" },
    }, ["name", "userIds"]),
  },
  {
    name: "fi_remove_user_from_authority",
    description: "Remove user from an authority/role",
    inputSchema: buildSchema({
      name: { type: "string", description: "Authority name" },
      userId: { type: "number", description: "User ID to remove" },
    }, ["name", "userId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_create_authority(args, config) {
    const payload = asJson(args.authority, "authority", true);
    return authorities.createAuthority(config, payload);
  },
  async fi_list_authorities(args, config) {
    const pagination = buildPagination(args);
    return authorities.listAuthorities(config, pagination);
  },
  async fi_get_authority(args, config) {
    const name = asString(args.name, "name", true) as string;
    return authorities.getAuthority(config, name);
  },
  async fi_delete_authority(args, config) {
    const id = asString(args.id, "id", true) as string;
    return authorities.deleteAuthority(config, id);
  },
  async fi_list_authority_users(args, config) {
    const name = asString(args.name, "name", true) as string;
    const pagination = buildPagination(args);
    return authorities.getUsersByAuthority(config, name, pagination);
  },
  async fi_search_users_not_in_authority(args, config) {
    const name = asString(args.name, "name", true) as string;
    const term = asString(args.term, "term", true) as string;
    return authorities.searchUsersNotInAuthority(config, name, term);
  },
  async fi_add_users_to_authority(args, config) {
    const name = asString(args.name, "name", true) as string;
    const userIds = asNumberArray(args.userIds, "userIds", true) as number[];
    return authorities.addUsersToAuthority(config, name, userIds);
  },
  async fi_remove_user_from_authority(args, config) {
    const name = asString(args.name, "name", true) as string;
    const userId = asNumber(args.userId, "userId", true) as number;
    return authorities.removeUserFromAuthority(config, name, userId);
  },
};
