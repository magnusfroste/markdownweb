---
name: Product Launch
description: Single-product launch page — hero, story split, features, pricing, FAQ, CTA.
recommendedThemes:
  - startup-bold
  - modern-tech
  - creative-playful
variables:
  - name: productName
    description: Product name.
    default: Halo
  - name: oneLiner
    description: Short value prop under the headline.
    default: A pocket-sized recorder that just works.
  - name: priceUSD
    description: Price in USD.
    default: "199"
  - name: ctaUrl
    description: Where the buy CTA leads.
    default: /buy
---

::nav{brand="{{productName}}"}
- Story → /#story
- Specs → /#specs
- Buy → {{ctaUrl}}
::

::hero{eyebrow="New · Available now"}
# Meet {{productName}}.
## {{oneLiner}}
[Buy — ${{priceUSD}}]({{ctaUrl}}){variant=primary} [Watch the film](/film)
::

::split{variant="text-left"}
# Designed to disappear.
We spent two years removing every button, light, and switch that wasn't earning its place. What's left is the smallest, quietest device we've ever made.
[Read the story](/story){variant=primary}
::

::features{title="What's inside" columns=3}
- 🎙 **Studio-grade mics** — Three-capsule array, 24-bit / 96 kHz.
- 🔋 **All-day battery** — 14 hours continuous, USB-C in 30 min.
- ☁️ **Auto sync** — Cloud transfer the moment you stop recording.
- 🤫 **Silent build** — Aluminum unibody, zero moving parts.
- 🎨 **Three colors** — Stone, Ink, Bone.
- 📦 **In the box** — {{productName}}, USB-C cable, lanyard.
::

::pricing{title="Pricing"}
- **{{productName}}** — ${{priceUSD}} · Free shipping worldwide
- **Studio bundle** — ${{priceUSD}} + accessories pack
::

::faq{title="Questions"}
- **Warranty?** — Two years, parts and labor.
- **Returns?** — 30 days, no questions.
- **International shipping?** — DDP to 60 countries.
::

::cta{background="primary"}
# Get yours.
## Shipping in 3–5 business days.
[Buy {{productName}} — ${{priceUSD}}]({{ctaUrl}}){variant=primary}
::

::footer
© {{productName}} · [Support](/support) · [Press](/press)
::
