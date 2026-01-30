package io.flowinquiry.modules.mcp.tools;

import io.flowinquiry.modules.usermanagement.domain.User;
import io.flowinquiry.modules.usermanagement.service.UserService;
import io.flowinquiry.modules.usermanagement.service.dto.ResourcePermissionDTO;
import io.flowinquiry.modules.usermanagement.service.dto.UserDTO;
import io.flowinquiry.modules.usermanagement.service.dto.UserHierarchyDTO;
import io.flowinquiry.modules.usermanagement.service.mapper.UserMapper;
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
 * MCP Tools for user operations.
 *
 * <p>Provides AI-accessible tools for managing users and user hierarchy.
 */
@Component
@ConditionalOnProperty(name = "spring.ai.mcp.server.enabled", havingValue = "true", matchIfMissing = true)
public class UserMcpTools {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserMcpTools(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @Tool(name = "fi_search_users", description = "Search users with pagination and filters")
    public Page<UserDTO> searchUsers(
            @ToolParam(description = "Page number (0-based)", required = false) Integer page,
            @ToolParam(description = "Page size", required = false) Integer size,
            @ToolParam(description = "Sort field", required = false) String sortBy,
            @ToolParam(description = "Sort direction: asc or desc", required = false)
                    String sortDirection,
            @ToolParam(description = "Filter query", required = false) QueryDTO query) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);
        return userService.findAllPublicUsers(Optional.ofNullable(query), pageable);
    }

    @Tool(name = "fi_get_user", description = "Get user by ID")
    public Optional<UserDTO> getUser(@ToolParam(description = "User ID") Long userId) {
        return userService.getUserWithManagerById(userId);
    }

    @Tool(name = "fi_create_user", description = "Create a new user. Required: email")
    public UserDTO createUser(@ToolParam(description = "User data") UserDTO user) {
        return userService.createUser(user);
    }

    @Tool(name = "fi_update_user", description = "Update a user. Include 'id' in user object")
    public UserDTO updateUser(@ToolParam(description = "User data with id") UserDTO user) {
        return userService.updateUser(user);
    }

    @Tool(name = "fi_delete_user", description = "Delete a user by ID (soft delete)")
    public void deleteUser(@ToolParam(description = "User ID") Long userId) {
        userService.softDeleteUserById(userId);
    }

    @Tool(name = "fi_get_user_permissions", description = "Get user's permissions")
    public List<ResourcePermissionDTO> getUserPermissions(
            @ToolParam(description = "User ID") Long userId) {
        return userService.getResourcesWithPermissionsByUserId(userId);
    }

    @Tool(name = "fi_list_direct_reports", description = "List direct reports for a manager")
    public List<UserDTO> listDirectReports(
            @ToolParam(description = "Manager user ID") Long managerId) {
        return userService.getDirectReports(managerId);
    }

    @Tool(name = "fi_get_user_hierarchy", description = "Get user's organizational hierarchy")
    public UserHierarchyDTO getUserHierarchy(@ToolParam(description = "User ID") Long userId) {
        return userService.getUserHierarchyWithSubordinates(userId);
    }

    @Tool(name = "fi_get_org_chart", description = "Get the full organization chart")
    public UserHierarchyDTO getOrgChart() {
        return userService.getOrgChart();
    }

    @Tool(name = "fi_search_users_by_term", description = "Search users by name or email")
    public Page<UserDTO> searchUsersByTerm(
            @ToolParam(description = "Search term") String term,
            @ToolParam(description = "Page number (0-based)", required = false) Integer page,
            @ToolParam(description = "Page size", required = false) Integer size) {
        Pageable pageable = createPageable(page, size, null, null);
        Page<User> users = userService.searchUsers(term, pageable);
        return users.map(userMapper::toDto);
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
