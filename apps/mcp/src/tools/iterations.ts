import * as iterations from "../../../cli/src/commands/iterations";
import { buildSchema, iterationJsonSchema } from "./schema";
import { asJson, asNumber } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_get_iteration",
    description: "Get iteration/sprint by ID",
    inputSchema: buildSchema({
      iterationId: { type: "number", description: "Iteration ID" },
    }, ["iterationId"]),
  },
  {
    name: "fi_create_iteration",
    description: "Create iteration/sprint. Required: name, projectId",
    inputSchema: buildSchema({
      iteration: iterationJsonSchema,
    }, ["iteration"]),
  },
  {
    name: "fi_update_iteration",
    description: "Update iteration/sprint. Include 'id' in iteration object",
    inputSchema: buildSchema({
      iterationId: { type: "number", description: "Iteration ID to update" },
      iteration: iterationJsonSchema,
    }, ["iterationId", "iteration"]),
  },
  {
    name: "fi_delete_iteration",
    description: "Delete iteration/sprint",
    inputSchema: buildSchema({
      iterationId: { type: "number", description: "Iteration ID to delete" },
    }, ["iterationId"]),
  },
  {
    name: "fi_close_iteration",
    description: "Close/complete an iteration/sprint",
    inputSchema: buildSchema({
      iterationId: { type: "number", description: "Iteration ID to close" },
    }, ["iterationId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_get_iteration(args, config) {
    const iterationId = asNumber(args.iterationId, "iterationId", true) as number;
    return iterations.getIteration(config, iterationId);
  },
  async fi_create_iteration(args, config) {
    const payload = asJson(args.iteration, "iteration", true);
    return iterations.createIteration(config, payload);
  },
  async fi_update_iteration(args, config) {
    const iterationId = asNumber(args.iterationId, "iterationId", true) as number;
    const payload = asJson(args.iteration, "iteration", true);
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
