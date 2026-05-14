/**
 * Server-rendered preview of an MCP-managed site.
 *
 * Supports multi-page sites authored with `::page{slug="/about"}` directives:
 *   /mcp/preview/:slug          → renders the "/" page (or whole doc if single-page)
 *   /mcp/preview/:slug/about    → renders the "/about" page
 *   /mcp/preview/:slug/a/b      → renders the "/a/b" page
 */

import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CSSProperties } from "react";
import { getSite } from "@/lib/mcp/store";
import { parseMarkdownWeb } from "@/lib/markdown-web/parser";
import { resolvePage } from "@/lib/markdown-web/resolve-page";
import { BlockRenderer } from "@/components/markdown-web/BlockRenderer";
import { resolveTokens, tokensToCssVars, type ThemeTokens } from "@/lib/mcp/themes";

function extractFirstParagraph(md: string): string {
  const body = md.replace(/^---[\s\S]*?---/m, "").trim();
  for (const line of body.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("#") || t.startsWith("::") || t.startsWith("```")) continue;
    return t.replace(/[*_`#>[\]()]/g, "").slice(0, 200);
  }
  return "";
}

const fetchSite = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const site = getSite(data.slug);
    if (!site) return null;
    const { theme, tokens } = resolveTokens(site.themeSlug, site.themeOverrides);
    const parsed = parseMarkdownWeb(site.markdown);
    const fm = (parsed.frontmatter ?? {}) as Record<string, unknown>;
    const description =
      (typeof fm.description === "string" && fm.description) ||
      extractFirstParagraph(site.markdown);
    return {
      title: site.title,
      slug: site.slug,
      markdown: site.markdown,
      themeName: theme.name,
      themeSlug: theme.slug,
      fontsHref: theme.fontsHref,
      tokens,
      description,
      layoutFamily: site.layoutFamily,
    };
  });

export const Route = createFileRoute("/mcp/preview/$slug")({
  loader: async ({ params }) => {
    const site = await fetchSite({ data: { slug: params.slug } });
    if (!site) throw notFound();
    return site;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "MCP preview" }] };
    const url = `https://mdsites.lovable.app/mcp/preview/${params.slug}`;
    // For multi-page sites, prefer the home ::page title/description if set.
    const doc = parseMarkdownWeb(loaderData.markdown);
    const home = doc.pages?.find((p) => p.slug === "/");
    const title = home?.title ?? loaderData.title;
    const description = home?.description ?? loaderData.description;
    return {
      meta: [
        { title: `${title} — MarkdownWeb` },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "stylesheet", href: loaderData.fontsHref },
        {
          rel: "alternate",
          type: "text/markdown",
          href: `https://mdsites.lovable.app/mcp/source/${params.slug}`,
          title: `Markdown source`,
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: title,
            description,
            url,
            isPartOf: {
              "@type": "WebSite",
              name: "MarkdownWeb",
              url: "https://mdsites.lovable.app",
            },
          }),
        },
      ],
    };
  },
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
  component: PreviewHomePage,
});

function PreviewHomePage() {
  const site = Route.useLoaderData();
  return <RenderPreview site={site} path="/" />;
}

/** Reusable preview body — shared with the splat sub-page route. */
export function RenderPreview({
  site,
  path,
}: {
  site: {
    slug: string;
    markdown: string;
    themeName: string;
    themeSlug: string;
    layoutFamily: string;
    tokens: ThemeTokens;
  };
  path: string;
}) {
  const doc = parseMarkdownWeb(site.markdown);
  const { blocks, notFound: pageNotFound, page } = resolvePage(doc, path);
  const cssVars = tokensToCssVars(site.tokens) as Record<string, string>;
  const wrapperStyle: CSSProperties = {
    ...(cssVars as unknown as CSSProperties),
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    fontFamily: "var(--font-sans)",
  };

  if (pageNotFound) {
    return (
      <div style={wrapperStyle} className="min-h-screen mcp-themed">
        <div className="bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest">
          MCP preview · {site.slug} · page: {path}
        </div>
        <div className="max-w-2xl mx-auto p-12 text-center">
          <h1 className="text-4xl font-black uppercase">Page not found</h1>
          <p className="mt-2 text-muted-foreground">
            No <code className="px-1 bg-muted">::page{`{slug="${path}"}`}</code> in this site.
          </p>
          <p className="mt-4">
            {doc.pages?.map((p) => (
              <Link
                key={p.slug}
                to="/mcp/preview/$slug/$"
                params={{ slug: site.slug, _splat: p.slug.replace(/^\//, "") }}
                className="inline-block mr-3 underline"
              >
                {p.slug}
              </Link>
            ))}
          </p>
        </div>
      </div>
    );
  }

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
        MCP preview · {site.slug} · theme: {site.themeName} · layout: {site.layoutFamily}
        {page ? <> · page: {page.slug}</> : null}
      </div>
      <BlockRenderer blocks={blocks} layoutFamily={site.layoutFamily} themeSlug={site.themeSlug} />
    </div>
  );
}
