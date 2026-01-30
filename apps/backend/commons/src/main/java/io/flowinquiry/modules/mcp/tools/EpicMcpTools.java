package io.flowinquiry.modules.mcp.tools;

import io.flowinquiry.modules.teams.service.ProjectEpicService;
import io.flowinquiry.modules.teams.service.dto.ProjectEpicDTO;
import java.util.Optional;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * MCP Tools for epic operations.
 *
 * <p>Provides AI-accessible tools for managing project epics.
 */
@Component
@ConditionalOnProperty(name = "spring.ai.mcp.server.enabled", havingValue = "true", matchIfMissing = true)
public class EpicMcpTools {

    private final ProjectEpicService projectEpicService;

    public EpicMcpTools(ProjectEpicService projectEpicService) {
        this.projectEpicService = projectEpicService;
    }

    @Tool(name = "fi_get_epic", description = "Get epic by ID")
    public Optional<ProjectEpicDTO> getEpic(@ToolParam(description = "Epic ID") Long epicId) {
        return projectEpicService.getEpicById(epicId);
    }

    @Tool(name = "fi_create_epic", description = "Create an epic. Required: name, projectId")
    public ProjectEpicDTO createEpic(@ToolParam(description = "Epic data") ProjectEpicDTO epic) {
        return projectEpicService.save(epic);
    }

    @Tool(name = "fi_update_epic", description = "Update an epic. Include 'id' in epic object")
    public ProjectEpicDTO updateEpic(
            @ToolParam(description = "Epic ID") Long epicId,
            @ToolParam(description = "Epic data") ProjectEpicDTO epic) {
        return projectEpicService.updateEpic(epicId, epic);
    }

    @Tool(name = "fi_delete_epic", description = "Delete an epic")
    public void deleteEpic(@ToolParam(description = "Epic ID") Long epicId) {
        projectEpicService.deleteEpic(epicId);
    }
}
