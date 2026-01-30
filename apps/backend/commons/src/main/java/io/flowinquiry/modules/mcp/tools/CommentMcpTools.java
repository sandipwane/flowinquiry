package io.flowinquiry.modules.mcp.tools;

import io.flowinquiry.modules.collab.domain.EntityType;
import io.flowinquiry.modules.collab.service.CommentService;
import io.flowinquiry.modules.collab.service.dto.CommentDTO;
import java.util.List;
import java.util.Optional;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * MCP Tools for comment operations.
 *
 * <p>Provides AI-accessible tools for managing comments on various entities.
 */
@Component
@ConditionalOnProperty(name = "spring.ai.mcp.server.enabled", havingValue = "true", matchIfMissing = true)
public class CommentMcpTools {

    private final CommentService commentService;

    public CommentMcpTools(CommentService commentService) {
        this.commentService = commentService;
    }

    @Tool(
            name = "fi_save_comment",
            description =
                    "Create or update comment. For create: omit 'id'. For update: include 'id'. Required: entityType (Ticket/Project/Team/User), entityId, content")
    public CommentDTO saveComment(@ToolParam(description = "Comment data") CommentDTO comment) {
        return commentService.saveComment(comment);
    }

    @Tool(name = "fi_get_comment", description = "Get comment by ID")
    public CommentDTO getComment(@ToolParam(description = "Comment ID") Long commentId) {
        return commentService.getCommentById(commentId);
    }

    @Tool(name = "fi_list_comments", description = "List comments for an entity")
    public List<CommentDTO> listComments(
            @ToolParam(description = "Entity type: Ticket, Project, Team, or User") String entityType,
            @ToolParam(description = "Entity ID") Long entityId) {
        EntityType type = parseEntityType(entityType);
        return commentService.getCommentsForEntity(type, entityId);
    }

    @Tool(name = "fi_delete_comment", description = "Delete a comment")
    public void deleteComment(@ToolParam(description = "Comment ID") Long commentId) {
        commentService.deleteComment(commentId);
    }

    private EntityType parseEntityType(String entityType) {
        return switch (entityType.toLowerCase()) {
            case "ticket" -> EntityType.Ticket;
            case "project" -> EntityType.Project;
            case "team" -> EntityType.Team;
            case "user" -> EntityType.User;
            default -> throw new IllegalArgumentException("Invalid entity type: " + entityType);
        };
    }
}
