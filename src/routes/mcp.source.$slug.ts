/**
 * Raw markdown source for an MCP-managed site.
 * Discovered via <link rel="alternate" type="text/markdown"> on the
 * preview HTML page. Served as text/markdown so LLM crawlers and
 * curl users get the canonical .md without HTML noise.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSite } from "@/lib/mcp/store";

const fetchMarkdown = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const site = getSite(data.slug);
    return site ? { markdown: site.markdown } : null;
  });

export const Route = createFileRoute("/mcp/source/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const result = await fetchMarkdown({ data: { slug: params.slug } });
        if (!result) {
          return new Response("# Not found\n\nThis site no longer exists.\n", {
            status: 404,
            headers: { "Content-Type": "text/markdown; charset=utf-8" },
          });
        }
        return new Response(result.markdown, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=60",
            "X-Robots-Tag": "all",
          },
        });
      },
    },
  },
});
