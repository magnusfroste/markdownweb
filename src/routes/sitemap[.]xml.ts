import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { templates } from "@/lib/mcp/templates";
import { listSites } from "@/lib/mcp/store";
import { parseMarkdownWeb } from "@/lib/markdown-web/parser";

const BASE_URL = "https://mdsites.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
          { path: "/edit", changefreq: "weekly", priority: "0.8", lastmod: today },
          { path: "/docs", changefreq: "weekly", priority: "0.7", lastmod: today },
          { path: "/mcp", changefreq: "weekly", priority: "0.6", lastmod: today },
        ];

        // One indexable URL per template (long-tail SEO)
        for (const t of templates) {
          entries.push({
            path: `/edit?template=${t.slug}`,
            changefreq: "monthly",
            priority: "0.5",
            lastmod: today,
          });
        }

        // Published MCP sites — enumerate every ::page slug for multi-page docs.
        const { items: published } = listSites({ status: "published", limit: 500 });
        for (const site of published) {
          const lastmod = site.updatedAt.slice(0, 10);
          const doc = parseMarkdownWeb(site.markdown);
          if (doc.pages && doc.pages.length > 0) {
            for (const p of doc.pages) {
              const sub = p.slug === "/" ? "" : p.slug;
              entries.push({
                path: `/mcp/preview/${site.slug}${sub}`,
                changefreq: "weekly",
                priority: "0.6",
                lastmod,
              });
            }
          } else {
            entries.push({
              path: `/mcp/preview/${site.slug}`,
              changefreq: "weekly",
              priority: "0.6",
              lastmod,
            });
          }
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
