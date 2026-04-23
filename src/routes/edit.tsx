import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import demoSource from "@/content/demo.md?raw";
import docsSource from "@/content/docs.md?raw";
import { parseMarkdownWeb } from "@/lib/markdown-web/parser";
import { BlockRenderer } from "@/components/markdown-web/BlockRenderer";

const STORAGE_KEY = "markdownweb:editor:source";

export const Route = createFileRoute("/edit")({
  head: () => ({
    meta: [
      { title: "Editor — MarkdownWeb" },
      {
        name: "description",
        content:
          "Edit markdown on the left, see your site render live on the right. Saved locally in your browser.",
      },
      { property: "og:title", content: "Editor — MarkdownWeb" },
      {
        property: "og:description",
        content: "Live markdown editor with split preview.",
      },
    ],
  }),
  component: EditorPage,
});

type Template = { id: string; label: string; source: string };

const TEMPLATES: Template[] = [
  { id: "demo", label: "Landing (demo.md)", source: demoSource },
  { id: "docs", label: "Docs reference (docs.md)", source: docsSource },
  {
    id: "blank",
    label: "Blank",
    source: `---\ntitle: "Untitled"\n---\n\n::hero\n# New page\n## Start writing markdown.\n::\n`,
  },
];

const BLOCK_ID = "mw-block-";

