/**
 * In-memory store for MCP-managed sites and activity log.
 * Module-level state — survives across requests within the same Worker
 * instance, but not across cold starts. This is intentional for the demo.
 */

import { parseMarkdownWeb, type ParseDiagnostic } from "@/lib/markdown-web/parser";

export type Site = {
  id: string;
  slug: string;
  title: string;
  markdown: string;
  createdAt: string;
  updatedAt: string;
};

export type ActivityEntry = {
  id: string;
  timestamp: string;
  skill: string;
  /** Last 4 chars of the API key used (for display only). */
  keyTail: string;
  /** Short summary of input args. */
  args: string;
  status: "ok" | "error";
  message?: string;
  durationMs: number;
};

const sites = new Map<string, Site>();
const activity: ActivityEntry[] = [];
const MAX_ACTIVITY = 200;

function rid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "site";
}

export function listSites(): Site[] {
  return Array.from(sites.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getSite(idOrSlug: string): Site | undefined {
  if (sites.has(idOrSlug)) return sites.get(idOrSlug);
  for (const s of sites.values()) if (s.slug === idOrSlug) return s;
  return undefined;
}

export function createSite(input: {
  title: string;
  markdown: string;
  slug?: string;
}): Site {
  const now = new Date().toISOString();
  const baseSlug = slugify(input.slug ?? input.title);
  let slug = baseSlug;
  let n = 2;
  while (Array.from(sites.values()).some((s) => s.slug === slug)) {
    slug = `${baseSlug}-${n++}`;
  }
  const site: Site = {
    id: rid("site"),
    slug,
    title: input.title,
    markdown: input.markdown,
    createdAt: now,
    updatedAt: now,
  };
  sites.set(site.id, site);
  return site;
}

export function updateSite(
  idOrSlug: string,
  patch: { title?: string; markdown?: string },
): Site | undefined {
  const site = getSite(idOrSlug);
  if (!site) return undefined;
  if (patch.title !== undefined) site.title = patch.title;
  if (patch.markdown !== undefined) site.markdown = patch.markdown;
  site.updatedAt = new Date().toISOString();
  return site;
}

export function validateMarkdown(md: string): {
  ok: boolean;
  diagnostics: ParseDiagnostic[];
  blockCount: number;
} {
  const parsed = parseMarkdownWeb(md);
  const errors = parsed.diagnostics.filter((d) => d.severity === "error");
  return {
    ok: errors.length === 0,
    diagnostics: parsed.diagnostics,
    blockCount: parsed.blocks.length,
  };
}

export function recordActivity(entry: Omit<ActivityEntry, "id" | "timestamp">): void {
  activity.unshift({
    ...entry,
    id: rid("act"),
    timestamp: new Date().toISOString(),
  });
  if (activity.length > MAX_ACTIVITY) activity.length = MAX_ACTIVITY;
}

export function listActivity(limit = 50): ActivityEntry[] {
  return activity.slice(0, limit);
}
