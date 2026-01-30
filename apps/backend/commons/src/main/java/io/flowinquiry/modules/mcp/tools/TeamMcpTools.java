package io.flowinquiry.modules.mcp.tools;

import io.flowinquiry.modules.teams.service.TeamService;
import io.flowinquiry.modules.teams.service.dto.TeamDTO;
import io.flowinquiry.modules.usermanagement.service.dto.UserDTO;
import io.flowinquiry.modules.usermanagement.service.dto.UserWithTeamRoleDTO;
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
 * MCP Tools for team operations.
 *
 * <p>Provides AI-accessible tools for managing teams and team membership.
 */
@Component
@ConditionalOnProperty(name = "spring.ai.mcp.server.enabled", havingValue = "true", matchIfMissing = true)
public class TeamMcpTools {

    private final TeamService teamService;

    public TeamMcpTools(TeamService teamService) {
        this.teamService = teamService;
    }

    @Tool(name = "fi_list_teams", description = "List teams with pagination and filters")
    public Page<TeamDTO> listTeams(
            @ToolParam(description = "Page number (0-based)", required = false) Integer page,
            @ToolParam(description = "Page size", required = false) Integer size,
            @ToolParam(description = "Sort field", required = false) String sortBy,
            @ToolParam(description = "Sort direction: asc or desc", required = false)
                    String sortDirection,
            @ToolParam(description = "Filter query", required = false) QueryDTO query) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);
        return teamService.findTeams(Optional.ofNullable(query), pageable);
    }

    @Tool(name = "fi_get_team", description = "Get team by ID")
    public Optional<TeamDTO> getTeam(@ToolParam(description = "Team ID") Long teamId) {
        return teamService.findTeamById(teamId);
    }

    @Tool(name = "fi_create_team", description = "Create a new team. Required: name")
    public TeamDTO createTeam(@ToolParam(description = "Team data") TeamDTO team) {
        return teamService.createTeam(team);
    }

    @Tool(name = "fi_update_team", description = "Update a team. Include 'id' in team object")
    public TeamDTO updateTeam(@ToolParam(description = "Team data with id") TeamDTO team) {
        return teamService.updateTeam(team);
    }

    @Tool(name = "fi_delete_team", description = "Delete a team by ID")
    public void deleteTeam(@ToolParam(description = "Team ID") Long teamId) {
        teamService.deleteTeam(teamId);
    }

    @Tool(name = "fi_delete_teams", description = "Delete multiple teams by IDs")
    public void deleteTeams(@ToolParam(description = "List of team IDs") List<Long> teamIds) {
        teamService.deleteTeams(teamIds);
    }

    @Tool(name = "fi_list_team_users", description = "List users in a team with their roles")
    public List<UserWithTeamRoleDTO> listTeamUsers(@ToolParam(description = "Team ID") Long teamId) {
        return teamService.getUsersByTeam(teamId);
    }

    @Tool(name = "fi_list_teams_by_user", description = "List teams that a user belongs to")
    public List<TeamDTO> listTeamsByUser(@ToolParam(description = "User ID") Long userId) {
        return teamService.findAllTeamsByUserId(userId);
    }

    @Tool(name = "fi_add_users_to_team", description = "Add users to a team with a specific role")
    public void addUsersToTeam(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "List of user IDs") List<Long> userIds,
            @ToolParam(description = "Role: guest, member, or manager") String role) {
        teamService.addUsersToTeam(userIds, role, teamId);
    }

    @Tool(name = "fi_search_users_not_in_team", description = "Search users not in a team")
    public List<UserDTO> searchUsersNotInTeam(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "Search term") String term) {
        return teamService.findUsersNotInTeam(term, teamId, PageRequest.of(0, 20));
    }

    @Tool(name = "fi_remove_user_from_team", description = "Remove a user from a team")
    public void removeUserFromTeam(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "User ID") Long userId) {
        teamService.removeUserFromTeam(userId, teamId);
    }

    @Tool(name = "fi_get_team_user_role", description = "Get user's role in a team")
    public String getTeamUserRole(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "User ID") Long userId) {
        return teamService.getUserRoleInTeam(userId, teamId);
    }

    @Tool(name = "fi_check_team_has_manager", description = "Check if a team has at least one manager")
    public boolean checkTeamHasManager(@ToolParam(description = "Team ID") Long teamId) {
        return teamService.hasManager(teamId);
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
