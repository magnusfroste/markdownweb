---
name: Event / Conference
description: Single-event landing — hero with date, stats, schedule steps, testimonials, FAQ, ticket CTA.
recommendedThemes:
  - brutalist-pop
  - startup-bold
  - creative-playful
variables:
  - name: eventName
    description: Name of the event.
    default: Frontier 2026
  - name: dateLine
    description: Date and venue line.
    default: October 14–15 · Berlin
  - name: ticketUrl
    description: Where the buy-tickets CTA leads.
    default: /tickets
---

::nav{brand="{{eventName}}"}
- Schedule → /#schedule
- Speakers → /speakers
- Venue → /venue
- Tickets → {{ticketUrl}}
::

::hero{eyebrow="{{dateLine}}"}
# {{eventName}}
## Two days. One room. The people building what's next.
[Get a ticket]({{ticketUrl}}){variant=primary} [See the schedule](/#schedule)
::

::stats
- **400** — Attendees
- **24** — Speakers
- **2 days** — One stage
- **9th year** — Running
::

::steps{title="The plan"}
- **Day 1 · Morning** — Keynotes and the year ahead.
- **Day 1 · Afternoon** — Deep-dive workshops.
- **Day 2 · Morning** — Lightning talks and field reports.
- **Day 2 · Evening** — Closing party at the venue rooftop.
::

::testimonials{columns=2}
- **"The only conference I clear my calendar for."** — Past attendee, 2024
- **"A genuinely high signal room."** — Past speaker, 2023
::

::faq{title="Practical"}
- **Is the talk recorded?** — Yes, attendees get recordings two weeks after.
- **Refunds?** — Full refund up to 30 days before.
- **Diversity scholarships?** — Yes — apply via the tickets page.
::

::cta{background="primary"}
# Tickets are limited.
## Last year sold out 6 weeks before the doors.
[Reserve your spot]({{ticketUrl}}){variant=primary}
::

::footer
{{eventName}} · {{dateLine}} · [Code of conduct](/coc) · [Contact](mailto:hello@example.com)
::
