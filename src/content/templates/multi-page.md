---
name: Multi-page (in one file)
description: Whole 4-page business site in ONE markdown file using ::page directives. Shared nav + footer.
recommendedThemes:
  - modern-tech
  - corporate-trust
  - editorial-serif
variables:
  - name: company
    description: Company / brand name.
    default: Acme
  - name: tagline
    description: One-line tagline shown in the home hero.
    default: We build software that doesn't yell.
  - name: contactEmail
    description: Email shown on the contact page.
    default: hello@acme.example
---

::nav{brand="{{company}}"}
- Home → /
- Services → /services
- About → /about
- Contact → /contact
::

::page{slug="/" title="{{company}} — {{tagline}}" description="Calm, considered software for serious teams."}

::hero{eyebrow="Est. 2018"}
# {{company}}
## {{tagline}}
[See what we do](/services){variant=primary} [Get in touch](/contact)
::

::features{title="What we believe" columns=3}
- 🧭 **Calm** — Tools should fade into work, not interrupt it.
- 🪶 **Light** — Less software, used well, beats more software.
- 🔧 **Honest** — We tell you what we'd actually build.
::

::cta{background="primary"}
# Curious?
## Half-hour intro call. No pitch deck.
[Book a call](/contact){variant=primary}
::

::

::page{slug="/services" title="Services — {{company}}" description="Engineering, product, and platform work for teams of 5–50."}

::hero{eyebrow="What we do"}
# Three things, done well.
## Engineering, product, and platform — for teams of 5–50.
::

::features{title="Service areas" columns=3}
- 🛠️ **Engineering** — Backend, web, mobile. Typescript, Rust, Postgres.
- 🎯 **Product** — Discovery sprints, prototyping, validation with users.
- 🏗️ **Platform** — Infra, observability, deploy pipelines that don't page you at 3am.
::

::pricing{title="Engagements"}
- name: Sprint
  price: From €15k
  features:
    - 2 weeks, 1–2 people
    - Discovery + working prototype
    - Written handover
- name: Project
  price: From €60k
  features:
    - 4–8 weeks, 2–3 people
    - Production-ready delivery
    - 30-day support included
- name: Embedded
  price: Custom
  features:
    - Multi-month, full team
    - Embedded with your eng + product
    - Quarterly review cadence
::

::cta{background="foreground"}
# Got a brief?
## Send it over — we'll reply within two working days.
[Email us](/contact){variant=primary}
::

::

::page{slug="/about" title="About — {{company}}" description="A small team that ships."}

::hero{eyebrow="Since 2018"}
# A small team that ships.
## Eight people across Stockholm and Berlin. No middle managers. No agency overhead.
::

::quote{author="Founder" role="{{company}}"}
We started {{company}} because we wanted to do good engineering for serious people, without the agency theatre.
::

::stats{title="Receipts"}
- **40+** — Projects shipped
- **8** — People on the team
- **6 yrs** — In business
- **0** — Account managers
::

::

::page{slug="/contact" title="Contact — {{company}}" description="Get in touch — usually a reply within 2 working days."}

::hero{eyebrow="Say hi"}
# Let's talk.
## Tell us what you're building. We reply within two working days, usually faster.
[Email {{contactEmail}}](mailto:{{contactEmail}}){variant=primary}
::

::features{title="Where to find us" columns=2}
- 📧 **Email** — {{contactEmail}}
- 📍 **Studios** — Stockholm · Berlin
::

::

::footer
© {{company}} · [Privacy](/privacy) · [{{contactEmail}}](mailto:{{contactEmail}})
::
