import { z } from "zod";

// ============================================================================
// Enums
// ============================================================================

export const TicketPriorityEnum = z.enum(["Critical", "High", "Medium", "Low", "Trivial"]);
export type TicketPriority = z.infer<typeof TicketPriorityEnum>;

export const ProjectStatusEnum = z.enum(["Active", "Closed", "Cancelled"]);
export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;

export const WorkflowVisibilityEnum = z.enum(["PUBLIC", "PRIVATE", "TEAM"]);
export type WorkflowVisibility = z.infer<typeof WorkflowVisibilityEnum>;

export const TicketChannelEnum = z.enum([
  "email", "phone", "web_portal", "chat", "social_media",
  "in_person", "mobile_app", "api", "system_generated", "internal"
]);
export type TicketChannel = z.infer<typeof TicketChannelEnum>;

export const TShirtSizeEnum = z.enum(["XS", "S", "M", "L", "XL"]);
export type TShirtSize = z.infer<typeof TShirtSizeEnum>;

export const SortDirectionEnum = z.enum(["asc", "desc"]);
export type SortDirection = z.infer<typeof SortDirectionEnum>;

export const QueryOperatorEnum = z.enum(["eq", "ne", "gt", "lt", "lk", "in"]);
export type QueryOperator = z.infer<typeof QueryOperatorEnum>;

export const EntityTypeEnum = z.enum(["Ticket", "Project", "Team", "User"]);
export type EntityType = z.infer<typeof EntityTypeEnum>;

// ============================================================================
// Query & Pagination
// ============================================================================

export const QueryFilterSchema = z.object({
  field: z.string().describe("Field name to filter on"),
  operator: QueryOperatorEnum.describe("Filter operator: eq, ne, gt, lt, lk (like), in"),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(z.union([z.string(), z.number(), z.boolean()]))
  ]).describe("Filter value"),
});
export type QueryFilter = z.infer<typeof QueryFilterSchema>;

export const QuerySchema: z.ZodType<{
  groups?: Array<{
    filters?: Array<z.infer<typeof QueryFilterSchema>>;
    logicalOperator: "AND" | "OR";
  }>;
  filters?: Array<z.infer<typeof QueryFilterSchema>>;
}> = z.object({
  groups: z.array(z.object({
    filters: z.array(QueryFilterSchema).optional(),
    logicalOperator: z.enum(["AND", "OR"]),
  })).optional().describe("Nested filter groups with AND/OR logic"),
  filters: z.array(QueryFilterSchema).optional().describe("Array of filters"),
}).describe("Query filter object. Example: { filters: [{ field: 'status', operator: 'eq', value: 'open' }] }");
export type Query = z.infer<typeof QuerySchema>;

export const PaginationSchema = z.object({
  page: z.number().default(1).describe("Page number (1-indexed)"),
  size: z.number().default(20).describe("Items per page"),
  sortField: z.string().optional().describe("Field to sort by"),
  sortDirection: SortDirectionEnum.default("asc").describe("Sort direction"),
});
export type Pagination = z.infer<typeof PaginationSchema>;

// ============================================================================
// Ticket Schema
// ============================================================================

/**
 * Full ticket schema for updates
 * IMPORTANT: API requires complete object for PUT operations
 * Pattern: GET ticket first, modify fields, then PUT complete object
 */
export const TicketSchema = z.object({
  id: z.number().describe("Ticket ID (required for updates)"),
  teamId: z.number().describe("Team ID"),
  teamName: z.string().optional().describe("Team name (read-only)"),
  workflowId: z.number().describe("Workflow ID"),
  workflowName: z.string().optional().describe("Workflow name (read-only)"),
  projectId: z.number().nullable().optional().describe("Project ID"),
  projectName: z.string().optional().describe("Project name (read-only)"),
  projectShortName: z.string().optional().describe("Project short code (read-only)"),
  projectTicketNumber: z.number().nullable().optional().describe("Ticket number within project"),
  requestUserId: z.number().describe("Requester user ID"),
  requestUserName: z.string().optional().describe("Requester name (read-only)"),
  assignUserId: z.number().nullable().optional().describe("Assigned user ID (null = unassigned)"),
  assignUserName: z.string().optional().describe("Assignee name (read-only)"),
  currentStateId: z.number().describe("Current workflow state ID"),
  currentStateName: z.string().optional().describe("State name (read-only)"),
  iterationId: z.number().nullable().optional().describe("Sprint/Iteration ID"),
  iterationName: z.string().optional().describe("Iteration name (read-only)"),
  epicId: z.number().nullable().optional().describe("Epic ID"),
  epicName: z.string().optional().describe("Epic name (read-only)"),
  requestTitle: z.string().describe("Ticket title"),
  requestDescription: z.string().optional().describe("Ticket description"),
  priority: TicketPriorityEnum.describe("Ticket priority"),
  isNew: z.boolean().describe("New ticket flag (REQUIRED for updates)"),
  isCompleted: z.boolean().describe("Completion flag (REQUIRED for updates)"),
  estimatedCompletionDate: z.string().nullable().optional().describe("ISO8601 date"),
  actualCompletionDate: z.string().nullable().optional().describe("ISO8601 date"),
  channel: TicketChannelEnum.optional().describe("Ticket source channel"),
  size: TShirtSizeEnum.optional().describe("T-shirt sizing"),
  estimate: z.number().optional().describe("Story points or hours"),
  parentTicketId: z.number().nullable().optional().describe("Parent ticket ID for subtasks"),
  createdAt: z.string().optional().describe("Creation timestamp (read-only)"),
  modifiedAt: z.string().optional().describe("Last modified timestamp (read-only)"),
}).describe(
  "Full ticket object. IMPORTANT: For updates, GET the ticket first, modify fields, then send complete object. " +
  "Required fields for update: id, teamId, workflowId, requestTitle, priority, isNew, isCompleted"
);
export type Ticket = z.infer<typeof TicketSchema>;

