# Target architecture — Xoroh Atlas on TanStack Start

Authoritative decisions: `docs/adr/0002-tanstack-foundation.md` (accepted,
owner-directed). This document describes the resulting system; where it adds
operational detail, the ADR prevails on any conflict.

## System shape (v1)

One TanStack Start application in `apps/docs`. No new workspace packages. No
Atlas-hosted backend required: the production build is a self-contained
static directory servable from any static host or CDN.

```text
apps/docs/
  routes/            __root.tsx, index, getting-started,
                     guides.architecture, guides.contributing,
                     guides.governance, 404 (file-route names per
                     TanStack Router conventions at implementation time)
  content/docs/      rewritten MDX source (5 pages at cutover)
  lib/content.*      inventory + frontmatter schema + navigation +
                     llms.txt/manifest.json/Markdown generators
  public/            favicons, fonts, other static assets
  vite.config.ts     TanStack Start plugin, prerender config, hosting seam
```

`packages/` stays an empty reservation (second consumer triggers engine
extraction per ADR-0001 D1, not v1 scope).

## Content pipeline

MDX files in-repo → Atlas-owned parsing/validation → route inventory →
prerendered HTML + navigation + search index + AI artifacts. Stages:

1. **Author** in `content/docs/` under the Atlas frontmatter schema
   (`title`, `description` required; navigation weight/order optional).
2. **Validate** at build/test time: schema conformance, every inventoried
   route reachable from navigation or explicitly unlisted, no orphans.
3. **Generate**: static HTML per route, sidebar/navigation data, search
   index (format per search-spike outcome), `llms.txt`, per-page Markdown,
   `manifest.json` (routes, versions, maturity), sitemap.
4. **Verify** via the acceptance gates in `docs/migration-plan.md`.

## Rendering and deployment model

Prerendered HTML-first; hydration bounded to interactive elements (theme
toggle, search UI, nav state); route-level code-splitting. Hosting provider
and canonical URL remain TBD behind a config/env seam — nothing hardcoded.
First deploy re-verifies host-specific 404 semantics against the host's
documented behavior.

## Cross-cutting behavior

- **Navigation/discoverability:** Atlas-owned sidebar config; full
  route inventory with completeness tests; sitemap.
- **SEO:** per-page metadata, semantic HTML, canonical URLs via seam.
- **Accessibility:** readable with no JS; keyboard-navigable; theme honors
  `prefers-color-scheme`; persisted preference.
- **Themes:** light/dark CSS, no-JS fallback default.
- **404/errors:** designed 404 route + host-validated static mechanism.
- **AI/LLM:** generated `llms.txt`, per-page Markdown, `manifest.json`;
  MCP/CLI deferred until a real consumer exists.
- **Search:** behind a narrow seam (index-build step + UI slot); concrete
  implementation chosen by the bounded spike, recorded before it ships.

## Explicit non-goals for v1

Second packages, engine extraction, versioned snapshots, i18n content,
API-reference generation, search-service backends, MCP/CLI, SSR or
Atlas-hosted runtimes, framework-neutral abstraction layers.

## Evolution path (no premature building)

Second consumer → extract `packages/atlas-engine` behind the D1
configuration seam. Versioning/i18n → reserved URL prefixes (ADR-0001 D4)
with independent justification. Each future capability needs a real consumer
and its own cost justification.
