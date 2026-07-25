import { useState, type FormEvent } from "react";
import { type DirectiveBlock, parseListItems } from "@/lib/markdown-web/parser";
import { renderMd } from "@/lib/markdown-web/inline";

export function StatsBlock({ block }: { block: DirectiveBlock }) {
  const items = parseListItems(block.body);
  const title = block.attrs.title as string | undefined;
  return (
    <section className="border-b-4 border-foreground bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {title && <h2 className="text-3xl md:text-4xl font-display mb-10">{title}</h2>}
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))` }}
        >
          {items.map((it, i) => (
            <div key={i} className="border-brutal bg-secondary p-6">
              <div className="text-5xl md:text-6xl font-display text-primary leading-none mb-2">{it.value}</div>
              <div className="font-mono text-xs uppercase tracking-widest">{it.label ?? it.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LogosBlock({ block }: { block: DirectiveBlock }) {
  const items = parseListItems(block.body);
  const title = block.attrs.title as string | undefined;
  return (
    <section className="border-b-4 border-foreground bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {title && (
          <div className="font-mono text-xs uppercase tracking-widest text-center mb-8 text-muted-foreground">
            {title}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-8">
          {items.map((it, i) => (
            <div
              key={i}
              className="border-brutal bg-background px-6 py-3 font-display text-xl hover:bg-secondary transition-colors"
            >
              {it.name ?? it.title}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsBlock({ block }: { block: DirectiveBlock }) {
  const items = parseListItems(block.body);
  const title = block.attrs.title as string | undefined;
  return (
    <section className="border-b-4 border-foreground bg-secondary">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {title && <h2 className="text-3xl md:text-4xl font-display mb-10">{title}</h2>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => {
            const author = String(it.author ?? "");
            const initials = author
              .split(/\s+/)
              .map((p) => p[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase();
            const avatar = it.avatar as string | undefined;
            return (
              <figure
                key={i}
                className="border-brutal bg-background shadow-brutal-sm p-6 flex flex-col hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1 transition-all"
              >
                <blockquote className="text-base leading-relaxed mb-6 flex-1">
                  "{it.quote ?? it.body}"
                </blockquote>
                <figcaption className="flex items-center gap-3 pt-4 border-t-4 border-foreground">
                  <div className="w-12 h-12 border-brutal bg-primary text-primary-foreground flex items-center justify-center overflow-hidden shrink-0">
                    {avatar ? (
                      <img src={String(avatar)} alt={author} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="font-display text-lg">{initials || "?"}</span>
                    )}
                  </div>
                  <div className="font-mono text-xs uppercase tracking-widest leading-tight">
                    <div>{author}</div>
                    {it.role && <div className="text-muted-foreground normal-case tracking-normal font-sans text-xs mt-0.5">{String(it.role)}</div>}
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FaqBlock({ block }: { block: DirectiveBlock }) {
  const items = parseListItems(block.body);
  const title = block.attrs.title as string | undefined;
  return (
    <section className="border-b-4 border-foreground bg-background">
      <div className="mx-auto max-w-3xl px-6 py-20">
        {title && <h2 className="text-3xl md:text-4xl font-display mb-10">{title}</h2>}
        <div className="space-y-4">
          {items.map((it, i) => (
            <details key={i} className="border-brutal bg-background group">
              <summary className="cursor-pointer p-4 font-display text-lg flex items-center justify-between list-none">
                <span>{it.q ?? it.question ?? it.title}</span>
                <span className="text-2xl font-mono group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div
                className="px-4 pb-4 text-muted-foreground"
                dangerouslySetInnerHTML={renderMd(String(it.a ?? it.answer ?? it.body ?? ""))}
              />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GalleryBlock({ block }: { block: DirectiveBlock }) {
  const items = parseListItems(block.body);
  const cols = (block.attrs.columns as number) ?? 3;
  const title = block.attrs.title as string | undefined;
  return (
    <section className="border-b-4 border-foreground bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {title && <h2 className="text-3xl md:text-4xl font-display mb-10">{title}</h2>}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(cols, items.length)}, minmax(0, 1fr))` }}
        >
          {items.map((it, i) => (
            <figure key={i} className="border-brutal bg-secondary overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {it.src ? (
                  <img src={String(it.src)} alt={String(it.alt ?? "")} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono text-xs uppercase text-muted-foreground">{it.alt ?? "image"}</span>
                )}
              </div>
              {it.caption && (
                <figcaption className="px-3 py-2 font-mono text-xs uppercase tracking-wider border-t-4 border-foreground">
                  {it.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TimelineBlock({ block }: { block: DirectiveBlock }) {
  const items = parseListItems(block.body);
  const title = block.attrs.title as string | undefined;
  return (
    <section className="border-b-4 border-foreground bg-background">
      <div className="mx-auto max-w-3xl px-6 py-20">
        {title && <h2 className="text-3xl md:text-4xl font-display mb-10">{title}</h2>}
        <ol className="relative border-l-4 border-foreground pl-8 space-y-10">
          {items.map((it, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[42px] w-5 h-5 bg-primary border-brutal" />
              {it.date && (
                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  {it.date}
                </div>
              )}
              <h3 className="font-display text-xl mb-1">{it.title}</h3>
              {it.body && <p className="text-muted-foreground">{it.body}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function StepsBlock({ block }: { block: DirectiveBlock }) {
  const items = parseListItems(block.body);
  const title = block.attrs.title as string | undefined;
  return (
    <section className="border-b-4 border-foreground bg-secondary">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {title && <h2 className="text-3xl md:text-4xl font-display mb-10">{title}</h2>}
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))` }}
        >
          {items.map((it, i) => (
            <div key={i} className="border-brutal bg-background shadow-brutal-sm p-6">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground border-brutal font-display text-xl mb-4">
                {i + 1}
              </div>
              <h3 className="font-display text-lg mb-2">{it.title}</h3>
              {it.body && <p className="text-sm text-muted-foreground">{it.body}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TabsBlock({ block }: { block: DirectiveBlock }) {
  const items = parseListItems(block.body);
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];
  return (
    <section className="border-b-4 border-foreground bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="border-brutal bg-background">
          <div className="flex border-b-4 border-foreground overflow-x-auto">
            {items.map((it, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`px-5 py-3 font-mono text-xs uppercase tracking-widest border-r-4 border-foreground last:border-r-0 transition-colors ${
                  i === active
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-secondary"
                }`}
              >
                {it.label ?? it.title}
              </button>
            ))}
          </div>
          <div
            className="p-6 [&_p]:mb-3 [&_strong]:bg-secondary [&_strong]:px-1 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm"
            dangerouslySetInnerHTML={renderMd(String(current?.body ?? current?.content ?? ""))}
          />
        </div>
      </div>
    </section>
  );
}

export function SplitBlock({ block }: { block: DirectiveBlock }) {
  const image = block.attrs.image as string | undefined;
  const imageAlt = (block.attrs.imageAlt as string) ?? "";
  const imageHref = block.attrs.imageHref as string | undefined;
  const imageCredit = block.attrs.imageCredit as string | undefined;
  const reverse = String(block.attrs.reverse ?? "") === "true";
  const bg = block.attrs.background === "secondary" ? "bg-secondary" : "bg-background";
  const eyebrow = block.attrs.eyebrow as string | undefined;

  const ImageSide = (
    <div className="relative">
      <div className="border-brutal shadow-brutal overflow-hidden bg-muted aspect-[4/3]">
        {image ? (
          <img src={image} alt={imageAlt} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
            no image
          </div>
        )}
      </div>
      {(imageHref || imageCredit) && (
        <div className="absolute -bottom-3 -right-3 bg-foreground text-background border-brutal px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
          {imageHref ? (
            <a href={imageHref} target="_blank" rel="noopener" className="hover:text-primary">
              {imageCredit ?? "stock photo ↗"}
            </a>
          ) : (
            imageCredit
          )}
        </div>
      )}
    </div>
  );

  const TextSide = (
    <div className="[&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:font-display [&_h2]:mb-4 [&_h3]:font-display [&_h3]:text-xl [&_h3]:mb-2 [&_p]:text-muted-foreground [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_strong]:bg-secondary [&_strong]:px-1">
      {eyebrow && (
        <div className="inline-block bg-foreground text-background px-3 py-1 mb-6 font-mono text-xs uppercase tracking-widest">
          {eyebrow}
        </div>
      )}
      <div dangerouslySetInnerHTML={renderMd(block.body)} />
    </div>
  );

  return (
    <section className={`border-b-4 border-foreground ${bg}`}>
      <div className="mx-auto max-w-6xl px-6 py-20 grid gap-12 md:grid-cols-2 items-center">
        {reverse ? (
          <>
            {TextSide}
            {ImageSide}
          </>
        ) : (
          <>
            {ImageSide}
            {TextSide}
          </>
        )}
      </div>
    </section>
  );
}

export function DividerBlock({ block }: { block: DirectiveBlock }) {
  const label = block.attrs.label as string | undefined;
  return (
    <div className="border-b-4 border-foreground bg-background">
      <div className="mx-auto max-w-6xl px-6 py-6 flex items-center gap-4">
        <div className="flex-1 h-1 bg-foreground" />
        {label && (
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        )}
        <div className="flex-1 h-1 bg-foreground" />
      </div>
    </div>
  );
}

/* ─────────── NEWSLETTER ─────────── */

export function NewsletterBlock({ block }: { block: DirectiveBlock }) {
  const action = block.attrs.action as string | undefined;
  const placeholder = (block.attrs.placeholder as string) ?? "you@example.com";
  const cta = (block.attrs.cta as string) ?? "Subscribe";
  // If no action, degrade to a mailto: link on submit — still functional without JS.
  const isMailto = !action;
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div
          className="relative overflow-hidden rounded-3xl border border-foreground/10 px-8 md:px-12 py-12 md:py-16 text-center"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--primary) 10%, var(--card)), var(--card))",
          }}
        >
          <div
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--primary), transparent 60%)" }}
          />
          <div
            className="relative [&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:font-display [&_h1]:tracking-tight [&_h1]:mb-3 [&_h2]:text-base [&_h2]:md:text-lg [&_h2]:text-muted-foreground [&_h2]:font-normal [&_h2]:mb-8 [&_p]:text-muted-foreground [&_p]:mb-6"
            dangerouslySetInnerHTML={renderMd(block.body.replace(/\[.*?\]\(.*?\)(\{.*?\})?/g, ""))}
          />
          <form
            action={action}
            method={isMailto ? undefined : "post"}
            className="relative flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            {...(isMailto ? { onSubmit: (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const el = (e.currentTarget.elements.namedItem("email") as HTMLInputElement | null); if (el?.value) window.location.href = `mailto:?subject=Subscribe&body=${encodeURIComponent(el.value)}`; } } : {})}
          >
            <input
              type="email"
              name="email"
              required
              maxLength={255}
              placeholder={placeholder}
              className="flex-1 rounded-full bg-background border border-foreground/15 px-5 py-3 text-sm outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {cta}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ─────────── COMPARE (feature matrix) ─────────── */

export function CompareBlock({ block }: { block: DirectiveBlock }) {
  const title = block.attrs.title as string | undefined;
  const subtitle = block.attrs.subtitle as string | undefined;
  const highlight = typeof block.attrs.highlight === "number" ? block.attrs.highlight : 0;

  // Parse rows from list items: split each on " | " for cells.
  const rows = block.body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("-"))
    .map((l) => l.replace(/^-\s*/, "").split("|").map((c) => c.trim()));

  if (rows.length === 0) return null;
  const [header, ...body] = rows;

  const cellCls = (colIdx: number) =>
    colIdx === highlight - 1
      ? "bg-primary/5 border-x border-primary/20"
      : "";

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-5xl px-6">
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && <h2 className="text-3xl md:text-5xl font-display tracking-tight mb-3">{title}</h2>}
            {subtitle && <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>}
          </div>
        )}
        <div className="overflow-x-auto rounded-2xl border border-foreground/10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-foreground/5">
                {header.map((h, i) => (
                  <th
                    key={i}
                    className={`px-6 py-4 text-sm font-semibold ${cellCls(i)}`}
                    dangerouslySetInnerHTML={renderMd(h)}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className="border-t border-foreground/10">
                  {row.map((cell, ci) => {
                    const isBool = cell === "✓" || cell === "✗" || cell === "—";
                    const toneCls = cell === "✓" ? "text-primary font-bold" : cell === "✗" ? "text-muted-foreground/50" : "";
                    return (
                      <td
                        key={ci}
                        className={`px-6 py-4 text-sm ${cellCls(ci)} ${isBool ? `text-center text-lg ${toneCls}` : ci === 0 ? "font-medium" : "text-muted-foreground"}`}
                        dangerouslySetInnerHTML={renderMd(cell)}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ─────────── VIDEO ─────────── */

function embedUrl(src: string): { type: "iframe" | "video"; url: string } | null {
  try {
    if (/\.(mp4|webm|mov)(\?|$)/i.test(src)) return { type: "video", url: src };
    // YouTube
    const yt = src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
    if (yt) return { type: "iframe", url: `https://www.youtube.com/embed/${yt[1]}` };
    // Vimeo
    const vm = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return { type: "iframe", url: `https://player.vimeo.com/video/${vm[1]}` };
    // Fallback: iframe the raw URL
    return { type: "iframe", url: src };
  } catch {
    return null;
  }
}

export function VideoBlock({ block }: { block: DirectiveBlock }) {
  const src = block.attrs.src as string | undefined;
  const title = block.attrs.title as string | undefined;
  const poster = block.attrs.poster as string | undefined;
  const aspect = (block.attrs.aspect as string) ?? "16/9";
  if (!src) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-6 text-sm text-muted-foreground">
        ::video needs a <code>src</code> attribute.
      </div>
    );
  }
  const embed = embedUrl(src);
  if (!embed) return null;

  return (
    <section className="bg-background py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div
          className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-black"
          style={{ aspectRatio: aspect, boxShadow: "0 30px 80px -20px rgba(0,0,0,0.35)" }}
        >
          {embed.type === "iframe" ? (
            <iframe
              src={embed.url}
              title={title ?? "Video"}
              className="absolute inset-0 w-full h-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={embed.url}
              poster={poster}
              controls
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
        {title && (
          <div className="text-center text-sm text-muted-foreground mt-4">{title}</div>
        )}
      </div>
    </section>
  );
}

/* ─────────── CODE (syntax + copy) ─────────── */

export function CodeBlock({ block }: { block: DirectiveBlock }) {
  const lang = (block.attrs.lang as string) ?? "";
  const title = block.attrs.title as string | undefined;
  const code = block.body.replace(/^\n+|\n+$/g, "");
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="bg-background py-8">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-2xl overflow-hidden border border-foreground/10 bg-[#0d1117] text-[#e6edf3]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              {title && (
                <span className="font-mono text-xs text-white/70 truncate">{title}</span>
              )}
              {lang && !title && (
                <span className="font-mono text-xs text-white/50 uppercase tracking-wider">{lang}</span>
              )}
            </div>
            <button
              type="button"
              onClick={onCopy}
              className="font-mono text-xs text-white/60 hover:text-white transition-colors px-2 py-1 rounded"
            >
              {copied ? "copied ✓" : "copy"}
            </button>
          </div>
          <pre className="p-5 overflow-x-auto text-sm leading-relaxed font-mono">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
