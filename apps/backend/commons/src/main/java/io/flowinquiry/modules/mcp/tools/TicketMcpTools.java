package io.flowinquiry.modules.mcp.tools;

import io.flowinquiry.modules.teams.service.TicketService;
import io.flowinquiry.modules.teams.service.WorkflowTransitionHistoryService;
import io.flowinquiry.modules.teams.service.dto.PriorityDistributionDTO;
import io.flowinquiry.modules.teams.service.dto.TeamTicketPriorityDistributionDTO;
import io.flowinquiry.modules.teams.service.dto.TicketActionCountByDateDTO;
import io.flowinquiry.modules.teams.service.dto.TicketDTO;
import io.flowinquiry.modules.teams.service.dto.TicketDistributionDTO;
import io.flowinquiry.modules.teams.service.dto.TransitionItemCollectionDTO;
import io.flowinquiry.modules.usermanagement.service.dto.TicketStatisticsDTO;
import io.flowinquiry.query.QueryDTO;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
 * MCP Tools for ticket operations.
 *
 * <p>Provides AI-accessible tools for creating, reading, updating, and deleting tickets, as well as
 * retrieving ticket statistics and distributions.
 */
@Component
@ConditionalOnProperty(name = "spring.ai.mcp.server.enabled", havingValue = "true", matchIfMissing = true)
public class TicketMcpTools {

    private final TicketService ticketService;
    private final WorkflowTransitionHistoryService workflowTransitionHistoryService;

    public TicketMcpTools(
            TicketService ticketService,
            WorkflowTransitionHistoryService workflowTransitionHistoryService) {
        this.ticketService = ticketService;
        this.workflowTransitionHistoryService = workflowTransitionHistoryService;
    }

