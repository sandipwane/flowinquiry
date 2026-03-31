import * as files from "../../../cli/src/commands/files";
import { buildSchema } from "./schema";
import {
  asNumber,
  asString,
  asStringArray,
  ensureFileExists,
  ensureFilesExist,
} from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_upload_file",
    description: "Upload a file",
    inputSchema: buildSchema({
      filePath: { type: "string" },
      type: { type: "string" },
      parentPath: { type: "string" },
    }, ["filePath", "type"]),
  },
  {
    name: "fi_upload_entity_attachments",
    description: "Upload entity attachments",
    inputSchema: buildSchema({
      entityType: { type: "string" },
      entityId: { type: "number" },
      files: { type: "array", items: { type: "string" } },
    }, ["entityType", "entityId", "files"]),
  },
  {
    name: "fi_list_entity_attachments",
    description: "List entity attachments",
    inputSchema: buildSchema({
      entityType: { type: "string" },
      entityId: { type: "number" },
    }, ["entityType", "entityId"]),
  },
  {
    name: "fi_delete_attachment",
    description: "Delete attachment",
    inputSchema: buildSchema({
      attachmentId: { type: "number" },
    }, ["attachmentId"]),
  },
  {
    name: "fi_download_file",
    description: "Download file",
    inputSchema: buildSchema({
      path: { type: "string" },
      outputPath: { type: "string" },
    }, ["path", "outputPath"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_upload_file(args, config) {
    const filePath = asString(args.filePath, "filePath", true) as string;
    const type = asString(args.type, "type", true) as string;
    const parentPath = asString(args.parentPath, "parentPath");
    ensureFileExists(filePath, "filePath");
    return files.uploadFile(config, filePath, type, parentPath);
  },
  async fi_upload_entity_attachments(args, config) {
    const entityType = asString(args.entityType, "entityType", true) as string;
    const entityId = asNumber(args.entityId, "entityId", true) as number;
    const fileList = asStringArray(args.files, "files", true) as string[];
    ensureFilesExist(fileList, "files");
    return files.uploadEntityAttachments(config, entityType, entityId, fileList);
  },
  async fi_list_entity_attachments(args, config) {
    const entityType = asString(args.entityType, "entityType", true) as string;
    const entityId = asNumber(args.entityId, "entityId", true) as number;
    return files.listEntityAttachments(config, entityType, entityId);
  },
  async fi_delete_attachment(args, config) {
    const attachmentId = asNumber(args.attachmentId, "attachmentId", true) as number;
    return files.deleteAttachment(config, attachmentId);
  },
  async fi_download_file(args, config) {
    const path = asString(args.path, "path", true) as string;
    const outputPath = asString(args.outputPath, "outputPath", true) as string;
    return files.downloadFile(config, path, outputPath);
  },
};
