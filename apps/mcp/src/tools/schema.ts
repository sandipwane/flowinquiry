import {
  TicketSchema,
  UserSchema,
  ProjectSchema,
  CommentSchema,
  IterationSchema,
  EpicSchema,
  TeamSchema,
  OrganizationSchema,
  WorkflowSchema,
  WorkflowDetailedSchema,
  AuthoritySchema,
  AppSettingSchema,
  RegistrationSchema,
  AuthorityPermissionsPayloadSchema,
  ProjectSettingsSchema,
  zodToJsonSchema,
} from "../schemas";

export const baseUrlProperty = { type: "string" } as const;

export const paginationProperties = {
  page: { type: "number", default: 1, description: "Page number (1-indexed)" },
  size: { type: "number", default: 20, description: "Items per page" },
  sortField: { type: "string", description: "Field to sort by" },
  sortDirection: { type: "string", enum: ["asc", "desc"], default: "asc", description: "Sort direction" },
} as const;

export const queryProperty = {
  type: "object",
  description: "Query filter. Example: { filters: [{ field: 'status', operator: 'eq', value: 'open' }] }. Operators: eq, ne, gt, lt, lk (like), in",
} as const;

// Legacy generic JSON property (deprecated - use explicit schemas below)
export const jsonProperty = { type: ["object", "array"] } as const;

// ============================================================================
// Explicit JSON Schemas from Zod (for MCP tool definitions)
// ============================================================================

export const ticketJsonSchema = zodToJsonSchema(TicketSchema);
export const userJsonSchema = zodToJsonSchema(UserSchema);
export const projectJsonSchema = zodToJsonSchema(ProjectSchema);
export const commentJsonSchema = zodToJsonSchema(CommentSchema);
export const iterationJsonSchema = zodToJsonSchema(IterationSchema);
export const epicJsonSchema = zodToJsonSchema(EpicSchema);
export const teamJsonSchema = zodToJsonSchema(TeamSchema);
export const organizationJsonSchema = zodToJsonSchema(OrganizationSchema);
export const workflowJsonSchema = zodToJsonSchema(WorkflowSchema);
export const workflowDetailedJsonSchema = zodToJsonSchema(WorkflowDetailedSchema);
export const authorityJsonSchema = zodToJsonSchema(AuthoritySchema);
export const appSettingJsonSchema = zodToJsonSchema(AppSettingSchema);
export const registrationJsonSchema = zodToJsonSchema(RegistrationSchema);
export const authorityPermissionsJsonSchema = zodToJsonSchema(AuthorityPermissionsPayloadSchema);
export const projectSettingsJsonSchema = zodToJsonSchema(ProjectSettingsSchema);

export function buildSchema(
  properties: Record<string, unknown>,
  required: string[] = [],
): Record<string, unknown> {
  return {
    type: "object",
    properties: {
      ...properties,
      baseUrl: baseUrlProperty,
    },
    required,
    additionalProperties: false,
  };
}

/**
 * Build schema with explicit entity schema embedded
 * Use this instead of generic `json` property for better LLM understanding
 */
export function buildSchemaWithEntity(
  entitySchema: Record<string, unknown>,
  entityKey: string,
  additionalProperties: Record<string, unknown> = {},
  required: string[] = [],
): Record<string, unknown> {
  return {
    type: "object",
    properties: {
      [entityKey]: entitySchema,
      ...additionalProperties,
      baseUrl: baseUrlProperty,
    },
    required: [entityKey, ...required],
    additionalProperties: false,
  };
}
