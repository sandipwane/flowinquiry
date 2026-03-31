import * as tickets from "../../../cli/src/commands/tickets";
import { parsePriority } from "../../../cli/src/utils";
import { buildSchema, paginationProperties, queryProperty, ticketJsonSchema } from "./schema";
import {
  asJson,
  asNumber,
  asString,
} from "../validation";
import { McpError } from "../errors";
import { buildPagination, buildQuery } from "./utils";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_create_ticket",
    description: "Create a ticket",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      workflowId: { type: "number" },
      stateId: { type: "number" },
      requesterId: { type: "number" },
      priority: {
        type: "string",
        enum: ["Critical", "High", "Medium", "Low", "Trivial"],
      },
      title: { type: "string" },
      description: { type: "string" },
    }, ["teamId", "workflowId", "stateId", "requesterId", "priority", "title", "description"]),
  },
  {
    name: "fi_search_tickets",
    description: "Search tickets",
    inputSchema: buildSchema({
      ...paginationProperties,
      query: queryProperty,
    }),
  },
  {
    name: "fi_get_ticket",
    description: "Get ticket",
    inputSchema: buildSchema({
      ticketId: { type: "number" },
    }, ["ticketId"]),
  },
  {
    name: "fi_update_ticket",
    description: "Update ticket. IMPORTANT: Requires FULL ticket object. Pattern: 1) GET ticket with fi_get_ticket, 2) Modify fields, 3) Send complete object. Required fields: id, teamId, workflowId, requestTitle, priority, isNew, isCompleted",
    inputSchema: buildSchema({
      ticketId: { type: "number", description: "Ticket ID to update" },
      ticket: ticketJsonSchema,
    }, ["ticketId", "ticket"]),
  },
  {
    name: "fi_delete_ticket",
    description: "Delete ticket",
    inputSchema: buildSchema({
      ticketId: { type: "number" },
    }, ["ticketId"]),
  },
  {
    name: "fi_get_next_ticket",
    description: "Get next ticket",
    inputSchema: buildSchema({
      ticketId: { type: "number" },
      projectId: { type: "number" },
    }, ["ticketId"]),
  },
  {
    name: "fi_get_previous_ticket",
    description: "Get previous ticket",
    inputSchema: buildSchema({
      ticketId: { type: "number" },
      projectId: { type: "number" },
    }, ["ticketId"]),
  },
  {
    name: "fi_get_team_ticket_distribution",
    description: "Ticket distribution",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      from: { type: "string" },
      to: { type: "string" },
      range: { type: "string" },
    }, ["teamId"]),
  },
  {
    name: "fi_get_team_ticket_priority_distribution",
    description: "Priority distribution",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      from: { type: "string" },
      to: { type: "string" },
      range: { type: "string" },
    }, ["teamId"]),
  },
  {
    name: "fi_get_team_ticket_statistics",
    description: "Team ticket statistics",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      from: { type: "string" },
      to: { type: "string" },
      range: { type: "string" },
    }, ["teamId"]),
  },
  {
    name: "fi_list_team_overdue_tickets",
    description: "Overdue tickets",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      ...paginationProperties,
    }, ["teamId"]),
  },
  {
    name: "fi_count_team_overdue_tickets",
    description: "Overdue ticket count",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      from: { type: "string" },
      to: { type: "string" },
      range: { type: "string" },
    }, ["teamId"]),
  },
  {
    name: "fi_list_team_unassigned_tickets",
    description: "Unassigned tickets",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      ...paginationProperties,
    }, ["teamId"]),
  },
  {
    name: "fi_get_team_ticket_creation_series",
    description: "Ticket creation time series",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      days: { type: "number" },
    }, ["teamId"]),
  },
  {
    name: "fi_list_user_overdue_tickets",
    description: "User overdue tickets",
    inputSchema: buildSchema({
      userId: { type: "number" },
      ...paginationProperties,
    }, ["userId"]),
  },
  {
    name: "fi_get_user_team_priority_distribution",
    description: "Team priority distribution by user",
    inputSchema: buildSchema({
      userId: { type: "number" },
      from: { type: "string" },
      to: { type: "string" },
      range: { type: "string" },
    }, ["userId"]),
  },
  {
    name: "fi_get_ticket_state_history",
    description: "Ticket state history",
    inputSchema: buildSchema({
      ticketId: { type: "number" },
    }, ["ticketId"]),
  },
  {
    name: "fi_update_ticket_state",
    description: "Update ticket state",
    inputSchema: buildSchema({
      ticketId: { type: "number" },
      newStateId: { type: "number" },
    }, ["ticketId", "newStateId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_create_ticket(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const workflowId = asNumber(args.workflowId, "workflowId", true) as number;
    const stateId = asNumber(args.stateId, "stateId", true) as number;
    const requesterId = asNumber(args.requesterId, "requesterId", true) as number;
    let priority: ReturnType<typeof parsePriority>;
    try {
      priority = parsePriority(asString(args.priority, "priority", true) as string);
    } catch (error) {
      throw new McpError(-32602, (error as Error).message);
    }
    const title = asString(args.title, "title", true) as string;
    const description = asString(args.description, "description", true) as string;
    return tickets.createTicket(config, {
      teamId,
      workflowId,
      stateId,
      requesterId,
      priority,
      title,
      description,
    });
  },
  async fi_search_tickets(args, config) {
    const pagination = buildPagination(args);
    const query = buildQuery(args);
    return tickets.searchTickets(config, pagination, query);
  },
  async fi_get_ticket(args, config) {
    const ticketId = asNumber(args.ticketId, "ticketId", true) as number;
    return tickets.getTicket(config, ticketId);
  },
  async fi_update_ticket(args, config) {
    const ticketId = asNumber(args.ticketId, "ticketId", true) as number;
    const payload = asJson(args.ticket, "ticket", true);
    return tickets.updateTicket(config, ticketId, payload);
  },
  async fi_delete_ticket(args, config) {
    const ticketId = asNumber(args.ticketId, "ticketId", true) as number;
    return tickets.deleteTicket(config, ticketId);
  },
  async fi_get_next_ticket(args, config) {
    const ticketId = asNumber(args.ticketId, "ticketId", true) as number;
    const projectId = asNumber(args.projectId, "projectId");
    return tickets.getNextTicket(config, ticketId, projectId);
  },
  async fi_get_previous_ticket(args, config) {
    const ticketId = asNumber(args.ticketId, "ticketId", true) as number;
    const projectId = asNumber(args.projectId, "projectId");
    return tickets.getPreviousTicket(config, ticketId, projectId);
  },
  async fi_get_team_ticket_distribution(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const fromDate = asString(args.from, "from");
    const toDate = asString(args.to, "to");
    const range = asString(args.range, "range");
    return tickets.getTeamTicketDistribution(config, teamId, { fromDate, toDate, range });
  },
  async fi_get_team_ticket_priority_distribution(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const fromDate = asString(args.from, "from");
    const toDate = asString(args.to, "to");
    const range = asString(args.range, "range");
    return tickets.getTeamPriorityDistribution(config, teamId, { fromDate, toDate, range });
  },
  async fi_get_team_ticket_statistics(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const fromDate = asString(args.from, "from");
    const toDate = asString(args.to, "to");
    const range = asString(args.range, "range");
    return tickets.getTeamStatistics(config, teamId, { fromDate, toDate, range });
  },
  async fi_list_team_overdue_tickets(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const pagination = buildPagination(args);
    return tickets.getTeamOverdueTickets(config, teamId, pagination);
  },
  async fi_count_team_overdue_tickets(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const fromDate = asString(args.from, "from");
    const toDate = asString(args.to, "to");
    const range = asString(args.range, "range");
    return tickets.countTeamOverdueTickets(config, teamId, { fromDate, toDate, range });
  },
  async fi_list_team_unassigned_tickets(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const pagination = buildPagination(args);
    return tickets.getTeamUnassignedTickets(config, teamId, pagination);
  },
  async fi_get_team_ticket_creation_series(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const days = asNumber(args.days, "days");
    return tickets.getTeamTicketCreationSeries(config, teamId, days);
  },
  async fi_list_user_overdue_tickets(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    const pagination = buildPagination(args);
    return tickets.getUserOverdueTickets(config, userId, pagination);
  },
  async fi_get_user_team_priority_distribution(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    const from = asString(args.from, "from");
    const to = asString(args.to, "to");
    const range = asString(args.range, "range");
    return tickets.getUserTeamPriorityDistribution(config, userId, { from, to, range });
  },
  async fi_get_ticket_state_history(args, config) {
    const ticketId = asNumber(args.ticketId, "ticketId", true) as number;
    return tickets.getTicketStateHistory(config, ticketId);
  },
  async fi_update_ticket_state(args, config) {
    const ticketId = asNumber(args.ticketId, "ticketId", true) as number;
    const newStateId = asNumber(args.newStateId, "newStateId", true) as number;
    return tickets.updateTicketState(config, ticketId, newStateId);
  },
};
