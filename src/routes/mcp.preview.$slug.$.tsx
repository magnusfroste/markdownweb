/**
 * Sub-page splat route for multi-page MCP previews.
 * Matches /mcp/preview/:slug/* and resolves the matching ::page directive.
 */
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSite } from "@/lib/mcp/store";
import { parseMarkdownWeb } from "@/lib/markdown-web/parser";
import { resolveTokens } from "@/lib/mcp/themes";
import { RenderPreview } from "./mcp.preview.$slug";

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

const fetchSiteForSubpage = createServerFn({ method: "GET" })
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

export const Route = createFileRoute("/mcp/preview/$slug/$")({
  loader: async ({ params }) => {
    const site = await fetchSiteForSubpage({ data: { slug: params.slug } });
    if (!site) throw notFound();
    return site;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "MCP preview" }] };
    const splat = params._splat ?? "";
    const path = "/" + splat.replace(/\/+$/, "");
    const doc = parseMarkdownWeb(loaderData.markdown);
    const page = doc.pages?.find((p) => p.slug === path);
    const title = page?.title ?? `${loaderData.title} · ${path}`;
    const description = page?.description ?? loaderData.description;
    const url = `https://mdsites.lovable.app/mcp/preview/${params.slug}${path === "/" ? "" : path}`;
    return {
      meta: [
        { title: `${title} — MarkdownWeb` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "stylesheet", href: loaderData.fontsHref },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="p-8 text-destructive">
      Failed to load preview: {error.message}
    </div>
  ),
  component: SubPagePreview,
});

function SubPagePreview() {
  const site = Route.useLoaderData();
  const params = Route.useParams() as { slug: string; _splat?: string };
  const path = "/" + (params._splat ?? "").replace(/\/+$/, "");
  return <RenderPreview site={site} path={path} />;
}