function blockLabel(block: ReturnType<typeof parseMarkdownWeb>["blocks"][number]): {
  name: string;
  hint?: string;
} {
  if (block.kind === "markdown") {
    const firstHeading = block.body.split("\n").find((l) => /^#{1,6}\s+/.test(l));
    const text = firstHeading?.replace(/^#{1,6}\s+/, "").trim();
    return { name: "markdown", hint: text || block.body.slice(0, 40).trim() };
  }
  const a = block.attrs as Record<string, unknown>;
  const hint =
    (a.title as string) ||
    (a.eyebrow as string) ||
    (a.brand as string) ||
    (a.subtitle as string) ||
    undefined;
  return { name: block.name, hint };
}

function EditorPage() {
  // Hydrate from localStorage on the client only — SSR must render the demo
  // source to avoid hydration mismatch.
  const [source, setSource] = useState<string>(demoSource);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeBlock, setActiveBlock] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const suppressObserverUntil = useRef(0);

  // Load saved source on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored.length > 0) setSource(stored);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Debounced autosave.
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, source);
        setSavedAt(Date.now());
      } catch {
        // ignore
      }
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [source, hydrated]);

  // Parse on every change. The parser is fault-tolerant and returns
  // diagnostics inline rather than throwing — we still keep a try/catch
  // as a last-resort safety net.
  const lastGoodDoc = useRef(parseMarkdownWeb(source));
  const doc = useMemo(() => {
    try {
      const parsed = parseMarkdownWeb(source);
      lastGoodDoc.current = parsed;
      return parsed;
    } catch {
      return lastGoodDoc.current;
    }
  }, [source]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Jump the textarea cursor to a 1-indexed line, focus and scroll it into view.
  const jumpToLine = (line: number) => {
    const el = textareaRef.current;
    if (!el) return;
    const lines = source.split("\n");
    const safeLine = Math.max(1, Math.min(line, lines.length));
    let pos = 0;
    for (let i = 0; i < safeLine - 1; i++) pos += lines[i].length + 1;
    el.focus();
    el.setSelectionRange(pos, pos + (lines[safeLine - 1]?.length ?? 0));
    // Approximate scroll position based on line height.
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 18;
    el.scrollTop = Math.max(0, (safeLine - 3) * lineHeight);
  };

  // Auto-highlight outline as the user scrolls the preview.
  // Uses IntersectionObserver against the preview scroll container as root,
  // picking the topmost intersecting block as "active".
  useEffect(() => {
    const root = previewScrollRef.current;
    if (!root) return;
    const els = doc.blocks
      .map((_, i) => document.getElementById(`${BLOCK_ID}${i}`))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    // Track per-element intersection state and recompute the topmost visible.
    const visible = new Map<HTMLElement, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        // Ignore observer updates briefly after a programmatic jump so
        // smooth-scrolling doesn't fight the user-clicked active state.
        if (Date.now() < suppressObserverUntil.current) return;

        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            visible.set(el, entry.intersectionRatio);
          } else {
            visible.delete(el);
          }
        }

        if (visible.size === 0) return;
        // Pick the visible block whose top is closest to (but at/below) the
        // top of the scroll viewport — that's what the user is "reading".
        const rootTop = root.getBoundingClientRect().top;
        let bestEl: HTMLElement | null = null;
        let bestDist = Infinity;
        for (const el of visible.keys()) {
          const top = el.getBoundingClientRect().top - rootTop;
          // Prefer blocks whose top has scrolled past or just reached the top.
          const dist = top >= -8 ? top : Math.abs(top) + 1000;
          if (dist < bestDist) {
            bestDist = dist;
            bestEl = el;
          }
        }
        if (bestEl) {
          const idx = Number(bestEl.dataset.mwBlockIndex ?? "0");
          setActiveBlock((prev) => (prev === idx ? prev : idx));
        }
      },
      {
        root,
        // Bias toward the top: shrink the bottom so blocks count as
        // "active" only once they enter the upper portion of the viewport.
        rootMargin: "0px 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [doc.blocks]);

  // Jump preview + editor to a specific block.
  const jumpToBlock = (index: number) => {
    const block = doc.blocks[index];
    if (!block) return;
    setActiveBlock(index);
    // Suppress observer briefly so it doesn't override our active selection
    // mid-scroll.
    suppressObserverUntil.current = Date.now() + 800;
    const el = document.getElementById(`${BLOCK_ID}${index}`);
    if (el && previewScrollRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    jumpToLine(block.startLine);
  };

  const handleDownload = () => {
    const blob = new Blob([source], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const handleLoadTemplate = (tpl: Template) => {
    if (
      source.trim() !== "" &&
      !confirm(`Replace current draft with "${tpl.label}"? Your current edit will be lost.`)
    ) {
      return;
    }
    setSource(tpl.source);
  };

  const handleReset = () => {
    if (!confirm("Clear the editor and remove your local draft?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setSource(demoSource);
    setSavedAt(null);
  };

  const savedLabel = savedAt
    ? `saved ${new Date(savedAt).toLocaleTimeString()}`
    : hydrated
      ? "not saved yet"
      : "loading…";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="bg-foreground text-background border-b-4 border-foreground sticky top-0 z-50">
        <div className="mx-auto max-w-[1800px] px-4 py-2 font-mono text-xs uppercase tracking-widest flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 bg-primary" />
            <span className="hidden sm:inline">editor</span>
            <span className="text-secondary">site.md</span>
            <span className="text-background/60 normal-case tracking-normal hidden md:inline">
              · {savedLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/"
              className="px-2 py-1 hover:bg-background hover:text-foreground transition-colors"
            >
              ← home
            </Link>
            <Link
              to="/docs"
              className="px-2 py-1 hover:bg-background hover:text-foreground transition-colors"
            >
              docs
            </Link>
            <span className="hidden md:inline-block w-px h-4 bg-background/30 mx-1" />
            <select
              aria-label="Load template"
              onChange={(e) => {
                const tpl = TEMPLATES.find((t) => t.id === e.target.value);
                if (tpl) handleLoadTemplate(tpl);
                e.currentTarget.selectedIndex = 0;
              }}
              className="bg-background text-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-widest border-2 border-background"
            >
              <option value="">load template…</option>
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCopy}
              className="bg-background text-foreground px-3 py-1 hover:bg-secondary transition-colors"
            >
              {copied ? "✓ copied" : "copy .md"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="bg-primary text-primary-foreground px-3 py-1 hover:bg-secondary hover:text-foreground transition-colors"
            >
              ↓ download .md
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-2 py-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              reset
            </button>
          </div>
        </div>
      </div>

      {/* Three-pane layout: outline | editor | preview */}
      <div className="flex-1 lg:grid lg:grid-cols-[240px_1fr_1fr] lg:h-[calc(100vh-2.5rem)]">
        {/* OUTLINE */}
        <aside className="bg-background border-r-4 border-foreground lg:overflow-y-auto">
          <div className="sticky top-0 bg-background border-b-4 border-foreground px-3 py-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest z-10">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary" />
              outline
            </span>
            <span className="text-muted-foreground normal-case tracking-normal">
              {doc.blocks.length}
            </span>
          </div>
          {doc.blocks.length === 0 ? (
            <div className="p-3 font-mono text-xs text-muted-foreground">No blocks yet.</div>
          ) : (
            <ol className="py-1">
              {doc.blocks.map((b, i) => {
                const { name, hint } = blockLabel(b);
                const active = i === activeBlock;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => jumpToBlock(i)}
                      className={[
                        "w-full text-left px-3 py-2 flex items-start gap-2 border-l-4 transition-colors font-mono text-xs",
                        active
                          ? "border-l-primary bg-primary/15 text-foreground"
                          : "border-l-transparent hover:bg-secondary/60 text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                      aria-current={active ? "true" : undefined}
                    >
                      <span
                        className={[
                          "shrink-0 inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-widest border-2 border-foreground",
                          active
                            ? "bg-foreground text-background"
                            : "bg-background text-foreground",
                        ].join(" ")}
                      >
                        {name}
                      </span>
                      <span className="flex-1 min-w-0">
                        {hint && (
                          <span className="block truncate normal-case tracking-normal">
                            {hint}
                          </span>
                        )}
                        <span className="block text-[10px] text-muted-foreground mt-0.5">
                          L{b.startLine}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </aside>

        {/* EDITOR */}
        <div className="bg-foreground text-background lg:overflow-hidden flex flex-col lg:border-r-4 lg:border-foreground">
          <div className="sticky top-0 bg-foreground border-b-4 border-primary px-4 py-2 flex items-center justify-between font-mono text-xs uppercase tracking-widest z-10">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary" />
              source — site.md
            </span>
            <span className="text-background/60 normal-case tracking-normal">
              {source.length.toLocaleString()} chars
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            className="flex-1 min-h-[60vh] lg:min-h-0 w-full bg-foreground text-background font-mono text-xs leading-relaxed p-4 outline-none resize-none border-0 focus:bg-foreground"
            placeholder="# Start writing your site…"
          />
        </div>

        {/* PREVIEW */}
        <div ref={previewScrollRef} className="bg-background lg:overflow-y-auto">
          <div className="sticky top-0 bg-background border-b-4 border-foreground px-4 py-2 flex items-center justify-between font-mono text-xs uppercase tracking-widest z-10">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary" />
              live preview
            </span>
            <span className="text-muted-foreground normal-case tracking-normal">
              {doc.blocks.length} block{doc.blocks.length === 1 ? "" : "s"}
              {doc.diagnostics.length > 0 && (
                <>
                  {" · "}
                  <span className="text-destructive">
                    {doc.diagnostics.length} issue
                    {doc.diagnostics.length === 1 ? "" : "s"}
                  </span>
                </>
              )}
            </span>
          </div>

          {doc.diagnostics.length > 0 && (
            <div className="border-b-4 border-foreground bg-destructive/10">
              <ul className="divide-y-2 divide-foreground/20">
                {doc.diagnostics.map((d, i) => {
                  const isErr = d.severity === "error";
                  return (
                    <li key={i} className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => jumpToLine(d.line)}
                        className="w-full text-left flex items-start gap-3 group"
                      >
                        <span
                          className={[
                            "shrink-0 inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest border-2 border-foreground",
                            isErr
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-secondary text-foreground",
                          ].join(" ")}
                        >
                          {isErr ? "error" : "warn"} · L{d.line}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-mono text-foreground group-hover:underline break-words">
                            {d.message}
                          </span>
                          {d.hint && (
                            <span className="block mt-1 text-xs text-muted-foreground break-words">
                              {d.hint}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                          jump →
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <BlockRenderer blocks={doc.blocks} idPrefix={BLOCK_ID} />
        </div>
      </div>
    </div>
  );
}
