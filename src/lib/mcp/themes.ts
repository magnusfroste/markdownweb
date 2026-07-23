/**
 * Theme registry — 10 curated design templates an MCP agent can apply to
 * a site. Each theme is a complete token set (palette + typography + radius).
 *
 * Agents pick a theme via `set_theme` and can override a small whitelist of
 * tokens via `update_theme_tokens`. They CANNOT inject arbitrary CSS — that
 * keeps every site looking intentional even when an LLM writes the markdown.
 */

export type ThemeTokens = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
  radius: string;
  /** Tailwind / CSS letter-spacing for headings. */
  headingTracking: string;
  /** Heading weight (numeric or keyword). */
  headingWeight: string;
  /** Logo URL — optional, agent-supplied. */
  logoUrl?: string;
};

export type Theme = {
  slug: string;
  name: string;
  description: string;
  tokens: ThemeTokens;
  /** Stylesheet to load (Google Fonts). */
  fontsHref: string;
};

/** Whitelist of tokens an agent may override per-site. */
export const OVERRIDABLE_TOKENS = [
  "background",
  "foreground",
  "primary",
  "primaryForeground",
  "accent",
  "accentForeground",
  "muted",
  "mutedForeground",
  "border",
  "radius",
  "logoUrl",
] as const satisfies readonly (keyof ThemeTokens)[];

export type OverridableToken = (typeof OVERRIDABLE_TOKENS)[number];

export type ThemeOverrides = Partial<Pick<ThemeTokens, OverridableToken>>;

const SYSTEM_SANS = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
const SYSTEM_MONO = "ui-monospace, Menlo, Consolas, monospace";

