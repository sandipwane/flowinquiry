import * as teams from "../../../cli/src/commands/teams";
import { buildSchema, jsonProperty, paginationProperties, queryProperty } from "./schema";
import {
  asJson,
  asNumber,
  asNumberArray,
  asString,
  ensureFileExists,
} from "../validation";
import { buildPagination, buildQuery } from "./utils";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_list_teams",
    description: "List teams",
    inputSchema: buildSchema({
      ...paginationProperties,
      query: queryProperty,
    }),
  },
  {
    name: "fi_get_team",
    description: "Get team by id",
    inputSchema: buildSchema({
      teamId: { type: "number" },
    }, ["teamId"]),
  },
  {
    name: "fi_create_team",
    description: "Create team (multipart)",
    inputSchema: buildSchema({
      json: jsonProperty,
      logoPath: { type: "string" },
    }, ["json"]),
  },
  {
    name: "fi_update_team",
    description: "Update team (multipart)",
    inputSchema: buildSchema({
      json: jsonProperty,
      logoPath: { type: "string" },
    }, ["json"]),
  },
  {
    name: "fi_delete_team",
    description: "Delete team",
    inputSchema: buildSchema({
      teamId: { type: "number" },
    }, ["teamId"]),
  },
  {
    name: "fi_delete_teams",
    description: "Delete multiple teams",
    inputSchema: buildSchema({
      teamIds: { type: "array", items: { type: "number" } },
    }, ["teamIds"]),
  },
  {
    name: "fi_list_team_users",
    description: "List users for a team",
    inputSchema: buildSchema({
      teamId: { type: "number" },
    }, ["teamId"]),
  },
  {
    name: "fi_list_teams_by_user",
    description: "List teams for a user",
    inputSchema: buildSchema({
      userId: { type: "number" },
    }, ["userId"]),
  },
  {
    name: "fi_add_users_to_team",
    description: "Add users to team",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      userIds: { type: "array", items: { type: "number" } },
      role: { type: "string" },
    }, ["teamId", "userIds", "role"]),
  },
  {
    name: "fi_search_users_not_in_team",
    description: "Search users not in team",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      term: { type: "string" },
    }, ["teamId", "term"]),
  },
  {
    name: "fi_remove_user_from_team",
    description: "Remove user from team",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      userId: { type: "number" },
    }, ["teamId", "userId"]),
  },
  {
    name: "fi_get_team_user_role",
    description: "Get user role in team",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      userId: { type: "number" },
    }, ["teamId", "userId"]),
  },
  {
    name: "fi_check_team_has_manager",
    description: "Check if team has manager",
    inputSchema: buildSchema({
      teamId: { type: "number" },
    }, ["teamId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_list_teams(args, config) {
    const pagination = buildPagination(args);
    const query = buildQuery(args);
    return teams.listTeams(config, pagination, query);
  },
  async fi_get_team(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    return teams.getTeam(config, teamId);
  },
  async fi_create_team(args, config) {
    const payload = asJson(args.json, "json", true);
    const logoPath = asString(args.logoPath, "logoPath");
    if (logoPath) {
      ensureFileExists(logoPath, "logoPath");
    }
    return teams.createTeam(config, payload, logoPath);
  },
  async fi_update_team(args, config) {
    const payload = asJson(args.json, "json", true);
    const logoPath = asString(args.logoPath, "logoPath");
    if (logoPath) {
      ensureFileExists(logoPath, "logoPath");
    }
    return teams.updateTeam(config, payload, logoPath);
  },
  async fi_delete_team(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    return teams.deleteTeam(config, teamId);
  },
  async fi_delete_teams(args, config) {
    const teamIds = asNumberArray(args.teamIds, "teamIds", true) as number[];
    return teams.deleteTeams(config, teamIds);
  },
  async fi_list_team_users(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    return teams.listTeamUsers(config, teamId);
  },
  async fi_list_teams_by_user(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    return teams.getTeamsByUser(config, userId);
  },
  async fi_add_users_to_team(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const userIds = asNumberArray(args.userIds, "userIds", true) as number[];
    const role = asString(args.role, "role", true) as string;
    return teams.addUsersToTeam(config, teamId, userIds, role);
  },
  async fi_search_users_not_in_team(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const term = asString(args.term, "term", true) as string;
    return teams.searchUsersNotInTeam(config, teamId, term);
  },
  async fi_remove_user_from_team(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const userId = asNumber(args.userId, "userId", true) as number;
    return teams.removeUserFromTeam(config, teamId, userId);
  },
  async fi_get_team_user_role(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const userId = asNumber(args.userId, "userId", true) as number;
    return teams.getUserRoleInTeam(config, teamId, userId);
  },
  async fi_check_team_has_manager(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    return teams.hasManager(config, teamId);
  },
};