    @Tool(name = "fi_create_ticket", description = "Create a new ticket in a team")
    public TicketDTO createTicket(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "Workflow ID") Long workflowId,
            @ToolParam(description = "Initial state ID") Long stateId,
            @ToolParam(description = "Requester user ID") Long requesterId,
            @ToolParam(description = "Priority: Critical, High, Medium, Low, or Trivial")
                    String priority,
            @ToolParam(description = "Ticket title") String title,
            @ToolParam(description = "Ticket description") String description) {
        TicketDTO ticket = new TicketDTO();
        ticket.setTeamId(teamId);
        ticket.setWorkflowId(workflowId);
        ticket.setCurrentStateId(stateId);
        ticket.setRequestUserId(requesterId);
        ticket.setPriority(parsePriority(priority));
        ticket.setRequestTitle(title);
        ticket.setRequestDescription(description);
        return ticketService.createTicket(ticket);
    }

    @Tool(name = "fi_search_tickets", description = "Search tickets with pagination and filters")
    public Page<TicketDTO> searchTickets(
            @ToolParam(description = "Page number (0-based)", required = false) Integer page,
            @ToolParam(description = "Page size", required = false) Integer size,
            @ToolParam(description = "Sort field", required = false) String sortBy,
            @ToolParam(description = "Sort direction: asc or desc", required = false)
                    String sortDirection,
            @ToolParam(description = "Filter query in JSON format", required = false)
                    QueryDTO query) {
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);
        return ticketService.findTickets(query, pageable);
    }

    @Tool(name = "fi_get_ticket", description = "Get a ticket by ID")
    public TicketDTO getTicket(@ToolParam(description = "Ticket ID") Long ticketId) {
        return ticketService.getTicketById(ticketId);
    }

    @Tool(
            name = "fi_update_ticket",
            description =
                    "Update a ticket. IMPORTANT: Requires FULL ticket object. Pattern: 1) GET ticket with fi_get_ticket, 2) Modify fields, 3) Send complete object")
    public TicketDTO updateTicket(@ToolParam(description = "Complete ticket object") TicketDTO ticket) {
        return ticketService.updateTicket(ticket);
    }

    @Tool(name = "fi_delete_ticket", description = "Delete a ticket by ID")
    public void deleteTicket(@ToolParam(description = "Ticket ID") Long ticketId) {
        ticketService.deleteTicket(ticketId);
    }

    @Tool(name = "fi_get_next_ticket", description = "Get the next ticket in sequence")
    public Optional<TicketDTO> getNextTicket(
            @ToolParam(description = "Current ticket ID") Long ticketId,
            @ToolParam(description = "Project ID", required = false) Long projectId) {
        return ticketService.getNextTicket(ticketId, projectId);
    }

    @Tool(name = "fi_get_previous_ticket", description = "Get the previous ticket in sequence")
    public Optional<TicketDTO> getPreviousTicket(
            @ToolParam(description = "Current ticket ID") Long ticketId,
            @ToolParam(description = "Project ID", required = false) Long projectId) {
        return ticketService.getPreviousTicket(ticketId, projectId);
    }

    @Tool(
            name = "fi_get_team_ticket_distribution",
            description = "Get ticket distribution by team member")
    public List<TicketDistributionDTO> getTeamTicketDistribution(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "From date (ISO format)", required = false) String fromDate,
            @ToolParam(description = "To date (ISO format)", required = false) String toDate,
            @ToolParam(description = "Date range: week, month, quarter, year", required = false)
                    String range) {
        Instant[] dates = parseDateRange(fromDate, toDate, range);
        return ticketService.getTicketDistribution(teamId, dates[0], dates[1]);
    }

    @Tool(
            name = "fi_get_team_ticket_priority_distribution",
            description = "Get ticket priority distribution for a team")
    public List<PriorityDistributionDTO> getTeamPriorityDistribution(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "From date (ISO format)", required = false) String fromDate,
            @ToolParam(description = "To date (ISO format)", required = false) String toDate,
            @ToolParam(description = "Date range: week, month, quarter, year", required = false)
                    String range) {
        Instant[] dates = parseDateRange(fromDate, toDate, range);
        return ticketService.getPriorityDistribution(teamId, dates[0], dates[1]);
    }

    @Tool(name = "fi_get_team_ticket_statistics", description = "Get ticket statistics for a team")
    public TicketStatisticsDTO getTeamTicketStatistics(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "From date (ISO format)", required = false) String fromDate,
            @ToolParam(description = "To date (ISO format)", required = false) String toDate,
            @ToolParam(description = "Date range: week, month, quarter, year", required = false)
                    String range) {
        Instant[] dates = parseDateRange(fromDate, toDate, range);
        return ticketService.getTicketStatisticsByTeamId(teamId, dates[0], dates[1]);
    }

    @Tool(name = "fi_list_team_overdue_tickets", description = "List overdue tickets for a team")
    public Page<TicketDTO> listTeamOverdueTickets(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "Page number (0-based)", required = false) Integer page,
            @ToolParam(description = "Page size", required = false) Integer size) {
        Pageable pageable = createPageable(page, size, null, null);
        return ticketService.getOverdueTicketsByTeam(teamId, pageable);
    }

    @Tool(name = "fi_count_team_overdue_tickets", description = "Count overdue tickets for a team")
    public Long countTeamOverdueTickets(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "From date (ISO format)", required = false) String fromDate,
            @ToolParam(description = "To date (ISO format)", required = false) String toDate,
            @ToolParam(description = "Date range: week, month, quarter, year", required = false)
                    String range) {
        Instant[] dates = parseDateRange(fromDate, toDate, range);
        return ticketService.countOverdueTickets(
                teamId,
                io.flowinquiry.modules.teams.domain.WorkflowTransitionHistoryStatus.COMPLETED,
                dates[0],
                dates[1]);
    }

    @Tool(name = "fi_list_team_unassigned_tickets", description = "List unassigned tickets for a team")
    public Page<TicketDTO> listTeamUnassignedTickets(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "Page number (0-based)", required = false) Integer page,
            @ToolParam(description = "Page size", required = false) Integer size) {
        Pageable pageable = createPageable(page, size, null, null);
        return ticketService.getUnassignedTickets(teamId, pageable);
    }

    @Tool(
            name = "fi_get_team_ticket_creation_series",
            description = "Get ticket creation time series for a team")
    public List<TicketActionCountByDateDTO> getTeamTicketCreationSeries(
            @ToolParam(description = "Team ID") Long teamId,
            @ToolParam(description = "Number of days to look back", required = false) Integer days) {
        return ticketService.getTicketCreationTimeSeries(teamId, days != null ? days : 7);
    }

    @Tool(name = "fi_list_user_overdue_tickets", description = "List overdue tickets for a user")
    public Page<TicketDTO> listUserOverdueTickets(
            @ToolParam(description = "User ID") Long userId,
            @ToolParam(description = "Page number (0-based)", required = false) Integer page,
            @ToolParam(description = "Page size", required = false) Integer size) {
        Pageable pageable = createPageable(page, size, null, null);
        return ticketService.getOverdueTicketsByUser(userId, pageable);
    }

    @Tool(
            name = "fi_get_user_team_priority_distribution",
            description = "Get team priority distribution by user")
    public List<TeamTicketPriorityDistributionDTO> getUserTeamPriorityDistribution(
            @ToolParam(description = "User ID") Long userId,
            @ToolParam(description = "From date (ISO format)", required = false) String fromDate,
            @ToolParam(description = "To date (ISO format)", required = false) String toDate,
            @ToolParam(description = "Date range: week, month, quarter, year", required = false)
                    String range) {
        Instant[] dates = parseDateRange(fromDate, toDate, range);
        return ticketService.getPriorityDistributionForUser(userId, dates[0], dates[1]);
    }

    @Tool(name = "fi_get_ticket_state_history", description = "Get ticket state transition history")
    public TransitionItemCollectionDTO getTicketStateHistory(
            @ToolParam(description = "Ticket ID") Long ticketId) {
        return workflowTransitionHistoryService.getTransitionHistoryByTicketId(ticketId);
    }

    @Tool(name = "fi_update_ticket_state", description = "Update ticket state/status")
    public TicketDTO updateTicketState(
            @ToolParam(description = "Ticket ID") Long ticketId,
            @ToolParam(description = "New state ID") Long newStateId) {
        return ticketService.updateTicketState(ticketId, newStateId);
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

    private Instant[] parseDateRange(String fromDate, String toDate, String range) {
        Instant from = null;
        Instant to = Instant.now();

        if (fromDate != null && !fromDate.isEmpty()) {
            from = Instant.parse(fromDate);
        }
        if (toDate != null && !toDate.isEmpty()) {
            to = Instant.parse(toDate);
        }
        if (from == null && range != null) {
            from =
                    switch (range.toLowerCase()) {
                        case "week" -> to.minus(7, ChronoUnit.DAYS);
                        case "month" -> to.minus(30, ChronoUnit.DAYS);
                        case "quarter" -> to.minus(90, ChronoUnit.DAYS);
                        case "year" -> to.minus(365, ChronoUnit.DAYS);
                        default -> to.minus(30, ChronoUnit.DAYS);
                    };
        }
        if (from == null) {
            from = to.minus(30, ChronoUnit.DAYS);
        }
        return new Instant[] {from, to};
    }

    private io.flowinquiry.modules.teams.domain.TicketPriority parsePriority(String priority) {
        return switch (priority.toLowerCase()) {
            case "critical" -> io.flowinquiry.modules.teams.domain.TicketPriority.Critical;
            case "high" -> io.flowinquiry.modules.teams.domain.TicketPriority.High;
            case "medium" -> io.flowinquiry.modules.teams.domain.TicketPriority.Medium;
            case "low" -> io.flowinquiry.modules.teams.domain.TicketPriority.Low;
            case "trivial" -> io.flowinquiry.modules.teams.domain.TicketPriority.Trivial;
            default -> io.flowinquiry.modules.teams.domain.TicketPriority.Medium;
        };
    }
}
