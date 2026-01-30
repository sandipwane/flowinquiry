package io.flowinquiry.modules.mcp.tools;

import io.flowinquiry.modules.teams.service.ProjectIterationService;
import io.flowinquiry.modules.teams.service.dto.ProjectIterationDTO;
import java.util.Optional;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * MCP Tools for iteration/sprint operations.
 *
 * <p>Provides AI-accessible tools for managing project iterations/sprints.
 */
@Component
@ConditionalOnProperty(name = "spring.ai.mcp.server.enabled", havingValue = "true", matchIfMissing = true)
public class IterationMcpTools {

    private final ProjectIterationService projectIterationService;

    public IterationMcpTools(ProjectIterationService projectIterationService) {
        this.projectIterationService = projectIterationService;
    }

    @Tool(name = "fi_get_iteration", description = "Get iteration/sprint by ID")
    public Optional<ProjectIterationDTO> getIteration(
            @ToolParam(description = "Iteration ID") Long iterationId) {
        return projectIterationService.getIterationById(iterationId);
    }

    @Tool(
            name = "fi_create_iteration",
            description = "Create an iteration/sprint. Required: name, projectId")
    public ProjectIterationDTO createIteration(
            @ToolParam(description = "Iteration data") ProjectIterationDTO iteration) {
        return projectIterationService.save(iteration);
    }

    @Tool(
            name = "fi_update_iteration",
            description = "Update an iteration/sprint. Include 'id' in iteration object")
    public ProjectIterationDTO updateIteration(
            @ToolParam(description = "Iteration ID") Long iterationId,
            @ToolParam(description = "Iteration data") ProjectIterationDTO iteration) {
        return projectIterationService.updateIteration(iterationId, iteration);
    }

    @Tool(name = "fi_delete_iteration", description = "Delete an iteration/sprint")
    public void deleteIteration(@ToolParam(description = "Iteration ID") Long iterationId) {
        projectIterationService.deleteIteration(iterationId);
    }

    @Tool(name = "fi_close_iteration", description = "Close/complete an iteration/sprint")
    public ProjectIterationDTO closeIteration(
            @ToolParam(description = "Iteration ID") Long iterationId) {
        return projectIterationService.closeIteration(iterationId);
    }
}
