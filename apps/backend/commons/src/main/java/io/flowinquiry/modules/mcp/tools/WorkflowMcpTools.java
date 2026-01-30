package io.flowinquiry.modules.mcp.tools;

import io.flowinquiry.modules.teams.service.WorkflowService;
import io.flowinquiry.modules.teams.service.dto.WorkflowDTO;
import io.flowinquiry.modules.teams.service.dto.WorkflowDetailedDTO;
import io.flowinquiry.modules.teams.service.dto.WorkflowStateDTO;
import io.flowinquiry.query.QueryDTO;
import java.util.List;
import java.util.Optional;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

/**
 * MCP Tools for workflow operations.
 *
 * <p>Provides AI-accessible tools for managing workflows, states, and transitions.
 */
@Component
@ConditionalOnProperty(name = "spring.ai.mcp.server.enabled", havingValue = "true", matchIfMissing = true)
public class WorkflowMcpTools {

    private final WorkflowService workflowService;

    public WorkflowMcpTools(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @Tool(name = "fi_search_workflows", description = "Search workflows with pagination and filters")
    public Page<WorkflowDTO> searchWorkflows(
            @ToolParam(description = "Page number (0-based)", required = false) Integer page,
            @ToolParam(description = "Page size", required = false) Integer size,
            @ToolParam(description = "Sort field", required = false) String sortBy,
            @ToolParam(description = "Sort direction: asc or desc", required = false)
                    String sortDirection,
            @ToolParam(description = "Filter query", required = false) QueryDTO query) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);
        return workflowService.findWorkflows(Optional.ofNullable(query), pageable);
    }

    @Tool(name = "fi_get_workflow", description = "Get workflow by ID")
    public Optional<WorkflowDTO> getWorkflow(
            @ToolParam(description = "Workflow ID") Long workflowId) {
        return workflowService.getWorkflowById(workflowId);
    }

    @Tool(name = "fi_update_workflow", description = "Update workflow basic info")
    public WorkflowDTO updateWorkflow(
            @ToolParam(description = "Workflow ID") Long workflowId,
            @ToolParam(description = "Workflow data") WorkflowDTO workflow) {
        return workflowService.updateWorkflow(workflowId, workflow);
    }

    @Tool(name = "fi_delete_workflow", description = "Delete a workflow")
    public void deleteWorkflow(@ToolParam(description = "Workflow ID") Long workflowId) {
        workflowService.deleteWorkflow(workflowId);
    }

    @Tool(name = "fi_list_team_workflows", description = "List workflows available for a team")
    public List<WorkflowDTO> listTeamWorkflows(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "Filter for project workflows only", required = false)
                    Boolean usedForProject) {
        return workflowService.getWorkflowsForTeam(teamId, usedForProject);
    }

    @Tool(name = "fi_remove_workflow_from_team", description = "Remove/unlink workflow from team")
    public void removeWorkflowFromTeam(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "Workflow ID") Long workflowId) {
        workflowService.deleteWorkflowByTeam(teamId, workflowId);
    }

    @Tool(
            name = "fi_list_global_workflows_not_linked",
            description = "List global/public workflows not yet linked to a team")
    public List<WorkflowDTO> listGlobalWorkflowsNotLinked(
            @ToolParam(description = "Team ID") Long teamId) {
        return workflowService.listGlobalWorkflowsNotLinkedToTeam(teamId);
    }

    @Tool(
            name = "fi_list_workflow_transitions",
            description = "List valid state transitions from a given state")
    public List<WorkflowStateDTO> listWorkflowTransitions(
            @ToolParam(description = "Workflow ID") Long workflowId,
            @ToolParam(description = "Current state ID") Long stateId,
            @ToolParam(description = "Include transition to same state", required = false)
                    Boolean includeSelf) {
        return workflowService.getValidTargetWorkflowStates(
                workflowId, stateId, includeSelf != null && includeSelf);
    }

    @Tool(
            name = "fi_list_workflow_initial_states",
            description = "List initial/starting states for a workflow")
    public List<WorkflowStateDTO> listWorkflowInitialStates(
            @ToolParam(description = "Workflow ID") Long workflowId) {
        return workflowService.getInitialStatesOfWorkflow(workflowId);
    }

    @Tool(
            name = "fi_get_team_project_workflow",
            description = "Get the project workflow configured for a team")
    public Optional<WorkflowDetailedDTO> getTeamProjectWorkflow(
            @ToolParam(description = "Team ID") Long teamId) {
        return workflowService.findProjectWorkflowByTeam(teamId);
    }

    @Tool(name = "fi_get_workflow_details", description = "Get workflow with states and transitions")
    public Optional<WorkflowDetailedDTO> getWorkflowDetails(
            @ToolParam(description = "Workflow ID") Long workflowId) {
        return workflowService.getWorkflowDetail(workflowId);
    }

    @Tool(
            name = "fi_create_workflow_details",
            description =
                    "Create workflow with states and transitions. Required: name, states array, transitions array")
    public WorkflowDetailedDTO createWorkflowDetails(
            @ToolParam(description = "Workflow with states and transitions")
                    WorkflowDetailedDTO workflow) {
        return workflowService.saveWorkflow(workflow);
    }

    @Tool(
            name = "fi_update_workflow_details",
            description = "Update workflow with states and transitions")
    public WorkflowDetailedDTO updateWorkflowDetails(
            @ToolParam(description = "Workflow ID") Long workflowId,
            @ToolParam(description = "Workflow with states and transitions")
                    WorkflowDetailedDTO workflow) {
        return workflowService.updateWorkflow(workflowId, workflow);
    }

    @Tool(
            name = "fi_create_workflow_reference",
            description =
                    "Create workflow by referencing an existing one (shares states/transitions)")
    public WorkflowDetailedDTO createWorkflowReference(
            @ToolParam(description = "Team ID for new workflow") Long teamId,
            @ToolParam(description = "Reference workflow ID to link to") Long refId,
            @ToolParam(description = "Workflow basic info") WorkflowDTO workflow) {
        return workflowService.createWorkflowByReference(teamId, refId, workflow);
    }

    @Tool(
            name = "fi_create_workflow_clone",
            description = "Create workflow by cloning an existing one (copies states/transitions)")
    public WorkflowDetailedDTO createWorkflowClone(
            @ToolParam(description = "Team ID for new workflow") Long teamId,
            @ToolParam(description = "Source workflow ID to clone from") Long cloneId,
            @ToolParam(description = "Workflow basic info") WorkflowDTO workflow) {
        return workflowService.createWorkflowByCloning(teamId, cloneId, workflow);
    }

    private Pageable createPageable(Integer page, Integer size, String sortBy, String sortDirection) {
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 20;
        if (sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction =
                    "desc".equalsIgnoreCase(sortDirection)
                            ? Sort.Direction.DESC
                            : Sort.Direction.ASC;
            return PageRequest.of(pageNum, pageSize, Sort.by(direction, sortBy));
        }
        return PageRequest.of(pageNum, pageSize);
    }
}
