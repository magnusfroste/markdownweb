/**
 * MCP Streamable HTTP endpoint.
 *
 * Implements the minimal JSON-RPC subset MCP clients need:
 *   - initialize
 *   - tools/list
 *   - tools/call
 *
 * Auth: Bearer token via `Authorization` header, compared to MCP_ADMIN_KEY.
 *
 * Returns plain `application/json` responses (we do not stream SSE here),
 * but advertises both content types via the `Accept` header per spec.
 */

import { createFileRoute } from "@tanstack/react-router";
import { skills, getSkill } from "@/lib/mcp/skills";
import { recordActivity } from "@/lib/mcp/store";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Mcp-Session-Id",
  "Access-Control-Max-Age": "86400",
} as const;

function jsonRpcResult(id: unknown, result: unknown): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function jsonRpcError(
  id: unknown,
  code: number,
  message: string,
  status = 200,
): Response {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }),
    { status, headers: { "Content-Type": "application/json", ...CORS } },
  );
}

function summariseArgs(args: Record<string, unknown> | undefined): string {
  if (!args) return "";
  const keys = Object.keys(args);
  return keys
    .map((k) => {
      const v = args[k];
      if (typeof v === "string") return `${k}=${v.slice(0, 40)}${v.length > 40 ? "…" : ""}`;
      return `${k}=${JSON.stringify(v).slice(0, 40)}`;
    })
    .join(" ");
}

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),

      GET: async () =>
        new Response(
          JSON.stringify({
            name: "markdownweb-mcp",
            version: "0.1.0",
            transport: "streamable-http",
            skills: skills.map((s) => s.name),
            usage:
              "POST JSON-RPC 2.0 to this URL with `Authorization: Bearer <MCP_ADMIN_KEY>` and `Accept: application/json, text/event-stream`.",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...CORS },
          },
        ),

      POST: async ({ request }) => {
        const adminKey = process.env.MCP_ADMIN_KEY;
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.toLowerCase().startsWith("bearer ")
          ? auth.slice(7).trim()
          : "";
        const keyTail = token ? token.slice(-4) : "----";

        let body: {
          jsonrpc?: string;
          id?: unknown;
          method?: string;
          params?: Record<string, unknown>;
        } = {};
        try {
          body = await request.json();
        } catch {
          return jsonRpcError(null, -32700, "Parse error: invalid JSON", 400);
        }

        const id = body.id ?? null;
        const method = body.method ?? "";

        if (!adminKey) {
          return jsonRpcError(id, -32001, "Server missing MCP_ADMIN_KEY", 500);
        }
        if (!token || token !== adminKey) {
          return jsonRpcError(id, -32001, "Unauthorized", 401);
        }

        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;

        try {
          if (method === "initialize") {
            return jsonRpcResult(id, {
              protocolVersion: "2025-06-18",
              capabilities: { tools: { listChanged: false } },
              serverInfo: { name: "markdownweb-mcp", version: "0.1.0" },
            });
          }

          if (method === "notifications/initialized") {
            return new Response(null, { status: 204, headers: CORS });
          }

          if (method === "tools/list") {
            return jsonRpcResult(id, {
              tools: skills.map((s) => ({
                name: s.name,
                description: s.description,
                inputSchema: s.inputSchema,
              })),
            });
          }

          if (method === "tools/call") {
            const params = body.params ?? {};
            const name = typeof params.name === "string" ? params.name : "";
            const args =
              (params.arguments as Record<string, unknown> | undefined) ?? {};
            const skill = getSkill(name);
            if (!skill) {
              recordActivity({
                skill: name || "(unknown)",
                keyTail,
                args: summariseArgs(args),
                status: "error",
                message: "Unknown tool",
                durationMs: 0,
              });
              return jsonRpcError(id, -32601, `Unknown tool: ${name}`);
            }

            const start = Date.now();
            try {
              const result = skill.handler(args, { origin });
              const durationMs = Date.now() - start;
              recordActivity({
                skill: name,
                keyTail,
                args: summariseArgs(args),
                status: "ok",
                durationMs,
              });
              return jsonRpcResult(id, {
                content: [
                  { type: "text", text: JSON.stringify(result, null, 2) },
                ],
                structuredContent: result,
                isError: false,
              });
            } catch (err) {
              const durationMs = Date.now() - start;
              const message = err instanceof Error ? err.message : String(err);
              recordActivity({
                skill: name,
                keyTail,
                args: summariseArgs(args),
                status: "error",
                message,
                durationMs,
              });
              return jsonRpcResult(id, {
                content: [{ type: "text", text: message }],
                isError: true,
              });
            }
          }

          return jsonRpcError(id, -32601, `Method not found: ${method}`);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return jsonRpcError(id, -32603, `Internal error: ${message}`, 500);
        }
      },
    },
  },
});
