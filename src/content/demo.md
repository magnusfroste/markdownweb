---
title: "MarkdownWeb — Sites agents write. Sites agents read."
description: "Your website's source is one .md file. Agents author it over MCP, humans tweak it in plain text, LLMs cite it verbatim."
theme: brutalist
---

::nav{brand="MarkdownWeb"}
- Docs → /docs
- Editor → /edit
- MCP → /mcp
- GitHub → https://github.com/lovable-dev/markdownweb
::

::hero{eyebrow="agent-native CMS · v0.2"}
# The site your **agent runs**. The site every **LLM reads**.
## Hermes, Claude or OpenClaw own the editorial workflow over MCP. You keep a plain `.md` file you can tweak in five seconds. No prompt-engineering just to fix a typo.

[Give an agent the keys](/mcp){.primary} [See the source ↓](#source){.ghost}
::

::logos{title="Speaks the language of"}
- Claude
- GPT
- Gemini
- Hermes
- OpenClaw
- Cursor
::

::features{columns=3 title="WYSIWYG is dead. Long live plain text."}
- icon: 🤖
  title: Agents author
  body: MCP exposes 40+ skills — create_site, add_page, set_theme, add_block. Hermes ships a landing page in one turn.
- icon: ✍️
  title: Humans tweak
  body: Change a price, fix a headline, swap a testimonial. Open the .md, edit the line, save. No "please regenerate the hero" prompt.
- icon: 📖
  title: LLMs read
  body: The source IS the content. No JS-rendered soup. GPT crawls, Claude cites, Perplexity quotes — verbatim, from `/site.md`.
::

::split{image="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&q=80" imageAlt="Terminal on a dark screen" imageHref="https://unsplash.com/photos/turned-on-gray-laptop-computer-Wpnoqo2plFA" imageCredit="photo · unsplash ↗" eyebrow="the workflow"}
## An agent builds it. **You steer it.**

Hand your agent an MCP key. It picks a template, applies a theme, drafts the copy, adds blog posts, publishes. When you want to change *"$19/mo"* to *"$29/mo"*, you don't open a chat — you open the file.

**Traditional AI editing:** "Hey Claude, on the pricing section, second card, change the monthly price but keep the badge and reorder features so that…"
**MarkdownWeb:** open `site.md`, `$19` → `$29`, save.
::

::stats{title="Why plain text wins"}
- value: 1
  label: File per site
- value: 40+
  label: MCP skills exposed
- value: 0
  label: Prompts to fix a typo
- value: ∞
  label: LLMs that can read it
::

::split{image="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80" imageAlt="Code editor" imageHref="https://unsplash.com/photos/monitor-showing-java-programming-iar-afB0QQw" imageCredit="photo · unsplash ↗" reverse=true background="secondary" eyebrow="MCP-first"}
## Give your agent a **workspace**, not a chatbox.

`list_templates`, `create_site_from_template`, `add_page{type:"post"}`, `set_theme`, `update_theme_tokens`, `publish_site`. Your agent doesn't guess — it discovers, composes, previews and ships.

Every mutation returns a preview URL. Every site publishes an RSS feed. Every page emits OpenGraph, JSON-LD and a canonical `.md` for the next agent that crawls it.
::

::testimonials{title="Agentic content generation, at its best"}
- quote: My Hermes agent runs three landing pages. I edit copy in nvim on the train. We haven't opened a CMS in four months.
  author: Ada Lovelace
  role: Solo founder
  avatar: https://i.pravatar.cc/120?img=47
- quote: WYSIWYG asked me to click through 12 nested panels to change a price. MarkdownWeb asked me to change one character.
  author: Linus Torvalds
  role: Founder, Kernel Co
  avatar: https://i.pravatar.cc/120?img=12
- quote: Our agent drafts, our editor trims, our LLM search-indexes — all from the same file. No sync layer. No webhooks.
  author: Grace Hopper
  role: Head of Content
  avatar: https://i.pravatar.cc/120?img=32
- quote: We deleted the headless CMS, the block editor and the AI plugin. The .md file replaced all three.
  author: Margaret Hamilton
  role: Staff Engineer
  avatar: https://i.pravatar.cc/120?img=45
- quote: I told Claude 'add a Q4 launch post with these three bullets'. One MCP call, live in 8 seconds. Then I fixed the title in the file myself.
  author: Alan Turing
  role: CTO, Bletchley
  avatar: https://i.pravatar.cc/120?img=15
- quote: Perplexity started quoting our pricing page word-for-word. Turns out LLMs love markdown more than divs.
  author: Katherine Johnson
  role: Growth Lead
  avatar: https://i.pravatar.cc/120?img=49
::

::quote{author="Ada Lovelace" role="Computing Pioneer"}
The best interface for both a human and a machine is the one they can already read.
::

::features{columns=4 title="Pick a style" subtitle="10 themes × 3 layout families. Your agent picks. You can override any token."}
- icon: 🧱
  title: Brutalist Pop
  body: Thick borders, hard shadows, loud accents. (current)
- icon: 📰
  title: Editorial Serif
  body: Serif headlines, generous whitespace, magazine-style.
- icon: 🌃
  title: Neon Cyber
  body: Dark mode first. Neon glows, low-contrast surfaces.
- icon: 👑
  title: Luxury Gold
  body: Gold hairlines, deep noir, editorial swagger.
::

::pricing{title="Simple pricing" subtitle="Priced per agent seat. Humans edit for free." columns=3}
- name: Hobby
  tagline: One agent, one site
  price: $0
  period: mo
  features: 1 site | 1 MCP key | Community support | Lovable subdomain
  cta: Start free
  ctaHref: https://github.com/lovable-dev/markdownweb
- name: Agentic
  tagline: For solo founders + one AI editor
  price: $19
  period: mo
  featured: "true"
  badge: Most popular
  features: Unlimited sites | Unlimited MCP keys | Custom domains | Version history | RSS + sitemap
  cta: Read the MCP docs
  ctaHref: /mcp
- name: Studio
  tagline: For teams running many agents
  price: $79
  period: mo
  features: Everything in Agentic | Scoped keys per agent | Activity logs | White-label | Priority support
  cta: View on GitHub
  ctaHref: https://github.com/lovable-dev/markdownweb
::

::hero{eyebrow="ready when your agent is"}
# Hand your site to an **agent**.
## Get it back as a `.md` file you can still read.

[Mint an MCP key](/mcp){.primary} [Browse the docs →](/docs){.ghost}
::

::cta{background="primary"}
# Agentic content generation, when it's actually good.
## Agents write. Humans steer. LLMs read. One file.

[Clone the repo](https://github.com/lovable-dev/markdownweb){.primary} [Open the editor](/edit){.ghost}
::

::footer
© 2026 MarkdownWeb · Written by agents · Edited by humans · Read by LLMs
::
