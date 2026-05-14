/**
 * Helpers for resolving which blocks to render for a given route path
 * inside a multi-page markdown site (`::page` directives).
 */
import type { Block, ParsedDoc, Page } from "./parser";

export function normalizePath(raw: string | undefined | null): string {
  if (!raw) return "/";
  let s = raw.trim();
  if (!s.startsWith("/")) s = "/" + s;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

/**
 * Returns the resolved page + the full block list (sharedBefore + page +
 * sharedAfter) for a given path. Falls back to the doc's top-level blocks
 * when the doc has no ::page directives.
 */
export function resolvePage(
  doc: ParsedDoc,
  path: string,
): { page?: Page; blocks: Block[]; notFound: boolean } {
  if (!doc.pages || doc.pages.length === 0) {
    return { blocks: doc.blocks, notFound: false };
  }
  const target = normalizePath(path);
  const page = doc.pages.find((p) => p.slug === target);
  if (!page) {
    return { blocks: [], notFound: true };
  }
  return {
    page,
    blocks: [
      ...(doc.sharedBefore ?? []),
      ...page.blocks,
      ...(doc.sharedAfter ?? []),
    ],
    notFound: false,
  };
}
