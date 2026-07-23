/**
 * Page-lifecycle helpers for the MCP Blog Pack.
 *
 * All operations mutate a site's markdown by editing its top-level ::page
 * directives, then serialize back. Sites without any ::page directive get
 * auto-migrated to multi-page mode by wrapping their existing blocks in a
 * home page (`::page{slug="/"}`).
 */

import type { Block, DirectiveBlock } from "@/lib/markdown-web/parser";
import { parseMarkdownWeb } from "@/lib/markdown-web/parser";
import { serializeDoc, serializeBlock } from "./serialize";
import { getSite, updateSite, type Site } from "./store";

export type PageMeta = {
  slug: string;
  title?: string;
  description?: string;
  image?: string;
  date?: string;
  author?: string;
  tags?: string[];
  excerpt?: string;
  /** "page" (default) or "post". Post pages are surfaced by ::post-index and RSS. */
  type?: "page" | "post";
};

function normalizePath(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "/";
  let s = raw.trim();
  if (!s.startsWith("/")) s = "/" + s;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function csvToTags(raw: unknown): string[] | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function tagsToCsv(tags: string[] | undefined): string | undefined {
  if (!tags || tags.length === 0) return undefined;
  return tags.join(",");
}

export function readPageMeta(block: DirectiveBlock): PageMeta {
  const a = block.attrs;
  return {
    slug: normalizePath(a.slug),
    title: typeof a.title === "string" ? a.title : undefined,
    description: typeof a.description === "string" ? a.description : undefined,
    image: typeof a.image === "string" ? a.image : undefined,
    date: typeof a.date === "string" ? a.date : undefined,
    author: typeof a.author === "string" ? a.author : undefined,
    tags: csvToTags(a.tags),
    excerpt: typeof a.excerpt === "string" ? a.excerpt : undefined,
    type: a.type === "post" ? "post" : "page",
  };
}

function metaToAttrs(meta: Partial<PageMeta>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (meta.slug) out.slug = normalizePath(meta.slug);
  if (meta.title) out.title = meta.title;
  if (meta.description) out.description = meta.description;
  if (meta.image) out.image = meta.image;
  if (meta.date) out.date = meta.date;
  if (meta.author) out.author = meta.author;
  if (meta.excerpt) out.excerpt = meta.excerpt;
  if (meta.type && meta.type !== "page") out.type = meta.type;
  const csv = tagsToCsv(meta.tags);
  if (csv) out.tags = csv;
  return out;
}

/**
 * Return blocks in multi-page shape, wrapping any pre-::page content in a
 * home ::page if none exist. Never persists.
 */
function ensureMultiPage(markdown: string): { blocks: Block[]; frontmatter: Record<string, unknown> } {
  const doc = parseMarkdownWeb(markdown);
  const hasPages = doc.blocks.some((b) => b.kind === "directive" && b.name === "page");
  if (hasPages) return { blocks: doc.blocks, frontmatter: doc.frontmatter };

  // Migrate: split into shared chrome (nav/footer stay at top-level) and a home ::page.
  const shared: Block[] = [];
  const inner: Block[] = [];
  for (const b of doc.blocks) {
    if (b.kind === "directive" && (b.name === "nav" || b.name === "footer")) {
      shared.push(b);
    } else {
      inner.push(b);
    }
  }
  const homeBody = inner.map((b) => serializeBlock(b)).join("\n\n");
  const home: DirectiveBlock = {
    kind: "directive",
    name: "page",
    attrs: { slug: "/", title: "Home" },
    body: homeBody,
    startLine: 0,
    bodyStartLine: 0,
  };
  return {
    blocks: [...shared, home],
    frontmatter: doc.frontmatter,
  };
}

function persist(site: Site, blocks: Block[], frontmatter: Record<string, unknown>, reason: string) {
  const md = serializeDoc(frontmatter, blocks);
  return updateSite(site.id, { markdown: md }, reason);
}

// ─────────────── listing ───────────────

export function listPages(siteIdOrSlug: string): PageMeta[] {
  const site = getSite(siteIdOrSlug);
  if (!site) return [];
  const doc = parseMarkdownWeb(site.markdown);
  if (!doc.pages || doc.pages.length === 0) {
    return [{ slug: "/", title: site.title, type: "page" }];
  }
  return doc.pages.map((p) => {
    // Re-read raw attrs from the source blocks to expose date/author/tags/etc.
    const raw = doc.blocks.find(
      (b): b is DirectiveBlock =>
        b.kind === "directive" &&
        b.name === "page" &&
        normalizePath((b as DirectiveBlock).attrs.slug) === p.slug,
    );
    return raw ? readPageMeta(raw) : { slug: p.slug, title: p.title, type: "page" };
  });
}

export function listPosts(siteIdOrSlug: string): PageMeta[] {
  return listPages(siteIdOrSlug)
    .filter((p) => p.type === "post")
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export function searchPages(
  siteIdOrSlug: string,
  query: string,
): Array<PageMeta & { snippet: string }> {
  const site = getSite(siteIdOrSlug);
  if (!site) return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const doc = parseMarkdownWeb(site.markdown);
  const results: Array<PageMeta & { snippet: string }> = [];
  const pageBlocks = doc.blocks.filter(
    (b): b is DirectiveBlock => b.kind === "directive" && b.name === "page",
  );
  for (const pb of pageBlocks) {
    const meta = readPageMeta(pb);
    const hay = `${meta.title ?? ""}\n${meta.excerpt ?? ""}\n${pb.body}`.toLowerCase();
    const idx = hay.indexOf(q);
    if (idx === -1) continue;
    const start = Math.max(0, idx - 40);
    const snippet = hay.slice(start, idx + q.length + 80).replace(/\s+/g, " ").trim();
    results.push({ ...meta, snippet });
  }
  return results;
}

// ─────────────── mutations ───────────────

export function addPage(
  siteIdOrSlug: string,
  meta: PageMeta,
  body = "",
): { page: PageMeta } | null {
  const site = getSite(siteIdOrSlug);
  if (!site) return null;
  const { blocks, frontmatter } = ensureMultiPage(site.markdown);
  const target = normalizePath(meta.slug);
  if (
    blocks.some(
      (b) => b.kind === "directive" && b.name === "page" && normalizePath((b as DirectiveBlock).attrs.slug) === target,
    )
  ) {
    throw new Error(`Page with slug "${target}" already exists`);
  }
  const block: DirectiveBlock = {
    kind: "directive",
    name: "page",
    attrs: metaToAttrs({ ...meta, slug: target }),
    body,
    startLine: 0,
    bodyStartLine: 0,
  };
  blocks.push(block);
  const updated = persist(site, blocks, frontmatter, "add_page");
  return updated ? { page: readPageMeta(block) } : null;
}

function findPageIdx(blocks: Block[], slug: string): number {
  const target = normalizePath(slug);
  return blocks.findIndex(
    (b) => b.kind === "directive" && b.name === "page" && normalizePath((b as DirectiveBlock).attrs.slug) === target,
  );
}

export function removePage(siteIdOrSlug: string, slug: string): boolean {
  const site = getSite(siteIdOrSlug);
  if (!site) return false;
  const { blocks, frontmatter } = ensureMultiPage(site.markdown);
  const idx = findPageIdx(blocks, slug);
  if (idx === -1) return false;
  blocks.splice(idx, 1);
  return !!persist(site, blocks, frontmatter, "remove_page");
}

export function renamePage(
  siteIdOrSlug: string,
  fromSlug: string,
  toSlug: string,
): PageMeta | null {
  const site = getSite(siteIdOrSlug);
  if (!site) return null;
  const { blocks, frontmatter } = ensureMultiPage(site.markdown);
  const idx = findPageIdx(blocks, fromSlug);
  if (idx === -1) return null;
  const target = normalizePath(toSlug);
  if (findPageIdx(blocks, target) !== -1 && target !== normalizePath(fromSlug)) {
    throw new Error(`Cannot rename: slug "${target}" already exists`);
  }
  const block = blocks[idx] as DirectiveBlock;
  block.attrs.slug = target;
  persist(site, blocks, frontmatter, "rename_page");
  return readPageMeta(block);
}

export function setPageMeta(
  siteIdOrSlug: string,
  slug: string,
  patch: Partial<PageMeta>,
): PageMeta | null {
  const site = getSite(siteIdOrSlug);
  if (!site) return null;
  const { blocks, frontmatter } = ensureMultiPage(site.markdown);
  const idx = findPageIdx(blocks, slug);
  if (idx === -1) return null;
  const block = blocks[idx] as DirectiveBlock;
  const current = readPageMeta(block);
  const merged: PageMeta = {
    ...current,
    ...patch,
    slug: current.slug, // never rename via this path
  };
  block.attrs = metaToAttrs(merged);
  persist(site, blocks, frontmatter, "set_page_meta");
  return readPageMeta(block);
}

export function setPageBody(
  siteIdOrSlug: string,
  slug: string,
  markdown: string,
): PageMeta | null {
  const site = getSite(siteIdOrSlug);
  if (!site) return null;
  const { blocks, frontmatter } = ensureMultiPage(site.markdown);
  const idx = findPageIdx(blocks, slug);
  if (idx === -1) return null;
  const block = blocks[idx] as DirectiveBlock;
  block.body = markdown;
  persist(site, blocks, frontmatter, "set_page_body");
  return readPageMeta(block);
}
