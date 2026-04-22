import { type Block, type DirectiveBlock, parseListItems } from "@/lib/markdown-web/parser";
import { renderMd, extractActionLinks, type ParsedLink } from "@/lib/markdown-web/inline";
import { Link } from "@tanstack/react-router";

function ActionLink({ link }: { link: ParsedLink }) {
  const isExternal = link.href.startsWith("http");
  const isHash = link.href.startsWith("#");
  const cls =
    link.variant === "primary"
      ? "inline-flex items-center gap-2 bg-primary text-primary-foreground border-brutal shadow-brutal-sm px-6 py-3 font-bold uppercase tracking-wide hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
      : "inline-flex items-center gap-2 bg-background text-foreground border-brutal px-6 py-3 font-bold uppercase tracking-wide hover:bg-secondary transition-colors";

  if (isExternal || isHash) {
    return (
      <a href={link.href} className={cls} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener" : undefined}>
        {link.label}
      </a>
    );
  }
  return (
    <Link to={link.href} className={cls}>
      {link.label}
    </Link>
  );
}

function Prose({ md }: { md: string }) {
  return (
    <div
      className="prose-md [&_h1]:text-5xl [&_h1]:md:text-7xl [&_h1]:font-display [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-sans [&_h2]:font-medium [&_h2]:text-muted-foreground [&_h2]:mb-6 [&_h2]:max-w-2xl [&_p]:mb-4 [&_p]:text-lg [&_strong]:bg-secondary [&_strong]:px-2 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_a]:underline [&_a]:underline-offset-4"
      dangerouslySetInnerHTML={renderMd(md)}
    />
  );
}

function HeroBlock({ block }: { block: DirectiveBlock }) {
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
        <Prose md={rest} />
        {links.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-10">
            {links.map((l, i) => <ActionLink key={i} link={l} />)}
          </div>
        )}
      </div>
      <div className="absolute top-8 right-8 w-24 h-24 bg-secondary border-brutal shadow-brutal hidden md:block rotate-12" />
      <div className="absolute bottom-8 right-32 w-12 h-12 bg-primary border-brutal hidden md:block" />
    </section>
  );
}

function FeaturesBlock({ block }: { block: DirectiveBlock }) {
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

function CtaBlock({ block }: { block: DirectiveBlock }) {
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
            {links.map((l, i) => <ActionLink key={i} link={l} />)}
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
        <div className="font-display text-xl flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-primary border-2 border-foreground" />
          {brand}
        </div>
        <div className="flex items-center gap-6 font-mono text-sm uppercase tracking-wider">
          {items.map((it, i) => (
            <a key={i} href={it.href} className="hover:bg-secondary px-2 py-1">
              {it.label}
            </a>
          ))}
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
      <div className="mx-auto max-w-3xl px-6 py-12 [&_h1]:text-4xl [&_h1]:font-display [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-display [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:underline">
        <div dangerouslySetInnerHTML={renderMd(md)} />
      </div>
    </section>
  );
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === "markdown") return <MarkdownProse key={i} md={b.body} />;
        switch (b.name) {
          case "nav": return <NavBlock key={i} block={b} />;
          case "hero": return <HeroBlock key={i} block={b} />;
          case "features": return <FeaturesBlock key={i} block={b} />;
          case "quote": return <QuoteBlock key={i} block={b} />;
          case "cta": return <CtaBlock key={i} block={b} />;
          case "footer": return <FooterBlock key={i} block={b} />;
          default:
            return (
              <div key={i} className="border-brutal bg-destructive/10 p-4 m-6 font-mono text-sm">
                Unknown block: <strong>::{b.name}::</strong>
              </div>
            );
        }
      })}
    </>
  );
}
