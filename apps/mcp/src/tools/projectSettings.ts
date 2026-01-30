import * as projectSettings from "../../../cli/src/commands/projectSettings";
import { buildSchema, projectSettingsJsonSchema } from "./schema";
import { asJson, asNumber } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_get_project_settings",
    description: "Get settings for a project",
    inputSchema: buildSchema({
      projectId: { type: "number", description: "Project ID" },
    }, ["projectId"]),
  },
  {
    name: "fi_create_project_settings",
    description: "Create project settings. Required: projectId",
    inputSchema: buildSchema({
      settings: projectSettingsJsonSchema,
    }, ["settings"]),
  },
  {
    name: "fi_update_project_settings",
    description: "Update project settings",
    inputSchema: buildSchema({
      projectId: { type: "number", description: "Project ID to update" },
      settings: projectSettingsJsonSchema,
    }, ["projectId", "settings"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_get_project_settings(args, config) {
    const projectId = asNumber(args.projectId, "projectId", true) as number;
    return projectSettings.getProjectSettings(config, projectId);
  },
  async fi_create_project_settings(args, config) {
    const payload = asJson(args.settings, "settings", true);
    return projectSettings.createProjectSettings(config, payload);
  },
  async fi_update_project_settings(args, config) {
    const projectId = asNumber(args.projectId, "projectId", true) as number;
    const payload = asJson(args.settings, "settings", true);
    return projectSettings.updateProjectSettings(config, projectId, payload);
  },
};
