---
name: Restaurant
description: Restaurant / café — hero, story split, gallery, testimonials, footer with hours.
recommendedThemes:
  - editorial-serif
  - wellness-soft
  - nature-organic
variables:
  - name: name
    description: Restaurant name.
    default: Maison Verde
  - name: cuisine
    description: One-line description.
    default: Seasonal, plant-forward, neighborhood cooking.
  - name: address
    description: Street address line shown in footer.
    default: 14 rue des Lilas · Paris 11
  - name: bookingUrl
    description: Where the booking CTA leads.
    default: /reservations
---

::nav{brand="{{name}}"}
- Menu → /menu
- About → /about
- Reservations → {{bookingUrl}}
::

::hero{eyebrow="Open Tue–Sat"}
# {{name}}
## {{cuisine}}
[Reserve a table]({{bookingUrl}}){variant=primary} [See the menu](/menu)
::

::split{variant="text-right"}
# A small kitchen, a short menu.
We change the menu when the season changes — usually three or four times a year. Most ingredients come from within 100 km. Bread is baked in-house every morning.
[Read about the kitchen](/about){variant=primary}
::

::gallery{columns=3}
- ![Spring tasting plate](/img/spring.jpg)
- ![The dining room at dusk](/img/room.jpg)
- ![Hand-pulled pasta](/img/pasta.jpg)
- ![Garden produce](/img/garden.jpg)
- ![Bread course](/img/bread.jpg)
- ![Wine cellar](/img/cellar.jpg)
::

::testimonials{columns=2}
- **"The neighborhood's quiet luxury."** — Le Fooding, 2024
- **"Worth a detour."** — Time Out, 2023
::

::cta{background="primary"}
# Hungry?
## We open reservations 30 days out.
[Book a table]({{bookingUrl}}){variant=primary}
::

::footer
{{name}} · {{address}} · Tue–Sat 18:00–23:00 · [Instagram](https://instagram.com)
::
