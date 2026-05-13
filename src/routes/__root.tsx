import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MarkdownWeb — Sites you write in Markdown" },
      {
        name: "description",
        content:
          "MarkdownWeb turns a single .md file into a themed, SEO-ready website. LLM-friendly, git-friendly, human-friendly.",
      },
      { name: "author", content: "MarkdownWeb" },
      { property: "og:site_name", content: "MarkdownWeb" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "MarkdownWeb — Sites you write in Markdown" },
      {
        property: "og:description",
        content:
          "Turn a single .md file into a themed, SEO-ready site. Built for AI agents and humans.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MarkdownWeb — Sites you write in Markdown" },
      {
        name: "twitter:description",
        content:
          "Turn a single .md file into a themed, SEO-ready site. Built for AI agents and humans.",
      },
      { name: "theme-color", content: "#0a0a0a" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "MarkdownWeb",
          url: "https://mdsites.lovable.app",
          description:
            "MarkdownWeb turns a single .md file into a themed, SEO-ready website.",
          potentialAction: {
            "@type": "SearchAction",
            target:
              "https://mdsites.lovable.app/docs?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "MarkdownWeb",
          applicationCategory: "WebApplication",
          operatingSystem: "Any",
          description:
            "Author and publish websites from a single Markdown file. Includes 10 themes and 10 templates, plus an MCP API for AI agents.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
