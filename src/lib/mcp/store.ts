/**
 * In-memory store for MCP-managed sites, assets, revisions, activity log,
 * and per-key auth records. Module-level state — survives across requests
 * within the same Worker instance, but not across cold starts.
 */

import { parseMarkdownWeb, type ParseDiagnostic } from "@/lib/markdown-web/parser";
import {
  DEFAULT_THEME_SLUG,
  type ThemeOverrides,
} from "./themes";

export type SiteStatus = "draft" | "published";

export type Site = {
  id: string;
  slug: string;
  title: string;
  markdown: string;
  status: SiteStatus;
  tags: string[];
  owner?: string;
  themeSlug: string;
  themeOverrides: ThemeOverrides;
  createdAt: string;
  updatedAt: string;
};

export type Revision = {
  id: string;
  siteId: string;
  markdown: string;
  title: string;
  createdAt: string;
  /** Skill that produced the change. */
  reason: string;
};

export type Asset = {
  id: string;
  siteId: string;
  name: string;
  mimeType: string;
  /** data URL — fine for the demo, replace with real storage in prod. */
  dataUrl: string;
  size: number;
  createdAt: string;
};

export type ApiKey = {
  id: string;
  /** Last 4 chars displayed in UI. */
  tail: string;
  /** SHA-256 of the raw token (hex). */
  hash: string;
  label: string;
  /** Empty array → all sites. Otherwise scoped list of siteIds. */
  siteScopes: string[];
  createdAt: string;
  revokedAt?: string;
};

export type ActivityEntry = {
  id: string;
  timestamp: string;
  skill: string;
  keyTail: string;
  args: string;
  status: "ok" | "error";
  message?: string;
  durationMs: number;
};

const sites = new Map<string, Site>();
const revisions = new Map<string, Revision[]>();
const assets = new Map<string, Asset>();
const keys = new Map<string, ApiKey>();
const activity: ActivityEntry[] = [];
const MAX_ACTIVITY = 200;
const MAX_REVISIONS_PER_SITE = 25;

function rid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "site"
  );
}

// ───────────────────────── sites ─────────────────────────

