---
title: "MarkdownWeb — Write your site in markdown"
description: "A site whose source is a markdown document. LLM-friendly, git-friendly, human-friendly."
theme: brutalist
---

::nav{brand="MarkdownWeb"}
- Docs → /docs
- Editor → /edit
- GitHub → https://github.com/lovable-dev/markdownweb
::

::hero{eyebrow="v0.1 — early preview"}
# Your site is **one .md file**.
## No blocks in a database. No drag-and-drop editors. Just markdown with frontmatter and directives — readable by any LLM.

[Get started](/docs){.primary} [See the source ↓](#source){.ghost}
::

::features{columns=3 title="Why markdown?"}
- icon: 🤖
  title: LLM-native
  body: Any AI can edit it. No schema to learn.
- icon: 📝
  title: Plain text
  body: Edit in VS Code, vim, or a web textarea. Diffable in git.
- icon: ⚡
  title: Directive blocks
  body: ::hero::, ::features::, ::cta:: — structured blocks with markdown content.
::

::split{image="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80" imageAlt="Code on a screen" imageHref="https://unsplash.com/photos/monitor-showing-java-programming-iar-afB0QQw" imageCredit="photo · unsplash ↗" eyebrow="how it works"}
## Markdown in. **Site out.**

Drop a `.md` file in your repo. We parse the frontmatter, render directive blocks like `::hero::` and `::pricing::`, and pass the rest through standard markdown.

No build step. No CMS. No JSX. Just text you can edit anywhere — your editor, GitHub web UI, or an LLM chat.
::

::stats{title="By the numbers"}
- value: 1
  label: File per page
- value: 0
  label: Build steps
- value: 16
  label: Block types
- value: ∞
  label: LLM-editable
::

::split{image="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80" imageAlt="Laptop on a desk" imageHref="https://unsplash.com/photos/macbook-pro-on-brown-wooden-table-OQMZwNd3ThU" imageCredit="photo · unsplash ↗" reverse=true background="secondary" eyebrow="for humans & AIs"}
## Edit it **anywhere**.

Open it in VS Code. Edit it on your phone via GitHub. Tell Claude to "add a testimonial from Ada Lovelace" and paste the result back.

Because it's just text, **every tool already supports it**.
::

::testimonials{title="People are shipping"}
- quote: I rebuilt my landing in 20 minutes by editing one file.
  author: Ada L.
  role: Indie hacker
- quote: My LLM owns my marketing site now. It's faster than me.
  author: Linus T.
  role: Founder
- quote: Git diff on copy changes. Finally.
  author: Grace H.
  role: Tech writer
::

::quote{author="Ada Lovelace" role="Computing Pioneer"}
The best abstraction is the one you can already write in a text file.
::

::pricing{title="Simple pricing" subtitle="No salespeople. No tricks. Just one .md file per plan." columns=3}
- name: Hobby
  tagline: For personal sites
  price: $0
  period: mo
  features: 1 site | Markdown source | Community support | Lovable subdomain
  cta: Start free
  ctaHref: https://github.com/lovable-dev/markdownweb
- name: Pro
  tagline: For indie hackers & freelancers
  price: $19
  period: mo
  featured: "true"
  badge: Most popular
  features: Unlimited sites | Custom domains | AI edit via prompt | Version history | Email support
  cta: Read the docs
  ctaHref: /docs
- name: Studio
  tagline: For teams & agencies
  price: $79
  period: mo
  features: Everything in Pro | Team collaboration | White-label | Priority support | SLA
  cta: View on GitHub
  ctaHref: https://github.com/lovable-dev/markdownweb
::

::cta{background="primary"}
# Build faster. Iterate without friction.
## Markdown in. Brutalist landing out.

[Clone the repo](https://github.com/lovable-dev/markdownweb){.primary} [Read the docs](/docs){.ghost}
::

::footer
© 2026 MarkdownWeb · Made with `.md`
::
