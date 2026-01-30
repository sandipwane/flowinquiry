import * as appSettings from "../../../cli/src/commands/appSettings";
import { buildSchema, appSettingJsonSchema } from "./schema";
import { asJson, asString } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_get_setting",
    description: "Get application setting by key",
    inputSchema: buildSchema({
      key: { type: "string", description: "Setting key" },
    }, ["key"]),
  },
  {
    name: "fi_list_settings",
    description: "List application settings, optionally filtered by group",
    inputSchema: buildSchema({
      group: { type: "string", description: "Optional setting group to filter by" },
    }),
  },
  {
    name: "fi_update_settings",
    description: "Update multiple application settings at once",
    inputSchema: buildSchema({
      settings: {
        type: "array",
        items: appSettingJsonSchema,
        description: "Array of settings to update",
      },
    }, ["settings"]),
  },
  {
    name: "fi_update_setting",
    description: "Update a single application setting by key",
    inputSchema: buildSchema({
      key: { type: "string", description: "Setting key to update" },
      setting: appSettingJsonSchema,
    }, ["key", "setting"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_get_setting(args, config) {
    const key = asString(args.key, "key", true) as string;
    return appSettings.getSetting(config, key);
  },
  async fi_list_settings(args, config) {
    const group = asString(args.group, "group");
    return appSettings.listSettings(config, group);
  },
  async fi_update_settings(args, config) {
    const payload = asJson(args.settings, "settings", true);
    return appSettings.updateSettings(config, payload);
  },
  async fi_update_setting(args, config) {
    const key = asString(args.key, "key", true) as string;
    const payload = asJson(args.setting, "setting", true);
    return appSettings.updateSetting(config, key, payload);
  },
};
