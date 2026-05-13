/**
 * Serialize parsed blocks back to markdown source so MCP block-level skills
 * (add_block / update_block / remove_block / move_block) can mutate a site
 * without forcing the agent to ship the whole markdown body each call.
 */

import type { Block, DirectiveBlock } from "@/lib/markdown-web/parser";

function serializeAttrs(attrs: Record<string, string | number | boolean>): string {
  const entries = Object.entries(attrs);
  if (entries.length === 0) return "";
  const parts = entries.map(([k, v]) => {
    if (v === true) return k;
    if (v === false) return `${k}=false`;
    if (typeof v === "number") return `${k}=${v}`;
    // string — always quote with double quotes; escape inner "
    const s = String(v).replace(/"/g, '\\"');
    return `${k}="${s}"`;
  });
  return `{${parts.join(" ")}}`;
}

export function serializeBlock(block: Block): string {
  if (block.kind === "markdown") return block.body;
  const d = block as DirectiveBlock;
  const head = `::${d.name}${serializeAttrs(d.attrs)}`;
  const body = d.body.replace(/\n+$/, "");
  return body.length > 0 ? `${head}\n${body}\n::` : `${head}\n::`;
}

export function serializeDoc(
  frontmatter: Record<string, unknown>,
  blocks: Block[],
): string {
  const parts: string[] = [];
  if (Object.keys(frontmatter).length > 0) {
    const fm = Object.entries(frontmatter)
      .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
      .join("\n");
    parts.push(`---\n${fm}\n---`);
  }
  parts.push(blocks.map(serializeBlock).join("\n\n"));
  return parts.join("\n") + "\n";
}
