import * as comments from "../../../cli/src/commands/comments";
import { buildSchema, jsonProperty } from "./schema";
import { asJson, asNumber, asString } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_save_comment",
    description: "Create or update comment",
    inputSchema: buildSchema({
      json: jsonProperty,
    }, ["json"]),
  },
  {
    name: "fi_get_comment",
    description: "Get comment",
    inputSchema: buildSchema({
      commentId: { type: "number" },
    }, ["commentId"]),
  },
  {
    name: "fi_list_comments",
    description: "List comments for entity",
    inputSchema: buildSchema({
      entityType: { type: "string" },
      entityId: { type: "number" },
    }, ["entityType", "entityId"]),
  },
  {
    name: "fi_delete_comment",
    description: "Delete comment",
    inputSchema: buildSchema({
      commentId: { type: "number" },
    }, ["commentId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_save_comment(args, config) {
    const payload = asJson(args.json, "json", true);
    return comments.saveComment(config, payload);
  },
  async fi_get_comment(args, config) {
    const commentId = asNumber(args.commentId, "commentId", true) as number;
    return comments.getComment(config, commentId);
  },
  async fi_list_comments(args, config) {
    const entityType = asString(args.entityType, "entityType", true) as string;
    const entityId = asNumber(args.entityId, "entityId", true) as number;
    return comments.listComments(config, entityType, entityId);
  },
  async fi_delete_comment(args, config) {
    const commentId = asNumber(args.commentId, "commentId", true) as number;
    return comments.deleteComment(config, commentId);
  },
};
