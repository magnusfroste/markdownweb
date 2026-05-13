/**
 * MCP skill registry — each skill is a tool exposed over the MCP protocol.
 * The handler returns a plain JSON-serializable result; the route wraps it
 * into the MCP `content` envelope.
 */

import {
  createSite,
  getSite,
  updateSite,
  deleteSite,
  duplicateSite,
  renameSlug,
  setMetadata,
  setSiteTheme,
  updateThemeOverrides,
  resetThemeOverrides,
  validateMarkdown,
  listSites,
  listRevisions,
  restoreRevision,
  uploadAsset,
  listAssets,
  deleteAsset,
  createKey,
  listKeys,
  revokeKey,
  listActivity,
  type SiteStatus,
} from "./store";
import { directives, getDirective } from "./directives";
import { serializeDoc, serializeBlock } from "./serialize";
import {
  themes,
  getTheme,
  resolveTokens,
  sanitizeOverrides,
  OVERRIDABLE_TOKENS,
} from "./themes";
import { templates, getTemplate, renderTemplate } from "./templates";
import { parseMarkdownWeb, type Block } from "@/lib/markdown-web/parser";

export type SkillCtx = { origin: string; isAdmin: boolean };

export type Skill = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  /** When true, requires the global admin key (not a scoped per-site key). */
  adminOnly?: boolean;
  handler: (args: Record<string, unknown>, ctx: SkillCtx) => unknown | Promise<unknown>;
};

function asString(v: unknown, field: string): string {
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(`Argument \`${field}\` must be a non-empty string`);
  }
  return v;
}

function asStringArray(v: unknown, field: string): string[] {
  if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) {
    throw new Error(`Argument \`${field}\` must be a string[]`);
  }
  return v as string[];
}

function previewUrl(origin: string, slug: string): string {
  return `${origin}/mcp/preview/${slug}`;
}

function loadDoc(idOrSlug: string) {
  const site = getSite(idOrSlug);
  if (!site) throw new Error(`Site not found: ${idOrSlug}`);
  const parsed = parseMarkdownWeb(site.markdown);
  return { site, parsed };
}

function persist(siteId: string, frontmatter: Record<string, unknown>, blocks: Block[], reason: string) {
  const md = serializeDoc(frontmatter, blocks);
  return updateSite(siteId, { markdown: md }, reason);
}

