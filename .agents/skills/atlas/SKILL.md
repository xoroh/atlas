---
name: atlas
description: Govern work in the xoroh/atlas documentation platform. Use for any Atlas task: Astro/Starlight site development, content authoring, validation, and releases. Stops before publication, deployment, merges, and cross-repository actions.
---

# atlas skill

Atlas (`xoroh/atlas`) is the reusable documentation engine and platform for
the Xoroh ecosystem. It powers documentation sites — including the Xoroh
Atlas site in `apps/docs` — without absorbing other projects' documentation
identity. Kern keeps its own docs; future consumers keep theirs.

## Architecture (see `docs/adr/0001-atlas-foundation.md`)

- `apps/docs` — the Xoroh Atlas documentation site (Astro + Starlight):
  configuration plus Markdown/MDX content. Engine concerns stay separable
  for future extraction into `packages/atlas-engine`; sites never patch
  engine internals — configuration and plugins are the only seam.
- `packages/` — reserved for distributable documentation tooling with its own
  release policy. Nothing lives here until a real consumer needs it.
- No `libs/` — there is no internal shared-library need yet; introduce it
  only when two consumers share non-distributable code.

## Development workflow

- Toolchain: Bun >=1.4.2. Install: `bun install --frozen-lockfile`.
- Validate: `bun test`, `bun run check` (Astro check), `bun run build`
  (production build from `apps/docs`).
- Content: file-based MDX under `apps/docs/src/content/docs/`; follow
  Starlight conventions (sidebar config in `astro.config.mjs`).
- URL reservations: `/v/{version}` and `/{locale}/` prefixes are reserved;
  do not implement versioning or i18n content yet.
- AI surfaces: static `llms.txt` plus per-page Markdown; MCP/CLI deferred.

## Validation and project-specific requirements

- CI runs frozen install, tests, Astro check, and production build with
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