/** Partial ticket for create - fewer required fields */
export const TicketCreateSchema = z.object({
  teamId: z.number().describe("Team ID (required)"),
  workflowId: z.number().describe("Workflow ID (required)"),
  stateId: z.number().describe("Initial workflow state ID (required)"),
  requesterId: z.number().describe("Requester user ID (required)"),
  priority: TicketPriorityEnum.describe("Ticket priority (required)"),
  title: z.string().describe("Ticket title (required)"),
  description: z.string().describe("Ticket description (required)"),
  assignUserId: z.number().optional().describe("Assigned user ID"),
  projectId: z.number().optional().describe("Project ID"),
  iterationId: z.number().optional().describe("Sprint/Iteration ID"),
  epicId: z.number().optional().describe("Epic ID"),
  estimatedCompletionDate: z.string().optional().describe("ISO8601 date"),
  channel: TicketChannelEnum.optional().describe("Source channel"),
  size: TShirtSizeEnum.optional().describe("T-shirt sizing"),
  estimate: z.number().optional().describe("Story points or hours"),
});
export type TicketCreate = z.infer<typeof TicketCreateSchema>;

// ============================================================================
// User Schema
// ============================================================================

export const UserSchema = z.object({
  id: z.number().optional().describe("User ID (required for updates)"),
  email: z.string().email().describe("Email address (required for create)"),
  login: z.string().optional().describe("Username/login"),
  firstName: z.string().optional().describe("First name"),
  lastName: z.string().optional().describe("Last name"),
  imageUrl: z.string().optional().describe("Avatar URL"),
  activated: z.boolean().optional().describe("Account activated status"),
  langKey: z.string().optional().describe("Language code (e.g., 'en', 'es')"),
  timezone: z.string().optional().describe("Timezone (e.g., 'America/New_York')"),
  title: z.string().optional().describe("Job title"),
  managerId: z.number().nullable().optional().describe("Manager's user ID"),
  authorities: z.array(z.string()).optional().describe("Roles (e.g., ['ROLE_USER', 'ROLE_ADMIN'])"),
}).describe("User object. Include 'id' field for updates, omit for create");
export type User = z.infer<typeof UserSchema>;

// ============================================================================
// Project Schema
// ============================================================================

export const ProjectSchema = z.object({
  id: z.number().optional().describe("Project ID (required for updates)"),
  name: z.string().describe("Project name (required)"),
  shortName: z.string().describe("Short code for ticket numbers, e.g., 'PROJ' (required)"),
  description: z.string().optional().describe("Project description"),
  teamId: z.number().describe("Owning team ID (required)"),
  teamName: z.string().optional().describe("Team name (read-only)"),
  status: ProjectStatusEnum.optional().describe("Project status"),
  startDate: z.string().optional().describe("ISO8601 date"),
  endDate: z.string().optional().describe("ISO8601 date"),
  createdAt: z.string().optional().describe("Creation timestamp (read-only)"),
  modifiedAt: z.string().optional().describe("Last modified timestamp (read-only)"),
}).describe("Project object. Required: name, shortName, teamId");
export type Project = z.infer<typeof ProjectSchema>;

// ============================================================================
// Comment Schema
// ============================================================================

export const CommentSchema = z.object({
  id: z.number().optional().describe("Comment ID (include for updates, omit for create)"),
  entityType: EntityTypeEnum.describe("Entity type: Ticket, Project, Team, User (required)"),
  entityId: z.number().describe("ID of the entity (required)"),
  content: z.string().describe("Comment text (required)"),
  createdBy: z.number().optional().describe("Author user ID (read-only)"),
  createdAt: z.string().optional().describe("Creation timestamp (read-only)"),
  updatedAt: z.string().optional().describe("Last update timestamp (read-only)"),
}).describe("Comment object. For updates include 'id', for create omit it");
export type Comment = z.infer<typeof CommentSchema>;

