/**
 * MCP settings page — admin view.
 *  - Endpoint URL + admin key status
 *  - Listed skills (admin vs scoped)
 *  - All MCP-managed sites with status/tags
 *  - Recent activity (last 50)
 *
 * State comes from a server fn so it reflects the Worker-side in-memory store.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { skills } from "@/lib/mcp/skills";
import { themes } from "@/lib/mcp/themes";
import { templates } from "@/lib/mcp/templates";
import {
  listActivity,
  listSites,
  listKeys,
  type ActivityEntry,
  type Site,
  type ApiKey,
} from "@/lib/mcp/store";

const getMcpStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { items } = listSites({ limit: 200 });
  return {
    keyConfigured: Boolean(process.env.MCP_ADMIN_KEY),
    activity: listActivity(50),
    sites: items,
    keys: listKeys(),
  };
});

type Status = {
  keyConfigured: boolean;
  activity: ActivityEntry[];
  sites: Site[];
  keys: ApiKey[];
};

const skillSummaries = skills.map((s) => ({
  name: s.name,
  description: s.description,
  adminOnly: Boolean(s.adminOnly),
}));

export const Route = createFileRoute("/mcp")({
  head: () => ({ meta: [{ title: "MCP — MarkdownWeb" }] }),
  loader: () => getMcpStatus(),
  component: McpSettingsPage,
});

function McpSettingsPage() {
  const initial = Route.useLoaderData() as Status;
  const [status, setStatus] = useState<Status>(initial);
  const [endpoint, setEndpoint] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEndpoint(`${window.location.origin}/api/mcp`);
  }, []);

  async function refresh() {
    const next = await getMcpStatus();
    setStatus(next);
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-foreground bg-foreground text-background px-6 py-4">
        <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
          <div>
            <div className="text-xs uppercase tracking-widest opacity-60">Settings</div>
            <h1 className="text-2xl font-black uppercase">MCP server</h1>
          </div>
          <Link to="/" className="text-xs uppercase tracking-widest underline underline-offset-4">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Endpoint */}
        <section className="border-4 border-foreground p-6 space-y-4">
          <h2 className="text-xl font-black uppercase">Endpoint</h2>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <code className="flex-1 bg-muted p-3 font-mono text-sm break-all border-2 border-foreground">
              {endpoint || "—"}
            </code>
            <button
              type="button"
              onClick={() => copy(endpoint)}
              disabled={!endpoint}
              className="border-2 border-foreground px-4 py-2 font-bold uppercase text-sm hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
            >
              {copied ? "Copied!" : "Copy URL"}
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="border-2 border-foreground p-3">
              <div className="text-xs uppercase tracking-widest opacity-60">Auth header</div>
              <code className="font-mono">Authorization: Bearer &lt;token&gt;</code>
            </div>
            <div className="border-2 border-foreground p-3">
              <div className="text-xs uppercase tracking-widest opacity-60">Admin key</div>
              {status.keyConfigured ? (
                <span className="font-bold text-green-700">Configured ✓</span>
              ) : (
                <span className="font-bold text-destructive">
                  Missing — set MCP_ADMIN_KEY
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="border-4 border-foreground p-6 space-y-4">
          <h2 className="text-xl font-black uppercase">Skills ({skillSummaries.length})</h2>
          <ul className="divide-y-2 divide-foreground">
            {skillSummaries.map((s) => (
              <li key={s.name} className="py-3 grid sm:grid-cols-[220px_1fr] gap-3">
                <code className="font-mono font-bold flex items-center gap-2">
                  {s.name}
                  {s.adminOnly && (
                    <span className="text-[10px] bg-foreground text-background px-1 py-0.5 uppercase">
                      admin
                    </span>
                  )}
                </code>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Themes */}
        <section className="border-4 border-foreground p-6 space-y-4">
          <h2 className="text-xl font-black uppercase">Design themes ({themes.length})</h2>
          <p className="text-sm text-muted-foreground">
            Curated templates an MCP agent can apply via{" "}
            <code className="font-mono">set_theme</code>. Per-site brand
            tweaks via <code className="font-mono">update_theme_tokens</code>.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {themes.map((t) => (
              <div
                key={t.slug}
                className="border-2 border-foreground p-3 space-y-2"
                style={{ background: t.tokens.background, color: t.tokens.foreground }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm" style={{ fontFamily: t.tokens.fontDisplay }}>
                    {t.name}
                  </span>
                  <code className="text-[10px] opacity-70 font-mono">{t.slug}</code>
                </div>
                <div className="flex gap-1">
                  {[t.tokens.primary, t.tokens.accent, t.tokens.foreground, t.tokens.muted].map((c) => (
                    <span
                      key={c}
                      className="w-6 h-6 border"
                      style={{ background: c, borderColor: t.tokens.border }}
                    />
                  ))}
                </div>
                <p className="text-xs opacity-80" style={{ fontFamily: t.tokens.fontBody }}>
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section className="border-4 border-foreground p-6 space-y-4">
          <h2 className="text-xl font-black uppercase">Site templates ({templates.length})</h2>
          <p className="text-sm text-muted-foreground">
            Pre-built blueprints with <code className="font-mono">{`{{variables}}`}</code>.
            Agents instantiate via{" "}
            <code className="font-mono">create_site_from_template</code>.
          </p>
          <ul className="divide-y-2 divide-foreground">
            {templates.map((t) => (
              <li key={t.slug} className="py-3 grid sm:grid-cols-[200px_1fr] gap-3">
                <div>
                  <div className="font-bold">{t.name}</div>
                  <code className="text-[10px] opacity-60 font-mono">{t.slug}</code>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {t.recommendedThemes.map((th) => (
                      <span key={th} className="bg-muted px-1 py-0.5 font-mono">
                        theme:{th}
                      </span>
                    ))}
                    {t.variables.map((v) => (
                      <span
                        key={v.name}
                        className="border border-foreground px-1 py-0.5 font-mono"
                        title={v.description}
                      >
                        {`{{${v.name}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Sites */}
        <section className="border-4 border-foreground p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase">Sites ({status.sites.length})</h2>
            <button
              type="button"
              onClick={refresh}
              className="border-2 border-foreground px-3 py-1 text-xs uppercase font-bold hover:bg-foreground hover:text-background transition-colors"
            >
              Refresh
            </button>
          </div>
          {status.sites.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sites yet. Call <code className="font-mono">create_site</code> via MCP.
            </p>
          ) : (
            <ul className="divide-y-2 divide-foreground">
              {status.sites.map((s) => (
                <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold flex items-center gap-2 flex-wrap">
                      {s.title}
                      <span
                        className={`text-[10px] px-1 py-0.5 uppercase border ${
                          s.status === "published"
                            ? "bg-foreground text-background"
                            : "border-foreground"
                        }`}
                      >
                        {s.status}
                      </span>
                      {s.tags.map((t) => (
                        <span key={t} className="text-[10px] bg-muted px-1 py-0.5 font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      /{s.slug} · theme: {s.themeSlug} · {new Date(s.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Link
                      to="/mcp/preview/$slug"
                      params={{ slug: s.slug }}
                      className="border-2 border-foreground px-3 py-1 text-xs uppercase font-bold hover:bg-foreground hover:text-background transition-colors text-center"
                    >
                      Preview →
                    </Link>
                    <a
                      href={`/mcp/source/${s.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="border-2 border-foreground px-3 py-1 text-xs uppercase font-bold hover:bg-primary hover:text-primary-foreground transition-colors text-center"
                      title="Raw markdown for LLM crawlers"
                    >
                      .md ↗
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* API Keys */}
        <section className="border-4 border-foreground p-6 space-y-4">
          <h2 className="text-xl font-black uppercase">Scoped keys ({status.keys.length})</h2>
          {status.keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No scoped keys yet. Mint one with{" "}
              <code className="font-mono">create_key</code> (admin-only). The
              global admin key always works.
            </p>
          ) : (
            <ul className="divide-y-2 divide-foreground">
              {status.keys.map((k) => (
                <li key={k.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold">
                      {k.label}{" "}
                      <span className="font-mono text-xs opacity-60">…{k.tail}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {k.siteScopes.length === 0
                        ? "all sites"
                        : `${k.siteScopes.length} site(s)`}{" "}
                      · {new Date(k.createdAt).toLocaleString()}
                      {k.revokedAt && " · revoked"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Activity */}
        <section className="border-4 border-foreground p-6 space-y-4">
          <h2 className="text-xl font-black uppercase">Activity ({status.activity.length})</h2>
          {status.activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No MCP calls yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground text-left">
                    <th className="py-2 pr-3 text-xs uppercase">Time</th>
                    <th className="py-2 pr-3 text-xs uppercase">Skill</th>
                    <th className="py-2 pr-3 text-xs uppercase">Status</th>
                    <th className="py-2 pr-3 text-xs uppercase">Args</th>
                    <th className="py-2 pr-3 text-xs uppercase">Key</th>
                    <th className="py-2 pr-3 text-xs uppercase">Δ ms</th>
                  </tr>
                </thead>
                <tbody>
                  {status.activity.map((a) => (
                    <tr key={a.id} className="border-b border-muted-foreground/30 align-top">
                      <td className="py-2 pr-3 font-mono text-xs whitespace-nowrap">
                        {new Date(a.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2 pr-3 font-mono">{a.skill}</td>
                      <td className="py-2 pr-3">
                        {a.status === "ok" ? (
                          <span className="text-green-700 font-bold">OK</span>
                        ) : (
                          <span className="text-destructive font-bold" title={a.message}>
                            ERR
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs max-w-[280px] truncate">
                        {a.args || "—"}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">…{a.keyTail}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{a.durationMs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
