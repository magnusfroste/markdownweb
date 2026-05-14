/**
 * Directive registry — describes every ::directive:: block the renderer supports.
 * Used by MCP skills `list_directives` and `get_directive_schema` so external
 * agents can discover what they're allowed to write.
 */

export type DirectiveAttr = {
  name: string;
  type: "string" | "number" | "boolean" | "enum";
  required?: boolean;
  enum?: string[];
  description: string;
};

export type DirectiveSpec = {
  name: string;
  description: string;
  /** What goes between ::name and :: */
  bodyFormat:
    | "markdown"
    | "list" // - **Title** — body  (with optional leading emoji icon)
    | "list-with-actions" // markdown + [Label](href){variant=primary}
    | "nav-items" // - Label → /path
    | "key-value-list"; // pricing-style
  attrs: DirectiveAttr[];
  example: string;
};

export const directives: DirectiveSpec[] = [
  {
    name: "nav",
    description: "Sticky top navigation with brand and link items.",
    bodyFormat: "nav-items",
    attrs: [
      { name: "brand", type: "string", description: "Brand label shown left." },
    ],
    example: `::nav{brand="Acme"}\n- Home → /\n- Docs → /docs\n- GitHub → https://github.com/x/y\n::`,
  },
  {
    name: "hero",
    description: "Large landing hero with optional eyebrow and CTAs.",
    bodyFormat: "list-with-actions",
    attrs: [
      { name: "eyebrow", type: "string", description: "Small label above headline." },
    ],
    example: `::hero{eyebrow="v1.0"}\n# Build sites in markdown\n## A tiny CMS for AI agents.\n[Get started](/start){variant=primary} [Docs](/docs)\n::`,
  },
  {
    name: "features",
    description: "Grid of feature cards. Each list item becomes a card.",
    bodyFormat: "list",
    attrs: [
      { name: "title", type: "string", description: "Optional section heading." },
      { name: "columns", type: "number", description: "1–4. Default 3." },
    ],
    example: `::features{title="Why us" columns=3}\n- 🚀 **Fast** — Sub-50ms TTFB.\n- 🔒 **Safe** — RLS by default.\n- 🧩 **Composable** — Block markdown.\n::`,
  },
  {
    name: "pricing",
    description: "Pricing plan cards. Each item is one plan.",
    bodyFormat: "list",
    attrs: [
      { name: "title", type: "string", description: "Section title." },
      { name: "subtitle", type: "string", description: "Section subtitle." },
      { name: "columns", type: "number", description: "Number of plans per row." },
    ],
    example: `::pricing{title="Plans"}\n- **Free** — $0/mo · 1 site\n- **Pro** — $29/mo · Unlimited\n::`,
  },
  {
    name: "quote",
    description: "Centered pull quote with author attribution.",
    bodyFormat: "markdown",
    attrs: [
      { name: "author", type: "string", description: "Author name." },
      { name: "role", type: "string", description: "Author role/company." },
    ],
    example: `::quote{author="Ada Lovelace" role="Mathematician"}\nThe analytical engine weaves algebraic patterns.\n::`,
  },
  {
    name: "cta",
    description: "Call-to-action band with headline and buttons.",
    bodyFormat: "list-with-actions",
    attrs: [
      {
        name: "background",
        type: "enum",
        enum: ["foreground", "primary"],
        description: "Band color.",
      },
    ],
    example: `::cta{background="primary"}\n# Ready?\n## Spin up your first site in seconds.\n[Start free](/signup){variant=primary}\n::`,
  },
  {
    name: "footer",
    description: "Page footer. Body is rendered as markdown.",
    bodyFormat: "markdown",
    attrs: [],
    example: `::footer\n© 2026 Acme · [Privacy](/privacy) · [Terms](/terms)\n::`,
  },
  {
    name: "stats",
    description: "Row of large numeric stats.",
    bodyFormat: "list",
    attrs: [
      { name: "title", type: "string", description: "Optional section title." },
    ],
    example: `::stats\n- **10k+** — Active sites\n- **99.9%** — Uptime\n- **<50ms** — TTFB\n::`,
  },
  {
    name: "logos",
    description: "Strip of partner/customer logos. Each item is a label.",
    bodyFormat: "list",
    attrs: [
      { name: "title", type: "string", description: "Strip title." },
    ],
    example: `::logos{title="Trusted by"}\n- Acme\n- Globex\n- Initech\n::`,
  },
  {
    name: "testimonials",
    description: "Grid of quote cards with author + role.",
    bodyFormat: "list",
    attrs: [
      { name: "title", type: "string", description: "Section title." },
      { name: "columns", type: "number", description: "1–3." },
    ],
    example: `::testimonials{columns=2}\n- **"Game changer"** — Ada Lovelace, CTO at Acme\n- **"Best DX I've had"** — Alan Turing, Eng at Globex\n::`,
  },
  {
    name: "faq",
    description: "Frequently asked questions. Each item is Q — A.",
    bodyFormat: "list",
    attrs: [
      { name: "title", type: "string", description: "Section title." },
    ],
    example: `::faq{title="FAQ"}\n- **Is there a free tier?** — Yes, forever.\n- **Self-host?** — One docker command.\n::`,
  },
  {
    name: "gallery",
    description: "Image gallery. Items are markdown image links.",
    bodyFormat: "list",
    attrs: [
      { name: "columns", type: "number", description: "Items per row." },
    ],
    example: `::gallery{columns=3}\n- ![Shot 1](/img/1.png)\n- ![Shot 2](/img/2.png)\n::`,
  },
  {
    name: "timeline",
    description: "Vertical timeline of events.",
    bodyFormat: "list",
    attrs: [
      { name: "title", type: "string", description: "Section title." },
    ],
    example: `::timeline{title="Roadmap"}\n- **2024 Q1** — Idea\n- **2024 Q4** — Public beta\n::`,
  },
  {
    name: "steps",
    description: "Numbered steps / how-it-works.",
    bodyFormat: "list",
    attrs: [
      { name: "title", type: "string", description: "Section title." },
    ],
    example: `::steps{title="How it works"}\n- **Write** — Author markdown\n- **Push** — Commit\n- **Ship** — Auto-deploys\n::`,
  },
  {
    name: "tabs",
    description: "Tabbed content. Each item label becomes a tab.",
    bodyFormat: "list",
    attrs: [],
    example:
      "::tabs\n- **Node** — `npm i mdweb`\n- **Bun** — `bun add mdweb`\n::",
  },
  {
    name: "divider",
    description: "Horizontal divider band.",
    bodyFormat: "markdown",
    attrs: [
      { name: "label", type: "string", description: "Optional centered label." },
    ],
    example: `::divider{label="More"}\n::`,
  },
  {
    name: "split",
    description: "Two-column split section: text + visual.",
    bodyFormat: "markdown",
    attrs: [
      {
        name: "variant",
        type: "enum",
        enum: ["text-left", "text-right"],
        description: "Which side text appears on.",
      },
    ],
    example: `::split{variant="text-left"}\n# Title\nSupporting paragraph.\n[Learn more](/x){variant=primary}\n::`,
  },
  {
    name: "page",
    description:
      "Multi-page mode: wrap a route's blocks. The whole site lives in ONE .md file. Each ::page becomes its own URL with its own <head>. Blocks outside any ::page (typically ::nav and ::footer) are shared on every page.",
    bodyFormat: "markdown",
    attrs: [
      { name: "slug", type: "string", description: 'Route path, e.g. "/" or "/about". Required.' },
      { name: "title", type: "string", description: "Page-specific <title> tag." },
      { name: "description", type: "string", description: "Meta description for this page." },
      { name: "image", type: "string", description: "og:image URL for this page." },
    ],
    example: `::page{slug="/" title="Home — Acme"}\n::hero\n# Welcome\n::\n::\n\n::page{slug="/about" title="About — Acme"}\n::hero\n# About us\n::\n::`,
  },
];

export function getDirective(name: string): DirectiveSpec | undefined {
  return directives.find((d) => d.name === name);
}
