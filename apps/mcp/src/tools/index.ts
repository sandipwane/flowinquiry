import { tools as authTools, handlers as authHandlers } from "./auth";
import { tools as userTools, handlers as userHandlers } from "./users";
import { tools as authorityTools, handlers as authorityHandlers } from "./authorities";
import { tools as authorityPermissionTools, handlers as authorityPermissionHandlers } from "./authorityPermissions";
import { tools as resourceTools, handlers as resourceHandlers } from "./resources";
import { tools as teamTools, handlers as teamHandlers } from "./teams";
import { tools as orgTools, handlers as orgHandlers } from "./organizations";
import { tools as workflowTools, handlers as workflowHandlers } from "./workflows";
import { tools as projectTools, handlers as projectHandlers } from "./projects";
import { tools as iterationTools, handlers as iterationHandlers } from "./iterations";
import { tools as epicTools, handlers as epicHandlers } from "./epics";
import { tools as projectSettingTools, handlers as projectSettingHandlers } from "./projectSettings";
import { tools as ticketTools, handlers as ticketHandlers } from "./tickets";
import { tools as reportTools, handlers as reportHandlers } from "./reports";
import { tools as commentTools, handlers as commentHandlers } from "./comments";
import { tools as notificationTools, handlers as notificationHandlers } from "./notifications";
import { tools as activityTools, handlers as activityHandlers } from "./activity";
import { tools as watcherTools, handlers as watcherHandlers } from "./watchers";
import { tools as appSettingTools, handlers as appSettingHandlers } from "./appSettings";
import { tools as fileTools, handlers as fileHandlers } from "./files";
import { tools as sharedTools, handlers as sharedHandlers } from "./shared";
import { tools as sseTools, handlers as sseHandlers } from "./sse";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  ...authTools,
  ...userTools,
  ...authorityTools,
  ...authorityPermissionTools,
  ...resourceTools,
  ...teamTools,
  ...orgTools,
  ...workflowTools,
  ...projectTools,
  ...iterationTools,
  ...epicTools,
  ...projectSettingTools,
  ...ticketTools,
  ...reportTools,
  ...commentTools,
  ...notificationTools,
  ...activityTools,
  ...watcherTools,
  ...appSettingTools,
  ...fileTools,
  ...sharedTools,
  ...sseTools,
];

export const handlers: Record<string, ToolHandler> = {
  ...authHandlers,
  ...userHandlers,
  ...authorityHandlers,
  ...authorityPermissionHandlers,
  ...resourceHandlers,
  ...teamHandlers,
  ...orgHandlers,
  ...workflowHandlers,
  ...projectHandlers,
  ...iterationHandlers,
  ...epicHandlers,
  ...projectSettingHandlers,
  ...ticketHandlers,
  ...reportHandlers,
  ...commentHandlers,
  ...notificationHandlers,
  ...activityHandlers,
  ...watcherHandlers,
  ...appSettingHandlers,
  ...fileHandlers,
  ...sharedHandlers,
  ...sseHandlers,
};