// ============================================================================
// Iteration (Sprint) Schema
// ============================================================================

export const IterationSchema = z.object({
  id: z.number().optional().describe("Iteration ID (required for updates)"),
  name: z.string().describe("Iteration name (required)"),
  projectId: z.number().describe("Project ID (required)"),
  startDate: z.string().optional().describe("ISO8601 date"),
  endDate: z.string().optional().describe("ISO8601 date"),
  status: z.string().optional().describe("Iteration status: Planned, Active, Completed"),
}).describe("Project iteration/sprint object");
export type Iteration = z.infer<typeof IterationSchema>;

// ============================================================================
// Epic Schema
// ============================================================================

export const EpicSchema = z.object({
  id: z.number().optional().describe("Epic ID (required for updates)"),
  name: z.string().describe("Epic name (required)"),
  projectId: z.number().describe("Project ID (required)"),
  description: z.string().optional().describe("Epic description"),
  status: z.string().optional().describe("Epic status: Open, In Progress, Done"),
}).describe("Project epic object");
export type Epic = z.infer<typeof EpicSchema>;

// ============================================================================
// Team Schema
// ============================================================================

export const TeamSchema = z.object({
  id: z.number().optional().describe("Team ID (required for updates)"),
  name: z.string().describe("Team name (required)"),
  slogan: z.string().optional().describe("Team slogan/tagline"),
  description: z.string().optional().describe("Team description"),
  organizationId: z.number().nullable().optional().describe("Parent organization ID"),
  logoUrl: z.string().optional().describe("Team logo URL (read-only)"),
  usersCount: z.number().optional().describe("Number of team members (read-only)"),
}).describe("Team object");
export type Team = z.infer<typeof TeamSchema>;

// ============================================================================
// Organization Schema
// ============================================================================

export const OrganizationSchema = z.object({
  id: z.number().optional().describe("Organization ID (required for updates)"),
  name: z.string().describe("Organization name (required)"),
  description: z.string().optional().describe("Organization description"),
  website: z.string().optional().describe("Organization website URL"),
}).describe("Organization object");
export type Organization = z.infer<typeof OrganizationSchema>;

// ============================================================================
// Workflow Schema
// ============================================================================

export const WorkflowStateSchema = z.object({
  id: z.number().optional().describe("State ID"),
  workflowId: z.number().describe("Parent workflow ID"),
  stateName: z.string().describe("State name (required)"),
  isInitial: z.boolean().optional().describe("Is this an initial state?"),
  isFinal: z.boolean().optional().describe("Is this a final/completed state?"),
});
export type WorkflowState = z.infer<typeof WorkflowStateSchema>;

export const WorkflowTransitionSchema = z.object({
  id: z.number().optional().describe("Transition ID"),
  workflowId: z.number().describe("Parent workflow ID"),
  sourceStateId: z.number().describe("Source state ID"),
  targetStateId: z.number().describe("Target state ID"),
});
export type WorkflowTransition = z.infer<typeof WorkflowTransitionSchema>;

export const WorkflowSchema = z.object({
  id: z.number().optional().describe("Workflow ID (required for updates)"),
  name: z.string().describe("Workflow name (required)"),
  description: z.string().optional().describe("Workflow description"),
  requestName: z.string().optional().describe("Display name for requests"),
  ownerId: z.number().optional().describe("Owner user ID"),
  ownerName: z.string().optional().describe("Owner name (read-only)"),
  visibility: WorkflowVisibilityEnum.optional().describe("Visibility: PUBLIC, PRIVATE, TEAM"),
  level1EscalationTimeout: z.number().optional().describe("Hours before level 1 escalation"),
  level2EscalationTimeout: z.number().optional().describe("Hours before level 2 escalation"),
  level3EscalationTimeout: z.number().optional().describe("Hours before level 3 escalation"),
  useForProject: z.boolean().optional().describe("Can be used for project tickets"),
}).describe("Workflow object");
export type Workflow = z.infer<typeof WorkflowSchema>;

export const WorkflowDetailedSchema = WorkflowSchema.extend({
  states: z.array(WorkflowStateSchema).describe("Workflow states"),
  transitions: z.array(WorkflowTransitionSchema).describe("State transitions"),
}).describe("Workflow with states and transitions");
export type WorkflowDetailed = z.infer<typeof WorkflowDetailedSchema>;

// ============================================================================
// Authority Schema
// ============================================================================

export const AuthoritySchema = z.object({
  id: z.number().optional().describe("Authority ID"),
  name: z.string().describe("Authority/role name (required)"),
  description: z.string().optional().describe("Authority description"),
}).describe("Authority/role object");
export type Authority = z.infer<typeof AuthoritySchema>;

