import * as iterations from "../../../cli/src/commands/iterations";
import { buildSchema, jsonProperty } from "./schema";
import { asJson, asNumber } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_get_iteration",
    description: "Get iteration",
    inputSchema: buildSchema({
      iterationId: { type: "number" },
    }, ["iterationId"]),
  },
  {
    name: "fi_create_iteration",
    description: "Create iteration",
    inputSchema: buildSchema({
      json: jsonProperty,
    }, ["json"]),
  },
  {
    name: "fi_update_iteration",
    description: "Update iteration",
    inputSchema: buildSchema({
      iterationId: { type: "number" },
      json: jsonProperty,
    }, ["iterationId", "json"]),
  },
  {
    name: "fi_delete_iteration",
    description: "Delete iteration",
    inputSchema: buildSchema({
      iterationId: { type: "number" },
    }, ["iterationId"]),
  },
  {
    name: "fi_close_iteration",
    description: "Close iteration",
    inputSchema: buildSchema({
      iterationId: { type: "number" },
    }, ["iterationId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_get_iteration(args, config) {
    const iterationId = asNumber(args.iterationId, "iterationId", true) as number;
    return iterations.getIteration(config, iterationId);
  },
  async fi_create_iteration(args, config) {
    const payload = asJson(args.json, "json", true);
    return iterations.createIteration(config, payload);
  },
  async fi_update_iteration(args, config) {
    const iterationId = asNumber(args.iterationId, "iterationId", true) as number;
    const payload = asJson(args.json, "json", true);
    return iterations.updateIteration(config, iterationId, payload);
  },
  async fi_delete_iteration(args, config) {
    const iterationId = asNumber(args.iterationId, "iterationId", true) as number;
    return iterations.deleteIteration(config, iterationId);
  },
  async fi_close_iteration(args, config) {
    const iterationId = asNumber(args.iterationId, "iterationId", true) as number;
    return iterations.closeIteration(config, iterationId);
  },
};
