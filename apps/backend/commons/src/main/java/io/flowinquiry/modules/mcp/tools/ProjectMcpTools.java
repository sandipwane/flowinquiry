package io.flowinquiry.modules.mcp.tools;

import io.flowinquiry.modules.teams.service.ProjectEpicService;
import io.flowinquiry.modules.teams.service.ProjectIterationService;
import io.flowinquiry.modules.teams.service.ProjectService;
import io.flowinquiry.modules.teams.service.dto.ProjectDTO;
import io.flowinquiry.modules.teams.service.dto.ProjectEpicDTO;
import io.flowinquiry.modules.teams.service.dto.ProjectIterationDTO;
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
 * MCP Tools for project operations.
 *
 * <p>Provides AI-accessible tools for managing projects, iterations, and epics.
 */
@Component
@ConditionalOnProperty(name = "spring.ai.mcp.server.enabled", havingValue = "true", matchIfMissing = true)
public class ProjectMcpTools {

    private final ProjectService projectService;
    private final ProjectIterationService projectIterationService;
    private final ProjectEpicService projectEpicService;

    public ProjectMcpTools(
            ProjectService projectService,
            ProjectIterationService projectIterationService,
            ProjectEpicService projectEpicService) {
        this.projectService = projectService;
        this.projectIterationService = projectIterationService;
        this.projectEpicService = projectEpicService;
    }

    @Tool(name = "fi_search_projects", description = "Search projects with pagination and filters")
    public Page<ProjectDTO> searchProjects(
            @ToolParam(description = "Page number (0-based)", required = false) Integer page,
            @ToolParam(description = "Page size", required = false) Integer size,
            @ToolParam(description = "Sort field", required = false) String sortBy,
            @ToolParam(description = "Sort direction: asc or desc", required = false)
                    String sortDirection,
            @ToolParam(description = "Filter query", required = false) QueryDTO query) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);
        return projectService.findProjects(Optional.ofNullable(query), pageable);
    }

    @Tool(name = "fi_get_project", description = "Get project by ID")
    public ProjectDTO getProject(@ToolParam(description = "Project ID") Long projectId) {
        return projectService.getProjectById(projectId);
    }

    @Tool(
            name = "fi_create_project",
            description = "Create a new project. Required: name, shortName, teamId")
    public ProjectDTO createProject(@ToolParam(description = "Project data") ProjectDTO project) {
        return projectService.createProject(project);
    }

    @Tool(name = "fi_update_project", description = "Update a project. Include 'id' in project object")
    public ProjectDTO updateProject(
            @ToolParam(description = "Project ID") Long projectId,
            @ToolParam(description = "Project data") ProjectDTO project) {
        return projectService.updateProject(projectId, project);
    }

    @Tool(name = "fi_delete_project", description = "Delete a project by ID")
    public void deleteProject(@ToolParam(description = "Project ID") Long projectId) {
        projectService.deleteProject(projectId);
    }

    @Tool(name = "fi_list_project_iterations", description = "List iterations/sprints for a project")
    public List<ProjectIterationDTO> listProjectIterations(
            @ToolParam(description = "Project ID") Long projectId) {
        return projectIterationService.findByProjectId(projectId);
    }

    @Tool(name = "fi_list_project_epics", description = "List epics for a project")
    public List<ProjectEpicDTO> listProjectEpics(
            @ToolParam(description = "Project ID") Long projectId) {
        return projectEpicService.findByProjectId(projectId);
    }

    @Tool(name = "fi_get_project_by_short_name", description = "Get project by short name")
    public ProjectDTO getProjectByShortName(
            @ToolParam(description = "Project short name") String shortName) {
        return projectService.getByShortName(shortName);
    }

    @Tool(name = "fi_list_projects_by_user", description = "List projects accessible to a user")
    public Page<ProjectDTO> listProjectsByUser(
            @ToolParam(description = "User ID") Long userId,
            @ToolParam(description = "Page number (0-based)", required = false) Integer page,
            @ToolParam(description = "Page size", required = false) Integer size) {
        Pageable pageable = createPageable(page, size, null, null);
        return projectService.getProjectsByUserId(userId, pageable);
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
