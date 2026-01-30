import * as projects from "../../../cli/src/commands/projects";
import { buildSchema, jsonProperty, paginationProperties, queryProperty } from "./schema";
import { asJson, asNumber, asString } from "../validation";
import { buildPagination, buildQuery } from "./utils";
import type { ToolDefinition, ToolHandler } from "./types";
import { McpError } from "../errors";

export const tools: ToolDefinition[] = [
  {
    name: "fi_search_projects",
    description: "Search projects",
    inputSchema: buildSchema({
      ...paginationProperties,
      query: queryProperty,
    }),
  },
  {
    name: "fi_get_project",
    description: "Get project by id",
    inputSchema: buildSchema({
      projectId: { type: "number" },
    }, ["projectId"]),
  },
  {
    name: "fi_create_project",
    description: "Create project",
    inputSchema: buildSchema({
      json: jsonProperty,
    }, ["json"]),
  },
  {
    name: "fi_update_project",
    description: "Update project",
    inputSchema: buildSchema({
      projectId: { type: "number" },
      json: jsonProperty,
    }, ["projectId", "json"]),
  },
  {
    name: "fi_delete_project",
    description: "Delete project",
    inputSchema: buildSchema({
      projectId: { type: "number" },
    }, ["projectId"]),
  },
  {
    name: "fi_export_projects",
    description: "Export projects",
    inputSchema: buildSchema({
      ...paginationProperties,
      query: queryProperty,
      format: { type: "string", enum: ["csv", "xlsx"] },
      outputPath: { type: "string" },
    }, ["format", "outputPath"]),
  },
  {
    name: "fi_list_project_iterations",
    description: "List project iterations",
    inputSchema: buildSchema({
      projectId: { type: "number" },
    }, ["projectId"]),
  },
  {
    name: "fi_list_project_epics",
    description: "List project epics",
    inputSchema: buildSchema({
      projectId: { type: "number" },
    }, ["projectId"]),
  },
  {
    name: "fi_get_project_by_short_name",
    description: "Get project by short name",
    inputSchema: buildSchema({
      shortName: { type: "string" },
    }, ["shortName"]),
  },
  {
    name: "fi_list_projects_by_user",
    description: "List projects by user",
    inputSchema: buildSchema({
      userId: { type: "number" },
      ...paginationProperties,
    }, ["userId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_search_projects(args, config) {
    const pagination = buildPagination(args);
    const query = buildQuery(args);
    return projects.listProjects(config, pagination, query);
  },
  async fi_get_project(args, config) {
    const projectId = asNumber(args.projectId, "projectId", true) as number;
    return projects.getProject(config, projectId);
  },
  async fi_create_project(args, config) {
    const payload = asJson(args.json, "json", true);
    return projects.createProject(config, payload);
  },
  async fi_update_project(args, config) {
    const projectId = asNumber(args.projectId, "projectId", true) as number;
    const payload = asJson(args.json, "json", true);
    return projects.updateProject(config, projectId, payload);
  },
  async fi_delete_project(args, config) {
    const projectId = asNumber(args.projectId, "projectId", true) as number;
    return projects.deleteProject(config, projectId);
  },
  async fi_export_projects(args, config) {
    const pagination = buildPagination(args);
    const query = buildQuery(args);
    const format = asString(args.format, "format", true) as string;
    const outputPath = asString(args.outputPath, "outputPath", true) as string;
    const accept = format === "xlsx"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "text/csv";
    if (format !== "csv" && format !== "xlsx") {
      throw new McpError(-32602, "format must be 'csv' or 'xlsx'");
    }
    return projects.exportProjects(config, pagination, query, accept, outputPath);
  },
  async fi_list_project_iterations(args, config) {
    const projectId = asNumber(args.projectId, "projectId", true) as number;
    return projects.getProjectIterations(config, projectId);
  },
  async fi_list_project_epics(args, config) {
    const projectId = asNumber(args.projectId, "projectId", true) as number;
    return projects.getProjectEpics(config, projectId);
  },
  async fi_get_project_by_short_name(args, config) {
    const shortName = asString(args.shortName, "shortName", true) as string;
    return projects.getProjectByShortName(config, shortName);
  },
  async fi_list_projects_by_user(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    const pagination = buildPagination(args);
    return projects.getProjectsByUser(config, userId, pagination);
  },
};
