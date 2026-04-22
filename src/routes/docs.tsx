import { createFileRoute } from "@tanstack/react-router";
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
          "Komplett block-referens för MarkdownWeb: hero, features, stats, logos, testimonials, pricing, faq, gallery, timeline, steps, tabs.",
      },
      { property: "og:title", content: "Docs — MarkdownWeb block reference" },
      { property: "og:description", content: "Alla blocktyper med exempel." },
    ],
  }),
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-background border-b-4 border-foreground">
        <div className="mx-auto max-w-6xl px-6 py-2 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-primary" />
          source: <span className="text-secondary">docs.md</span>
        </div>
      </div>
      <BlockRenderer blocks={doc.blocks} />
    </div>
  );
}
