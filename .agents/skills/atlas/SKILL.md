---
name: atlas
description: Govern work in the xoroh/atlas documentation engine. Use for any Atlas task: engine package development, content-pipeline work, validation, and releases. Stops before publication, deployment, merges, and cross-repository actions.
---

# atlas skill

Atlas (`xoroh/atlas`) is the Xoroh documentation **engine**: validated
documents and deterministic generated outputs that future consumers
(sites, CLIs, agents) build on. There is no website in this repository;
a site is a future consumer project, not the foundation (see
`docs/adr/0003-atlas-core-first.md`).

## Architecture (see `docs/adr/0003-atlas-core-first.md`)

- `packages/atlas-core` — contracts only: configuration model, document
  model, public types, diagnostics. Zero runtime dependencies.
- `packages/atlas-content` — file discovery, Markdown+frontmatter parsing,
  metadata validation, normalized `AtlasDocument`s. Depends on core only
  (+ its frontmatter library).
- `packages/atlas-build` — pipeline orchestration
  (`buildAtlas`: config → documents → outputs) and deterministic
  generation (`manifest.json`, `llms.txt`, per-page Markdown) plus file
  writers. Depends on core and content.
- Dependency direction flows toward `atlas-core` only; no cycles. Engine
  packages never import Astro, Starlight, TanStack Start, React, or any
  rendering framework — enforced by `tests/monorepo.test.ts`.
- `packages/` gains a new member only for a demonstrated responsibility
  with an explicit contract — never for diagram symmetry or hypothetical
  integrations. No MDX/search/theme/site packages exist; each needs a real
  requirement first.
- `apps/` is reserved for future consumer applications. None exist now;
  do not create a website, a replacement site, or a temporary second site.

## Development workflow

- Toolchain: Bun >=1.4.2. Install: `bun install --frozen-lockfile`.
- Validate: `bun test` (unit + lifecycle integration + workspace boundary
  tests), `bun run check` (strict typecheck of engine packages and root
  tests) — exactly as CI does.
- Content format: Markdown with YAML frontmatter (`.md`) validated
  against the Atlas schema (required `title`, `description`). MDX stays a
  future adapter until justified; do not add it speculatively.
- Fixtures live in `packages/atlas-content/fixtures/`; keep them small and
  purpose-built. One bad file must never hide another — collect
  diagnostics, don't throw past them.
- gray-matter is called with explicit options (never bare) to bypass its
  input cache; see `packages/atlas-content/src/parse.ts` and `vendor.d.ts`.
- Dependencies: each addition needs a named concrete requirement and must
  satisfy `docs/adr/0003-atlas-core-first.md` §4. Verify library behavior
  against installed-version code, never from memory or third-party guides.
- Never reference Fumadocs in product-facing architecture documentation.

## Validation and project-specific requirements

- CI runs frozen install, engine tests, and strict typecheck with
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
