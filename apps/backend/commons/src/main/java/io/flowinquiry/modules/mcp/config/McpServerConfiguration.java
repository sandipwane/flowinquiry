package io.flowinquiry.modules.mcp.config;

import io.flowinquiry.modules.mcp.tools.CommentMcpTools;
import io.flowinquiry.modules.mcp.tools.EpicMcpTools;
import io.flowinquiry.modules.mcp.tools.IterationMcpTools;
import io.flowinquiry.modules.mcp.tools.OrganizationMcpTools;
import io.flowinquiry.modules.mcp.tools.ProjectMcpTools;
import io.flowinquiry.modules.mcp.tools.TeamMcpTools;
import io.flowinquiry.modules.mcp.tools.TicketMcpTools;
import io.flowinquiry.modules.mcp.tools.UserMcpTools;
import io.flowinquiry.modules.mcp.tools.WorkflowMcpTools;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Spring AI MCP Server.
 *
 * <p>This configuration exposes FlowInquiry services as MCP tools that can be invoked by AI
 * assistants like Claude Desktop. The MCP server is enabled by default but can be disabled by
 * setting {@code spring.ai.mcp.server.enabled=false}.
 */
@Configuration
@ConditionalOnProperty(name = "spring.ai.mcp.server.enabled", havingValue = "true", matchIfMissing = true)
public class McpServerConfiguration {

    @Bean
    public ToolCallbackProvider mcpToolProvider(
            TicketMcpTools ticketTools,
            TeamMcpTools teamTools,
            UserMcpTools userTools,
            ProjectMcpTools projectTools,
            WorkflowMcpTools workflowTools,
            CommentMcpTools commentTools,
            OrganizationMcpTools organizationTools,
            EpicMcpTools epicTools,
            IterationMcpTools iterationTools) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(
                        ticketTools,
                        teamTools,
                        userTools,
                        projectTools,
                        workflowTools,
                        commentTools,
                        organizationTools,
                        epicTools,
                        iterationTools)
                .build();
    }
}
