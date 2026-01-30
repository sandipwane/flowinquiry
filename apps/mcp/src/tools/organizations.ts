import * as organizations from "../../../cli/src/commands/organizations";
import { buildSchema, jsonProperty, paginationProperties, queryProperty } from "./schema";
import { asJson, asNumber } from "../validation";
import { buildPagination, buildQuery } from "./utils";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_create_organization",
    description: "Create organization",
    inputSchema: buildSchema({
      json: jsonProperty,
    }, ["json"]),
  },
  {
    name: "fi_update_organization",
    description: "Update organization",
    inputSchema: buildSchema({
      orgId: { type: "number" },
      json: jsonProperty,
    }, ["orgId", "json"]),
  },
  {
    name: "fi_delete_organization",
    description: "Delete organization",
    inputSchema: buildSchema({
      orgId: { type: "number" },
    }, ["orgId"]),
  },
  {
    name: "fi_get_organization",
    description: "Get organization",
    inputSchema: buildSchema({
      orgId: { type: "number" },
    }, ["orgId"]),
  },
  {
    name: "fi_search_organizations",
    description: "Search organizations",
    inputSchema: buildSchema({
      ...paginationProperties,
      query: queryProperty,
    }),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_create_organization(args, config) {
    const payload = asJson(args.json, "json", true);
    return organizations.createOrganization(config, payload);
  },
  async fi_update_organization(args, config) {
    const orgId = asNumber(args.orgId, "orgId", true) as number;
    const payload = asJson(args.json, "json", true);
    return organizations.updateOrganization(config, orgId, payload);
  },
  async fi_delete_organization(args, config) {
    const orgId = asNumber(args.orgId, "orgId", true) as number;
    return organizations.deleteOrganization(config, orgId);
  },
  async fi_get_organization(args, config) {
    const orgId = asNumber(args.orgId, "orgId", true) as number;
    return organizations.getOrganization(config, orgId);
  },
  async fi_search_organizations(args, config) {
    const pagination = buildPagination(args);
    const query = buildQuery(args);
    return organizations.searchOrganizations(config, pagination, query);
  },
};
