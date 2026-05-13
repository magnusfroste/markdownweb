/**
 * Template registry — pre-built site blueprints with `{{variables}}`.
 *
 * Templates are markdown files under `src/content/templates/*.md` with a
 * YAML frontmatter block carrying:
 *   name         — human-readable label
 *   description  — one-liner
 *   recommendedThemes — slugs from themes.ts (first one used as default)
 *   variables    — [{name, description, default?}]
 *
 * Body uses `{{variableName}}` placeholders that are substituted at
 * `create_site_from_template` time. Bundled at build time via Vite's
 * `import.meta.glob` so they ship inside the Worker.
 */

import yaml from "js-yaml";

type RawTemplateModule = string;

// Vite eagerly bundles every template MD as a raw string.
const rawModules = import.meta.glob<RawTemplateModule>(
  "../../content/templates/*.md",
  { query: "?raw", import: "default", eager: true },
);

export type TemplateVariable = {
  name: string;
  description: string;
  default?: string;
};

export type Template = {
  slug: string;
  name: string;
  description: string;
  recommendedThemes: string[];
  variables: TemplateVariable[];
  /** Raw markdown body (after frontmatter, with `{{vars}}` intact). */
  body: string;
};

function parseTemplate(path: string, raw: string): Template {
  // slug = filename without extension
  const file = path.split("/").pop() ?? "untitled.md";
  const slug = file.replace(/\.md$/, "");

  const src = raw.replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(src);
  if (!match) {
    throw new Error(`Template ${slug}: missing YAML frontmatter`);
  }
  const data = (yaml.load(match[1]) ?? {}) as Record<string, unknown>;
  const body = match[2];

  const name = typeof data.name === "string" ? data.name : slug;
  const description =
    typeof data.description === "string" ? data.description : "";
  const recommendedThemes = Array.isArray(data.recommendedThemes)
    ? (data.recommendedThemes as unknown[]).filter(
        (x): x is string => typeof x === "string",
      )
    : [];
  const variables = Array.isArray(data.variables)
    ? (data.variables as unknown[])
        .filter((v): v is Record<string, unknown> => typeof v === "object" && v !== null)
        .map((v): TemplateVariable => ({
          name: String(v.name ?? ""),
          description: String(v.description ?? ""),
          default: typeof v.default === "string" ? v.default : undefined,
        }))
        .filter((v) => v.name.length > 0)
    : [];

  return { slug, name, description, recommendedThemes, variables, body };
}

export const templates: Template[] = Object.entries(rawModules)
  .map(([path, raw]) => parseTemplate(path, raw))
  .sort((a, b) => a.name.localeCompare(b.name));

export function getTemplate(slug: string): Template | undefined {
  return templates.find((t) => t.slug === slug);
}

/**
 * Substitute `{{var}}` placeholders. Missing vars fall back to the variable's
 * default (if defined) or are left as the literal `{{var}}` so the agent can
 * spot them. Returns the rendered markdown plus the list of vars that ended
 * up unresolved.
 */
export function renderTemplate(
  template: Template,
  values: Record<string, string>,
): { markdown: string; missing: string[] } {
  const merged: Record<string, string> = {};
  for (const v of template.variables) {
    if (v.default !== undefined) merged[v.name] = v.default;
  }
  for (const [k, v] of Object.entries(values)) {
    if (typeof v === "string") merged[k] = v;
  }

  const missing: string[] = [];
  const markdown = template.body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, name) => {
    if (Object.prototype.hasOwnProperty.call(merged, name)) return merged[name];
    if (!missing.includes(name)) missing.push(name);
    return `{{${name}}}`;
  });

  return { markdown, missing };
}
