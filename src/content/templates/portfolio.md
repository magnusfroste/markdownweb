---
name: Portfolio
description: Designer / studio portfolio — hero, gallery, split case study, testimonial, contact CTA.
recommendedThemes:
  - editorial-serif
  - luxury-noir
  - creative-playful
variables:
  - name: name
    description: Your name or studio name.
    default: Jane Doe
  - name: discipline
    description: What you do (one short phrase).
    default: Independent designer & art director
  - name: contactEmail
    description: Email shown in CTA.
    default: hello@example.com
---

::nav{brand="{{name}}"}
- Work → /#work
- About → /about
- Contact → mailto:{{contactEmail}}
::

::hero{eyebrow="2020 — Now"}
# {{name}}
## {{discipline}}. Available for select projects.
[See selected work](/#work){variant=primary} [Get in touch](mailto:{{contactEmail}})
::

::gallery{columns=3}
- ![Project Aria — brand identity](/img/aria.jpg)
- ![Folio — editorial system](/img/folio.jpg)
- ![Northwind — packaging](/img/northwind.jpg)
- ![Helix — wayfinding](/img/helix.jpg)
- ![Kestrel — type specimen](/img/kestrel.jpg)
- ![Mirror — exhibition](/img/mirror.jpg)
::

::split{variant="text-left"}
# Selected case study
A complete brand refresh for a 30-year-old publisher — from logotype and editorial system to merch and wayfinding. Shipped across 14 markets.
[Read the case →](/work/publisher){variant=primary}
::

::quote{author="A. Director" role="Editor-in-Chief, Periodical Co."}
A rare collaborator who actually elevates the brief. We'd hire again tomorrow.
::

::cta{background="foreground"}
# Got a project in mind?
## Booking from Q3. Drop me a line.
[Email me](mailto:{{contactEmail}}){variant=primary}
::

::footer
{{name}} · © {{name}} · [Instagram](https://instagram.com) · [Are.na](https://are.na)
::
