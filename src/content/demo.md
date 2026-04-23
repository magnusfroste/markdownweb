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

::logos{title="Trusted by builders at"}
- GitHub
- Vercel
- Linear
- Stripe
- Notion
- Figma
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
- quote: I rebuilt my landing in 20 minutes by editing one file. Git diff on copy changes is a superpower.
  author: Ada Lovelace
  role: Indie hacker
  avatar: https://i.pravatar.cc/120?img=47
- quote: My LLM owns my marketing site now. It iterates faster than any CMS workflow I've ever used.
  author: Linus Torvalds
  role: Founder, Kernel Co
  avatar: https://i.pravatar.cc/120?img=12
- quote: Finally — a stack where my writers and my AI agents edit the exact same file. No more sync drama.
  author: Grace Hopper
  role: Head of Content
  avatar: https://i.pravatar.cc/120?img=32
- quote: Replaced 4 plugins and a headless CMS with a folder of .md files. Bundle size dropped 80%.
  author: Margaret Hamilton
  role: Staff Engineer
  avatar: https://i.pravatar.cc/120?img=45
- quote: Onboarding a new marketer used to take a week. Now it's 'here's the repo, edit hero.md'.
  author: Alan Turing
  role: CTO, Bletchley
  avatar: https://i.pravatar.cc/120?img=15
- quote: The diff-friendly format means design review actually happens in PRs now. Game changer.
  author: Katherine Johnson
  role: Design Lead
  avatar: https://i.pravatar.cc/120?img=49
::

::quote{author="Ada Lovelace" role="Computing Pioneer"}
The best abstraction is the one you can already write in a text file.
::

::features{columns=4 title="Pick a style" subtitle="Set theme: in your frontmatter. Same markdown, different vibe."}
- icon: 🧱
  title: Brutalist Pop
  body: Thick borders, hard shadows, loud accents. (current)
- icon: 📰
  title: Editorial
  body: Serif headlines, generous whitespace, magazine-style.
- icon: 🌙
  title: Midnight
  body: Dark mode first. Soft glows, low-contrast surfaces.
- icon: ✨
  title: Minimal
  body: Swiss grid, neutral palette, type does the work.
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

::hero{eyebrow="ready when you are"}
# Ship a site **today**.
## One markdown file. Zero config. Deploy in minutes — edit forever.

[Start building](https://github.com/lovable-dev/markdownweb){.primary} [Browse the docs →](/docs){.ghost}
::

::cta{background="primary"}
# Build faster. Iterate without friction.
## Markdown in. Brutalist landing out.

[Clone the repo](https://github.com/lovable-dev/markdownweb){.primary} [Read the docs](/docs){.ghost}
::

::footer
© 2026 MarkdownWeb · Made with `.md`
::
