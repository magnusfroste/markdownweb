import type * as React from "react";
import { type Block, type DirectiveBlock, parseListItems } from "@/lib/markdown-web/parser";
import { renderMd, extractActionLinks, type ParsedLink } from "@/lib/markdown-web/inline";
import { Link } from "@tanstack/react-router";
import {
  StatsBlock,
  LogosBlock,
  TestimonialsBlock,
  FaqBlock,
  GalleryBlock,
  TimelineBlock,
  StepsBlock,
  TabsBlock,
  DividerBlock,
  SplitBlock,
} from "./blocks/extras";
import {
  getLayoutFamily,
  resolveVariant,
  type LayoutFamily,
} from "@/lib/mcp/layouts";

function ActionLink({ link, tone = "brutal" }: { link: ParsedLink; tone?: "brutal" | "soft" | "ghost" }) {
  const isExternal = link.href.startsWith("http");
  const isHash = link.href.startsWith("#");

  let cls = "";
  if (tone === "brutal") {
    cls =
      link.variant === "primary"
        ? "inline-flex items-center gap-2 bg-primary text-primary-foreground border-brutal shadow-brutal-sm px-6 py-3 font-bold uppercase tracking-wide hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        : "inline-flex items-center gap-2 bg-background text-foreground border-brutal px-6 py-3 font-bold uppercase tracking-wide hover:bg-secondary transition-colors";
  } else if (tone === "soft") {
    cls =
      link.variant === "primary"
        ? "inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/30"
        : "inline-flex items-center gap-2 bg-foreground/5 text-foreground rounded-full px-6 py-3 text-sm font-semibold hover:bg-foreground/10 transition-colors backdrop-blur-sm";
  } else {
    // ghost — editorial
    cls =
      link.variant === "primary"
        ? "inline-flex items-center gap-2 text-foreground border-b-2 border-foreground pb-1 text-base font-medium hover:gap-3 transition-all"
        : "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-base transition-colors";
  }

  if (isExternal || isHash) {
    return (
      <a href={link.href} className={cls} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener" : undefined}>
        {link.label}
        {tone === "ghost" && link.variant === "primary" && <span aria-hidden>→</span>}
      </a>
    );
  }
  return (
    <Link to={link.href} className={cls}>
      {link.label}
      {tone === "ghost" && link.variant === "primary" && <span aria-hidden>→</span>}
    </Link>
  );
}

/* ─────────── HERO variants ─────────── */

function HeroMarquee({ block }: { block: DirectiveBlock }) {
  const { links, rest } = extractActionLinks(block.body);
  const eyebrow = block.attrs.eyebrow as string | undefined;
  return (
    <section className="relative border-b-4 border-foreground bg-background bg-grid">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        {eyebrow && (
          <div className="inline-block bg-foreground text-background px-3 py-1 mb-8 font-mono text-xs uppercase tracking-widest">
            {eyebrow}
          </div>
        )}
        <div
          className="prose-md [&_h1]:text-5xl [&_h1]:md:text-7xl [&_h1]:font-display [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-sans [&_h2]:font-medium [&_h2]:text-muted-foreground [&_h2]:mb-6 [&_h2]:max-w-2xl [&_p]:mb-4 [&_p]:text-lg"
          dangerouslySetInnerHTML={renderMd(rest)}
        />
        {links.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-10">
            {links.map((l, i) => <ActionLink key={i} link={l} tone="brutal" />)}
          </div>
        )}
      </div>
      <div className="absolute top-8 right-8 w-24 h-24 bg-secondary border-brutal shadow-brutal hidden md:block rotate-12" />
      <div className="absolute bottom-8 right-32 w-12 h-12 bg-primary border-brutal hidden md:block" />
    </section>
  );
}

