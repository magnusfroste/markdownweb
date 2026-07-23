import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import demoSource from "@/content/demo.md?raw";
import { parseMarkdownWeb } from "@/lib/markdown-web/parser";
import { BlockRenderer } from "@/components/markdown-web/BlockRenderer";

// Parse the bundled demo markdown ONCE at module load.
// This guarantees server and client see the exact same parsed output
// (avoids hydration mismatches from non-deterministic parsing in render).
const initialDoc = parseMarkdownWeb(demoSource);

export const Route = createFileRoute("/")({
  head: () => {
    const ogImage =
      "https://mdsites.lovable.app/api/og.svg?" +
      new URLSearchParams({
        title: "Write your site in Markdown",
        subtitle: "LLM-friendly, git-friendly, human-friendly.",
        badge: "mdsites.lovable.app",
      }).toString();
    return {
      meta: [
        { title: "MarkdownWeb — Write your site in markdown" },
        { name: "description", content: "Sites whose source is a .md document. LLM-friendly, git-friendly, human-friendly." },
        { property: "og:title", content: "MarkdownWeb — Write your site in markdown" },
        { property: "og:description", content: "Sites whose source is a .md document. LLM-friendly, git-friendly, human-friendly." },
        { property: "og:url", content: "https://mdsites.lovable.app/" },
        { property: "og:type", content: "website" },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:title", content: "MarkdownWeb — Write your site in markdown" },
        { name: "twitter:description", content: "Sites whose source is a .md document. LLM-friendly, git-friendly, human-friendly." },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: "https://mdsites.lovable.app/" }],
    };
  },
  component: Index,
});

function Index() {
  const [source, setSource] = useState(demoSource);
  const [showSource, setShowSource] = useState(false);

  // Re-parse only when the user has actually edited the source.
  const doc = useMemo(() => {
    if (source === demoSource) return initialDoc;
    try {
      return parseMarkdownWeb(source);
    } catch (e) {
      return { frontmatter: {}, blocks: [], error: (e as Error).message };
    }
  }, [source]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-background border-b-4 border-foreground">
        <div className="mx-auto max-w-6xl px-6 py-2 flex items-center justify-between font-mono text-xs uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-primary" />
            source: <span className="text-secondary">demo.md</span>
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
              <span>edit the markdown — page rebuilds live</span>
              <span className="text-muted-foreground">{source.length} chars</span>
            </div>
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              spellCheck={false}
              className="w-full h-[420px] bg-background border-brutal p-4 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:shadow-brutal-sm"
            />
          </div>
        </div>
      )}

      <BlockRenderer blocks={doc.blocks} />
    </div>
  );
}
