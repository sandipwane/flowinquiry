import * as epics from "../../../cli/src/commands/epics";
import { buildSchema, jsonProperty } from "./schema";
import { asJson, asNumber } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_get_epic",
    description: "Get epic",
    inputSchema: buildSchema({
      epicId: { type: "number" },
    }, ["epicId"]),
  },
  {
    name: "fi_create_epic",
    description: "Create epic",
    inputSchema: buildSchema({
      json: jsonProperty,
    }, ["json"]),
  },
  {
    name: "fi_update_epic",
    description: "Update epic",
    inputSchema: buildSchema({
      epicId: { type: "number" },
      json: jsonProperty,
    }, ["epicId", "json"]),
  },
  {
    name: "fi_delete_epic",
    description: "Delete epic",
    inputSchema: buildSchema({
      epicId: { type: "number" },
    }, ["epicId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_get_epic(args, config) {
    const epicId = asNumber(args.epicId, "epicId", true) as number;
    return epics.getEpic(config, epicId);
  },
  async fi_create_epic(args, config) {
    const payload = asJson(args.json, "json", true);
    return epics.createEpic(config, payload);
  },
  async fi_update_epic(args, config) {
    const epicId = asNumber(args.epicId, "epicId", true) as number;
    const payload = asJson(args.json, "json", true);
    return epics.updateEpic(config, epicId, payload);
  },
  async fi_delete_epic(args, config) {
    const epicId = asNumber(args.epicId, "epicId", true) as number;
    return epics.deleteEpic(config, epicId);
  },
};
