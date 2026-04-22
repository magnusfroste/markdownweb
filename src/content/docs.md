---
title: "MarkdownWeb — Docs & Block Reference"
description: "Alla blocktyper med exempel. Skriv din sajt i markdown med frontmatter och MDC-direktiv."
---

::nav{brand="MarkdownWeb"}
- Hem → /
- Docs → /docs
- GitHub → https://github.com
::

::hero{eyebrow="Docs · v0.1"}
# Block-referens
## Frontmatter + MDC-direktiv. Inga JSX-imports, inga byggsteg. Bara `.md`.
::

# Syntax i två minuter

Varje sida är en `.md`-fil. Toppen är **YAML-frontmatter** (titel, meta, tema). Resten är vanlig markdown blandat med **MDC-direktiv** — `::name{attrs}` … `::`.

```md
---
title: "Min sajt"
description: "Skriven i markdown."
---

::hero{eyebrow="v1"}
# Stor rubrik
## Underrubrik

[Kom igång](/start){.primary}
::
```

Inuti ett direktiv är innehållet **vanlig markdown**. Listor (`- key: value`) tolkas som strukturerad data när blocket vill ha det (t.ex. `features`, `pricing`).

## Standard vi följer

- **Frontmatter:** YAML mellan `---`-rader. Samma som Jekyll, Hugo, Astro, Next.
- **Direktiv:** [MDC](https://content.nuxt.com/docs/files/markdown) (Markdown Components) — Nuxt Content's syntax. Också nära `remark-directive` / MDX directive proposal.
- **Inline:** standard CommonMark + GFM (länkar, **fet**, `kod`, listor).

Vi valde **inte** full MDX — det kräver JSX-kompilator och bryter "any LLM kan editera". MDC ger 90% av nyttan med 10% av komplexiteten.

::divider{label="Block reference"}
::

::hero{eyebrow="01 · hero"}
# Hero-block
## Stor rubrik, valfri underrubrik och CTA-knappar via markdown-länkar.

[Primär](/start){.primary} [Sekundär](#){.ghost}
::

```md
::hero{eyebrow="v1"}
# Rubrik
## Underrubrik

[CTA](/x){.primary} [Mer](#){.ghost}
::
```

::features{columns=3 title="02 · features"}
- icon: ⚡
  title: Snabbt
  body: En .md-fil renderar direkt utan byggsteg.
- icon: 🧱
  title: Komponerbart
  body: Blanda direktiv-block med vanlig markdown.
- icon: 🔍
  title: Sökbart
  body: Plain text — git diff, grep, LLM, allt funkar.
::

```md
::features{columns=3 title="Varför?"}
- icon: ⚡
  title: Snabbt
  body: Beskrivning här.
::
```

::stats{title="03 · stats"}
- value: 100%
  label: Markdown
- value: 0
  label: Build steps
- value: ∞
  label: LLM-friendly
- value: 9
  label: Block types
::

```md
::stats{title="Siffror"}
- value: 100%
  label: Markdown
- value: 0
  label: Build steps
::
```

::logos{title="04 · logos — used by"}
- name: Acme
- name: Globex
- name: Initech
- name: Umbrella
- name: Stark
::

```md
::logos{title="Used by"}
- name: Acme
- name: Globex
::
```

::testimonials{title="05 · testimonials"}
- quote: Äntligen en CMS som inte är en CMS.
  author: Ada L.
  role: Indie hacker
- quote: Min LLM editar sajten direkt. Galet.
  author: Linus T.
  role: Founder
- quote: Git blame på copy. Drömläge.
  author: Grace H.
  role: Tech writer
::

```md
::testimonials{title="Vad folk säger"}
- quote: Citatet här.
  author: Namn
  role: Titel
::
```

::pricing{title="06 · pricing" columns=3}
- name: Free
  price: $0
  period: mån
  features: 1 sajt | Subdomain | Community
  cta: Starta
  ctaHref: /signup
- name: Pro
  price: $19
  period: mån
  featured: "true"
  features: Allt i Free | Custom domain | AI-edit
  cta: Prova gratis
  ctaHref: /signup
- name: Team
  price: $79
  period: mån
  features: Allt i Pro | Collaboration | SLA
  cta: Kontakt
  ctaHref: /contact
::

```md
::pricing{title="Priser" columns=3}
- name: Pro
  price: $19
  period: mån
  featured: "true"
  features: A | B | C
  cta: Kom igång
  ctaHref: /signup
::
```

::quote{author="Donald Knuth" role="Literate Programming"}
Programs are meant to be read by humans and only incidentally for computers to execute.
::

```md
::quote{author="Namn" role="Titel"}
Citatet här.
::
```

::faq{title="07 · faq"}
- q: Måste jag lära mig MDX?
  a: Nej. Bara markdown + `::direktiv::`-block. Ingen JSX.
- q: Kan jag redigera sajten med en LLM?
  a: Ja — det är hela poängen. Säg "lägg till en pricing-sektion" och få tillbaka markdown.
- q: Kan jag styla själv?
  a: Temat är globalt (här Brutalist Pop). Block ärver tokens från `styles.css`.
::

```md
::faq{title="Vanliga frågor"}
- q: Frågan?
  a: Svaret med **markdown**.
::
```

::gallery{columns=3 title="08 · gallery"}
- alt: Brutal grid 1
  caption: 01 · grid
- alt: Brutal grid 2
  caption: 02 · stack
- alt: Brutal grid 3
  caption: 03 · void
::

```md
::gallery{columns=3 title="Galleri"}
- src: /img/a.jpg
  alt: Beskrivning
  caption: Bildtext
::
```

::timeline{title="09 · timeline"}
- date: 2026-04
  title: MVP
  body: Renderare, hero, features, pricing.
- date: 2026-05
  title: Multi-page
  body: Flera .md-filer som routes.
- date: 2026-06
  title: AI-edit
  body: Inline LLM-redigering av källan.
::

```md
::timeline{title="Roadmap"}
- date: 2026-04
  title: MVP
  body: Beskrivning.
::
```

::steps{title="10 · steps"}
- title: Skriv markdown
  body: Öppna .md-filen och redigera fritt.
- title: Lägg till block
  body: Använd ::direktiv:: för struktur.
- title: Publicera
  body: Pusha till git, sajten byggs.
::

```md
::steps{title="Hur det funkar"}
- title: Steg ett
  body: Beskrivning.
::
```

::tabs
- label: Install
  body: |
    Klona repot och kör `npm install`. Sen `npm run dev`.
- label: Deploy
  body: |
    Pusha till main. Auto-deploy via Lovable Cloud.
::

```md
::tabs
- label: Tab 1
  body: |
    Innehåll med **markdown**.
- label: Tab 2
  body: |
    Annat innehåll.
::
```

::divider{label="layout helpers"}
::

```md
::divider{label="Sektion"}
::
```

::cta{background="primary"}
# Redo att skriva din sajt i markdown?
## En .md-fil. Inga steg. Bara push.

[Klona repot](https://github.com){.primary} [Tillbaka hem](/){.ghost}
::

::footer
© 2026 MarkdownWeb · Skrivet i `docs.md`
::
