# MarkdownWeb

A tiny CMS where every site is a single markdown file with `::directive::`
blocks. Built so an external AI agent (e.g. an OpenClaw / Claude / Cursor
client) can spin up and maintain dozens of sites over the **Model Context
Protocol** (MCP).

- **Stack**: TanStack Start (React 19) on Vite 7, Tailwind v4, Cloudflare
  Workers as the deploy target.
- **Storage**: in-memory (demo). Survives within a Worker instance, not
  across cold starts. See *Going to production* below.
- **MCP**: JSON-RPC 2.0 endpoint at `/api/mcp`, ~25 skills exposed.

## Quick start (local)

```bash
bun install

# Local secrets for `wrangler dev` — Lovable Cloud injects MCP_ADMIN_KEY
# automatically when deployed, so this file is only needed locally.
cat > .dev.vars <<'EOF'
MCP_ADMIN_KEY=dev-local-admin-key
EOF

bun dev
# → http://localhost:5173
```

Open `/` for the landing page, `/docs` for the directive reference, `/edit`
for the live markdown editor, `/mcp` for the admin panel.

## How an iteadmin gets started

1. **Fork & clone** this repo, then `bun install`.
2. **Decide where it runs**:
   - *Lovable Cloud* (recommended): import the repo in the Lovable dashboard,
     set the `MCP_ADMIN_KEY` secret in **Settings → Secrets**, click Publish.
     You get a stable URL like `https://project--<id>.lovable.app`.
   - *Self-host on Cloudflare Workers*: `bunx wrangler deploy`. Set the
     secret with `bunx wrangler secret put MCP_ADMIN_KEY`.
3. **Open `/mcp`** on the deployed URL. You should see "Admin key:
   Configured ✓" and the endpoint URL ready to copy.
4. **Hand the endpoint + admin key to the agent** (see "Connecting an
   external agent" below).
5. *(Optional)* Mint scoped per-agent keys via the admin-only `create_key`
   skill so each downstream agent only writes to its own sites.

## Connecting an external agent

The MCP endpoint follows the [Streamable HTTP
spec](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports).
Every request is JSON-RPC 2.0 over POST.

```bash
# Health check (no auth needed)
curl https://your-host/api/mcp

# List skills
curl -X POST https://your-host/api/mcp \
  -H 'Authorization: Bearer YOUR_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Create a site
curl -X POST https://your-host/api/mcp \
  -H 'Authorization: Bearer YOUR_ADMIN_KEY' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc":"2.0","id":2,"method":"tools/call",
    "params":{"name":"create_site","arguments":{
      "title":"Hello",
      "markdown":"::hero\n# Hej!\n[Start](/start){variant=primary}\n::"
    }}
  }'
```

For Claude Desktop / OpenClaw style clients, register the endpoint as a
Streamable HTTP MCP server with the bearer token as the auth header.

## Skills (v2)

Discoverable from the agent via `tools/list`. Every site-targeting skill
takes `idOrSlug`.

**Lifecycle** — `create_site`, `get_site`, `update_site`, `delete_site`,
`duplicate_site`, `rename_slug`, `set_metadata` (tags / owner / status),
`publish_site`, `unpublish_site`, `list_sites` (filter by `search`,
`status`, `tag`, paginated).

**Directive discovery** — `list_directives`, `get_directive_schema`. The
agent should call these before writing markdown so it knows which
`::blocks::` exist and what attrs they take.

**Theming** — `list_themes`, `get_theme`, `set_theme`, `get_site_theme`,
`update_theme_tokens`, `reset_theme_tokens`. Ten curated design templates
(Editorial Serif, Modern Tech, Brutalist Pop, Luxury Noir, Wellness Soft,
Startup Bold, Corporate Trust, Creative Playful, Dev Docs, Nature Organic).
Agents pick a theme; per-site brand tweaks are limited to a whitelist
(`primary`, `accent`, `background`, `foreground`, `radius`, `logoUrl`, …)
so output stays designerly even when an LLM writes the markdown.

**Block-level editing** (cheap incremental edits) — `list_blocks`,
`add_block`, `update_block`, `remove_block`, `move_block`. Operate by
index instead of round-tripping the entire markdown body.

**Validation & review** — `validate_markdown`, `diff_markdown`.

**Revisions** — `list_revisions`, `restore_revision`. Every mutating
skill snapshots automatically (last 25 per site).

**Assets** — `upload_asset` (data URL), `list_assets`, `delete_asset`.

**Observability** — `get_activity`.

**Key management** *(admin-only — global `MCP_ADMIN_KEY` required)* —
`create_key`, `list_keys`, `revoke_key`. Scoped keys can be limited to
specific `siteIds` so downstream agents can't touch each other's sites.

## Directives

Run `tools/call` → `list_directives` for the live list, or open `/docs`.
Currently supported: `nav`, `hero`, `features`, `pricing`, `quote`, `cta`,
`footer`, `stats`, `logos`, `testimonials`, `faq`, `gallery`, `timeline`,
`steps`, `tabs`, `divider`, `split`.

Markdown shape:

```md
---
title: My site
---

::nav{brand="Acme"}
- Home → /
- Docs → /docs
::

::hero{eyebrow="v1.0"}
# Headline
## Subhead.
[Start](/start){variant=primary} [Docs](/docs)
::
```

## Project layout

```
src/
├── routes/
│   ├── index.tsx                  # landing page
│   ├── docs.tsx                   # directive docs
│   ├── edit.tsx                   # live markdown editor
│   ├── mcp.tsx                    # admin panel
│   ├── mcp.preview.$slug.tsx      # SSR preview of an MCP-managed site
│   └── api.mcp.ts                 # MCP JSON-RPC endpoint
├── lib/
│   ├── markdown-web/parser.ts     # frontmatter + ::directive:: parser
│   └── mcp/
│       ├── store.ts               # in-memory sites/revisions/assets/keys
│       ├── skills.ts              # MCP tool registry
│       ├── directives.ts          # directive schema for `list_directives`
│       └── serialize.ts           # blocks → markdown
└── components/markdown-web/       # block renderers
```

## Going to production

The demo store is `Map`-based and per-Worker-instance. For real workloads:

1. **Enable Lovable Cloud** (or Supabase) and replace `src/lib/mcp/store.ts`
   with Postgres-backed equivalents. The skill surface stays identical —
   only the storage primitives change.
2. **Move assets** from data-URL-in-memory to Lovable Cloud storage / R2.
3. **Rate-limit** `/api/mcp` per key and bound payload sizes.
4. **Audit log → durable**: persist `recordActivity` entries.

## Deploy

- **Lovable**: click *Publish*. Frontend updates require an explicit
  publish; server routes deploy on save.
- **Cloudflare Workers**: `bunx wrangler deploy` (config in `wrangler.jsonc`).

## License

MIT.
