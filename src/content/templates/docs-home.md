---
name: Docs Home
description: Open-source / library landing — hero, features, install tabs, CTA, footer.
recommendedThemes:
  - dev-docs
  - modern-tech
  - corporate-trust
variables:
  - name: libName
    description: Library / package name.
    default: mdweb
  - name: oneLiner
    description: One-line description.
    default: A tiny, agent-friendly markdown CMS.
  - name: githubUrl
    description: GitHub repo URL.
    default: https://github.com/example/mdweb
---

::nav{brand="{{libName}}"}
- Docs → /docs
- Reference → /reference
- GitHub → {{githubUrl}}
::

::hero{eyebrow="v1.0 · MIT"}
# {{libName}}
## {{oneLiner}}
[Read the docs](/docs){variant=primary} [Star on GitHub]({{githubUrl}})
::

::features{title="Why {{libName}}" columns=3}
- 🪶 **Tiny** — < 10 KB, zero peer deps.
- 🧩 **Composable** — Bring your own renderer.
- 🌐 **Edge-ready** — Runs anywhere fetch runs.
- 🔧 **Typed** — First-class TypeScript types.
- 🧪 **Tested** — 98% coverage, public API frozen.
- 📚 **Documented** — Every export, every option.
::

::tabs
- **npm** — `npm i {{libName}}`
- **bun** — `bun add {{libName}}`
- **deno** — `deno add jsr:@scope/{{libName}}`
::

::cta{background="foreground"}
# Five-minute quickstart.
## Install, write a file, render.
[Open the quickstart](/docs/quickstart){variant=primary}
::

::footer
{{libName}} · MIT licensed · [GitHub]({{githubUrl}}) · [Changelog](/changelog)
::