// ============================================================================
// Notification Schema
// ============================================================================

export const NotificationSchema = z.object({
  id: z.number().optional().describe("Notification ID"),
  userId: z.number().describe("Target user ID"),
  title: z.string().optional().describe("Notification title"),
  message: z.string().optional().describe("Notification message"),
  isRead: z.boolean().optional().describe("Read status"),
  createdAt: z.string().optional().describe("Creation timestamp"),
}).describe("Notification object");
export type Notification = z.infer<typeof NotificationSchema>;

// ============================================================================
// App Settings Schema
// ============================================================================

export const AppSettingSchema = z.object({
  id: z.number().optional().describe("Setting ID"),
  key: z.string().describe("Setting key (required)"),
  value: z.string().optional().describe("Setting value"),
  description: z.string().optional().describe("Setting description"),
}).describe("Application setting object");
export type AppSetting = z.infer<typeof AppSettingSchema>;

// ============================================================================
// Registration Schema (for account creation)
// ============================================================================

export const RegistrationSchema = z.object({
  email: z.string().email().describe("Email address (required)"),
  login: z.string().describe("Username/login (required)"),
  firstName: z.string().optional().describe("First name"),
  lastName: z.string().optional().describe("Last name"),
  password: z.string().describe("Password (required)"),
  langKey: z.string().optional().describe("Language code (e.g., 'en')"),
}).describe("Account registration object");
export type Registration = z.infer<typeof RegistrationSchema>;

// ============================================================================
// Authority Permissions Schema
// ============================================================================

export const AuthorityPermissionSchema = z.object({
  authorityName: z.string().describe("Authority/role name (required)"),
  resourceId: z.number().describe("Resource ID (required)"),
  permission: z.string().describe("Permission type (required)"),
}).describe("Authority permission mapping");
export type AuthorityPermission = z.infer<typeof AuthorityPermissionSchema>;

export const AuthorityPermissionsPayloadSchema = z.object({
  authorityName: z.string().describe("Authority/role name (required)"),
  permissions: z.array(z.object({
    resourceId: z.number().describe("Resource ID"),
    permission: z.string().describe("Permission type"),
  })).describe("List of permissions to set"),
}).describe("Payload for saving authority permissions");
export type AuthorityPermissionsPayload = z.infer<typeof AuthorityPermissionsPayloadSchema>;

// ============================================================================
// Project Settings Schema
// ============================================================================

export const ProjectSettingsSchema = z.object({
  id: z.number().optional().describe("Settings ID (required for updates)"),
  projectId: z.number().describe("Project ID (required)"),
  settings: z.record(z.unknown()).optional().describe("Key-value settings object"),
}).describe("Project settings object");
export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>;

// ============================================================================
// Utility: Convert Zod to JSON Schema
// ============================================================================

/**
 * Converts a Zod schema to JSON Schema for MCP tool definitions
 * Note: This is a simplified conversion - for complex cases use zod-to-json-schema library
 */
export function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  // For now, return a simple object type with description
  // In production, use zod-to-json-schema package for full conversion
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodType;
      properties[key] = zodFieldToJsonSchema(zodValue);

      // Check if field is required (not optional, not nullable at root)
      if (!zodValue.isOptional() && !(zodValue instanceof z.ZodNullable)) {
        required.push(key);
      }
    }

    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
      description: schema.description,
    };
  }

  return { type: "object" };
}

function zodFieldToJsonSchema(field: z.ZodType): Record<string, unknown> {
  const description = field.description;
  const base: Record<string, unknown> = {};
  if (description) base.description = description;

  // Unwrap optional/nullable
  let inner = field;
  let isNullable = false;

  if (inner instanceof z.ZodOptional) {
    inner = inner.unwrap();
  }
  if (inner instanceof z.ZodNullable) {
    inner = inner.unwrap();
    isNullable = true;
  }

  if (inner instanceof z.ZodString) {
    return { ...base, type: isNullable ? ["string", "null"] : "string" };
  }
  if (inner instanceof z.ZodNumber) {
    return { ...base, type: isNullable ? ["number", "null"] : "number" };
  }
  if (inner instanceof z.ZodBoolean) {
    return { ...base, type: isNullable ? ["boolean", "null"] : "boolean" };
  }
  if (inner instanceof z.ZodEnum) {
    return { ...base, type: "string", enum: inner.options };
  }
  if (inner instanceof z.ZodArray) {
    return { ...base, type: "array", items: zodFieldToJsonSchema(inner.element) };
  }
  if (inner instanceof z.ZodObject) {
    return { ...base, ...zodToJsonSchema(inner) };
  }
  if (inner instanceof z.ZodUnion) {
    // Simplify union to first non-null type
    return { ...base, type: "string" };
  }

  return { ...base, type: "object" };
}
