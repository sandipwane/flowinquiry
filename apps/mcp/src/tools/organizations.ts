import * as organizations from "../../../cli/src/commands/organizations";
import { buildSchema, paginationProperties, queryProperty, organizationJsonSchema } from "./schema";
import { asJson, asNumber } from "../validation";
import { buildPagination, buildQuery } from "./utils";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_create_organization",
    description: "Create organization. Required: name",
    inputSchema: buildSchema({
      organization: organizationJsonSchema,
    }, ["organization"]),
  },
  {
    name: "fi_update_organization",
    description: "Update organization. Include 'id' in organization object",
    inputSchema: buildSchema({
      orgId: { type: "number", description: "Organization ID to update" },
      organization: organizationJsonSchema,
    }, ["orgId", "organization"]),
  },
  {
    name: "fi_delete_organization",
    description: "Delete organization",
    inputSchema: buildSchema({
      orgId: { type: "number", description: "Organization ID to delete" },
    }, ["orgId"]),
  },
  {
    name: "fi_get_organization",
    description: "Get organization by ID",
    inputSchema: buildSchema({
      orgId: { type: "number", description: "Organization ID" },
    }, ["orgId"]),
  },
  {
    name: "fi_search_organizations",
    description: "Search organizations with pagination and filters",
    inputSchema: buildSchema({
      ...paginationProperties,
      query: queryProperty,
    }),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_create_organization(args, config) {
    const payload = asJson(args.organization, "organization", true);
    return organizations.createOrganization(config, payload);
  },
  async fi_update_organization(args, config) {
    const orgId = asNumber(args.orgId, "orgId", true) as number;
    const payload = asJson(args.organization, "organization", true);
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
