---
name: Coming Soon
description: Minimal launch / waitlist page — hero + CTA + tiny footer. Three blocks total.
recommendedThemes:
  - brutalist-pop
  - luxury-noir
  - editorial-serif
variables:
  - name: projectName
    description: What you're launching.
    default: Project Halo
  - name: oneLiner
    description: One-line description.
    default: Something quiet is coming.
  - name: waitlistUrl
    description: Where the waitlist CTA leads.
    default: /waitlist
---

::hero{eyebrow="Coming soon"}
# {{projectName}}
## {{oneLiner}}
[Join the waitlist]({{waitlistUrl}}){variant=primary}
::

::cta{background="foreground"}
# Be first to know.
## We'll send one email when we launch. That's the deal.
[Get notified]({{waitlistUrl}}){variant=primary}
::

::footer
© {{projectName}} · [Twitter](https://twitter.com) · [Email](mailto:hello@example.com)
::
