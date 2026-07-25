import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { createServerFn } from "@tanstack/react-start";
import docsSource from "@/content/docs.md?raw";
import { parseMarkdownWeb } from "@/lib/markdown-web/parser";
import { BlockRenderer } from "@/components/markdown-web/BlockRenderer";
import { getSite } from "@/lib/mcp/store";
import { resolveTokens, tokensToCssVars } from "@/lib/mcp/themes";
import type { CSSProperties } from "react";

const DOCS_SLUG = "docs";

const fetchDocsSite = createServerFn({ method: "GET" }).handler(async () => {
  const site = getSite(DOCS_SLUG);
  if (!site) return null;
  const { tokens } = resolveTokens(site.themeSlug, site.themeOverrides);
  return {
    markdown: site.markdown,
    themeSlug: site.themeSlug,
    layoutFamily: site.layoutFamily,
    tokens,
  };
});

export const Route = createFileRoute("/docs")({
  loader: async () => ({ docsSite: await fetchDocsSite() }),
  head: () => {
    const ogImage =
      "https://mdsites.lovable.app/api/og.svg?" +
      new URLSearchParams({
        title: "Block reference",
        subtitle: "Every ::directive with live previews and copyable source.",
        badge: "mdsites.lovable.app · docs",
      }).toString();
    return {
      meta: [
        { title: "Docs — MarkdownWeb block reference" },
        {
          name: "description",
          content:
            "Live block previews on the left, copyable markdown source on the right. Every ::block directive with examples.",
        },
        { property: "og:title", content: "Docs — MarkdownWeb block reference" },
        { property: "og:description", content: "Live previews + copyable markdown for every ::block directive." },
        { property: "og:url", content: "https://mdsites.lovable.app/docs" },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:title", content: "Docs — MarkdownWeb block reference" },
        { name: "twitter:description", content: "Live previews + copyable markdown for every ::block directive." },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: "https://mdsites.lovable.app/docs" }],
    };
  },
  component: DocsPage,
});

function DocsPage() {
  const { docsSite } = Route.useLoaderData();
  const source = docsSite?.markdown ?? docsSource;
  const isFromMcp = docsSite !== null;
  const [copied, setCopied] = useState(false);

  const doc = useMemo(() => {
    try {
      return parseMarkdownWeb(source);
    } catch (e) {
      return { frontmatter: {}, blocks: [], error: (e as Error).message };
    }
  }, [source]);

  const cleanedSource = useMemo(
    () => source.replace(/^---[\s\S]*?---\n+/, "").trim(),
    [source],
  );

  const wrapperStyle: CSSProperties | undefined = docsSite
    ? {
        ...(tokensToCssVars(docsSite.tokens) as unknown as CSSProperties),
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-sans)",
      }
    : undefined;

  const sourceLabel = isFromMcp ? "mcp:docs" : "docs.md";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanedSource);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-background" style={wrapperStyle}>
      {/* Top status bar */}
      <div className="bg-foreground text-background border-b-4 border-foreground sticky top-0 z-50">
        <div className="mx-auto max-w-[1800px] px-4 py-2 font-mono text-xs uppercase tracking-widest flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-primary" />
            <span className="hidden sm:inline">source:</span>
            <span className="text-secondary">{sourceLabel}</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[10px]">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary" />
              live preview
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-secondary" />
              markdown source
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="bg-primary text-primary-foreground px-3 py-1 hover:bg-secondary hover:text-foreground transition-colors"
          >
            {copied ? "✓ copied!" : "copy all markdown"}
          </button>
        </div>
      </div>

      {/* Split layout */}
      <div className="lg:grid lg:grid-cols-2 lg:h-[calc(100vh-2.5rem)]">
        <div className="lg:overflow-y-auto lg:border-r-4 lg:border-foreground bg-background">
          <BlockRenderer blocks={doc.blocks} />
        </div>

        <aside className="bg-foreground text-background lg:overflow-y-auto">
          <div className="sticky top-0 bg-foreground border-b-4 border-primary px-4 py-2 flex items-center justify-between font-mono text-xs uppercase tracking-widest z-10">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary" />
              {sourceLabel} — source
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] hover:bg-secondary hover:text-foreground transition-colors"
            >
              {copied ? "✓" : "copy"}
            </button>
          </div>
          <pre className="p-4 font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto">
            <code>{cleanedSource}</code>
          </pre>
        </aside>
      </div>
    </div>
  );
}