function HeroSplit({ block }: { block: DirectiveBlock }) {
  const { links, rest } = extractActionLinks(block.body);
  const eyebrow = block.attrs.eyebrow as string | undefined;
  const image = block.attrs.image as string | undefined;
  const imageAlt = (block.attrs.imageAlt as string) ?? "";
  return (
    <section className="relative overflow-hidden bg-background">
      {/* glow blobs */}
      <div
        className="pointer-events-none absolute -top-40 -right-32 w-[36rem] h-[36rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle at center, var(--primary), transparent 60%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle at center, var(--accent), transparent 60%)" }}
      />
      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          {eyebrow && (
            <div className="inline-flex items-center gap-2 rounded-full bg-foreground/5 backdrop-blur px-3 py-1 mb-6 text-xs font-medium text-foreground">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {eyebrow}
            </div>
          )}
          <div
            className="[&_h1]:text-4xl [&_h1]:md:text-6xl [&_h1]:font-display [&_h1]:tracking-tight [&_h1]:mb-5 [&_h1]:leading-[1.05] [&_h2]:text-lg [&_h2]:md:text-xl [&_h2]:text-muted-foreground [&_h2]:font-normal [&_h2]:mb-6 [&_h2]:max-w-xl [&_h2]:leading-relaxed [&_p]:text-lg [&_p]:text-muted-foreground [&_p]:max-w-xl [&_p]:mb-4"
            dangerouslySetInnerHTML={renderMd(rest)}
          />
          {links.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-8">
              {links.map((l, i) => <ActionLink key={i} link={l} tone="soft" />)}
            </div>
          )}
        </div>
        <div className="relative">
          <div
            className="absolute inset-0 -m-4 rounded-3xl opacity-60 blur-2xl"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
          />
          <div
            className="relative rounded-2xl overflow-hidden bg-card aspect-[4/5] md:aspect-[5/6]"
            style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.25)" }}
          >
            {image ? (
              <img src={image} alt={imageAlt} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="absolute inset-0 flex flex-col">
                {/* fake product chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-foreground/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
                </div>
                <div className="flex-1 p-5 grid grid-cols-3 gap-3">
                  <div className="col-span-2 rounded-lg bg-foreground/5 p-3 flex flex-col gap-2">
                    <div className="h-2 w-1/3 rounded-full bg-foreground/15" />
                    <div className="h-8 rounded bg-gradient-to-br from-primary/30 to-accent/30" />
                    <div className="h-2 w-2/3 rounded-full bg-foreground/15" />
                    <div className="h-2 w-1/2 rounded-full bg-foreground/10" />
                  </div>
                  <div className="rounded-lg bg-primary/15 p-3 flex flex-col justify-between">
                    <div className="h-2 w-2/3 rounded-full bg-primary/40" />
                    <div className="h-6 w-6 rounded-full bg-primary" />
                  </div>
                  <div className="col-span-3 rounded-lg bg-foreground/5 p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent/40" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-1/3 rounded-full bg-foreground/15" />
                      <div className="h-2 w-2/3 rounded-full bg-foreground/10" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* floating chip */}
          <div className="hidden md:flex absolute -top-4 -left-6 items-center gap-2 rounded-full bg-card px-3 py-2 text-xs font-medium shadow-lg border border-foreground/10">
            <span className="inline-block w-2 h-2 rounded-full bg-primary" />
            live
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCentered({ block }: { block: DirectiveBlock }) {
  const { links, rest } = extractActionLinks(block.body);
  const eyebrow = block.attrs.eyebrow as string | undefined;
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        {eyebrow && (
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">
            — {eyebrow} —
          </div>
        )}
        <div
          className="[&_h1]:text-5xl [&_h1]:md:text-7xl [&_h1]:font-display [&_h1]:font-normal [&_h1]:tracking-tight [&_h1]:leading-[1.05] [&_h1]:mb-6 [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-normal [&_h2]:text-muted-foreground [&_h2]:mb-8 [&_h2]:leading-relaxed [&_p]:text-lg [&_p]:text-muted-foreground [&_p]:max-w-2xl [&_p]:mx-auto [&_p]:mb-4 [&_p]:leading-relaxed"
          dangerouslySetInnerHTML={renderMd(rest)}
        />
        {links.length > 0 && (
          <div className="flex flex-wrap gap-6 justify-center mt-10">
            {links.map((l, i) => <ActionLink key={i} link={l} tone="ghost" />)}
          </div>
        )}
      </div>
      <div className="mx-auto max-w-xs h-px bg-foreground/15" />
    </section>
  );
}

function HeroBlock({ block, family }: { block: DirectiveBlock; family: LayoutFamily }) {
  const v = resolveVariant("hero", family, block.attrs.variant);
  if (v === "split") return <HeroSplit block={block} />;
  if (v === "centered") return <HeroCentered block={block} />;
  return <HeroMarquee block={block} />;
}

/* ─────────── FEATURES variants ─────────── */

function FeaturesGrid({ block }: { block: DirectiveBlock }) {
  const items = parseListItems(block.body);
  const cols = (block.attrs.columns as number) ?? 3;
  const title = block.attrs.title as string | undefined;
  return (
    <section className="border-b-4 border-foreground bg-secondary">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {title && <h2 className="text-4xl md:text-5xl mb-12">{title}</h2>}
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${Math.min(cols, items.length)}, minmax(0, 1fr))` }}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className="bg-background border-brutal shadow-brutal-sm p-6 hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              {it.icon && <div className="text-4xl mb-4">{it.icon}</div>}
              <h3 className="text-xl font-display mb-2">{it.title}</h3>
              {it.body && <p className="text-muted-foreground">{it.body}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesBento({ block }: { block: DirectiveBlock }) {
  const items = parseListItems(block.body);
  const title = block.attrs.title as string | undefined;
  // Bento spans repeat in cycles: big, small, small, wide, small, small …
  const spans = ["md:col-span-2 md:row-span-2", "", "", "md:col-span-2", "", ""];
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {title && (
          <h2 className="text-3xl md:text-5xl font-display tracking-tight mb-3">{title}</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 md:auto-rows-[minmax(180px,auto)] gap-4 mt-10">
          {items.map((it, i) => {
            const span = spans[i % spans.length];
            const isHero = i % spans.length === 0;
            return (
              <div
                key={i}
                className={[
                  "relative overflow-hidden rounded-2xl border border-foreground/10 p-6 group",
                  span,
                  isHero
                    ? "bg-gradient-to-br from-primary/15 via-accent/10 to-transparent"
                    : "bg-card hover:border-foreground/20",
                  "transition-all hover:-translate-y-0.5",
                ].join(" ")}
              >
                {isHero && (
                  <div
                    className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-40 blur-2xl"
                    style={{ background: "radial-gradient(circle, var(--primary), transparent 60%)" }}
                  />
                )}
                <div className="relative">
                  {it.icon && (
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/5 mb-4 text-xl">
                      {it.icon}
                    </div>
                  )}
                  <h3 className={`font-display tracking-tight ${isHero ? "text-2xl md:text-3xl" : "text-lg"} mb-2`}>
                    {it.title}
                  </h3>
                  {it.body && (
                    <p className={`${isHero ? "text-base" : "text-sm"} text-muted-foreground leading-relaxed`}>
                      {it.body}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturesZigzag({ block }: { block: DirectiveBlock }) {
  const items = parseListItems(block.body);
  const title = block.attrs.title as string | undefined;
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-5xl px-6 py-20">
        {title && (
          <h2 className="text-3xl md:text-5xl font-display tracking-tight mb-12 max-w-2xl">
            {title}
          </h2>
        )}
        <div className="space-y-16">
          {items.map((it, i) => {
            const reverse = i % 2 === 1;
            return (
              <div
                key={i}
                className={`grid md:grid-cols-2 gap-10 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="aspect-[5/4] rounded-lg bg-muted overflow-hidden flex items-center justify-center text-4xl">
                  {it.icon ?? "✦"}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
                    Chapter {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display tracking-tight mb-3">
                    {it.title}
                  </h3>
                  {it.body && (
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {it.body}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturesBlock({ block, family }: { block: DirectiveBlock; family: LayoutFamily }) {
  const v = resolveVariant("features", family, block.attrs.variant);
  if (v === "bento") return <FeaturesBento block={block} />;
  if (v === "zigzag") return <FeaturesZigzag block={block} />;
  return <FeaturesGrid block={block} />;
}

/* ─────────── CTA variants ─────────── */

function CtaBold({ block }: { block: DirectiveBlock }) {
  const { links, rest } = extractActionLinks(block.body);
  const bg = block.attrs.background === "primary" ? "bg-primary text-primary-foreground" : "bg-foreground text-background";
  return (
    <section className={`border-b-4 border-foreground ${bg}`}>
      <div className="mx-auto max-w-5xl px-6 py-24">
        <div className="[&_h1]:text-4xl [&_h1]:md:text-6xl [&_h1]:font-display [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-sans [&_h2]:font-medium [&_h2]:opacity-80 [&_h2]:mb-8">
          <div dangerouslySetInnerHTML={renderMd(rest)} />
        </div>
        {links.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-2">
            {links.map((l, i) => <ActionLink key={i} link={l} tone="brutal" />)}
          </div>
        )}
      </div>
    </section>
  );
}

function CtaBanner({ block }: { block: DirectiveBlock }) {
  const { links, rest } = extractActionLinks(block.body);
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 md:px-14 py-14 md:py-20"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--primary) 14%, var(--card)), color-mix(in oklab, var(--accent) 10%, var(--card)))",
            boxShadow: "0 40px 100px -30px color-mix(in oklab, var(--primary) 35%, transparent)",
          }}
        >
          <div
            className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--primary), transparent 60%)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--accent), transparent 60%)" }}
          />
          <div className="relative grid md:grid-cols-[1.5fr_auto] gap-8 items-center">
            <div className="[&_h1]:text-3xl [&_h1]:md:text-5xl [&_h1]:font-display [&_h1]:tracking-tight [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:md:text-xl [&_h2]:text-muted-foreground [&_h2]:font-normal [&_h2]:mb-0 [&_p]:text-muted-foreground [&_p]:text-base [&_p]:max-w-xl">
              <div dangerouslySetInnerHTML={renderMd(rest)} />
            </div>
            {links.length > 0 && (
              <div className="flex flex-wrap gap-3 md:justify-end">
                {links.map((l, i) => <ActionLink key={i} link={l} tone="soft" />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaInline({ block }: { block: DirectiveBlock }) {
  const { links, rest } = extractActionLinks(block.body);
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
          — Next chapter —
        </div>
        <div className="[&_h1]:text-3xl [&_h1]:md:text-5xl [&_h1]:font-display [&_h1]:font-normal [&_h1]:tracking-tight [&_h1]:leading-tight [&_h1]:mb-4 [&_h2]:text-lg [&_h2]:md:text-xl [&_h2]:text-muted-foreground [&_h2]:font-normal [&_h2]:mb-0 [&_p]:text-muted-foreground">
          <div dangerouslySetInnerHTML={renderMd(rest)} />
        </div>
        {links.length > 0 && (
          <div className="flex flex-wrap gap-6 mt-10 justify-center">
            {links.map((l, i) => <ActionLink key={i} link={l} tone="ghost" />)}
          </div>
        )}
      </div>
    </section>
  );
}

function CtaBlock({ block, family }: { block: DirectiveBlock; family: LayoutFamily }) {
  const v = resolveVariant("cta", family, block.attrs.variant);
  if (v === "banner") return <CtaBanner block={block} />;
  if (v === "inline") return <CtaInline block={block} />;
  return <CtaBold block={block} />;
}

/* ─────────── unchanged blocks ─────────── */

function QuoteBlock({ block }: { block: DirectiveBlock }) {
  return (
    <section className="border-b-4 border-foreground bg-background">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="text-7xl font-display text-primary leading-none mb-4">"</div>
        <blockquote className="text-2xl md:text-3xl font-display leading-tight mb-6">
          {block.body.trim()}
        </blockquote>
        {block.attrs.author && (
          <div className="font-mono text-sm uppercase tracking-widest">
            — {block.attrs.author as string}
            {block.attrs.role && <span className="text-muted-foreground">, {block.attrs.role as string}</span>}
          </div>
        )}
      </div>
    </section>
  );
}

function NavBlock({ block }: { block: DirectiveBlock }) {
  const brand = (block.attrs.brand as string) ?? "Site";
  const items = block.body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("-"))
    .map((l) => {
      const m = /^-\s*(.+?)\s*(?:→|->|\|)\s*(.+)$/.exec(l);
      if (!m) return null;
      return { label: m[1], href: m[2] };
    })
    .filter((x): x is { label: string; href: string } => x !== null);
  return (
    <nav className="border-b-4 border-foreground bg-background sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl flex items-center gap-2 hover:opacity-80">
          <span className="inline-block w-3 h-3 bg-primary border-2 border-foreground" />
          {brand}
        </Link>
        <div className="flex items-center gap-2 md:gap-4 font-mono text-xs md:text-sm uppercase tracking-wider">
          {items.map((it, i) => {
            const isExternal = it.href.startsWith("http");
            const isHash = it.href.startsWith("#");
            if (isExternal) {
              return (
                <a key={i} href={it.href} target="_blank" rel="noopener" className="hover:bg-secondary px-2 py-1">
                  {it.label} ↗
                </a>
              );
            }
            if (isHash) {
              return (
                <a key={i} href={it.href} className="hover:bg-secondary px-2 py-1">
                  {it.label}
                </a>
              );
            }
            return (
              <Link
                key={i}
                to={it.href}
                className="hover:bg-secondary px-2 py-1"
                activeProps={{ className: "bg-foreground text-background px-2 py-1" }}
                activeOptions={{ exact: true }}
              >
                {it.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function FooterBlock({ block }: { block: DirectiveBlock }) {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-8 font-mono text-sm">
        <div dangerouslySetInnerHTML={renderMd(block.body)} />
      </div>
    </footer>
  );
}

function MarkdownProse({ md }: { md: string }) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 [&_h1]:text-4xl [&_h1]:font-display [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-display [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1 [&_li]:leading-relaxed [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_pre]:relative [&_pre]:bg-foreground [&_pre]:text-background [&_pre]:border-brutal [&_pre]:shadow-brutal-sm [&_pre]:p-5 [&_pre]:pt-9 [&_pre]:overflow-x-auto [&_pre]:my-6 [&_pre]:before:content-['MARKDOWN_SOURCE'] [&_pre]:before:absolute [&_pre]:before:top-0 [&_pre]:before:left-0 [&_pre]:before:bg-primary [&_pre]:before:text-primary-foreground [&_pre]:before:px-3 [&_pre]:before:py-1 [&_pre]:before:font-mono [&_pre]:before:text-[10px] [&_pre]:before:uppercase [&_pre]:before:tracking-widest [&_pre_code]:bg-transparent [&_pre_code]:text-background [&_pre_code]:p-0 [&_pre_code]:text-sm">
        <div dangerouslySetInnerHTML={renderMd(md)} />
      </div>
    </section>
  );
}

function PricingBlock({ block }: { block: DirectiveBlock }) {
  const plans = parseListItems(block.body);
  const title = block.attrs.title as string | undefined;
  const subtitle = block.attrs.subtitle as string | undefined;
  const colsAttr = block.attrs.columns as number | undefined;
  const cols = colsAttr ?? (plans.length > 0 ? plans.length : 3);

  return (
    <section className="border-b-4 border-foreground bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && <h2 className="text-4xl md:text-5xl mb-3">{title}</h2>}
            {subtitle && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
          </div>
        )}
        <div
          className="grid gap-6 md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
          style={{ ["--cols" as string]: Math.min(cols, plans.length) }}
        >
          {plans.map((plan, i) => {
            const featured = String(plan.featured ?? "") === "true";
            const features = String(plan.features ?? "")
              .split("|")
              .map((f) => f.trim())
              .filter(Boolean);
            const ctaHref = String(plan.ctaHref ?? plan.href ?? "#");
            const ctaLabel = String(plan.cta ?? "Choose plan");
            const isExternal = ctaHref.startsWith("http");
            return (
              <div
                key={i}
                className={[
                  "border-brutal p-8 flex flex-col",
                  featured
                    ? "bg-primary text-primary-foreground shadow-brutal-lg md:-translate-y-2"
                    : "bg-background shadow-brutal-sm hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1 transition-all",
                ].join(" ")}
              >
                {featured && (
                  <div className="inline-block self-start bg-foreground text-background px-2 py-1 mb-4 font-mono text-xs uppercase tracking-widest">
                    {String(plan.badge ?? "Most popular")}
                  </div>
                )}
                <h3 className="text-2xl font-display mb-1">{plan.name ?? plan.title}</h3>
                {plan.tagline && (
                  <p className={`text-sm mb-6 ${featured ? "opacity-80" : "text-muted-foreground"}`}>
                    {plan.tagline}
                  </p>
                )}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-display">{plan.price}</span>
                  {plan.period && (
                    <span className={`text-sm font-mono ${featured ? "opacity-70" : "text-muted-foreground"}`}>
                      /{plan.period}
                    </span>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <span className={`font-bold ${featured ? "text-secondary" : "text-primary"}`}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={ctaHref}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener" : undefined}
                  className={[
                    "inline-flex items-center justify-center gap-2 border-brutal px-6 py-3 font-bold uppercase tracking-wide transition-all",
                    featured
                      ? "bg-background text-foreground hover:bg-secondary"
                      : "bg-primary text-primary-foreground shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
                  ].join(" ")}
                >
                  {ctaLabel}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BlockRenderer({
  blocks,
  idPrefix,
  layoutFamily,
}: {
  blocks: Block[];
  idPrefix?: string;
  /** Slug of the layout family that decides each block's default variant. */
  layoutFamily?: string;
}) {
  const family = getLayoutFamily(layoutFamily);

  const wrap = (i: number, node: React.ReactNode) => {
    if (!idPrefix) return node;
    return (
      <div
        key={i}
        id={`${idPrefix}${i}`}
        data-mw-block-index={i}
        className="scroll-mt-16"
      >
        {node}
      </div>
    );
  };

  return (
    <div className={`mw-fam-${family.slug}`}>
      {blocks.map((b, i) => {
        let node: React.ReactNode;
        if (b.kind === "markdown") {
          node = <MarkdownProse md={b.body} />;
        } else {
          switch (b.name) {
            case "nav": node = <NavBlock block={b} />; break;
            case "hero": node = <HeroBlock block={b} family={family} />; break;
            case "features": node = <FeaturesBlock block={b} family={family} />; break;
            case "pricing": node = <PricingBlock block={b} />; break;
            case "quote": node = <QuoteBlock block={b} />; break;
            case "cta": node = <CtaBlock block={b} family={family} />; break;
            case "footer": node = <FooterBlock block={b} />; break;
            case "stats": node = <StatsBlock block={b} />; break;
            case "logos": node = <LogosBlock block={b} />; break;
            case "testimonials": node = <TestimonialsBlock block={b} />; break;
            case "faq": node = <FaqBlock block={b} />; break;
            case "gallery": node = <GalleryBlock block={b} />; break;
            case "timeline": node = <TimelineBlock block={b} />; break;
            case "steps": node = <StepsBlock block={b} />; break;
            case "tabs": node = <TabsBlock block={b} />; break;
            case "divider": node = <DividerBlock block={b} />; break;
            case "split": node = <SplitBlock block={b} />; break;
            default:
              node = (
                <div className="border-brutal bg-destructive/10 p-4 m-6 font-mono text-sm">
                  Unknown block: <strong>::{b.name}::</strong>
                </div>
              );
          }
        }
        if (idPrefix) return wrap(i, node);
        return <div key={i}>{node}</div>;
      })}
    </div>
  );
}