export const skills: Skill[] = [
  // ───────── site lifecycle ─────────
  {
    name: "create_site",
    description:
      "Create a new markdown-powered site. Optionally set `themeSlug` (see list_themes). Returns id, slug, preview URL.",
    inputSchema: {
      type: "object",
      required: ["title", "markdown"],
      properties: {
        title: { type: "string" },
        markdown: { type: "string" },
        slug: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        owner: { type: "string" },
        themeSlug: {
          type: "string",
          description: "One of the slugs returned by list_themes.",
        },
      },
    },
    handler: (args, ctx) => {
      const title = asString(args.title, "title");
      const markdown = asString(args.markdown, "markdown");
      const validation = validateMarkdown(markdown);
      const themeSlug =
        typeof args.themeSlug === "string" ? args.themeSlug : undefined;
      if (themeSlug && !getTheme(themeSlug)) {
        throw new Error(`Unknown theme: ${themeSlug}. Call list_themes.`);
      }
      const site = createSite({
        title,
        markdown,
        slug: typeof args.slug === "string" ? args.slug : undefined,
        tags: Array.isArray(args.tags) ? (args.tags as string[]) : undefined,
        owner: typeof args.owner === "string" ? args.owner : undefined,
        themeSlug,
      });
      return {
        id: site.id,
        slug: site.slug,
        title: site.title,
        themeSlug: site.themeSlug,
        previewUrl: previewUrl(ctx.origin, site.slug),
        validation,
      };
    },
  },
  {
    name: "get_site",
    description: "Fetch a site by id or slug. Returns full markdown + metadata.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: { idOrSlug: { type: "string" } },
    },
    handler: (args, ctx) => {
      const site = getSite(asString(args.idOrSlug, "idOrSlug"));
      if (!site) throw new Error("Site not found");
      return { ...site, previewUrl: previewUrl(ctx.origin, site.slug) };
    },
  },
  {
    name: "update_site",
    description: "Update title and/or full markdown. Snapshots a revision.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: {
        idOrSlug: { type: "string" },
        title: { type: "string" },
        markdown: { type: "string" },
      },
    },
    handler: (args, ctx) => {
      const idOrSlug = asString(args.idOrSlug, "idOrSlug");
      const patch: { title?: string; markdown?: string } = {};
      if (typeof args.title === "string") patch.title = args.title;
      if (typeof args.markdown === "string") patch.markdown = args.markdown;
      const site = updateSite(idOrSlug, patch);
      if (!site) throw new Error("Site not found");
      return {
        id: site.id,
        slug: site.slug,
        updatedAt: site.updatedAt,
        previewUrl: previewUrl(ctx.origin, site.slug),
        validation: patch.markdown ? validateMarkdown(patch.markdown) : null,
      };
    },
  },
  {
    name: "delete_site",
    description: "Permanently delete a site, its revisions, and its assets.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: { idOrSlug: { type: "string" } },
    },
    handler: (args) => {
      const ok = deleteSite(asString(args.idOrSlug, "idOrSlug"));
      if (!ok) throw new Error("Site not found");
      return { ok: true };
    },
  },
  {
    name: "duplicate_site",
    description: "Clone a site (markdown + tags). Returns the new site.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: {
        idOrSlug: { type: "string" },
        title: { type: "string", description: "Title for the new site." },
      },
    },
    handler: (args, ctx) => {
      const site = duplicateSite(
        asString(args.idOrSlug, "idOrSlug"),
        typeof args.title === "string" ? args.title : undefined,
      );
      if (!site) throw new Error("Site not found");
      return { id: site.id, slug: site.slug, previewUrl: previewUrl(ctx.origin, site.slug) };
    },
  },
  {
    name: "rename_slug",
    description: "Change a site's URL slug. Auto-deduplicates collisions.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug", "newSlug"],
      properties: { idOrSlug: { type: "string" }, newSlug: { type: "string" } },
    },
    handler: (args, ctx) => {
      const site = renameSlug(
        asString(args.idOrSlug, "idOrSlug"),
        asString(args.newSlug, "newSlug"),
      );
      if (!site) throw new Error("Site not found");
      return { slug: site.slug, previewUrl: previewUrl(ctx.origin, site.slug) };
    },
  },
  {
    name: "set_metadata",
    description: "Set tags, owner and/or status (draft|published) on a site.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: {
        idOrSlug: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        owner: { type: "string" },
        status: { type: "string", enum: ["draft", "published"] },
      },
    },
    handler: (args) => {
      const site = setMetadata(asString(args.idOrSlug, "idOrSlug"), {
        tags: Array.isArray(args.tags) ? asStringArray(args.tags, "tags") : undefined,
        owner: typeof args.owner === "string" ? args.owner : undefined,
        status:
          args.status === "draft" || args.status === "published"
            ? (args.status as SiteStatus)
            : undefined,
      });
      if (!site) throw new Error("Site not found");
      return { id: site.id, status: site.status, tags: site.tags, owner: site.owner };
    },
  },
  {
    name: "publish_site",
    description: "Mark a site as published.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: { idOrSlug: { type: "string" } },
    },
    handler: (args) => {
      const site = setMetadata(asString(args.idOrSlug, "idOrSlug"), { status: "published" });
      if (!site) throw new Error("Site not found");
      return { id: site.id, status: site.status };
    },
  },
  {
    name: "unpublish_site",
    description: "Mark a site as draft.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: { idOrSlug: { type: "string" } },
    },
    handler: (args) => {
      const site = setMetadata(asString(args.idOrSlug, "idOrSlug"), { status: "draft" });
      if (!site) throw new Error("Site not found");
      return { id: site.id, status: site.status };
    },
  },
  {
    name: "list_sites",
    description: "List sites with optional search/status/tag filters and pagination.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string" },
        status: { type: "string", enum: ["draft", "published"] },
        tag: { type: "string" },
        limit: { type: "number" },
        offset: { type: "number" },
      },
    },
    handler: (args, ctx) => {
      const { items, total } = listSites({
        search: typeof args.search === "string" ? args.search : undefined,
        status:
          args.status === "draft" || args.status === "published"
            ? (args.status as SiteStatus)
            : undefined,
        tag: typeof args.tag === "string" ? args.tag : undefined,
        limit: typeof args.limit === "number" ? args.limit : undefined,
        offset: typeof args.offset === "number" ? args.offset : undefined,
      });
      return {
        total,
        items: items.map((s) => ({
          id: s.id,
          slug: s.slug,
          title: s.title,
          status: s.status,
          tags: s.tags,
          owner: s.owner,
          updatedAt: s.updatedAt,
          previewUrl: previewUrl(ctx.origin, s.slug),
        })),
      };
    },
  },

  // ───────── theming ─────────
  {
    name: "list_themes",
    description:
      "List all curated design templates. Each theme is a vetted token set (palette + typography + radius). Use `set_theme` to apply one.",
    inputSchema: { type: "object", properties: {} },
    handler: () =>
      themes.map((t) => ({
        slug: t.slug,
        name: t.name,
        description: t.description,
        preview: {
          background: t.tokens.background,
          foreground: t.tokens.foreground,
          primary: t.tokens.primary,
          accent: t.tokens.accent,
          fontDisplay: t.tokens.fontDisplay,
          radius: t.tokens.radius,
        },
      })),
  },
  {
    name: "get_theme",
    description: "Return the full token spec for one theme.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: { slug: { type: "string" } },
    },
    handler: (args) => {
      const t = getTheme(asString(args.slug, "slug"));
      if (!t) throw new Error(`Unknown theme: ${args.slug}`);
      return t;
    },
  },
  {
    name: "set_theme",
    description:
      "Apply a theme to a site (resets any token overrides). Use `update_theme_tokens` afterwards to brand it.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug", "themeSlug"],
      properties: {
        idOrSlug: { type: "string" },
        themeSlug: { type: "string" },
      },
    },
    handler: (args, ctx) => {
      const themeSlug = asString(args.themeSlug, "themeSlug");
      if (!getTheme(themeSlug)) {
        throw new Error(`Unknown theme: ${themeSlug}. Call list_themes.`);
      }
      const site = setSiteTheme(asString(args.idOrSlug, "idOrSlug"), themeSlug);
      if (!site) throw new Error("Site not found");
      return {
        id: site.id,
        themeSlug: site.themeSlug,
        previewUrl: previewUrl(ctx.origin, site.slug),
      };
    },
  },
  {
    name: "get_site_theme",
    description: "Return the resolved theme tokens (theme defaults merged with overrides) for a site.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: { idOrSlug: { type: "string" } },
    },
    handler: (args) => {
      const site = getSite(asString(args.idOrSlug, "idOrSlug"));
      if (!site) throw new Error("Site not found");
      const { theme, tokens } = resolveTokens(site.themeSlug, site.themeOverrides);
      return {
        themeSlug: theme.slug,
        themeName: theme.name,
        overrides: site.themeOverrides,
        resolved: tokens,
      };
    },
  },
  {
    name: "update_theme_tokens",
    description: `Override a whitelist of theme tokens for one site. Allowed tokens: ${OVERRIDABLE_TOKENS.join(", ")}. Pass color values as hex (#rrggbb), radius as CSS length, logoUrl as URL.`,
    inputSchema: {
      type: "object",
      required: ["idOrSlug", "tokens"],
      properties: {
        idOrSlug: { type: "string" },
        tokens: {
          type: "object",
          description: "Map of token name → string value.",
        },
      },
    },
    handler: (args, ctx) => {
      const overrides = sanitizeOverrides(args.tokens);
      const site = updateThemeOverrides(
        asString(args.idOrSlug, "idOrSlug"),
        overrides,
      );
      if (!site) throw new Error("Site not found");
      return {
        id: site.id,
        overrides: site.themeOverrides,
        previewUrl: previewUrl(ctx.origin, site.slug),
      };
    },
  },
  {
    name: "reset_theme_tokens",
    description: "Clear all per-site token overrides; revert to the theme's defaults.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: { idOrSlug: { type: "string" } },
    },
    handler: (args, ctx) => {
      const site = resetThemeOverrides(asString(args.idOrSlug, "idOrSlug"));
      if (!site) throw new Error("Site not found");
      return {
        id: site.id,
        themeSlug: site.themeSlug,
        previewUrl: previewUrl(ctx.origin, site.slug),
      };
    },
  },

  // ───────── directives ─────────
  {
    name: "list_directives",
    description: "List every ::directive:: block type the renderer supports.",
    inputSchema: { type: "object", properties: {} },
    handler: () =>
      directives.map((d) => ({
        name: d.name,
        description: d.description,
        bodyFormat: d.bodyFormat,
      })),
  },
  {
    name: "get_directive_schema",
    description: "Return the full schema for one directive (attrs, body format, example).",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: { name: { type: "string" } },
    },
    handler: (args) => {
      const d = getDirective(asString(args.name, "name"));
      if (!d) throw new Error(`Unknown directive: ${args.name}`);
      return d;
    },
  },

  // ───────── block-level editing ─────────
  {
    name: "list_blocks",
    description: "Return the parsed blocks of a site so an agent can edit by index.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: { idOrSlug: { type: "string" } },
    },
    handler: (args) => {
      const { parsed } = loadDoc(asString(args.idOrSlug, "idOrSlug"));
      return {
        frontmatter: parsed.frontmatter,
        blocks: parsed.blocks.map((b, i) => ({
          index: i,
          kind: b.kind,
          name: b.kind === "directive" ? b.name : null,
          attrs: b.kind === "directive" ? b.attrs : null,
          body: b.body,
          source: serializeBlock(b),
        })),
      };
    },
  },
  {
    name: "add_block",
    description:
      "Insert a directive or markdown block at `index` (default: end). For directives, pass `name`+`attrs`+`body`. For markdown, pass `markdown`.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: {
        idOrSlug: { type: "string" },
        index: { type: "number" },
        name: { type: "string", description: "Directive name (omit for markdown)." },
        attrs: { type: "object" },
        body: { type: "string", description: "Directive body." },
        markdown: { type: "string", description: "Markdown body (alternative to directive)." },
      },
    },
    handler: (args, ctx) => {
      const { site, parsed } = loadDoc(asString(args.idOrSlug, "idOrSlug"));
      const blocks = [...parsed.blocks];
      const index = typeof args.index === "number" ? args.index : blocks.length;
      let block: Block;
      if (typeof args.name === "string") {
        block = {
          kind: "directive",
          name: args.name,
          attrs: (args.attrs as Record<string, string | number | boolean>) ?? {},
          body: typeof args.body === "string" ? args.body : "",
          startLine: 0,
          bodyStartLine: 0,
        };
      } else {
        block = {
          kind: "markdown",
          body: asString(args.markdown, "markdown"),
          startLine: 0,
        };
      }
      blocks.splice(Math.max(0, Math.min(index, blocks.length)), 0, block);
      const updated = persist(site.id, parsed.frontmatter, blocks, "add_block");
      return {
        index,
        previewUrl: previewUrl(ctx.origin, updated!.slug),
        blockCount: blocks.length,
      };
    },
  },
  {
    name: "update_block",
    description: "Replace fields on the block at `index`.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug", "index"],
      properties: {
        idOrSlug: { type: "string" },
        index: { type: "number" },
        attrs: { type: "object" },
        body: { type: "string" },
        markdown: { type: "string" },
      },
    },
    handler: (args, ctx) => {
      const { site, parsed } = loadDoc(asString(args.idOrSlug, "idOrSlug"));
      const blocks = [...parsed.blocks];
      const index = args.index as number;
      const target = blocks[index];
      if (!target) throw new Error(`No block at index ${index}`);
      if (target.kind === "directive") {
        if (args.attrs && typeof args.attrs === "object") {
          target.attrs = {
            ...target.attrs,
            ...(args.attrs as Record<string, string | number | boolean>),
          };
        }
        if (typeof args.body === "string") target.body = args.body;
      } else {
        if (typeof args.markdown === "string") target.body = args.markdown;
      }
      const updated = persist(site.id, parsed.frontmatter, blocks, "update_block");
      return { index, previewUrl: previewUrl(ctx.origin, updated!.slug) };
    },
  },
  {
    name: "remove_block",
    description: "Remove the block at `index`.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug", "index"],
      properties: { idOrSlug: { type: "string" }, index: { type: "number" } },
    },
    handler: (args, ctx) => {
      const { site, parsed } = loadDoc(asString(args.idOrSlug, "idOrSlug"));
      const blocks = [...parsed.blocks];
      const index = args.index as number;
      if (!blocks[index]) throw new Error(`No block at index ${index}`);
      blocks.splice(index, 1);
      const updated = persist(site.id, parsed.frontmatter, blocks, "remove_block");
      return { previewUrl: previewUrl(ctx.origin, updated!.slug), blockCount: blocks.length };
    },
  },
  {
    name: "move_block",
    description: "Move block at `from` to position `to`.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug", "from", "to"],
      properties: {
        idOrSlug: { type: "string" },
        from: { type: "number" },
        to: { type: "number" },
      },
    },
    handler: (args, ctx) => {
      const { site, parsed } = loadDoc(asString(args.idOrSlug, "idOrSlug"));
      const blocks = [...parsed.blocks];
      const from = args.from as number;
      const to = args.to as number;
      if (!blocks[from]) throw new Error(`No block at index ${from}`);
      const [b] = blocks.splice(from, 1);
      blocks.splice(Math.max(0, Math.min(to, blocks.length)), 0, b);
      const updated = persist(site.id, parsed.frontmatter, blocks, "move_block");
      return { previewUrl: previewUrl(ctx.origin, updated!.slug) };
    },
  },

  // ───────── validation ─────────
  {
    name: "validate_markdown",
    description: "Parse markdown and return diagnostics + block count. No persistence.",
    inputSchema: {
      type: "object",
      required: ["markdown"],
      properties: { markdown: { type: "string" } },
    },
    handler: (args) => validateMarkdown(asString(args.markdown, "markdown")),
  },
  {
    name: "diff_markdown",
    description: "Cheap line diff between two markdown strings — for review before apply.",
    inputSchema: {
      type: "object",
      required: ["a", "b"],
      properties: { a: { type: "string" }, b: { type: "string" } },
    },
    handler: (args) => {
      const a = asString(args.a, "a").split("\n");
      const b = asString(args.b, "b").split("\n");
      const max = Math.max(a.length, b.length);
      const changes: { line: number; a: string | null; b: string | null }[] = [];
      for (let i = 0; i < max; i++) {
        if (a[i] !== b[i]) {
          changes.push({ line: i + 1, a: a[i] ?? null, b: b[i] ?? null });
        }
      }
      return { changes, equal: changes.length === 0 };
    },
  },

  // ───────── revisions ─────────
  {
    name: "list_revisions",
    description: "List recent revisions for a site (newest first).",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: { idOrSlug: { type: "string" } },
    },
    handler: (args) =>
      listRevisions(asString(args.idOrSlug, "idOrSlug")).map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        reason: r.reason,
        title: r.title,
      })),
  },
  {
    name: "restore_revision",
    description: "Restore a site to a previous revision (snapshots current state first).",
    inputSchema: {
      type: "object",
      required: ["idOrSlug", "revisionId"],
      properties: { idOrSlug: { type: "string" }, revisionId: { type: "string" } },
    },
    handler: (args, ctx) => {
      const site = restoreRevision(
        asString(args.idOrSlug, "idOrSlug"),
        asString(args.revisionId, "revisionId"),
      );
      if (!site) throw new Error("Site or revision not found");
      return { id: site.id, previewUrl: previewUrl(ctx.origin, site.slug) };
    },
  },

  // ───────── assets ─────────
  {
    name: "upload_asset",
    description:
      "Attach a binary asset to a site as a data URL. Returns an asset URL the agent can embed in markdown.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug", "name", "mimeType", "dataUrl"],
      properties: {
        idOrSlug: { type: "string" },
        name: { type: "string" },
        mimeType: { type: "string" },
        dataUrl: { type: "string", description: "data: URL (base64 encoded)." },
      },
    },
    handler: (args) => {
      const asset = uploadAsset({
        siteIdOrSlug: asString(args.idOrSlug, "idOrSlug"),
        name: asString(args.name, "name"),
        mimeType: asString(args.mimeType, "mimeType"),
        dataUrl: asString(args.dataUrl, "dataUrl"),
      });
      if (!asset) throw new Error("Site not found");
      return {
        id: asset.id,
        url: asset.dataUrl,
        size: asset.size,
        embed: `![${asset.name}](${asset.dataUrl})`,
      };
    },
  },
  {
    name: "list_assets",
    description: "List assets attached to a site.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: { idOrSlug: { type: "string" } },
    },
    handler: (args) =>
      listAssets(asString(args.idOrSlug, "idOrSlug")).map((a) => ({
        id: a.id,
        name: a.name,
        mimeType: a.mimeType,
        size: a.size,
        createdAt: a.createdAt,
      })),
  },
  {
    name: "delete_asset",
    description: "Delete an asset by id.",
    inputSchema: {
      type: "object",
      required: ["assetId"],
      properties: { assetId: { type: "string" } },
    },
    handler: (args) => ({ ok: deleteAsset(asString(args.assetId, "assetId")) }),
  },

  // ───────── observability ─────────
  {
    name: "get_activity",
    description: "Return recent MCP activity entries (newest first).",
    inputSchema: {
      type: "object",
      properties: { limit: { type: "number", description: "Default 50, max 200." } },
    },
    handler: (args) => listActivity(typeof args.limit === "number" ? args.limit : 50),
  },

  // ───────── key management (admin only) ─────────
  {
    name: "create_key",
    description:
      "Mint a new API key. Optionally scope it to specific siteIds. Returns the raw token ONCE.",
    adminOnly: true,
    inputSchema: {
      type: "object",
      required: ["label"],
      properties: {
        label: { type: "string" },
        siteScopes: {
          type: "array",
          items: { type: "string" },
          description: "Empty = full access to all sites.",
        },
      },
    },
    handler: async (args) => {
      const { key, token } = await createKey({
        label: asString(args.label, "label"),
        siteScopes: Array.isArray(args.siteScopes)
          ? asStringArray(args.siteScopes, "siteScopes")
          : [],
      });
      return {
        id: key.id,
        label: key.label,
        token,
        tail: key.tail,
        siteScopes: key.siteScopes,
        warning: "Save the token now — it will not be shown again.",
      };
    },
  },
  {
    name: "list_keys",
    description: "List all minted API keys (no token shown).",
    adminOnly: true,
    inputSchema: { type: "object", properties: {} },
    handler: () =>
      listKeys().map((k) => ({
        id: k.id,
        label: k.label,
        tail: k.tail,
        siteScopes: k.siteScopes,
        createdAt: k.createdAt,
        revokedAt: k.revokedAt ?? null,
      })),
  },
  {
    name: "revoke_key",
    description: "Revoke an API key by id.",
    adminOnly: true,
    inputSchema: {
      type: "object",
      required: ["keyId"],
      properties: { keyId: { type: "string" } },
    },
    handler: (args) => ({ ok: revokeKey(asString(args.keyId, "keyId")) }),
  },
];

export function getSkill(name: string): Skill | undefined {
  return skills.find((s) => s.name === name);
}
