import yaml from "js-yaml";

export type ParseDiagnostic = {
  severity: "error" | "warning";
  message: string;
  /** 1-indexed line number in the original source (incl. frontmatter). */
  line: number;
  /** Optional hint shown under the message. */
  hint?: string;
};

/**
 * Browser-safe frontmatter extractor.
 * Returns the line offset (1-indexed) where the body content starts in the
 * original source so downstream errors can point at the right line.
 */
function extractFrontmatter(source: string): {
  data: Record<string, unknown>;
  content: string;
  /** Number of lines consumed by the frontmatter block (0 if none). */
  bodyStartLine: number;
  diagnostics: ParseDiagnostic[];
} {
  const diagnostics: ParseDiagnostic[] = [];
  const src = source.replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(src);
  if (!match) return { data: {}, content: src, bodyStartLine: 0, diagnostics };

  // Lines: opening "---" + frontmatter lines + closing "---" + optional newline
  const fmLineCount = match[1].split("\n").length;
  const bodyStartLine = 1 /* opening --- */ + fmLineCount + 1 /* closing --- */;

  let data: Record<string, unknown> = {};
  try {
    data = (yaml.load(match[1]) ?? {}) as Record<string, unknown>;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // js-yaml errors carry a `mark` with the line number inside the YAML chunk.
    const yamlLine =
      err && typeof err === "object" && "mark" in err && (err as { mark?: { line?: number } }).mark
        ? ((err as { mark?: { line?: number } }).mark!.line ?? 0)
        : 0;
    diagnostics.push({
      severity: "error",
      message: `Invalid frontmatter YAML: ${msg.split("\n")[0]}`,
      line: 1 + 1 + yamlLine, // opening --- + 1-indexed
      hint: "Check indentation and quote any value containing : or # ",
    });
  }
  return { data, content: match[2], bodyStartLine, diagnostics };
}

export type DirectiveBlock = {
  kind: "directive";
  name: string;
  attrs: Record<string, string | number | boolean>;
  /** Raw inner content between ::name and :: */
  body: string;
  /** 1-indexed line where the opening ::name line lives in the source. */
  startLine: number;
  /** 1-indexed line where the body content begins (line after ::name). */
  bodyStartLine: number;
};

export type MarkdownBlock = {
  kind: "markdown";
  body: string;
  /** 1-indexed line where this markdown block starts in the source. */
  startLine: number;
};

export type Block = DirectiveBlock | MarkdownBlock;

export type Page = {
  /** Route slug, e.g. "/" or "/about". Always starts with "/". */
  slug: string;
  /** Page-specific <title> (overrides frontmatter title for this page). */
  title?: string;
  /** Page-specific meta description. */
  description?: string;
  /** Optional og:image URL for this page. */
  image?: string;
  /** Blocks rendered inside this page (between shared blocks). */
  blocks: Block[];
};

export type ParsedDoc = {
  frontmatter: Record<string, unknown>;
  /** All top-level blocks (legacy / single-page mode). */
  blocks: Block[];
  /**
   * Multi-page sites: present when at least one ::page directive exists.
   * Blocks outside ::page become `sharedBefore` / `sharedAfter` and are
   * rendered on every page (use for nav + footer).
   */
  pages?: Page[];
  sharedBefore?: Block[];
  sharedAfter?: Block[];
  diagnostics: ParseDiagnostic[];
};

/**
 * Parse attribute string like:  variant="split" columns=3 dark
 * into a record. Reports unterminated quotes as diagnostics.
 */
