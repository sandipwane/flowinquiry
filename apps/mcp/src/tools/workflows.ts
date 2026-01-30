import * as workflows from "../../../cli/src/commands/workflows";
import { buildSchema, jsonProperty, paginationProperties, queryProperty } from "./schema";
import { asBoolean, asJson, asNumber } from "../validation";
import { buildPagination, buildQuery } from "./utils";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_search_workflows",
    description: "Search workflows",
    inputSchema: buildSchema({
      ...paginationProperties,
      query: queryProperty,
    }),
  },
  {
    name: "fi_get_workflow",
    description: "Get workflow",
    inputSchema: buildSchema({
      workflowId: { type: "number" },
    }, ["workflowId"]),
  },
  {
    name: "fi_update_workflow",
    description: "Update workflow",
    inputSchema: buildSchema({
      workflowId: { type: "number" },
      json: jsonProperty,
    }, ["workflowId", "json"]),
  },
  {
    name: "fi_delete_workflow",
    description: "Delete workflow",
    inputSchema: buildSchema({
      workflowId: { type: "number" },
    }, ["workflowId"]),
  },
  {
    name: "fi_list_team_workflows",
    description: "List workflows for a team",
    inputSchema: buildSchema({
      teamId: { type: "number" },
      usedForProject: { type: "boolean" },
    }, ["teamId"]),
  },
  {
    name: "fi_remove_workflow_from_team",
    description: "Remove workflow from team",
    inputSchema: buildSchema({
      workflowId: { type: "number" },
      teamId: { type: "number" },
    }, ["workflowId", "teamId"]),
  },
  {
    name: "fi_list_global_workflows_not_linked",
    description: "List global workflows not linked to team",
    inputSchema: buildSchema({
      teamId: { type: "number" },
    }, ["teamId"]),
  },
  {
    name: "fi_list_workflow_transitions",
    description: "List valid transitions",
    inputSchema: buildSchema({
      workflowId: { type: "number" },
      stateId: { type: "number" },
      includeSelf: { type: "boolean" },
    }, ["workflowId", "stateId"]),
  },
  {
    name: "fi_list_workflow_initial_states",
    description: "List workflow initial states",
    inputSchema: buildSchema({
      workflowId: { type: "number" },
    }, ["workflowId"]),
  },
  {
    name: "fi_get_team_project_workflow",
    description: "Get project workflow for team",
    inputSchema: buildSchema({
      teamId: { type: "number" },
    }, ["teamId"]),
  },
  {
    name: "fi_get_workflow_details",
    description: "Get workflow details",
    inputSchema: buildSchema({
      workflowId: { type: "number" },
    }, ["workflowId"]),
  },
  {
    name: "fi_create_workflow_details",
    description: "Create workflow with details",
    inputSchema: buildSchema({
      json: jsonProperty,
    }, ["json"]),
  },
  {
    name: "fi_update_workflow_details",
    description: "Update workflow details",
    inputSchema: buildSchema({
      workflowId: { type: "number" },
      json: jsonProperty,
    }, ["workflowId", "json"]),
  },
  {
    name: "fi_create_workflow_reference",
    description: "Create workflow by reference",
    inputSchema: buildSchema({
      refId: { type: "number" },
      teamId: { type: "number" },
      json: jsonProperty,
    }, ["refId", "teamId", "json"]),
  },
  {
    name: "fi_create_workflow_clone",
    description: "Create workflow by cloning",
    inputSchema: buildSchema({
      cloneId: { type: "number" },
      teamId: { type: "number" },
      json: jsonProperty,
    }, ["cloneId", "teamId", "json"]),
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
    const payload = asJson(args.json, "json", true);
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
    const payload = asJson(args.json, "json", true);
    return workflows.createWorkflowDetail(config, payload);
  },
  async fi_update_workflow_details(args, config) {
    const workflowId = asNumber(args.workflowId, "workflowId", true) as number;
    const payload = asJson(args.json, "json", true);
    return workflows.updateWorkflowDetail(config, workflowId, payload);
  },
  async fi_create_workflow_reference(args, config) {
    const refId = asNumber(args.refId, "refId", true) as number;
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const payload = asJson(args.json, "json", true);
    return workflows.createWorkflowReference(config, refId, teamId, payload);
  },
  async fi_create_workflow_clone(args, config) {
    const cloneId = asNumber(args.cloneId, "cloneId", true) as number;
    const teamId = asNumber(args.teamId, "teamId", true) as number;
    const payload = asJson(args.json, "json", true);
    return workflows.createWorkflowClone(config, cloneId, teamId, payload);
  },
};
