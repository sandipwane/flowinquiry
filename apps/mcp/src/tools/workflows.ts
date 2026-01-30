import * as workflows from "../../../cli/src/commands/workflows";
import { buildSchema, paginationProperties, queryProperty, workflowJsonSchema, workflowDetailedJsonSchema } from "./schema";
import { asBoolean, asJson, asNumber } from "../validation";
import { buildPagination, buildQuery } from "./utils";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_search_workflows",
    description: "Search workflows with pagination and filters",
    inputSchema: buildSchema({
      ...paginationProperties,
      query: queryProperty,
    }),
  },
  {
    name: "fi_get_workflow",
    description: "Get workflow by ID",
    inputSchema: buildSchema({
      workflowId: { type: "number", description: "Workflow ID" },
    }, ["workflowId"]),
  },
  {
    name: "fi_update_workflow",
    description: "Update workflow basic info. Include 'id' in workflow object",
    inputSchema: buildSchema({
      workflowId: { type: "number", description: "Workflow ID to update" },
      workflow: workflowJsonSchema,
    }, ["workflowId", "workflow"]),
  },
  {
    name: "fi_delete_workflow",
    description: "Delete workflow",
    inputSchema: buildSchema({
      workflowId: { type: "number", description: "Workflow ID to delete" },
    }, ["workflowId"]),
  },
  {
    name: "fi_list_team_workflows",
    description: "List workflows available for a team",
    inputSchema: buildSchema({
      teamId: { type: "number", description: "Team ID" },
      usedForProject: { type: "boolean", description: "Filter for project workflows only" },
    }, ["teamId"]),
  },
  {
    name: "fi_remove_workflow_from_team",
    description: "Remove/unlink workflow from team",
    inputSchema: buildSchema({
      workflowId: { type: "number", description: "Workflow ID" },
      teamId: { type: "number", description: "Team ID" },
    }, ["workflowId", "teamId"]),
  },
  {
    name: "fi_list_global_workflows_not_linked",
    description: "List global/public workflows not yet linked to a team",
    inputSchema: buildSchema({
      teamId: { type: "number", description: "Team ID" },
    }, ["teamId"]),
  },
  {
    name: "fi_list_workflow_transitions",
    description: "List valid state transitions from a given state",
    inputSchema: buildSchema({
      workflowId: { type: "number", description: "Workflow ID" },
      stateId: { type: "number", description: "Current state ID" },
      includeSelf: { type: "boolean", description: "Include transition to same state" },
    }, ["workflowId", "stateId"]),
  },
  {
    name: "fi_list_workflow_initial_states",
    description: "List initial/starting states for a workflow",
    inputSchema: buildSchema({
      workflowId: { type: "number", description: "Workflow ID" },
    }, ["workflowId"]),
  },
  {
    name: "fi_get_team_project_workflow",
    description: "Get the project workflow configured for a team",
    inputSchema: buildSchema({
      teamId: { type: "number", description: "Team ID" },
    }, ["teamId"]),
  },
  {
    name: "fi_get_workflow_details",
    description: "Get workflow with states and transitions",
    inputSchema: buildSchema({
      workflowId: { type: "number", description: "Workflow ID" },
    }, ["workflowId"]),
  },
  {
    name: "fi_create_workflow_details",
    description: "Create workflow with states and transitions. Required: name, states array, transitions array",
    inputSchema: buildSchema({
      workflow: workflowDetailedJsonSchema,
    }, ["workflow"]),
  },
  {
    name: "fi_update_workflow_details",
    description: "Update workflow with states and transitions. Include 'id' in workflow object",
    inputSchema: buildSchema({
      workflowId: { type: "number", description: "Workflow ID to update" },
      workflow: workflowDetailedJsonSchema,
    }, ["workflowId", "workflow"]),
  },
  {
    name: "fi_create_workflow_reference",
    description: "Create workflow by referencing an existing one (shares states/transitions)",
    inputSchema: buildSchema({
      refId: { type: "number", description: "Reference workflow ID to link to" },
      teamId: { type: "number", description: "Team ID for new workflow" },
      workflow: workflowJsonSchema,
    }, ["refId", "teamId", "workflow"]),
  },
  {
    name: "fi_create_workflow_clone",
    description: "Create workflow by cloning an existing one (copies states/transitions)",
    inputSchema: buildSchema({
      cloneId: { type: "number", description: "Source workflow ID to clone from" },
      teamId: { type: "number", description: "Team ID for new workflow" },
      workflow: workflowJsonSchema,
    }, ["cloneId", "teamId", "workflow"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_search_workflows(args, config) {
    const pagination = buildPagination(args);
    const query = buildQuery(args);
    return workflows.searchWorkflows(config, pagination, query);
  },
  async fi_get_workflow(args, config) {
    const workflowId = asNumber(args.workflowId, "workflowId", true) as number;
    return workflows.getWorkflow(config, workflowId);
  },
  async fi_update_workflow(args, config) {
    const workflowId = asNumber(args.workflowId, "workflowId", true) as number;
    const payload = asJson(args.workflow, "workflow", true);
    return workflows.updateWorkflow(config, workflowId, payload);
  },
  async fi_delete_workflow(args, config) {
    const workflowId = asNumber(args.workflowId, "workflowId", true) as number;
    return workflows.deleteWorkflow(config, workflowId);
  },
  async fi_list_team_workflows(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const usedForProject = asBoolean(args.usedForProject, "usedForProject");
    return workflows.listWorkflowsForTeamUsedForProject(config, teamId, usedForProject);
  },
  async fi_remove_workflow_from_team(args, config) {
    const workflowId = asNumber(args.workflowId, "workflowId", true) as number;
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    return workflows.deleteTeamWorkflow(config, workflowId, teamId);
  },
  async fi_list_global_workflows_not_linked(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    return workflows.listGlobalWorkflowsNotLinked(config, teamId);
  },
  async fi_list_workflow_transitions(args, config) {
    const workflowId = asNumber(args.workflowId, "workflowId", true) as number;
    const stateId = asNumber(args.stateId, "stateId", true) as number;
    const includeSelf = asBoolean(args.includeSelf, "includeSelf");
    return workflows.getWorkflowTransitions(config, workflowId, stateId, includeSelf);
  },
  async fi_list_workflow_initial_states(args, config) {
    const workflowId = asNumber(args.workflowId, "workflowId", true) as number;
    return workflows.getWorkflowInitialStates(config, workflowId);
  },
  async fi_get_team_project_workflow(args, config) {
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    return workflows.getProjectWorkflowByTeam(config, teamId);
  },
  async fi_get_workflow_details(args, config) {
    const workflowId = asNumber(args.workflowId, "workflowId", true) as number;
    return workflows.getWorkflowDetail(config, workflowId);
  },
  async fi_create_workflow_details(args, config) {
    const payload = asJson(args.workflow, "workflow", true);
    return workflows.createWorkflowDetail(config, payload);
  },
  async fi_update_workflow_details(args, config) {
    const workflowId = asNumber(args.workflowId, "workflowId", true) as number;
    const payload = asJson(args.workflow, "workflow", true);
    return workflows.updateWorkflowDetail(config, workflowId, payload);
  },
  async fi_create_workflow_reference(args, config) {
    const refId = asNumber(args.refId, "refId", true) as number;
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const payload = asJson(args.workflow, "workflow", true);
    return workflows.createWorkflowReference(config, refId, teamId, payload);
  },
  async fi_create_workflow_clone(args, config) {
    const cloneId = asNumber(args.cloneId, "cloneId", true) as number;
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const payload = asJson(args.workflow, "workflow", true);
    return workflows.createWorkflowClone(config, cloneId, teamId, payload);
  },
};
