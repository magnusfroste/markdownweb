/**
 * MCP skill registry — each skill is a tool exposed over the MCP protocol.
 * The handler returns a plain JSON-serializable result; the route wraps it
 * into the MCP `content` envelope.
 */

import {
  createSite,
  getSite,
  updateSite,
  validateMarkdown,
  listSites,
} from "./store";

export type Skill = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>, ctx: { origin: string }) => unknown;
};

function asString(v: unknown, field: string): string {
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(`Argument \`${field}\` must be a non-empty string`);
  }
  return v;
}

export const skills: Skill[] = [
  {
    name: "create_site",
    description:
      "Create a new markdown-powered site. Returns the site id, slug and a preview URL.",
    inputSchema: {
      type: "object",
      required: ["title", "markdown"],
      properties: {
        title: { type: "string", description: "Human-readable title." },
        markdown: {
          type: "string",
          description:
            "Full markdown source including frontmatter and ::directive:: blocks.",
        },
        slug: {
          type: "string",
          description: "Optional URL slug. Auto-generated from title if omitted.",
        },
      },
    },
    handler: (args, ctx) => {
      const title = asString(args.title, "title");
      const markdown = asString(args.markdown, "markdown");
      const slug = typeof args.slug === "string" ? args.slug : undefined;
      const validation = validateMarkdown(markdown);
      const site = createSite({ title, markdown, slug });
      return {
        id: site.id,
        slug: site.slug,
        title: site.title,
        previewUrl: `${ctx.origin}/mcp/preview/${site.slug}`,
        validation,
      };
    },
  },
  {
    name: "get_site",
    description:
      "Fetch a site by id or slug. Returns full markdown source and metadata.",
    inputSchema: {
      type: "object",
      required: ["idOrSlug"],
      properties: {
        idOrSlug: { type: "string" },
      },
    },
    handler: (args, ctx) => {
      const idOrSlug = asString(args.idOrSlug, "idOrSlug");
      const site = getSite(idOrSlug);
      if (!site) throw new Error(`Site not found: ${idOrSlug}`);
      return {
        ...site,
        previewUrl: `${ctx.origin}/mcp/preview/${site.slug}`,
      };
    },
  },
  {
    name: "update_site",
    description:
      "Update a site's title and/or markdown. Pass only the fields you want to change.",
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
      if (!site) throw new Error(`Site not found: ${idOrSlug}`);
      const validation =
        patch.markdown !== undefined ? validateMarkdown(patch.markdown) : null;
      return {
        id: site.id,
        slug: site.slug,
        updatedAt: site.updatedAt,
        previewUrl: `${ctx.origin}/mcp/preview/${site.slug}`,
        validation,
      };
    },
  },
  {
    name: "validate_markdown",
    description:
      "Parse markdown and return diagnostics (errors/warnings) plus the number of parsed blocks. Does not persist anything.",
    inputSchema: {
      type: "object",
      required: ["markdown"],
      properties: { markdown: { type: "string" } },
    },
    handler: (args) => {
      const markdown = asString(args.markdown, "markdown");
      return validateMarkdown(markdown);
    },
  },
  {
    name: "list_sites",
    description: "List all sites managed via MCP (id, slug, title, updated time).",
    inputSchema: { type: "object", properties: {} },
    handler: (_args, ctx) =>
      listSites().map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        updatedAt: s.updatedAt,
        previewUrl: `${ctx.origin}/mcp/preview/${s.slug}`,
      })),
  },
];

export function getSkill(name: string): Skill | undefined {
  return skills.find((s) => s.name === name);
}
