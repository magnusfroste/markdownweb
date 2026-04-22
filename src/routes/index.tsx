import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import demoSource from "@/content/demo.md?raw";
import { parseMarkdownWeb } from "@/lib/markdown-web/parser";
import { BlockRenderer } from "@/components/markdown-web/BlockRenderer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MarkdownWeb — Skriv din sajt i markdown" },
      { name: "description", content: "Sajter vars källkod är ett .md-dokument. LLM-vänlig, git-vänlig, människo-vänlig." },
      { property: "og:title", content: "MarkdownWeb — Skriv din sajt i markdown" },
      { property: "og:description", content: "Sajter vars källkod är ett .md-dokument." },
    ],
  }),
  component: Index,
});

function Index() {
  const [source, setSource] = useState(demoSource);
  const [showSource, setShowSource] = useState(false);

  const doc = useMemo(() => {
    try {
      return parseMarkdownWeb(source);
    } catch (e) {
      return { frontmatter: {}, blocks: [], error: (e as Error).message };
    }
  }, [source]);

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
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

      <div className="grid lg:grid-cols-[1fr] gap-0">
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

        <div>
          <BlockRenderer blocks={doc.blocks} />
        </div>
      </div>
    </div>
  );
}
