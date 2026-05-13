import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { templates } from "@/lib/mcp/templates";

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