export const themes: Theme[] = [
  {
    slug: "editorial-serif",
    name: "Editorial Serif",
    description: "Magazine-style serif headlines on warm off-white. Signature: drop-cap on first paragraph + gold hairline between sections. Brand storytelling.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@400;500;600;700&display=swap",
    tokens: {
      background: "#f5f3ee",
      foreground: "#0d0d0d",
      card: "#ffffff",
      cardForeground: "#0d0d0d",
      muted: "#e8e4dd",
      mutedForeground: "#5c5a55",
      primary: "#0d0d0d",
      primaryForeground: "#f5f3ee",
      accent: "#c9a84c",
      accentForeground: "#0d0d0d",
      border: "#1a1a1a",
      fontDisplay: `"Instrument Serif", Georgia, serif`,
      fontBody: `"Work Sans", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "2px",
      headingTracking: "-0.015em",
      headingWeight: "400",
    },
  },
  {
    slug: "modern-tech",
    name: "Modern Tech",
    description: "Crisp grotesk on midnight indigo. Signature: soft conic glow under the hero. SaaS, dev tools, AI startups.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&display=swap",
    tokens: {
      background: "#0a0a1a",
      foreground: "#e8eaf2",
      card: "#141432",
      cardForeground: "#e8eaf2",
      muted: "#1e1e3a",
      mutedForeground: "#9499b8",
      primary: "#4f46e5",
      primaryForeground: "#ffffff",
      accent: "#22d3ee",
      accentForeground: "#0a0a1a",
      border: "#2a2a4a",
      fontDisplay: `"Space Grotesk", ${SYSTEM_SANS}`,
      fontBody: `"DM Sans", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "8px",
      headingTracking: "-0.02em",
      headingWeight: "700",
    },
  },
  {
    slug: "brutalist-pop",
    name: "Brutalist Pop",
    description: "High-contrast black/white with a single neon accent. Signature: 4px offset shadow on hero badge. Editorial brutalism.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Hind:wght@400;500;700&display=swap",
    tokens: {
      background: "#ffffff",
      foreground: "#0a0a0a",
      card: "#ffffff",
      cardForeground: "#0a0a0a",
      muted: "#f0f0f0",
      mutedForeground: "#3a3a3a",
      primary: "#ff5722",
      primaryForeground: "#0a0a0a",
      accent: "#ffeb3b",
      accentForeground: "#0a0a0a",
      border: "#0a0a0a",
      fontDisplay: `"Archivo Black", ${SYSTEM_SANS}`,
      fontBody: `"Hind", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "0px",
      headingTracking: "-0.03em",
      headingWeight: "900",
    },
  },
  {
    slug: "luxury-noir",
    name: "Luxury Noir",
    description: "Black with gold accents and elegant serifs. Signature: gold hairline divider between sections + gold-underlined links. Premium / fashion / hospitality.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Karla:wght@400;500;700&display=swap",
    tokens: {
      background: "#0d0d0d",
      foreground: "#f0e8d0",
      card: "#1a1a1a",
      cardForeground: "#f0e8d0",
      muted: "#262626",
      mutedForeground: "#a09680",
      primary: "#c9a84c",
      primaryForeground: "#0d0d0d",
      accent: "#f0d78c",
      accentForeground: "#0d0d0d",
      border: "#3a3a3a",
      fontDisplay: `"Cormorant Garamond", Georgia, serif`,
      fontBody: `"Karla", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "4px",
      headingTracking: "-0.01em",
      headingWeight: "500",
    },
  },
  {
    slug: "wellness-soft",
    name: "Wellness Soft",
    description: "Sage and cream, soft serifs. Signature: organic blob behind the hero. Health, beauty, lifestyle, retreats.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400&family=Nunito+Sans:wght@400;500;600;700&display=swap",
    tokens: {
      background: "#f5f0e8",
      foreground: "#2d3a2a",
      card: "#ffffff",
      cardForeground: "#2d3a2a",
      muted: "#dce5d4",
      mutedForeground: "#5a6b56",
      primary: "#7d9b76",
      primaryForeground: "#ffffff",
      accent: "#a8c0a0",
      accentForeground: "#2d3a2a",
      border: "#c4d0bc",
      fontDisplay: `"Lora", Georgia, serif`,
      fontBody: `"Nunito Sans", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "12px",
      headingTracking: "-0.005em",
      headingWeight: "600",
    },
  },
  {
    slug: "startup-bold",
    name: "Startup Bold",
    description: "Electric coral on near-black. Signature: neon glow under primary buttons. Bold, energetic, attention-grabbing.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap",
    tokens: {
      background: "#0f0f12",
      foreground: "#fafafa",
      card: "#1a1a20",
      cardForeground: "#fafafa",
      muted: "#22222a",
      mutedForeground: "#9595a8",
      primary: "#ff6b6b",
      primaryForeground: "#0f0f12",
      accent: "#574b90",
      accentForeground: "#fafafa",
      border: "#2c2c36",
      fontDisplay: `"Sora", ${SYSTEM_SANS}`,
      fontBody: `"Manrope", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "10px",
      headingTracking: "-0.025em",
      headingWeight: "800",
    },
  },
  {
    slug: "corporate-trust",
    name: "Corporate Trust",
    description: "Navy and white, classic serif. Signature: classic top-rule above section titles. Finance, legal, enterprise, B2B.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
    tokens: {
      background: "#ffffff",
      foreground: "#0f1b3d",
      card: "#f7f8fb",
      cardForeground: "#0f1b3d",
      muted: "#e8edf3",
      mutedForeground: "#3b4a6a",
      primary: "#1e3a5f",
      primaryForeground: "#ffffff",
      accent: "#3b6fa0",
      accentForeground: "#ffffff",
      border: "#cdd6e4",
      fontDisplay: `"Libre Baskerville", Georgia, serif`,
      fontBody: `"IBM Plex Sans", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "4px",
      headingTracking: "-0.01em",
      headingWeight: "700",
    },
  },
  {
    slug: "creative-playful",
    name: "Creative Playful",
    description: "Sunset gradients with display serifs. Signature: subtle hero gradient + slightly tilted bordered cards. Portfolios, creative agencies, events.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Cabin:wght@400;500;600;700&display=swap",
    tokens: {
      background: "#fff7f0",
      foreground: "#2a1810",
      card: "#ffffff",
      cardForeground: "#2a1810",
      muted: "#ffe8d6",
      mutedForeground: "#7a4a30",
      primary: "#ff6b35",
      primaryForeground: "#ffffff",
      accent: "#e84393",
      accentForeground: "#ffffff",
      border: "#f0c8a8",
      fontDisplay: `"Abril Fatface", Georgia, serif`,
      fontBody: `"Cabin", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "16px",
      headingTracking: "0em",
      headingWeight: "400",
    },
  },
  {
    slug: "dev-docs",
    name: "Dev Docs",
    description: "Slate, steel, monospace headers. Signature: monospace chip eyebrows. Developer tools, API docs, technical content.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap",
    tokens: {
      background: "#fafbfc",
      foreground: "#1a202c",
      card: "#ffffff",
      cardForeground: "#1a202c",
      muted: "#edf0f4",
      mutedForeground: "#4a5568",
      primary: "#2d3748",
      primaryForeground: "#ffffff",
      accent: "#3182ce",
      accentForeground: "#ffffff",
      border: "#cbd5e0",
      fontDisplay: `"JetBrains Mono", ui-monospace, monospace`,
      fontBody: `"Inter", ${SYSTEM_SANS}`,
      fontMono: `"JetBrains Mono", ui-monospace, monospace`,
      radius: "6px",
      headingTracking: "-0.02em",
      headingWeight: "700",
    },
  },
  {
    slug: "nature-organic",
    name: "Nature Organic",
    description: "Forest greens with mossy accents. Signature: asymmetric soft-corner cards. Outdoors, sustainability, food, organic brands.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
    tokens: {
      background: "#f4f1ea",
      foreground: "#1a3c2a",
      card: "#ffffff",
      cardForeground: "#1a3c2a",
      muted: "#e0dccf",
      mutedForeground: "#4a5d48",
      primary: "#2d5a3d",
      primaryForeground: "#f4f1ea",
      accent: "#a0c49d",
      accentForeground: "#1a3c2a",
      border: "#c4ccb4",
      fontDisplay: `"Syne", ${SYSTEM_SANS}`,
      fontBody: `"Plus Jakarta Sans", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "20px",
      headingTracking: "-0.02em",
      headingWeight: "800",
    },
  },
  {
    slug: "restaurant-bistro",
    name: "Restaurant Bistro",
    description: "Warm cream + deep burgundy with a script accent. Signature: hand-drawn wavy divider between sections + burgundy small-caps eyebrows. Restaurants, cafés, wine bars, hospitality menus.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Inter:wght@400;500;600&family=Caveat:wght@600&display=swap",
    tokens: {
      background: "#f7f1e6",
      foreground: "#2a1210",
      card: "#fffaf1",
      cardForeground: "#2a1210",
      muted: "#ede2cc",
      mutedForeground: "#6b4a3e",
      primary: "#6e1a1a",
      primaryForeground: "#f7f1e6",
      accent: "#b8863b",
      accentForeground: "#2a1210",
      border: "#d8c6a4",
      fontDisplay: `"Playfair Display", Georgia, serif`,
      fontBody: `"Inter", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "3px",
      headingTracking: "-0.01em",
      headingWeight: "700",
    },
  },
  {
    slug: "real-estate-lux",
    name: "Real Estate Lux",
    description: "Deep navy on warm oat, generous whitespace, thin uppercase eyebrows. Signature: 1px gold frame around hero imagery + wide-tracked ALL CAPS section labels. Real estate, architecture, interiors, hospitality.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Urbanist:wght@300;400;500;600&display=swap",
    tokens: {
      background: "#f4efe6",
      foreground: "#0e1a2b",
      card: "#ffffff",
      cardForeground: "#0e1a2b",
      muted: "#e6ded0",
      mutedForeground: "#556477",
      primary: "#0e1a2b",
      primaryForeground: "#f4efe6",
      accent: "#a88a53",
      accentForeground: "#0e1a2b",
      border: "#c9bfae",
      fontDisplay: `"Cormorant Garamond", Georgia, serif`,
      fontBody: `"Urbanist", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "2px",
      headingTracking: "-0.005em",
      headingWeight: "400",
    },
  },
  {
    slug: "fitness-energy",
    name: "Fitness Energy",
    description: "Jet black with electric lime, condensed uppercase display. Signature: diagonal lime slash on hero + heavy italic caps eyebrows. Gyms, athletic brands, coaching, esports.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,500;0,700;1,700&family=Barlow:wght@400;500;700&display=swap",
    tokens: {
      background: "#08090b",
      foreground: "#f2f4f0",
      card: "#12141a",
      cardForeground: "#f2f4f0",
      muted: "#1c1f26",
      mutedForeground: "#8f96a3",
      primary: "#c6ff3d",
      primaryForeground: "#08090b",
      accent: "#ff2d55",
      accentForeground: "#f2f4f0",
      border: "#262a33",
      fontDisplay: `"Bebas Neue", "Barlow Condensed", ${SYSTEM_SANS}`,
      fontBody: `"Barlow", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "0px",
      headingTracking: "0.01em",
      headingWeight: "700",
    },
  },
  {
    slug: "agency-swiss",
    name: "Agency Swiss",
    description: "Pure Swiss grid: white, black, oversized numerals, lowercase labels. Signature: 12-col baseline hairlines + big numeric section markers (01 / 02). Design studios, agencies, portfolios.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Neue+Haas+Grotesk+Text+Pro&family=Inter:wght@300;400;500;700&family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap",
    tokens: {
      background: "#fbfbf9",
      foreground: "#0a0a0a",
      card: "#ffffff",
      cardForeground: "#0a0a0a",
      muted: "#efefec",
      mutedForeground: "#5a5a58",
      primary: "#0a0a0a",
      primaryForeground: "#fbfbf9",
      accent: "#ff3b00",
      accentForeground: "#fbfbf9",
      border: "#0a0a0a",
      fontDisplay: `"Inter", ${SYSTEM_SANS}`,
      fontBody: `"Inter", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "0px",
      headingTracking: "-0.035em",
      headingWeight: "500",
    },
  },
  {
    slug: "fashion-runway",
    name: "Fashion Runway",
    description: "Stark white with oversized display serif and wide tracking. Signature: massive thin-weight display headings + tiny wide-tracked labels. Fashion, beauty, editorial e-commerce.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400&family=Jost:wght@300;400;500&display=swap",
    tokens: {
      background: "#ffffff",
      foreground: "#111111",
      card: "#ffffff",
      cardForeground: "#111111",
      muted: "#f4f4f4",
      mutedForeground: "#6a6a6a",
      primary: "#111111",
      primaryForeground: "#ffffff",
      accent: "#c46a70",
      accentForeground: "#ffffff",
      border: "#e5e5e5",
      fontDisplay: `"Cormorant", Georgia, serif`,
      fontBody: `"Jost", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "0px",
      headingTracking: "-0.02em",
      headingWeight: "300",
    },
  },
  {
    slug: "legal-heritage",
    name: "Legal Heritage",
    description: "Deep burgundy on parchment, transitional serif, formal spacing. Signature: monogram-style ornamental divider + gold underline on numbered section headings. Law firms, wealth management, universities.",
    fontsHref:
      "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@400;600&display=swap",
    tokens: {
      background: "#f4ede0",
      foreground: "#1a0d0d",
      card: "#fbf6ea",
      cardForeground: "#1a0d0d",
      muted: "#e6dbc4",
      mutedForeground: "#5c463c",
      primary: "#5a1216",
      primaryForeground: "#f4ede0",
      accent: "#a67c2e",
      accentForeground: "#1a0d0d",
      border: "#c6b48c",
      fontDisplay: `"EB Garamond", Georgia, serif`,
      fontBody: `"Source Sans 3", ${SYSTEM_SANS}`,
      fontMono: SYSTEM_MONO,
      radius: "2px",
      headingTracking: "0em",
      headingWeight: "600",
    },
  },
];

