import { useState } from "react";
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
          {items.map((it, i) => (
            <figure key={i} className="border-brutal bg-background shadow-brutal-sm p-6 flex flex-col">
              <blockquote className="text-base mb-6 flex-1">"{it.quote ?? it.body}"</blockquote>
              <figcaption className="font-mono text-xs uppercase tracking-widest">
                — {it.author}
                {it.role && <span className="text-muted-foreground">, {it.role}</span>}
              </figcaption>
            </figure>
          ))}
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