export function listSites(opts?: {
  search?: string;
  status?: SiteStatus;
  tag?: string;
  limit?: number;
  offset?: number;
}): { items: Site[]; total: number } {
  let items = Array.from(sites.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    items = items.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  if (opts?.status) items = items.filter((s) => s.status === opts.status);
  if (opts?.tag) items = items.filter((s) => s.tags.includes(opts.tag!));
  const total = items.length;
  const offset = opts?.offset ?? 0;
  const limit = opts?.limit ?? 50;
  return { items: items.slice(offset, offset + limit), total };
}

export function getSite(idOrSlug: string): Site | undefined {
  if (sites.has(idOrSlug)) return sites.get(idOrSlug);
  for (const s of sites.values()) if (s.slug === idOrSlug) return s;
  return undefined;
}

function uniqueSlug(base: string): string {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  let n = 2;
  while (Array.from(sites.values()).some((s) => s.slug === slug)) {
    slug = `${baseSlug}-${n++}`;
  }
  return slug;
}

function snapshot(site: Site, reason: string): void {
  const list = revisions.get(site.id) ?? [];
  list.unshift({
    id: rid("rev"),
    siteId: site.id,
    markdown: site.markdown,
    title: site.title,
    createdAt: new Date().toISOString(),
    reason,
  });
  if (list.length > MAX_REVISIONS_PER_SITE) list.length = MAX_REVISIONS_PER_SITE;
  revisions.set(site.id, list);
}

export function createSite(input: {
  title: string;
  markdown: string;
  slug?: string;
  tags?: string[];
  owner?: string;
  themeSlug?: string;
}): Site {
  const now = new Date().toISOString();
  const site: Site = {
    id: rid("site"),
    slug: uniqueSlug(input.slug ?? input.title),
    title: input.title,
    markdown: input.markdown,
    status: "draft",
    tags: input.tags ?? [],
    owner: input.owner,
    themeSlug: input.themeSlug ?? DEFAULT_THEME_SLUG,
    themeOverrides: {},
    createdAt: now,
    updatedAt: now,
  };
  sites.set(site.id, site);
  snapshot(site, "create_site");
  return site;
}

// ───────────────────────── theming ─────────────────────────

export function setSiteTheme(idOrSlug: string, themeSlug: string): Site | undefined {
  const site = getSite(idOrSlug);
  if (!site) return undefined;
  site.themeSlug = themeSlug;
  site.themeOverrides = {};
  site.updatedAt = new Date().toISOString();
  return site;
}

export function updateThemeOverrides(
  idOrSlug: string,
  overrides: ThemeOverrides,
): Site | undefined {
  const site = getSite(idOrSlug);
  if (!site) return undefined;
  site.themeOverrides = { ...site.themeOverrides, ...overrides };
  site.updatedAt = new Date().toISOString();
  return site;
}

export function resetThemeOverrides(idOrSlug: string): Site | undefined {
  const site = getSite(idOrSlug);
  if (!site) return undefined;
  site.themeOverrides = {};
  site.updatedAt = new Date().toISOString();
  return site;
}

export function updateSite(
  idOrSlug: string,
  patch: { title?: string; markdown?: string },
  reason = "update_site",
): Site | undefined {
  const site = getSite(idOrSlug);
  if (!site) return undefined;
  if (patch.title !== undefined) site.title = patch.title;
  if (patch.markdown !== undefined) site.markdown = patch.markdown;
  site.updatedAt = new Date().toISOString();
  snapshot(site, reason);
  return site;
}

export function deleteSite(idOrSlug: string): boolean {
  const site = getSite(idOrSlug);
  if (!site) return false;
  sites.delete(site.id);
  revisions.delete(site.id);
  for (const a of Array.from(assets.values())) {
    if (a.siteId === site.id) assets.delete(a.id);
  }
  return true;
}

export function duplicateSite(
  idOrSlug: string,
  newTitle?: string,
): Site | undefined {
  const src = getSite(idOrSlug);
  if (!src) return undefined;
  return createSite({
    title: newTitle ?? `${src.title} (copy)`,
    markdown: src.markdown,
    tags: [...src.tags],
    owner: src.owner,
  });
}

export function renameSlug(idOrSlug: string, newSlug: string): Site | undefined {
  const site = getSite(idOrSlug);
  if (!site) return undefined;
  site.slug = uniqueSlug(newSlug);
  site.updatedAt = new Date().toISOString();
  return site;
}

export function setMetadata(
  idOrSlug: string,
  meta: { tags?: string[]; owner?: string; status?: SiteStatus },
): Site | undefined {
  const site = getSite(idOrSlug);
  if (!site) return undefined;
  if (meta.tags !== undefined) site.tags = meta.tags;
  if (meta.owner !== undefined) site.owner = meta.owner;
  if (meta.status !== undefined) site.status = meta.status;
  site.updatedAt = new Date().toISOString();
  return site;
}

// ───────────────────────── revisions ─────────────────────────

export function listRevisions(idOrSlug: string): Revision[] {
  const site = getSite(idOrSlug);
  if (!site) return [];
  return revisions.get(site.id) ?? [];
}

export function restoreRevision(
  idOrSlug: string,
  revisionId: string,
): Site | undefined {
  const site = getSite(idOrSlug);
  if (!site) return undefined;
  const rev = (revisions.get(site.id) ?? []).find((r) => r.id === revisionId);
  if (!rev) return undefined;
  return updateSite(site.id, { markdown: rev.markdown, title: rev.title }, "restore_revision");
}

// ───────────────────────── assets ─────────────────────────

export function uploadAsset(input: {
  siteIdOrSlug: string;
  name: string;
  mimeType: string;
  dataUrl: string;
}): Asset | undefined {
  const site = getSite(input.siteIdOrSlug);
  if (!site) return undefined;
  const asset: Asset = {
    id: rid("asset"),
    siteId: site.id,
    name: input.name,
    mimeType: input.mimeType,
    dataUrl: input.dataUrl,
    size: input.dataUrl.length,
    createdAt: new Date().toISOString(),
  };
  assets.set(asset.id, asset);
  return asset;
}

export function listAssets(siteIdOrSlug: string): Asset[] {
  const site = getSite(siteIdOrSlug);
  if (!site) return [];
  return Array.from(assets.values()).filter((a) => a.siteId === site.id);
}

export function deleteAsset(assetId: string): boolean {
  return assets.delete(assetId);
}

// ───────────────────────── api keys ─────────────────────────

async function sha256Hex(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createKey(input: {
  label: string;
  siteScopes?: string[];
}): Promise<{ key: ApiKey; token: string }> {
  const token = `mcp_${rid("k").slice(2)}${Math.random().toString(36).slice(2, 14)}`;
  const hash = await sha256Hex(token);
  const key: ApiKey = {
    id: rid("key"),
    tail: token.slice(-4),
    hash,
    label: input.label,
    siteScopes: input.siteScopes ?? [],
    createdAt: new Date().toISOString(),
  };
  keys.set(key.id, key);
  return { key, token };
}

export function listKeys(): ApiKey[] {
  return Array.from(keys.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function revokeKey(keyId: string): boolean {
  const k = keys.get(keyId);
  if (!k) return false;
  k.revokedAt = new Date().toISOString();
  return true;
}

export async function findKeyByToken(token: string): Promise<ApiKey | undefined> {
  const hash = await sha256Hex(token);
  for (const k of keys.values()) {
    if (k.hash === hash && !k.revokedAt) return k;
  }
  return undefined;
}

export function keyAllowsSite(key: ApiKey, siteId: string): boolean {
  if (key.siteScopes.length === 0) return true;
  return key.siteScopes.includes(siteId);
}

// ───────────────────────── activity ─────────────────────────

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

// ───────────────────────── markdown ─────────────────────────

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
