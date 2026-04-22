import { marked } from "marked";

/** Render markdown as inline HTML (links, bold, code). Trusted source — local .md. */
export function renderMd(md: string): { __html: string } {
  const html = marked.parse(md, { async: false, breaks: true }) as string;
  return { __html: html };
}

/**
 * Extract markdown links of form [label](href){.class}
 * Returns array { label, href, variant } and the remaining markdown with these links removed.
 */
export type ParsedLink = { label: string; href: string; variant: string };

export function extractActionLinks(md: string): {
  links: ParsedLink[];
  rest: string;
} {
  const re = /\[([^\]]+)\]\(([^)]+)\)(?:\{\.([\w-]+)\})?/g;
  const links: ParsedLink[] = [];
  const rest = md.replace(re, (_full, label, href, variant) => {
    links.push({ label, href, variant: variant ?? "primary" });
    return "";
  });
  return { links, rest: rest.trim() };
}