function parseAttrs(
  raw: string,
  line: number,
  diagnostics: ParseDiagnostic[],
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!raw) return out;

  // Detect unbalanced double-quotes (common typo). Skip the single-quote
  // check entirely — apostrophes appear constantly inside double-quoted
  // titles ("doesn't") and would produce false positives.
  const dq = (raw.match(/"/g) ?? []).length;
  if (dq % 2 !== 0) {
    diagnostics.push({
      severity: "error",
      message: `Unbalanced double-quote in directive attributes: \`${raw}\``,
      line,
      hint: 'Each `key="value"` needs both opening and closing ".',
    });
  }

  const re = /([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    const key = m[1];
    const val = m[2] ?? m[3] ?? m[4];
    if (val === undefined) {
      out[key] = true;
    } else if (/^-?\d+(\.\d+)?$/.test(val)) {
      out[key] = Number(val);
    } else if (val === "true" || val === "false") {
      out[key] = val === "true";
    } else {
      out[key] = val;
    }
  }
  return out;
}

const KNOWN_DIRECTIVES = new Set([
  "nav",
  "hero",
  "features",
  "pricing",
  "quote",
  "cta",
  "footer",
  "stats",
  "logos",
  "testimonials",
  "faq",
  "gallery",
  "timeline",
  "steps",
  "tabs",
  "divider",
  "split",
  "page",
]);

function normalizeSlug(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "/";
  let s = raw.trim();
  if (!s.startsWith("/")) s = "/" + s;
  // Collapse trailing slash except for root.
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

/**
 * Splits a markdown body into top-level blocks.
 * Directives:  ::name{attrs}\n ...body... \n::
 * Anything else becomes a "markdown" block.
 *
 * `lineOffset` is the 1-indexed line of `body` inside the *original* source,
 * so block-level diagnostics point at the right line in the editor.
 */
function splitBlocks(
  body: string,
  lineOffset: number,
  diagnostics: ParseDiagnostic[],
): Block[] {
  const lines = body.split("\n");
  const blocks: Block[] = [];
  let buf: string[] = [];
  let bufStart = 0; // index into `lines` where current md buffer began

  const flushMd = () => {
    const text = buf.join("\n").trim();
    if (text) {
      blocks.push({
        kind: "markdown",
        body: text,
        startLine: lineOffset + bufStart,
      });
    }
    buf = [];
  };

  let i = 0;
  let inFence = false;
  let fenceMarker = "";
  while (i < lines.length) {
    const line = lines[i];
    const sourceLine = lineOffset + i; // 1-indexed line in original source

    // Track fenced code blocks (``` or ~~~) so directives inside them
    // are treated as plain markdown content, not parsed as blocks.
    const fenceOpen = /^(\s*)(`{3,}|~{3,})/.exec(line);
    if (fenceOpen) {
      const marker = fenceOpen[2];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker[0];
      } else if (marker[0] === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      if (buf.length === 0) bufStart = i;
      buf.push(line);
      i++;
      continue;
    }

    if (!inFence) {
      // Stray closing `::` outside any directive — common copy-paste mistake.
      if (line.trim() === "::") {
        diagnostics.push({
          severity: "error",
          message: "Stray closing `::` with no matching opening directive.",
          line: sourceLine,
          hint: "Remove this line or add an opening like `::hero` above.",
        });
        i++;
        continue;
      }

      const open = /^::([\w-]+)(?:\{([^}]*)\})?\s*$/.exec(line);
      // Detect malformed opener: starts with :: but doesn't match.
      const looksLikeOpener = /^::\S/.test(line) && !open;
      if (looksLikeOpener) {
        diagnostics.push({
          severity: "error",
          message: `Malformed directive opener: \`${line.trim()}\``,
          line: sourceLine,
          hint: "Expected `::name` or `::name{key=\"value\"}` on its own line.",
        });
        if (buf.length === 0) bufStart = i;
        buf.push(line);
        i++;
        continue;
      }

      if (open) {
        flushMd();
        const name = open[1];
        const attrs = parseAttrs(open[2] ?? "", sourceLine, diagnostics);

        if (!KNOWN_DIRECTIVES.has(name)) {
          diagnostics.push({
            severity: "warning",
            message: `Unknown directive \`::${name}\`. It will render as an error placeholder.`,
            line: sourceLine,
            hint: `Known: ${Array.from(KNOWN_DIRECTIVES).sort().join(", ")}`,
          });
        }

        const startLine = sourceLine;
        const bodyStartLine = sourceLine + 1;
        const inner: string[] = [];
        i++;
        let closed = false;
        // ::page is the only nestable directive — track depth so inner
        // ::hero / :: etc. don't close the page prematurely.
        const nestable = name === "page";
        let depth = 1;
        while (i < lines.length) {
          const t = lines[i].trim();
          if (nestable && /^::[\w-]+/.test(t)) depth++;
          if (t === "::") {
            if (!nestable || --depth === 0) {
              closed = true;
              break;
            }
          }
          inner.push(lines[i]);
          i++;
        }
        if (!closed) {
          diagnostics.push({
            severity: "error",
            message: `Unclosed directive \`::${name}\` — missing trailing \`::\`.`,
            line: startLine,
            hint: "Add a line containing only `::` to close the block.",
          });
        } else {
          // skip closing ::
          i++;
        }
        blocks.push({
          kind: "directive",
          name,
          attrs,
          body: inner.join("\n"),
          startLine,
          bodyStartLine,
        });
        continue;
      }
    }
    if (buf.length === 0) bufStart = i;
    buf.push(line);
    i++;
  }
  flushMd();
  return blocks;
}

