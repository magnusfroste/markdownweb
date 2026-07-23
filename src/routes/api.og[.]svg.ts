/**
 * Dynamic OG image endpoint.
 *
 * Renders a themed SVG social card from query params so every share link
 * gets a meaningful preview instead of hosting's screenshot fallback.
 *
 *   /api/og.svg?title=...&subtitle=...&bg=...&fg=...&accent=...&font=...&badge=...
 *
 * Twitter/X renders SVG og:image. Facebook/LinkedIn support is
 * inconsistent, so long-term we'd rasterize (satori + resvg-wasm) — for
 * the POC an SVG that at least beats a blank preview is worth the trade.
 */
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const W = 1200;
const H = 630;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clean(v: string | null, fallback: string, max = 200): string {
  if (!v) return fallback;
  return v.slice(0, max);
}

function isHex(v: string | null): v is string {
  return !!v && /^#[0-9a-fA-F]{3,8}$/.test(v);
}

/** Wrap `text` into lines that fit `maxChars` per line, up to `maxLines`. */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length <= maxChars) {
      current = (current + " " + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (words.join(" ").length > lines.join(" ").length) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.replace(/.{0,3}$/, "…");
  }
  return lines;
}

export const Route = createFileRoute("/api/og.svg")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams;

        const title = clean(q.get("title"), "MarkdownWeb", 120);
        const subtitle = clean(q.get("subtitle"), "Sites you write in Markdown", 140);
        const badge = clean(q.get("badge"), "mdsites.lovable.app", 60);
        const bg = isHex(q.get("bg")) ? q.get("bg")! : "#0a0a0a";
        const fg = isHex(q.get("fg")) ? q.get("fg")! : "#f5f5f5";
        const accent = isHex(q.get("accent")) ? q.get("accent")! : "#ff5b1f";
        const muted = isHex(q.get("muted")) ? q.get("muted")! : fg;
        const fontFamily = clean(
          q.get("font"),
          "Space Grotesk, Inter, system-ui, sans-serif",
          80,
        );

        const titleLines = wrap(title, 22, 3);
        const titleFontSize = titleLines.length >= 3 ? 84 : titleLines.length === 2 ? 96 : 112;
        const titleLineHeight = titleFontSize * 1.05;
        const titleBlockHeight = titleLines.length * titleLineHeight;
        const titleStartY = 240 + (H - 320 - titleBlockHeight) / 2;

        const titleTspans = titleLines
          .map(
            (line, i) =>
              `<tspan x="80" dy="${i === 0 ? 0 : titleLineHeight}">${esc(line)}</tspan>`,
          )
          .join("");

        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${esc(bg)}"/>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <circle cx="1080" cy="120" r="380" fill="${esc(accent)}" opacity="0.10"/>
  <rect x="0" y="0" width="12" height="${H}" fill="${esc(accent)}"/>

  <g font-family="${esc(fontFamily)}" fill="${esc(fg)}">
    <text x="80" y="130" font-size="24" font-weight="600" letter-spacing="4" fill="${esc(accent)}" opacity="0.95">
      ${esc(badge.toUpperCase())}
    </text>

    <text x="80" y="${titleStartY}" font-size="${titleFontSize}" font-weight="700" letter-spacing="-2">
      ${titleTspans}
    </text>

    <text x="80" y="${H - 90}" font-size="30" font-weight="500" fill="${esc(muted)}" opacity="0.75">
      ${esc(subtitle)}
    </text>

    <g transform="translate(80, ${H - 44})" font-size="20" font-weight="600" letter-spacing="2" fill="${esc(muted)}" opacity="0.55">
      <text>MARKDOWNWEB</text>
    </g>
  </g>
</svg>`;

        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
