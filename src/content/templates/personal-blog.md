---
name: Personal Blog
description: Writer / personal site — short hero, recent posts, pull quote, footer.
recommendedThemes:
  - editorial-serif
  - wellness-soft
  - nature-organic
variables:
  - name: authorName
    description: Your name.
    default: Sam Writer
  - name: bio
    description: One-line bio under the hero.
    default: Essays on software, cities, and the things that connect them.
---

::nav{brand="{{authorName}}"}
- Writing → /
- About → /about
- Newsletter → /newsletter
::

::hero{eyebrow="Notes"}
# {{authorName}}
## {{bio}}
[Subscribe](/newsletter){variant=primary} [About](/about)
::

::features{title="Recent writing" columns=1}
- 📝 **On the quiet years** — A short essay on craft and slow accumulation.
- 📝 **What cities owe you** — How public space shapes who we become.
- 📝 **Tools I keep using** — A working list, updated when something earns its keep.
- 📝 **Letters from a small studio** — A monthly note. Mostly process.
::

::quote{author="Annie Dillard"}
How we spend our days is, of course, how we spend our lives.
::

::cta{background="foreground"}
# Get the newsletter
## One short letter, first Sunday of the month. Free.
[Subscribe](/newsletter){variant=primary}
::

::footer
© {{authorName}} · [RSS](/rss.xml) · [Email](mailto:hello@example.com)
::
