import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import demoSource from "@/content/demo.md?raw";
import { parseMarkdownWeb } from "@/lib/markdown-web/parser";
import { BlockRenderer } from "@/components/markdown-web/BlockRenderer";
import { getSite } from "@/lib/mcp/store";
import { resolveTokens, tokensToCssVars } from "@/lib/mcp/themes";
import type { CSSProperties } from "react";

const HOME_SLUG = "home";

const fetchHomeSite = createServerFn({ method: "GET" }).handler(async () => {
  const site = getSite(HOME_SLUG);
  if (!site) return null;
  const { tokens } = resolveTokens(site.themeSlug, site.themeOverrides);
  return {
    markdown: site.markdown,
    themeSlug: site.themeSlug,
    layoutFamily: site.layoutFamily,
    tokens,
  };
});

export const Route = createFileRoute("/")({
  loader: async () => {
    const homeSite = await fetchHomeSite();
    return { homeSite };
  },
  component: Index,
});

function Index() {
  const { homeSite } = Route.useLoaderData();
  const source = homeSite?.markdown ?? demoSource;
  const [editedSource, setEditedSource] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);

  const currentSource = editedSource ?? source;

  const doc = useMemo(() => {
    try {
      return parseMarkdownWeb(currentSource);
    } catch (e) {
      return { frontmatter: {}, blocks: [], error: (e as Error).message };
    }
  }, [currentSource]);

  const isFromMcp = homeSite !== null;
  const wrapperStyle: CSSProperties | undefined = homeSite
    ? {
        ...(tokensToCssVars(homeSite.tokens) as unknown as CSSProperties),
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-sans)",
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background" style={wrapperStyle}>
      <div className="bg-foreground text-background border-b-4 border-foreground">
        <div className="mx-auto max-w-6xl px-6 py-2 flex items-center justify-between font-mono text-xs uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-primary" />
            source:{" "}
            <span className="text-secondary">
              {isFromMcp ? "mcp:home" : "demo.md"}
            </span>
          </div>
          <button
            onClick={() => setShowSource((s) => !s)}
            className="bg-primary text-primary-foreground px-3 py-1 hover:bg-secondary hover:text-foreground transition-colors"
          >
            {showSource ? "Hide source" : "Show source"}
          </button>
        </div>
      </div>

      {showSource && (
        <div className="border-b-4 border-foreground bg-muted">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <div className="font-mono text-xs uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>
                {isFromMcp
                  ? "live from mcp store — edits are local only"
                  : "edit the markdown — page rebuilds live"}
              </span>
              <span className="text-muted-foreground">
                {currentSource.length} chars
              </span>
            </div>
            <textarea
              value={currentSource}
              onChange={(e) => setEditedSource(e.target.value)}
              spellCheck={false}
              className="w-full h-[420px] bg-background border-brutal p-4 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:shadow-brutal-sm"
            />
          </div>
        </div>
      )}

      <BlockRenderer
        blocks={doc.blocks}
        layoutFamily={homeSite?.layoutFamily}
        themeSlug={homeSite?.themeSlug}
      />
    </div>
  );
}
