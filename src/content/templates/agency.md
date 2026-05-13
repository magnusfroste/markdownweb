---
name: Agency
description: Consulting / agency site — services, stats, client logos, testimonials, contact CTA.
recommendedThemes:
  - corporate-trust
  - editorial-serif
  - modern-tech
variables:
  - name: agencyName
    description: Agency name shown in nav and footer.
    default: Northwind & Co.
  - name: tagline
    description: Hero subhead.
    default: Strategy, design, and engineering for ambitious teams.
  - name: contactUrl
    description: Where the contact CTA leads.
    default: /contact
---

::nav{brand="{{agencyName}}"}
- Services → /#services
- Work → /work
- About → /about
- Contact → {{contactUrl}}
::

::hero{eyebrow="Est. 2014"}
# We build things that matter.
## {{tagline}}
[Start a project]({{contactUrl}}){variant=primary} [See our work](/work)
::

::features{title="What we do" columns=3}
- 🧭 **Strategy** — Positioning, naming, market entry, GTM.
- 🎨 **Brand & design** — Identity systems, web, product UI.
- ⚙️ **Engineering** — Web platforms, internal tools, integrations.
::

::stats{title="By the numbers"}
- **12 yrs** — In business
- **180+** — Projects shipped
- **40+** — Active clients
- **9 countries** — Where we work
::

::logos{title="Selected clients"}
- Globex
- Initech
- Umbrella
- Soylent
- Hooli
- Massive Dynamic
::

::testimonials{columns=2}
- **"They don't just deliver — they raise the bar."** — VP Product, Globex
- **"The most senior team we've worked with."** — CEO, Initech
::

::cta{background="primary"}
# Let's build something.
## We take on a small number of projects each quarter.
[Tell us about your project]({{contactUrl}}){variant=primary}
::

::footer
{{agencyName}} · © {{agencyName}} · [Careers](/careers) · [Contact]({{contactUrl}})
::
