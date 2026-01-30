import * as projectSettings from "../../../cli/src/commands/projectSettings";
import { buildSchema, jsonProperty } from "./schema";
import { asJson, asNumber } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_get_project_settings",
    description: "Get project settings",
    inputSchema: buildSchema({
      projectId: { type: "number" },
    }, ["projectId"]),
  },
  {
    name: "fi_create_project_settings",
    description: "Create project settings",
    inputSchema: buildSchema({
      json: jsonProperty,
    }, ["json"]),
  },
  {
    name: "fi_update_project_settings",
    description: "Update project settings",
    inputSchema: buildSchema({
      projectId: { type: "number" },
      json: jsonProperty,
    }, ["projectId", "json"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_get_project_settings(args, config) {
    const projectId = asNumber(args.projectId, "projectId", true) as number;
    return projectSettings.getProjectSettings(config, projectId);
  },
  async fi_create_project_settings(args, config) {
    const payload = asJson(args.json, "json", true);
    return projectSettings.createProjectSettings(config, payload);
  },
  async fi_update_project_settings(args, config) {
    const projectId = asNumber(args.projectId, "projectId", true) as number;
    const payload = asJson(args.json, "json", true);
    return projectSettings.updateProjectSettings(config, projectId, payload);
  },
};
