/**
 * Server-rendered preview of an MCP-managed site.
 * Loader fetches the site from the in-memory store via a server fn so that
 * the same Worker instance has access to the data.
 */

import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSite } from "@/lib/mcp/store";
import { parseMarkdownWeb } from "@/lib/markdown-web/parser";
import { BlockRenderer } from "@/components/markdown-web/BlockRenderer";

const fetchSite = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data }) => {
    const site = getSite(data.slug);
    if (!site) return null;
    return { title: site.title, slug: site.slug, markdown: site.markdown };
  });

export const Route = createFileRoute("/mcp/preview/$slug")({
  loader: async ({ params }) => {
    const site = await fetchSite({ data: { slug: params.slug } });
    if (!site) throw notFound();
    return site;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — MCP preview` : "MCP preview" },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="border-4 border-foreground p-8 max-w-md text-center">
        <h1 className="text-3xl font-black uppercase">Site not found</h1>
        <p className="mt-2 text-muted-foreground">
          This MCP site no longer exists in memory. Sites are reset on cold start.
        </p>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-8 text-destructive">Failed to load preview: {error.message}</div>
  ),
  component: PreviewPage,
});

function PreviewPage() {
  const site = Route.useLoaderData();
  const doc = parseMarkdownWeb(site.markdown);
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest">
        MCP preview · {site.slug}
      </div>
      <div>
        {doc.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </div>
  );
}
