import * as reports from "../../../cli/src/commands/reports";
import { buildSchema } from "./schema";
import { asBoolean, asString, asStringArray } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_get_ticket_ageing_report",
    description: "Ticket ageing report",
    inputSchema: buildSchema({
      projectId: { type: "string" },
      iterationId: { type: "string" },
      status: { type: "array", items: { type: "string" } },
      priority: { type: "array", items: { type: "string" } },
      assignUserId: { type: "array", items: { type: "string" } },
      createdFrom: { type: "string" },
      createdTo: { type: "string" },
      groupBy: { type: "string" },
      includeClosed: { type: "boolean" },
    }, ["projectId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_get_ticket_ageing_report(args, config) {
    const projectId = asString(args.projectId, "projectId", true) as string;
    const iterationId = asString(args.iterationId, "iterationId");
    const status = asStringArray(args.status, "status");
    const priority = asStringArray(args.priority, "priority");
    const assignUserId = asStringArray(args.assignUserId, "assignUserId");
    const createdFrom = asString(args.createdFrom, "createdFrom");
    const createdTo = asString(args.createdTo, "createdTo");
    const groupBy = asString(args.groupBy, "groupBy");
    const includeClosed = asBoolean(args.includeClosed, "includeClosed");

    return reports.getTicketAgeingReport(config, {
      projectId,
      iterationId,
      status,
      priority,
      assignUserId,
      createdFrom,
      createdTo,
      groupBy,
      includeClosed,
    });
  },
};
