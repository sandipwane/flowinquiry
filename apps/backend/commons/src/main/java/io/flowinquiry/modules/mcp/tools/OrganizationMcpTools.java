package io.flowinquiry.modules.mcp.tools;

import io.flowinquiry.modules.teams.domain.Organization;
import io.flowinquiry.modules.teams.service.OrganizationService;
import io.flowinquiry.modules.teams.service.dto.OrganizationDTO;
import io.flowinquiry.modules.teams.service.mapper.OrganizationMapper;
import io.flowinquiry.query.QueryDTO;
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
 * MCP Tools for organization operations.
 *
 * <p>Provides AI-accessible tools for managing organizations.
 */
@Component
@ConditionalOnProperty(name = "spring.ai.mcp.server.enabled", havingValue = "true", matchIfMissing = true)
public class OrganizationMcpTools {

    private final OrganizationService organizationService;
    private final OrganizationMapper organizationMapper;

    public OrganizationMcpTools(
            OrganizationService organizationService, OrganizationMapper organizationMapper) {
        this.organizationService = organizationService;
        this.organizationMapper = organizationMapper;
    }

    @Tool(name = "fi_create_organization", description = "Create a new organization. Required: name")
    public OrganizationDTO createOrganization(
            @ToolParam(description = "Organization data") OrganizationDTO organizationDTO) {
        Organization organization = organizationMapper.toEntity(organizationDTO);
        Organization saved = organizationService.createOrganization(organization);
        return organizationMapper.toDto(saved);
    }

    @Tool(
            name = "fi_update_organization",
            description = "Update an organization. Include 'id' in organization object")
    public OrganizationDTO updateOrganization(
            @ToolParam(description = "Organization ID") Long orgId,
            @ToolParam(description = "Organization data") OrganizationDTO organizationDTO) {
        Organization organization = organizationMapper.toEntity(organizationDTO);
        Organization updated = organizationService.updateOrganization(orgId, organization);
        return organizationMapper.toDto(updated);
    }

    @Tool(name = "fi_delete_organization", description = "Delete an organization")
    public void deleteOrganization(@ToolParam(description = "Organization ID") Long orgId) {
        organizationService.deleteOrganization(orgId);
    }

    @Tool(name = "fi_get_organization", description = "Get organization by ID")
    public OrganizationDTO getOrganization(@ToolParam(description = "Organization ID") Long orgId) {
        Organization organization = organizationService.findOrganizationById(orgId);
        return organizationMapper.toDto(organization);
    }

    @Tool(
            name = "fi_search_organizations",
            description = "Search organizations with pagination and filters")
    public Page<OrganizationDTO> searchOrganizations(
            @ToolParam(description = "Page number (0-based)", required = false) Integer page,
            @ToolParam(description = "Page size", required = false) Integer size,
            @ToolParam(description = "Sort field", required = false) String sortBy,
            @ToolParam(description = "Sort direction: asc or desc", required = false)
                    String sortDirection,
            @ToolParam(description = "Filter query", required = false) QueryDTO query) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);
        Page<Organization> organizations =
                organizationService.findOrganizations(Optional.ofNullable(query), pageable);
        return organizations.map(organizationMapper::toDto);
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
