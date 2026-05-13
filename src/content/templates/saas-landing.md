---
name: SaaS Landing
description: Classic product landing — nav, hero, social proof, features, pricing, FAQ, CTA, footer.
recommendedThemes:
  - modern-tech
  - startup-bold
  - dev-docs
variables:
  - name: brand
    description: Product / company name shown in nav and footer.
    default: Acme
  - name: tagline
    description: One-line value proposition under the hero headline.
    default: The fastest way to ship your idea.
  - name: headline
    description: Hero headline.
    default: Ship 10x faster.
  - name: ctaPrimary
    description: Primary CTA button label.
    default: Start free
  - name: ctaPrimaryUrl
    description: Primary CTA destination.
    default: /signup
  - name: priceMonthly
    description: Monthly price in USD.
    default: "29"
---

::nav{brand="{{brand}}"}
- Features → /#features
- Pricing → /#pricing
- Docs → /docs
- Sign in → /login
::

::hero{eyebrow="New · v2.0"}
# {{headline}}
## {{tagline}}
[{{ctaPrimary}}]({{ctaPrimaryUrl}}){variant=primary} [Read the docs](/docs)
::

::logos{title="Trusted by teams at"}
- Globex
- Initech
- Umbrella
- Soylent
- Hooli
::

::features{title="Everything you need" columns=3}
- 🚀 **Blazing fast** — Sub-50ms response times worldwide.
- 🔒 **Secure by default** — SOC 2, RLS, audit logs out of the box.
- 🧩 **Composable** — Compose primitives instead of fighting frameworks.
- 📊 **Observable** — Built-in metrics, traces, and logs.
- 🌍 **Global** — Edge-deployed in 280+ cities.
- 💸 **Honest pricing** — No per-seat traps. No surprise bills.
::

::testimonials{columns=2}
- **"Cut our infra bill by 70%."** — Ada Lovelace, CTO at Globex
- **"Best DX I've had in years."** — Alan Turing, Eng at Initech
::

::pricing{title="Simple pricing"}
- **Free** — $0/mo · 1 project · Community support
- **Pro** — ${{priceMonthly}}/mo · Unlimited projects · Priority support
- **Enterprise** — Custom · SSO · SLA · Dedicated support
::

::faq{title="Questions"}
- **Is there a free tier?** — Yes, forever. No credit card needed.
- **Can I self-host?** — One docker command, full source available.
- **How does billing work?** — Monthly, usage-based above the included tier.
- **Do you offer SSO?** — On the Enterprise plan.
::

::cta{background="primary"}
# Ready to ship?
## Spin up your first project in under 60 seconds.
[{{ctaPrimary}}]({{ctaPrimaryUrl}}){variant=primary}
::

::footer
© {{brand}} · [Privacy](/privacy) · [Terms](/terms) · [Status](/status)
::
