---
name: Nonprofit
description: NGO / cause site — hero, impact stats, mission quote, how-it-works steps, donate CTA.
recommendedThemes:
  - nature-organic
  - wellness-soft
  - corporate-trust
variables:
  - name: orgName
    description: Organization name.
    default: Common Ground
  - name: mission
    description: One-line mission statement.
    default: We help small farms transition to regenerative practices.
  - name: donateUrl
    description: Where the donate CTA leads.
    default: /donate
---

::nav{brand="{{orgName}}"}
- Mission → /mission
- Programs → /programs
- Annual report → /report
- Donate → {{donateUrl}}
::

::hero{eyebrow="501(c)(3) · Since 2011"}
# {{orgName}}
## {{mission}}
[Donate]({{donateUrl}}){variant=primary} [Read our 2025 report](/report)
::

::stats{title="2025 impact"}
- **2,400+** — Farms supported
- **18,000 ha** — Under regenerative practice
- **14** — Active programs
- **92¢** — Of every dollar to programs
::

::quote{author="A. Founder" role="Executive Director"}
We don't change agriculture from a board room. We change it one farm, one season, one neighbor at a time.
::

::steps{title="How it works"}
- **You give** — One-time or monthly. Tax-deductible.
- **We deploy** — Direct to farms in our network.
- **Farms transition** — Soil, seed, training, equipment.
- **You see the report** — Every donor gets the annual.
::

::cta{background="primary"}
# Be part of the next season.
## A monthly gift compounds — for the soil, for the farms.
[Become a monthly donor]({{donateUrl}}){variant=primary}
::

::footer
{{orgName}} · 501(c)(3) · EIN 00-0000000 · [Financials](/financials) · [Contact](mailto:hello@example.com)
::
