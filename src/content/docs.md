---
title: "MarkdownWeb — Docs & Block Reference"
description: "Every block type with live examples. Write your site in markdown with frontmatter and MDC directives."
---

::nav{brand="MarkdownWeb"}
- Home → /
- Docs → /docs
- GitHub → https://github.com/lovable-dev/markdownweb
::

::hero{eyebrow="Docs · v0.1"}
# Block reference
## Frontmatter + MDC directives. No JSX imports, no build step. Just `.md`.
::

# Syntax in two minutes

Every page is a `.md` file. The top is **YAML frontmatter** (title, meta, theme). The rest is regular markdown mixed with **MDC directives** — `::name{attrs}` … `::`.

```md
---
title: "My site"
description: "Written in markdown."
---

::hero{eyebrow="v1"}
# Big headline
# # Subheadline

[Get started](/start){.primary}
::
```

Inside a directive, the content is **plain markdown**. Lists (`- key: value`) are parsed as structured data when the block expects it (e.g. `features`, `pricing`).

## Standards we follow

- **Frontmatter:** YAML between `---` lines. Same as Jekyll, Hugo, Astro, Next.
- **Directives:** [MDC](https://content.nuxt.com/docs/files/markdown) (Markdown Components) — Nuxt Content's syntax. Close to `remark-directive` / the MDX directive proposal.
- **Inline:** standard CommonMark + GFM (links, **bold**, `code`, lists).

We **did not** choose full MDX — it requires a JSX compiler and breaks "any LLM can edit it". MDC gives 90% of the value at 10% of the complexity.

::divider{label="Block reference — preview, then source"}
::

::hero{eyebrow="01 · hero"}
# Hero block
## Big headline, optional subheadline, and CTA buttons via markdown links.

[Primary](/start){.primary} [Secondary](#){.ghost}
::

::divider{label="↓ source"}
::

```md
::hero{eyebrow="v1"}
# Headline
# # Subheadline

[CTA](/x){.primary} [More](#){.ghost}
::
```

::divider{label="02 · features"}
::

::features{columns=3 title="Features"}
- icon: ⚡
  title: Fast
  body: A .md file renders directly without a build step.
- icon: 🧱
  title: Composable
  body: Mix directive blocks with plain markdown.
- icon: 🔍
  title: Searchable
  body: Plain text — git diff, grep, LLM, everything works.
::

::divider{label="↓ source"}
::

```md
::features{columns=3 title="Why?"}
- icon: ⚡
  title: Fast
  body: Description here.
::
```

::divider{label="03 · stats"}
::

::stats{title="By the numbers"}
- value: 100%
  label: Markdown
- value: 0
  label: Build steps
- value: ∞
  label: LLM-friendly
- value: 11
  label: Block types
::

::divider{label="↓ source"}
::

```md
::stats{title="Numbers"}
- value: 100%
  label: Markdown
- value: 0
  label: Build steps
::
```

::divider{label="04 · logos"}
::

::logos{title="Used by"}
- name: Acme
- name: Globex
- name: Initech
- name: Umbrella
- name: Stark
::

::divider{label="↓ source"}
::

```md
::logos{title="Used by"}
- name: Acme
- name: Globex
::
```

::divider{label="05 · testimonials"}
::

::testimonials{title="What people say"}
- quote: Finally a CMS that isn't a CMS.
  author: Ada L.
  role: Indie hacker
- quote: My LLM edits the site directly. Wild.
  author: Linus T.
  role: Founder
- quote: Git blame on copy. Dream setup.
  author: Grace H.
  role: Tech writer
::

::divider{label="↓ source"}
::

```md
::testimonials{title="Reviews"}
- quote: The quote here.
  author: Name
  role: Title
::
```

::divider{label="06 · pricing"}
::

::pricing{title="Pricing" columns=3}
- name: Free
  price: $0
  period: mo
  features: 1 site | Subdomain | Community
  cta: Start
  ctaHref: https://github.com/lovable-dev/markdownweb
- name: Pro
  price: $19
  period: mo
  featured: "true"
  features: Everything in Free | Custom domain | AI edit
  cta: Try free
  ctaHref: https://github.com/lovable-dev/markdownweb
- name: Team
  price: $79
  period: mo
  features: Everything in Pro | Collaboration | SLA
  cta: Contact
  ctaHref: https://github.com/lovable-dev/markdownweb
::

::divider{label="↓ source"}
::

```md
::pricing{title="Pricing" columns=3}
- name: Pro
  price: $19
  period: mo
  featured: "true"
  features: A | B | C
  cta: Get started
  ctaHref: /signup
::
```

::divider{label="07 · quote"}
::

::quote{author="Donald Knuth" role="Literate Programming"}
Programs are meant to be read by humans and only incidentally for computers to execute.
::

::divider{label="↓ source"}
::

```md
::quote{author="Name" role="Title"}
The quote here.
::
```

::divider{label="08 · faq"}
::

::faq{title="FAQ"}
- q: Do I have to learn MDX?
  a: No. Just markdown + `::directive::` blocks. No JSX.
- q: Can I edit the site with an LLM?
  a: Yes — that's the whole point. Say "add a pricing section" and get markdown back.
- q: Can I style it myself?
  a: The theme is global (here Brutalist Pop). Blocks inherit tokens from `styles.css`.
::

::divider{label="↓ source"}
::

```md
::faq{title="FAQ"}
- q: The question?
  a: The answer with **markdown**.
::
```

::divider{label="09 · gallery"}
::

::gallery{columns=3 title="Gallery"}
- alt: Brutal grid 1
  caption: 01 · grid
- alt: Brutal grid 2
  caption: 02 · stack
- alt: Brutal grid 3
  caption: 03 · void
::

::divider{label="↓ source"}
::

```md
::gallery{columns=3 title="Gallery"}
- src: /img/a.jpg
  alt: Description
  caption: Caption
::
```

::divider{label="10 · timeline"}
::

::timeline{title="Roadmap"}
- date: 2026-04
  title: MVP
  body: Renderer, hero, features, pricing.
- date: 2026-05
  title: Multi-page
  body: Several .md files as routes.
- date: 2026-06
  title: AI edit
  body: Inline LLM editing of the source.
::

::divider{label="↓ source"}
::

```md
::timeline{title="Roadmap"}
- date: 2026-04
  title: MVP
  body: Description.
::
```

::divider{label="11 · steps"}
::

::steps{title="How it works"}
- title: Write markdown
  body: Open the .md file and edit freely.
- title: Add blocks
  body: Use ::directive:: for structure.
- title: Publish
  body: Push to git, the site builds.
::

::divider{label="↓ source"}
::

```md
::steps{title="How it works"}
- title: Step one
  body: Description.
::
```

::divider{label="12 · tabs"}
::

::tabs
- label: Install
  body: |
    Clone the repo and run `npm install`. Then `npm run dev`.
- label: Deploy
  body: |
    Push to main. Auto-deploy via Lovable Cloud.
::

::divider{label="↓ source"}
::

```md
::tabs
- label: Tab 1
  body: |
    Content with **markdown**.
- label: Tab 2
  body: |
    Other content.
::
```

::divider{label="13 · divider"}
::

```md
::divider{label="Section"}
::
```

::cta{background="primary"}
# Ready to write your site in markdown?
# # One .md file. No steps. Just push.

[Clone the repo](https://github.com/lovable-dev/markdownweb){.primary} [Back home](/){.ghost}
::

::footer
© 2026 MarkdownWeb · Written in `docs.md`
::