export function parseMarkdownWeb(source: string): ParsedDoc {
  const { data, content, bodyStartLine, diagnostics } = extractFrontmatter(source);
  // Body lines start at `bodyStartLine + 1` if frontmatter exists, otherwise 1.
  const offset = bodyStartLine === 0 ? 1 : bodyStartLine + 1;
  const blocks = splitBlocks(content, offset, diagnostics);

  // Multi-page mode: if any ::page directives exist, group blocks into pages
  // with shared chrome (nav/footer) before/after the first/last page.
  const hasPages = blocks.some((b) => b.kind === "directive" && b.name === "page");
  if (!hasPages) {
    return { frontmatter: data, blocks, diagnostics };
  }

  const sharedBefore: Block[] = [];
  const sharedAfter: Block[] = [];
  const pages: Page[] = [];
  let seenPage = false;
  const seenSlugs = new Set<string>();

  for (const b of blocks) {
    if (b.kind === "directive" && b.name === "page") {
      seenPage = true;
      const slug = normalizeSlug(b.attrs.slug);
      if (seenSlugs.has(slug)) {
        diagnostics.push({
          severity: "warning",
          message: `Duplicate page slug \`${slug}\` — only the first one is reachable.`,
          line: b.startLine,
        });
      }
      seenSlugs.add(slug);
      // Re-parse the page body so its inner directives become real blocks.
      const inner = splitBlocks(b.body, b.bodyStartLine, diagnostics);
      pages.push({
        slug,
        title: typeof b.attrs.title === "string" ? b.attrs.title : undefined,
        description: typeof b.attrs.description === "string" ? b.attrs.description : undefined,
        image: typeof b.attrs.image === "string" ? b.attrs.image : undefined,
        blocks: inner,
      });
    } else if (!seenPage) {
      sharedBefore.push(b);
    } else {
      sharedAfter.push(b);
    }
  }

  // Ensure at least one page resolves to "/".
  if (!pages.some((p) => p.slug === "/")) {
    diagnostics.push({
      severity: "warning",
      message: "No page with `slug=\"/\"` — the home route will 404.",
      line: 1,
      hint: "Add `::page{slug=\"/\" title=\"Home\"}` for the home page.",
    });
  }

  return {
    frontmatter: data,
    blocks, // legacy/raw — kept so existing single-page consumers still work
    pages,
    sharedBefore,
    sharedAfter,
    diagnostics,
  };
}

/** Helper: parse a YAML-ish list inside a directive body into items. */
export function parseListItems(body: string): Array<Record<string, string>> {
  try {
    const parsed = yaml.load(body);
    if (Array.isArray(parsed)) {
      return parsed.map((it) => {
        if (typeof it === "string") return { title: it };
        return it as Record<string, string>;
      });
    }
  } catch {
    // fall through
  }
  return body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("-"))
    .map((l) => ({ title: l.replace(/^-\s*/, "") }));
}
