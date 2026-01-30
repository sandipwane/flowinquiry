import * as watchers from "../../../cli/src/commands/watchers";
import { buildSchema, paginationProperties } from "./schema";
import { asNumber, asNumberArray, asString } from "../validation";
import { buildPagination } from "./utils";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_add_watchers",
    description: "Add watchers to entity",
    inputSchema: buildSchema({
      entityType: { type: "string" },
      entityId: { type: "number" },
      userIds: { type: "array", items: { type: "number" } },
    }, ["entityType", "entityId", "userIds"]),
  },
  {
    name: "fi_remove_watchers",
    description: "Remove watchers from entity",
    inputSchema: buildSchema({
      entityType: { type: "string" },
      entityId: { type: "number" },
      userIds: { type: "array", items: { type: "number" } },
    }, ["entityType", "entityId", "userIds"]),
  },
  {
    name: "fi_remove_watcher",
    description: "Remove single watcher",
    inputSchema: buildSchema({
      entityType: { type: "string" },
      entityId: { type: "number" },
      userId: { type: "number" },
    }, ["entityType", "entityId", "userId"]),
  },
  {
    name: "fi_list_watchers",
    description: "List entity watchers",
    inputSchema: buildSchema({
      entityType: { type: "string" },
      entityId: { type: "number" },
    }, ["entityType", "entityId"]),
  },
  {
    name: "fi_list_watched_entities",
    description: "List watched entities",
    inputSchema: buildSchema({
      userId: { type: "number" },
      ...paginationProperties,
    }, ["userId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_add_watchers(args, config) {
    const entityType = asString(args.entityType, "entityType", true) as string;
    const entityId = asNumber(args.entityId, "entityId", true) as number;
    const userIds = asNumberArray(args.userIds, "userIds", true) as number[];
    return watchers.addWatchers(config, entityType, entityId, userIds);
  },
  async fi_remove_watchers(args, config) {
    const entityType = asString(args.entityType, "entityType", true) as string;
    const entityId = asNumber(args.entityId, "entityId", true) as number;
    const userIds = asNumberArray(args.userIds, "userIds", true) as number[];
    return watchers.removeWatchers(config, entityType, entityId, userIds);
  },
  async fi_remove_watcher(args, config) {
    const entityType = asString(args.entityType, "entityType", true) as string;
    const entityId = asNumber(args.entityId, "entityId", true) as number;
    const userId = asNumber(args.userId, "userId", true) as number;
    return watchers.removeWatcher(config, entityType, entityId, userId);
  },
  async fi_list_watchers(args, config) {
    const entityType = asString(args.entityType, "entityType", true) as string;
    const entityId = asNumber(args.entityId, "entityId", true) as number;
    return watchers.listWatchers(config, entityType, entityId);
  },
  async fi_list_watched_entities(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    const pagination = buildPagination(args);
    return watchers.listWatchedEntities(config, userId, pagination);
  },
};
