import yaml from "js-yaml";

/**
 * Browser-safe frontmatter extractor.
 * Replaces gray-matter (which depends on Node's Buffer).
 */
function extractFrontmatter(source: string): { data: Record<string, unknown>; content: string } {
  // Normalize line endings
  const src = source.replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(src);
  if (!match) return { data: {}, content: src };
  try {
    const data = (yaml.load(match[1]) ?? {}) as Record<string, unknown>;
    return { data, content: match[2] };
  } catch {
    return { data: {}, content: match[2] };
  }
}

export type DirectiveBlock = {
  kind: "directive";
  name: string;
  attrs: Record<string, string | number | boolean>;
  /** Raw inner content between ::name and :: */
  body: string;
};

export type MarkdownBlock = {
  kind: "markdown";
  body: string;
};

export type Block = DirectiveBlock | MarkdownBlock;

export type ParsedDoc = {
  frontmatter: Record<string, unknown>;
  blocks: Block[];
};

/**
 * Parse attribute string like:  variant="split" columns=3 dark
 * into a record.
 */
function parseAttrs(raw: string): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!raw) return out;
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

/**
 * Splits a markdown body into top-level blocks.
 * Directives:  ::name{attrs}\n ...body... \n::
 * Anything else becomes a "markdown" block.
 */
function splitBlocks(body: string): Block[] {
  const lines = body.split("\n");
  const blocks: Block[] = [];
  let buf: string[] = [];

  const flushMd = () => {
    const text = buf.join("\n").trim();
    if (text) blocks.push({ kind: "markdown", body: text });
    buf = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const open = /^::([\w-]+)(?:\{([^}]*)\})?\s*$/.exec(line);
    if (open) {
      flushMd();
      const name = open[1];
      const attrs = parseAttrs(open[2] ?? "");
      const inner: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "::") {
        inner.push(lines[i]);
        i++;
      }
      // skip closing ::
      i++;
      blocks.push({
        kind: "directive",
        name,
        attrs,
        body: inner.join("\n"),
      });
      continue;
    }
    buf.push(line);
    i++;
  }
  flushMd();
  return blocks;
}

export function parseMarkdownWeb(source: string): ParsedDoc {
  const { data, content } = extractFrontmatter(source);
  return {
    frontmatter: data,
    blocks: splitBlocks(content),
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
  // Fallback: each "- foo" line becomes { title: "foo" }
  return body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("-"))
    .map((l) => ({ title: l.replace(/^-\s*/, "") }));
}
