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
      "Multi-page mode: wrap a route's blocks. The whole site lives in ONE .md file. Each ::page becomes its own URL with its own <head>. Blocks outside any ::page (typically ::nav and ::footer) are shared on every page. Set `type=\"post\"` + `date` to make a page appear in ::post-index and the RSS feed.",
    bodyFormat: "markdown",
    attrs: [
      { name: "slug", type: "string", required: true, description: 'Route path, e.g. "/" or "/blog/hello".' },
      { name: "title", type: "string", description: "Page-specific <title>." },
      { name: "description", type: "string", description: "Meta description." },
      { name: "image", type: "string", description: "og:image URL for this page." },
      { name: "type", type: "enum", enum: ["page", "post"], description: "Default `page`. Use `post` to opt into blog listings + RSS." },
      { name: "date", type: "string", description: "ISO date (YYYY-MM-DD) — required for posts to sort correctly." },
      { name: "author", type: "string", description: "Author name (posts)." },
      { name: "tags", type: "string", description: "Comma-separated tags, e.g. `tags=\"launch,product\"`." },
      { name: "excerpt", type: "string", description: "Short summary shown in ::post-index cards and RSS feed." },
    ],
    example: `::page{slug="/blog/hello" type="post" date="2026-07-23" author="Ada" tags="launch,product" excerpt="First post."}\n# Hello world\nWelcome to the blog.\n::`,
  },
  {
    name: "post-index",
    description:
      "Auto-generated list of every ::page{type=\"post\"} in the site, newest first. Great for a /blog landing page. Renders as cards with title, date, excerpt and tags.",
    bodyFormat: "markdown",
    attrs: [
      { name: "title", type: "string", description: "Section title, e.g. \"Latest posts\"." },
      { name: "limit", type: "number", description: "Max posts to show. Default: all." },
      { name: "tag", type: "string", description: "Only include posts that carry this tag." },
    ],
    example: `::post-index{title="Latest posts" limit=6}\n::`,
  },
  {
    name: "newsletter",
    description:
      "Email capture band. Renders a headline + email input + submit button. Submits to the URL in `action` as a POST form (or mailto: link if omitted). No JS required.",
    bodyFormat: "list-with-actions",
    attrs: [
      { name: "action", type: "string", description: "Form POST URL, e.g. a Buttondown/ConvertKit endpoint. Falls back to a mailto: link." },
      { name: "placeholder", type: "string", description: 'Email input placeholder. Default: "you@example.com".' },
      { name: "cta", type: "string", description: 'Submit button label. Default: "Subscribe".' },
    ],
    example: `::newsletter{action="https://buttondown.email/api/emails/embed-subscribe/acme" cta="Join list"}\n# Weekly changelog\n## One email, every Friday. No spam.\n::`,
  },
  {
    name: "compare",
    description:
      "Feature comparison table. First list item is the header row (column labels). Remaining rows are cells separated by ` | `. Use ✓/✗/— for booleans.",
    bodyFormat: "list",
    attrs: [
      { name: "title", type: "string", description: "Section title." },
      { name: "subtitle", type: "string", description: "Section subtitle." },
      { name: "highlight", type: "number", description: "1-based column index to visually highlight (e.g. your product's column)." },
    ],
    example: `::compare{title="Why us" highlight=2}\n- Feature | Others | **Us**\n- Markdown-native | ✗ | ✓\n- Agent-editable | ✗ | ✓\n- Setup time | Hours | Minutes\n::`,
  },
  {
    name: "video",
    description:
      "Responsive video embed. Supports YouTube, Vimeo, and direct MP4 URLs. Auto-detects provider from the URL.",
    bodyFormat: "markdown",
    attrs: [
      { name: "src", type: "string", required: true, description: "YouTube/Vimeo URL or direct .mp4 URL." },
      { name: "title", type: "string", description: "Caption shown under the video." },
      { name: "poster", type: "string", description: "Thumbnail image URL (for MP4 videos)." },
      { name: "aspect", type: "enum", enum: ["16/9", "4/3", "1/1", "9/16"], description: "Aspect ratio. Default 16/9." },
    ],
    example: `::video{src="https://youtu.be/dQw4w9WgXcQ" title="Product tour (2 min)"}\n::`,
  },
  {
    name: "code",
    description:
      "Syntax-highlighted code block with copy-to-clipboard button. Body is raw code — do NOT wrap in ``` fences (the whole block IS the fence).",
    bodyFormat: "markdown",
    attrs: [
      { name: "lang", type: "string", description: 'Language for syntax hint, e.g. "ts", "bash", "json". Default: plain.' },
      { name: "title", type: "string", description: "Filename or label shown in the header, e.g. \"install.sh\"." },
    ],
    example: `::code{lang="bash" title="install.sh"}\nnpm install mdweb\nmdweb dev\n::`,
  },
];

export function getDirective(name: string): DirectiveSpec | undefined {
  return directives.find((d) => d.name === name);
}
