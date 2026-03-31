import * as activity from "../../../cli/src/commands/activity";
import { buildSchema, paginationProperties } from "./schema";
import { asNumber, asString } from "../validation";
import { buildPagination } from "./utils";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_list_activity_logs",
    description: "List activity logs",
    inputSchema: buildSchema({
      entityType: { type: "string" },
      entityId: { type: "number" },
      ...paginationProperties,
    }, ["entityType", "entityId"]),
  },
  {
    name: "fi_list_user_activity_logs",
    description: "List user activity logs",
    inputSchema: buildSchema({
      userId: { type: "number" },
      ...paginationProperties,
    }, ["userId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_list_activity_logs(args, config) {
    const entityType = asString(args.entityType, "entityType", true) as string;
    const entityId = asNumber(args.entityId, "entityId", true) as number;
    const pagination = buildPagination(args);
    return activity.listActivityLogs(config, entityType, entityId, pagination);
  },
  async fi_list_user_activity_logs(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    const pagination = buildPagination(args);
    return activity.listUserActivityLogs(config, userId, pagination);
  },
};
