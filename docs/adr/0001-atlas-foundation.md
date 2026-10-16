# ADR-001: Atlas initial platform direction

- Status: partially superseded (D3 withdrawn by ADR-0002, confirmed by
  ADR-0003; see Correction below)
- Date: 2026-10-16
- Deciders: implementation task for `xoroh/atlas` Phase 0–1 (owner direction
  from the readiness audit; framework choice evidence-backed by spike below).
- Correction: 2026-10-16 (owner direction — TanStack Start, recorded in
  ADR-0002).

## Correction (2026-10-16)

The framework selection in D3 (Astro + Starlight) was recorded above as
`accepted` without the owner's approval. The owner has directed that Atlas
use TanStack Start instead. The historical record is preserved unchanged;
only its standing is corrected:

- **D3 (Framework: Astro + Starlight) is withdrawn** and superseded by
  [ADR-0002](0002-tanstack-foundation.md), confirmed by
  [ADR-0003](0003-atlas-core-first.md) (website program superseded before
  implementation; engine packages are the product). The spike evidence in
  D3 remains valid as a measurement of the Astro/Starlight implementation,
  not as a justification for keeping it.
- **D1 (engine/site boundary, deferred extraction), D2 (file-based MDX
  in-repo), D4 (`/v/{version}` and locale URL reservations), and D5 (static
  AI surfaces first; MCP/CLI deferred) remain valid** and are carried forward
  by ADR-0002. D2's mechanism changes (Starlight content collections are
  replaced by an Atlas-owned pipeline); its principle does not.
- The Astro + Starlight application in `apps/docs` is therefore a legacy
  implementation pending migration, not the approved architecture. It is
  preserved unchanged until the replacement passes its acceptance gates (see
  `docs/migration-plan.md`).

## Context

Atlas is an empty scaffold (single init commit): Bun 1.3.8 workspaces, a
manifest-only `apps/docs`, empty `packages/`, green validate-only CI. It must
become a reusable documentation platform (engine + branded sites) without
overbuilding v1. Kern keeps its own docs identity; Atlas powers sites, it
does not absorb them.

## D1 — Engine/site boundary

**Decision:** strict configuration seam. A future `packages/atlas-engine`
owns the content model, navigation, search-index building, and theme
contract; `apps/*` hold site configuration and content only. Sites never
patch engine internals; configuration and plugins are the only extension
mechanism. **Deferred:** extracting the engine package until a second site
or a real consumer needs it (Phase 1 keeps engine concerns inside `apps/docs`
with the seam documented, not extracted).

## D2 — Content model

**Decision:** file-based MDX in-repo (content collections). Alternatives:
CMS-backed authoring (rejected: operational burden, no editors demanding
it); database content (rejected: versioning and review become hard).
Getting it wrong costs a content migration; collections keep that migration
bounded because the engine owns the model.

## D3 — Framework

**Decision:** Astro + Starlight. Evidence from a bounded spike (2026-10-16,
both starters installed and production-built locally):
- Starlight: 270 packages, ~4 s build, 1.2 MB static output, Pagefind search
  index generated during build, content collections native, i18n routing
  supported, zero-JS default.
- Docusaurus (credible alternative): ~6 s build, 2.3 MB output, ~924 KB
  homepage JS, search needs a plugin/service, stronger built-in versioning
  and i18n content workflows.
Starlight wins on the audit criteria (file-based MDX, static output,
minimal client JS, content modeling, deploy-anywhere static). Docusaurus
wins only where Atlas v1 explicitly defers (multi-version hosting, i18n
content operations). Revisit if interactive playgrounds become core.

## D4 — URL and versioning strategy

**Decision:** reserve `/v/{version}` and locale prefixes (`/{locale}/`) in
the URL design now; ship neither in v1 (single version, single locale).
Rationale: URLs are forever; reservations cost nothing, migrations cost
trust. No routing complexity added now.

## D5 — AI-facing documentation

**Decision:** static `llms.txt` + per-page Markdown output + a small
`manifest.json` (routes, versions, maturity) from the start — cheap, no
infrastructure, validated by file-existence checks. MCP server and CLI
deferred until a real consumer requires programmatic access.

## Consequences

Phase 1 builds `apps/docs` on Starlight with the seam documented for future
engine extraction. Versioned snapshots, i18n content, API-reference
generation, and search-service upgrades each need their own cost
justification later. Remaining uncertainty: exact engine package split
(settled at Phase 2 when a second consumer exists).
