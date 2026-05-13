/**
 * Layout families — design "schools" that decide which visual variant each
 * block renders as. A family is orthogonal to a color theme:
 *
 *   site = template (content) + layoutFamily (composition) + theme (palette)
 *
 * Same markdown can render as a momentum AI-startup hero, an editorial
 * magazine spread, or a brutalist marquee — the family picks the variant
 * for every directive that supports them.
 *
 * Block authors can still override per block via `::hero{variant=split}` —
 * explicit attrs always win.
 */

export type LayoutFamilySlug = "momentum" | "editorial" | "brutalist";

/**
 * Variant catalog. Each block lists the variants it implements; the family
 * picks which one is the default. Adding a new variant = adding it here +
 * teaching the block component to render it.
 */
export const BLOCK_VARIANTS = {
  hero: ["centered", "split", "marquee"] as const,
  features: ["grid", "bento", "zigzag"] as const,
  cta: ["banner", "inline", "bold"] as const,
} as const;

export type BlockWithVariants = keyof typeof BLOCK_VARIANTS;
export type VariantFor<K extends BlockWithVariants> =
  (typeof BLOCK_VARIANTS)[K][number];

export type LayoutFamily = {
  slug: LayoutFamilySlug;
  name: string;
  description: string;
  /** One-liner that signals the vibe. */
  vibe: string;
  /** Default variant per block. */
  defaultVariants: {
    [K in BlockWithVariants]: VariantFor<K>;
  };
};

export const layoutFamilies: LayoutFamily[] = [
  {
    slug: "momentum",
    name: "Momentum",
    description:
      "AI-native startup energy. Asymmetric split heroes, bento feature grids, gradient CTA bars. Modern, confident, optimistic.",
    vibe: "AI / startup / SaaS",
    defaultVariants: {
      hero: "split",
      features: "bento",
      cta: "banner",
    },
  },
  {
    slug: "editorial",
    name: "Editorial",
    description:
      "Magazine-style layouts: centered serif heroes, zigzag image/text rows, inline quote CTAs. Calm, confident, story-driven.",
    vibe: "media / brand / story",
    defaultVariants: {
      hero: "centered",
      features: "zigzag",
      cta: "inline",
    },
  },
  {
    slug: "brutalist",
    name: "Brutalist",
    description:
      "Full-bleed marquee heroes, hard borders, blocky CTAs. Statement design — indie, bold, unapologetic.",
    vibe: "indie / statement / fashion",
    defaultVariants: {
      hero: "marquee",
      features: "grid",
      cta: "bold",
    },
  },
];

export const DEFAULT_LAYOUT_FAMILY: LayoutFamilySlug = "momentum";

export function getLayoutFamily(
  slug: string | undefined,
): LayoutFamily {
  return (
    layoutFamilies.find((f) => f.slug === slug) ??
    layoutFamilies.find((f) => f.slug === DEFAULT_LAYOUT_FAMILY)!
  );
}

/**
 * Resolve the active variant for a block. Explicit `variant=` attr in the
 * markdown wins; otherwise we fall back to the family's default; otherwise
 * the first known variant for that block.
 */
export function resolveVariant<K extends BlockWithVariants>(
  block: K,
  family: LayoutFamily,
  explicit: unknown,
): VariantFor<K> {
  const allowed = BLOCK_VARIANTS[block] as readonly string[];
  if (typeof explicit === "string" && allowed.includes(explicit)) {
    return explicit as VariantFor<K>;
  }
  return family.defaultVariants[block];
}
