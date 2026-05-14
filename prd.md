# MarkdownWeb — PRD & Backlog

## Status

POC — validerar att en autonom agent (Hermes) kan skapa och ändra en site
via MCP. Kör i dev mot in-memory store. Self-hosted deploy (Vercel) utan
Lovable Cloud / Supabase.

---

## Scope nu (POC)

- [x] MCP endpoint `/api/mcp` (JSON-RPC, Bearer auth)
- [x] Skills: create/read/write/list pages, themes, templates, keys
- [x] Preview-routes `/mcp/preview/:slug/*`
- [x] Admin-key via `MCP_ADMIN_KEY` (env)
- [x] `.env.example` + README deploy-instruktioner
- [x] Per-theme signature CSS (`mw-theme-{slug}`) — varje tema har en
      visuell detalj (drop-cap, gold hairline, neon glow, organic blob…)
      utan att Hermes behöver lära sig något nytt; signaturen står i
      `list_themes`-beskrivningen så agenten förstår valet.
- [ ] Manuell validering: Hermes skapar en site end-to-end

## Designsystem — backlog (efter POC-validering)

Idéer som höjer baseline från 8 → 9 men kräver mer från agenten eller
nya block. Lyfts in när vi vet att Hermes klarar grunderna.

- **Per-theme type scale** — `--h1-size`/`--h2-size` per tema istället
  för hårdkodat i blocken (editorial 96px vs dev-docs 40px).
- **Motion-lager** — `framer-motion` + tema-medveten rörelse
  (brutalist = ingen, momentum = mjuk, editorial = långsam).
- **Image-direktiv** — `::image{src=… treatment=duotone|grain|none}`
  + grain-overlay assets.
- **Theme-preview-skill** — `preview_theme` returnerar PNG/HTML innan
  Hermes commitar `set_theme`.

---

## Backlog — innan multi-agent / produktion

Prioriterad lista. Ingen byggs i POC:n; tas in när vi går från
"en agent leker" till "flera agenter delar hotell".

### Must-have (kritiskt för multi-agent)

1. **Per-agent keys** — ersätt enskilt `MCP_ADMIN_KEY` med `MCP_KEYS`
   (kommaseparerad lista) + activity-logg per nyckel.
2. **Optimistic concurrency** — `version`/`updatedAt` på `read-page`,
   krävs matchande på `write-page` (409 vid mismatch).
3. **Strukturerad validering** — Zod på frontmatter; returnera
   `{field, message}` istället för generisk 400.
4. **Draft → Publish** — `status: draft|published` i frontmatter så
   agenter kan jobba i utkast utan att besökare ser halvfärdigt.

### Should-have (smoothness)

5. `list-pages` med metadata (slug, title, status, updatedAt) — undvik N+1.
6. `llms.txt` i root för externa agenter (finns redan i `public/`, verifiera).
7. Asset upload — dokumentera flöde för bilder.
8. Rate limit på `/api/mcp` (per nyckel; in-memory eller Upstash).
9. `noindex` på preview-routes + uteslut från sitemap.

### Nice-to-have

10. Persistent audit-log (Activity är in-memory, försvinner vid Vercel cold start).
11. Git commit per write via GitHub API → gratis rollback/diff/PR.
12. CORS på `/api/mcp` — låt inte vara `*` när auth ligger bakom.

---

## Vercel-specifika risker

- **Filsystem read-only i prod** — `write-page` mot `src/content/` funkar
  INTE på Vercel. Antingen:
  - flytta persistens till DB (Postgres/KV), eller
  - skriv via GitHub API (commit-per-write) → triggar redeploy.
  POC:n kör in-memory; måste lösas innan produktion.
- Env vars sätts i Project Settings → Environment Variables (alla tre tiers).
- Verifiera `runtime = 'nodejs'` på server-routes som behöver Node-API:er.

---

## Mdsites "hotell" (framtid)

Samma env-mönster som POC: `.env.example` committad, `.env` lokal,
host-vars i Vercel/systemd/Docker. Lägg till per-tenant vars
(`DATABASE_URL`, `S3_*`, ev. `STRIPE_*`) i `.env.example` när dags.
