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
  createKey,
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

const mintKey = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { adminKey: string; label: string; siteScopes: string[] }) => data,
  )
  .handler(async ({ data }) => {
    const expected = process.env.MCP_ADMIN_KEY;
    if (!expected) throw new Error("Server missing MCP_ADMIN_KEY");
    if (!data.adminKey || data.adminKey !== expected) {
      throw new Error("Invalid admin key");
    }
    const label = data.label.trim();
    if (!label) throw new Error("Label is required");
    const { key, token } = await createKey({
      label,
      siteScopes: data.siteScopes.map((s) => s.trim()).filter(Boolean),
    });
    return {
      id: key.id,
      label: key.label,
      token,
      tail: key.tail,
      siteScopes: key.siteScopes,
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

        {/* Mint key */}
        <MintKeySection onMinted={refresh} />

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

type MintResult = {
  id: string;
  label: string;
  token: string;
  tail: string;
  siteScopes: string[];
};

function MintKeySection({ onMinted }: { onMinted: () => void }) {
  const [adminKey, setAdminKey] = useState("");
  const [label, setLabel] = useState("");
  const [scopes, setScopes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MintResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await mintKey({
        data: {
          adminKey,
          label,
          siteScopes: scopes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      });
      setResult(res as MintResult);
      setAdminKey("");
      setLabel("");
      setScopes("");
      onMinted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mint key");
    } finally {
      setLoading(false);
    }
  }

  async function copyToken() {
    if (!result) return;
    await navigator.clipboard.writeText(result.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="border-4 border-foreground p-6 space-y-4">
      <div>
        <h2 className="text-xl font-black uppercase">Mint API key</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Requires the global <code className="font-mono">MCP_ADMIN_KEY</code>.
          The token is shown ONCE — copy it now.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-widest font-bold">
              Admin key
            </span>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="MCP_ADMIN_KEY"
              required
              autoComplete="off"
              className="w-full border-2 border-foreground bg-background p-2 font-mono text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-widest font-bold">
              Label
            </span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="hermes-prod"
              required
              className="w-full border-2 border-foreground bg-background p-2 font-mono text-sm"
            />
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-widest font-bold">
            Site scopes (optional, comma-separated site IDs)
          </span>
          <input
            type="text"
            value={scopes}
            onChange={(e) => setScopes(e.target.value)}
            placeholder="leave empty for full access"
            className="w-full border-2 border-foreground bg-background p-2 font-mono text-sm"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="border-2 border-foreground px-4 py-2 font-bold uppercase text-sm hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
          >
            {loading ? "Minting…" : "Mint key"}
          </button>
          {error && (
            <span className="text-destructive font-bold text-sm">{error}</span>
          )}
        </div>
      </form>

      {result && (
        <div className="border-2 border-foreground bg-muted p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs uppercase tracking-widest font-bold">
              Token for "{result.label}" — copy now, won't be shown again
            </div>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="text-xs underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <code className="flex-1 bg-background p-3 font-mono text-sm break-all border-2 border-foreground">
              {result.token}
            </code>
            <button
              type="button"
              onClick={copyToken}
              className="border-2 border-foreground px-4 py-2 font-bold uppercase text-sm hover:bg-foreground hover:text-background transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            id: {result.id} · tail: …{result.tail} ·{" "}
            {result.siteScopes.length === 0
              ? "all sites"
              : `scopes: ${result.siteScopes.join(", ")}`}
          </div>
        </div>
      )}
    </section>
  );
}