export const DEFAULT_THEME_SLUG = "brutalist-pop";

export function getTheme(slug: string): Theme | undefined {
  return themes.find((t) => t.slug === slug);
}

export function resolveTokens(
  themeSlug: string | undefined,
  overrides: ThemeOverrides | undefined,
): { theme: Theme; tokens: ThemeTokens } {
  const theme = getTheme(themeSlug ?? DEFAULT_THEME_SLUG) ?? getTheme(DEFAULT_THEME_SLUG)!;
  const tokens: ThemeTokens = { ...theme.tokens, ...(overrides ?? {}) };
  return { theme, tokens };
}

/**
 * Filter an unknown overrides object down to allowed string-valued tokens.
 * Throws if the caller tries to override something off the whitelist.
 */
export function sanitizeOverrides(input: unknown): ThemeOverrides {
  if (!input || typeof input !== "object") return {};
  const out: ThemeOverrides = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (!(OVERRIDABLE_TOKENS as readonly string[]).includes(k)) {
      throw new Error(
        `Token \`${k}\` is not overridable. Allowed: ${OVERRIDABLE_TOKENS.join(", ")}`,
      );
    }
    if (typeof v !== "string" || v.length === 0 || v.length > 200) {
      throw new Error(`Override \`${k}\` must be a non-empty string ≤200 chars`);
    }
    (out as Record<string, string>)[k] = v;
  }
  return out;
}

/** Build the inline CSS variable map a renderer can spread on a wrapper div. */
export function tokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  return {
    "--background": tokens.background,
    "--foreground": tokens.foreground,
    "--card": tokens.card,
    "--card-foreground": tokens.cardForeground,
    "--muted": tokens.muted,
    "--muted-foreground": tokens.mutedForeground,
    "--primary": tokens.primary,
    "--primary-foreground": tokens.primaryForeground,
    "--accent": tokens.accent,
    "--accent-foreground": tokens.accentForeground,
    "--secondary": tokens.accent,
    "--secondary-foreground": tokens.accentForeground,
    "--popover": tokens.card,
    "--popover-foreground": tokens.cardForeground,
    "--border": tokens.border,
    "--input": tokens.border,
    "--ring": tokens.primary,
    "--radius": tokens.radius,
    "--font-display": tokens.fontDisplay,
    "--font-sans": tokens.fontBody,
    "--font-mono": tokens.fontMono,
  };
}
