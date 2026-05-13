/**
 * Server-rendered preview of an MCP-managed site.
 * Loader fetches site + resolved theme tokens, then we wrap the page in a
 * div whose inline `style` overrides the global `--background`, `--primary`,
 * `--font-sans` etc. tokens. Tailwind classes like `bg-background` cascade
 * to the new values, so block renderers stay theme-aware automatically.
 */

import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CSSProperties } from "react";
import { getSite } from "@/lib/mcp/store";
import { parseMarkdownWeb } from "@/lib/markdown-web/parser";
import { BlockRenderer } from "@/components/markdown-web/BlockRenderer";
import { resolveTokens, tokensToCssVars } from "@/lib/mcp/themes";

const fetchSite = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const site = getSite(data.slug);
    if (!site) return null;
    const { theme, tokens } = resolveTokens(site.themeSlug, site.themeOverrides);
    return {
      title: site.title,
      slug: site.slug,
      markdown: site.markdown,
      themeName: theme.name,
      fontsHref: theme.fontsHref,
      tokens,
    };
  });

export const Route = createFileRoute("/mcp/preview/$slug")({
  loader: async ({ params }) => {
    const site = await fetchSite({ data: { slug: params.slug } });
    if (!site) throw notFound();
    return site;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.title} — MCP preview` : "MCP preview",
      },
    ],
    links: loaderData
      ? [{ rel: "stylesheet", href: loaderData.fontsHref }]
      : [],
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
    <div className="p-8 text-destructive">
      Failed to load preview: {error.message}
    </div>
  ),
  component: PreviewPage,
});

function PreviewPage() {
  const site = Route.useLoaderData();
  const doc = parseMarkdownWeb(site.markdown);
  const cssVars = tokensToCssVars(site.tokens) as Record<string, string>;
  const wrapperStyle: CSSProperties = {
    ...(cssVars as unknown as CSSProperties),
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    fontFamily: "var(--font-sans)",
  };
  return (
    <div style={wrapperStyle} className="min-h-screen mcp-themed">
      <style>{`
        .mcp-themed h1, .mcp-themed h2, .mcp-themed h3, .mcp-themed h4 {
          font-family: var(--font-display);
        }
        .mcp-themed code, .mcp-themed pre {
          font-family: var(--font-mono);
        }
      `}</style>
      <div className="bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest">
        MCP preview · {site.slug} · theme: {site.themeName}
      </div>
      <BlockRenderer blocks={doc.blocks} />
    </div>
  );
}
