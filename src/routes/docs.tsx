import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import docsSource from "@/content/docs.md?raw";
import { parseMarkdownWeb } from "@/lib/markdown-web/parser";
import { BlockRenderer } from "@/components/markdown-web/BlockRenderer";

const doc = parseMarkdownWeb(docsSource);

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — MarkdownWeb block reference" },
      {
        name: "description",
        content:
          "Live block previews on the left, copyable markdown source on the right.",
      },
      { property: "og:title", content: "Docs — MarkdownWeb block reference" },
      { property: "og:description", content: "Every block type with examples." },
    ],
  }),
  component: DocsPage,
});

function DocsPage() {
  const [copied, setCopied] = useState(false);

  // Strip the page's own nav + footer + frontmatter so the source pane shows
  // only the body content the reader actually cares about.
  const cleanedSource = useMemo(() => {
    return docsSource
      .replace(/^---[\s\S]*?---\n+/, "") // drop frontmatter
      .trim();
  }, []);

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
    <div className="min-h-screen bg-background">
      {/* Top status bar */}
      <div className="bg-foreground text-background border-b-4 border-foreground sticky top-0 z-50">
        <div className="mx-auto max-w-[1800px] px-4 py-2 font-mono text-xs uppercase tracking-widest flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-primary" />
            <span className="hidden sm:inline">source:</span>
            <span className="text-secondary">docs.md</span>
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
        {/* LEFT: rendered preview, scrollable */}
        <div className="lg:overflow-y-auto lg:border-r-4 lg:border-foreground bg-background">
          <BlockRenderer blocks={doc.blocks} />
        </div>

        {/* RIGHT: markdown source, sticky on desktop */}
        <aside className="bg-foreground text-background lg:overflow-y-auto">
          <div className="sticky top-0 bg-foreground border-b-4 border-primary px-4 py-2 flex items-center justify-between font-mono text-xs uppercase tracking-widest z-10">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary" />
              docs.md — source
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
