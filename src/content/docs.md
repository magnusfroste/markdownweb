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
## Live previews on the left, copy-paste markdown on the right.
::

::hero{eyebrow="01 · hero"}
# Hero block
## Big headline, optional subheadline, and CTA buttons via markdown links.

[Primary](/start){.primary} [Secondary](#){.ghost}
::

::features{columns=3 title="02 · features"}
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

::stats{title="03 · stats"}
- value: 100%
  label: Markdown
- value: 0
  label: Build steps
- value: ∞
  label: LLM-friendly
- value: 11
  label: Block types
::

::logos{title="04 · logos — used by"}
- name: Acme
- name: Globex
- name: Initech
- name: Umbrella
- name: Stark
::

::testimonials{title="05 · testimonials"}
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

::pricing{title="06 · pricing" columns=3}
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

::quote{author="Donald Knuth" role="Literate Programming"}
Programs are meant to be read by humans and only incidentally for computers to execute.
::

::faq{title="07 · faq"}
- q: Do I have to learn MDX?
  a: No. Just markdown + `::directive::` blocks. No JSX.
- q: Can I edit the site with an LLM?
  a: Yes — that's the whole point. Say "add a pricing section" and get markdown back.
- q: Can I style it myself?
  a: The theme is global (here Brutalist Pop). Blocks inherit tokens from `styles.css`.
::

::gallery{columns=3 title="08 · gallery"}
- alt: Brutal grid 1
  caption: 01 · grid
- alt: Brutal grid 2
  caption: 02 · stack
- alt: Brutal grid 3
  caption: 03 · void
::

::timeline{title="09 · timeline"}
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

::steps{title="10 · steps"}
- title: Write markdown
  body: Open the .md file and edit freely.
- title: Add blocks
  body: Use ::directive:: for structure.
- title: Publish
  body: Push to git, the site builds.
::

::tabs
- label: Install
  body: |
    Clone the repo and run `npm install`. Then `npm run dev`.
- label: Deploy
  body: |
    Push to main. Auto-deploy via Lovable Cloud.
::

::divider{label="layout helpers — divider"}
::

::cta{background="primary"}
# Ready to write your site in markdown?
## One .md file. No steps. Just push.

[Clone the repo](https://github.com/lovable-dev/markdownweb){.primary} [Back home](/){.ghost}
::

::footer
© 2026 MarkdownWeb · Written in `docs.md`
::
