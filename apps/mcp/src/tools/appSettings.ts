import * as appSettings from "../../../cli/src/commands/appSettings";
import { buildSchema, jsonProperty } from "./schema";
import { asJson, asString } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_get_setting",
    description: "Get setting by key",
    inputSchema: buildSchema({
      key: { type: "string" },
    }, ["key"]),
  },
  {
    name: "fi_list_settings",
    description: "List settings",
    inputSchema: buildSchema({
      group: { type: "string" },
    }),
  },
  {
    name: "fi_update_settings",
    description: "Update settings",
    inputSchema: buildSchema({
      json: jsonProperty,
    }, ["json"]),
  },
  {
    name: "fi_update_setting",
    description: "Update setting by key",
    inputSchema: buildSchema({
      key: { type: "string" },
      json: jsonProperty,
    }, ["key", "json"]),
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
    const payload = asJson(args.json, "json", true);
    return appSettings.updateSettings(config, payload);
  },
  async fi_update_setting(args, config) {
    const key = asString(args.key, "key", true) as string;
    const payload = asJson(args.json, "json", true);
    return appSettings.updateSetting(config, key, payload);
  },
};
