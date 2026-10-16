---
name: atlas
description: Govern work in the xoroh/atlas documentation platform. Use for any Atlas task: TanStack Start site development, content authoring, validation, and releases. Stops before publication, deployment, merges, and cross-repository actions.
---

# atlas skill

Atlas (`xoroh/atlas`) is the reusable documentation engine and platform for
the Xoroh ecosystem. It powers documentation sites — including the Xoroh
Atlas site in `apps/docs` — without absorbing other projects' documentation
identity. Kern keeps its own docs; future consumers keep theirs.

## Architecture (see `docs/adr/0002-tanstack-foundation.md`; ADR-0001 §D3 withdrawn)

- `apps/docs` — the Xoroh Atlas documentation site on **TanStack Start**:
  file-based routes plus Atlas-owned MDX content pipeline (inventory,
  frontmatter schema, navigation). Engine concerns stay separable for
  future extraction into `packages/atlas-engine`; sites never patch
  engine internals — configuration and plugins are the only seam.
- Legacy: an Astro + Starlight implementation of `apps/docs` is still
  present and is preserved byte-identical until the TanStack replacement
  passes every acceptance gate in `docs/migration-plan.md`. Do not extend
  it, add Starlight conventions to new work, or copy its patterns into the
  new app — its five MDX pages are content to rewrite, not conventions to
  keep.
- `packages/` — reserved for distributable documentation tooling with its own
  release policy. Nothing lives here until a real consumer needs it (no new
  packages for v1).
- No `libs/` — there is no internal shared-library need yet; introduce it
  only when two consumers share non-distributable code.

## Development workflow

- Toolchain: Bun >=1.4.2. Install: `bun install --frozen-lockfile`.
- Target validation (TanStack app, once scaffolded): `bun test`, type-check
  and production build per `apps/docs/package.json` scripts; production
  build must emit self-contained static output (no Atlas backend required)
  per `docs/migration-plan.md` acceptance gates.
- Legacy validation (Astro app, until cutover): `bun test`,
  `bun run check` (Astro check), `bun run build` (production build from
  `apps/docs`). These commands validate the old implementation only.
- Content: file-based MDX under the Atlas frontmatter schema (required
  `title`, `description`); navigation owned by Atlas configuration, not
  framework conventions.
- URL reservations: `/v/{version}` and `/{locale}/` prefixes are reserved;
  do not implement versioning or i18n content yet.
- AI surfaces: generated static `llms.txt`, per-page Markdown, and
  `manifest.json`; MCP/CLI deferred.
- Dependencies: each addition needs a named concrete requirement and must
  satisfy `docs/adr/0002-tanstack-foundation.md` §10 (static-output
  compatible, maintained, MIT-compatible, minimal transitive weight).
  Verify framework behavior against installed-version schemas, never from
  memory or third-party guides.
- Never reference Fumadocs in product-facing architecture documentation.

## Validation and project-specific requirements

- CI runs frozen install, tests, type-check, and production build with
  least-privilege permissions and pinned actions.
- Changesets govern versioning; releases are manual with explicit human
  approval (`docs/RELEASING.md`). Never publish from CI.
- Standards provenance lives in `ADOPTED_STANDARDS.md`; update it on every
  adoption or rollback.

## Boundaries

Stop and request explicit authorization before: releases, tags, publication,
deployments, merges, pushes to `development`, settings changes, secrets
handling, or accessing other repositories (Kern, Axis, or any other).
Unresolved owner decisions (maintainers, hosting, external adopters) stay
open — record them, do not decide them.

## Xoroh standards audit entry point

On requests like "audit this repository against Xoroh standards", run an
on-demand audit (read-only by default) using the central `repository-audit`
procedure:

1. Identify this repository and read `ADOPTED_STANDARDS.md`: source repo,
   tag/SHA pin, adopted files, date, validation history.
2. Determine the baseline: **pinned-baseline audit** (compliance against the
   recorded pin — always possible locally) versus **latest-standards audit**
   (compliance against the current central revision — needs access to an
   up-to-date `xoroh/xoroh` checkout; report which one was performed).
3. Check: root `AGENTS.md` accuracy and this skill's discoverability; this
   skill's accuracy and boundaries; `apps/`/`packages/` structure;
   toolchain, CI, and permissions; secret handling; release procedure;
   provenance accuracy (pin still matches adopted files); independence
   (builds and runs without the central repo); broken refs and stale text.
4. Apply only applicable requirements — never demand every directory,
   framework, or feature.
5. Classify findings: compliant / noncompliant / partial / blocked /
   exception / owner-decision-required / recommendation / not-applicable,
   each with standard, evidence, impact, next action.
6. Standardization needs explicit scope and follows
   `cross-repo-standardization` — never modify as part of the audit.
