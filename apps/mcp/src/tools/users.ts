import * as users from "../../../cli/src/commands/users";
import { buildSchema, jsonProperty, paginationProperties, queryProperty } from "./schema";
import {
  asJson,
  asNumber,
  asString,
  ensureFileExists,
} from "../validation";
import { buildPagination, buildQuery } from "./utils";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_search_users",
    description: "Search users",
    inputSchema: buildSchema({
      ...paginationProperties,
      query: queryProperty,
    }),
  },
  {
    name: "fi_get_user",
    description: "Get user by id",
    inputSchema: buildSchema({
      userId: { type: "number" },
    }, ["userId"]),
  },
  {
    name: "fi_create_user",
    description: "Create a user",
    inputSchema: buildSchema({
      json: jsonProperty,
    }, ["json"]),
  },
  {
    name: "fi_update_user",
    description: "Update a user (multipart)",
    inputSchema: buildSchema({
      json: jsonProperty,
      avatarPath: { type: "string" },
    }, ["json"]),
  },
  {
    name: "fi_delete_user",
    description: "Delete a user",
    inputSchema: buildSchema({
      userId: { type: "number" },
    }, ["userId"]),
  },
  {
    name: "fi_get_user_permissions",
    description: "Get user permissions",
    inputSchema: buildSchema({
      userId: { type: "number" },
    }, ["userId"]),
  },
  {
    name: "fi_list_direct_reports",
    description: "List direct reports for manager",
    inputSchema: buildSchema({
      managerId: { type: "number" },
    }, ["managerId"]),
  },
  {
    name: "fi_get_user_hierarchy",
    description: "Get user hierarchy",
    inputSchema: buildSchema({
      userId: { type: "number" },
    }, ["userId"]),
  },
  {
    name: "fi_get_org_chart",
    description: "Get organization chart",
    inputSchema: buildSchema({}),
  },
  {
    name: "fi_search_users_by_term",
    description: "Search users by term",
    inputSchema: buildSchema({
      term: { type: "string" },
    }, ["term"]),
  },
  {
    name: "fi_update_current_user_locale",
    description: "Update current user locale",
    inputSchema: buildSchema({
      lang: { type: "string" },
    }, ["lang"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_search_users(args, config) {
    const pagination = buildPagination(args);
    const query = buildQuery(args);
    return users.searchUsers(config, pagination, query);
  },
  async fi_get_user(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    return users.getUser(config, userId);
  },
  async fi_create_user(args, config) {
    const payload = asJson(args.json, "json", true);
    return users.createUser(config, payload);
  },
  async fi_update_user(args, config) {
    const payload = asJson(args.json, "json", true);
    const avatarPath = asString(args.avatarPath, "avatarPath");
    if (avatarPath) {
      ensureFileExists(avatarPath, "avatarPath");
    }
    return users.updateUser(config, payload, avatarPath);
  },
  async fi_delete_user(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    return users.deleteUser(config, userId);
  },
  async fi_get_user_permissions(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    return users.getUserPermissions(config, userId);
  },
  async fi_list_direct_reports(args, config) {
    const managerId = asNumber(args.managerId, "managerId", true) as number;
    return users.getDirectReports(config, managerId);
  },
  async fi_get_user_hierarchy(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    return users.getUserHierarchy(config, userId);
  },
  async fi_get_org_chart(_args, config) {
    return users.getOrgChart(config);
  },
  async fi_search_users_by_term(args, config) {
    const term = asString(args.term, "term", true) as string;
    return users.searchUsersByTerm(config, term);
  },
  async fi_update_current_user_locale(args, config) {
    const lang = asString(args.lang, "lang", true) as string;
    return users.updateLocale(config, lang);
  },
};
