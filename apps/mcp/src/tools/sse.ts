import { buildSchema } from "./schema";
import { asNumber } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";
import { McpError } from "../errors";
import type { CliConfig } from "../../../cli/src/config";

async function listenSse(
  config: CliConfig,
  userId: number,
  maxMessages: number,
  timeoutMs: number,
): Promise<string[]> {
  const token = config.token;
  if (!token) {
    throw new McpError(-32001, "Missing FLOWINQUIRY_TOKEN");
  }

  const url = new URL(`/sse/events/${userId}`, config.baseUrl);
  url.searchParams.set("token", token);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const messages: string[] = [];

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP ${response.status} ${response.statusText} ${body}`);
    }

    const reader = response.body?.getReader();
    if (!reader) return messages;

    const decoder = new TextDecoder();
    let buffer = "";

    while (messages.length < maxMessages) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trimEnd();
        if (!trimmed) continue;
        if (trimmed.startsWith("data:")) {
          messages.push(trimmed.slice(5).trimStart());
        } else {
          messages.push(trimmed);
        }
        if (messages.length >= maxMessages) {
          await reader.cancel();
          break;
        }
      }
    }
  } catch (error) {
    if (controller.signal.aborted || (error as Error).name === "AbortError") {
      return messages;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  return messages;
}

export const tools: ToolDefinition[] = [
  {
    name: "fi_sse_listen",
    description: "Listen for SSE events (bounded)",
    inputSchema: buildSchema({
      userId: { type: "number" },
      maxMessages: { type: "number", default: 50 },
      timeoutMs: { type: "number", default: 30000 },
    }, ["userId"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_sse_listen(args, config) {
    const userId = asNumber(args.userId, "userId", true) as number;
    const maxMessages = asNumber(args.maxMessages, "maxMessages") ?? 50;
    const timeoutMs = asNumber(args.timeoutMs, "timeoutMs") ?? 30000;
    return listenSse(config, userId, maxMessages, timeoutMs);
  },
};
