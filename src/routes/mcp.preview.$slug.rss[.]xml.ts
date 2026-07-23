/**
 * RSS 2.0 feed for a site's ::page{type="post"} posts.
 * URL: /mcp/preview/:slug/rss.xml
 */
import { createFileRoute } from "@tanstack/react-router";
import { getSite } from "@/lib/mcp/store";
import { listPosts } from "@/lib/mcp/pages";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const Route = createFileRoute("/mcp/preview/$slug/rss")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const site = getSite(params.slug);
        if (!site) return new Response("Site not found", { status: 404 });

        const origin = new URL(request.url).origin;
        const base = `${origin}/mcp/preview/${site.slug}`;
        const posts = listPosts(site.slug);

        const items = posts
          .map((p) => {
            const url = `${base}${p.slug === "/" ? "" : p.slug}`;
            const pub = p.date ? new Date(p.date).toUTCString() : new Date().toUTCString();
            const cats = (p.tags ?? []).map((t) => `<category>${esc(t)}</category>`).join("");
            const author = p.author ? `<dc:creator>${esc(p.author)}</dc:creator>` : "";
            return `
    <item>
      <title>${esc(p.title ?? p.slug)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${pub}</pubDate>
      ${author}
      ${cats}
      <description>${esc(p.excerpt ?? p.description ?? "")}</description>
    </item>`;
          })
          .join("");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.title)}</title>
    <link>${esc(base)}</link>
    <description>${esc(site.title)} — posts</description>
    <language>en</language>
    <atom:link href="${esc(base)}/rss.xml" rel="self" type="application/rss+xml"/>${items}
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
