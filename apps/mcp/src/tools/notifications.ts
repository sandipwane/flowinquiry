import * as notifications from "../../../cli/src/commands/notifications";
import { buildSchema, paginationProperties } from "./schema";
import { asNumber, asNumberArray } from "../validation";
import { buildPagination } from "./utils";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_list_notifications",
    description: "List notifications",
    inputSchema: buildSchema({
      userId: { type: "number" },
      ...paginationProperties,
    }, ["userId"]),
  },
  {
    name: "fi_mark_notifications_read",
    description: "Mark notifications as read",
    inputSchema: buildSchema({
      notificationIds: { type: "array", items: { type: "number" } },
    }, ["notificationIds"]),
  },
  {
    name: "fi_list_unread_notifications",
    description: "List unread notifications",
    inputSchema: buildSchema({
      userId: { type: "number" },
    }, ["userId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_list_notifications(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    const pagination = buildPagination(args);
    return notifications.listNotifications(config, userId, pagination);
  },
  async fi_mark_notifications_read(args, config) {
    const notificationIds = asNumberArray(args.notificationIds, "notificationIds", true) as number[];
    return notifications.markNotificationsRead(config, notificationIds);
  },
  async fi_list_unread_notifications(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    return notifications.listUnreadNotifications(config, userId);
  },
};
