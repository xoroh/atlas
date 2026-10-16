# Repository audit — Xoroh Atlas

- Date: 2026-10-16. Branch: `development` at `f1bfef8` (merge of PR #3).
- Scope: `xoroh/atlas` only. No other repository was accessed or modified.
- Method: read-only inspection of all tracked files, full history, all
  remote branches, PR metadata, and CI logs. Local Bun 1.3.8 vs required
  ≥1.4.2 — local runs are provisional; CI (Bun 1.4.2) is the authority.

## Identity

Public MIT Bun workspace monorepo, org `xoroh`, default branch
`development`. 39 tracked files, 6 commits. Open PRs: #1
(`actions/checkout` 4→7, CI green) and #4 (TypeScript 5.9.3→7.0.2, **CI
failing** — `astro check` does not support TypeScript 7; do not merge
without resolving). `fix/dependabot-bun-ecosystem` is fully merged — base
all work on `development`.

## Layout and toolchain

- Root `package.json`: `atlas-monorepo`, private MIT, `bun@1.4.2`,
  workspaces `apps/*` + `packages/*`; scripts `test` / `dev` / `build` /
  `check` (the latter three delegate to `@xoroh/atlas-docs`).
- CI (`.github/workflows/ci.yml`): frozen install → `bun test` →
  `bun run check` → `bun run build`, Bun 1.4.2, least-privilege. Green on
  `development`.
- Dependabot: `github-actions` + `bun` ecosystems. Release discipline:
  Changesets config (`baseBranch: development`), manual releases only
  (`docs/RELEASING.md`), no publish workflow.
- `tests/monorepo.test.ts`: 3 tests (workspace manifest; docs-app manifest;
  Astro-toolchain presence). Test 3 asserts the Astro toolchain and will be
  rewritten during migration — not before.
- `packages/` is an empty reserved placeholder. There is no `libs/`.

## Application (legacy as of ADR-0002)

`apps/docs` (`@xoroh/atlas-docs`, private MIT): Astro ^7.2.10 + Starlight
^0.42.6. `astro.config.mjs` (Starlight sidebar, **no `site` URL** — hosting
undecided), `src/content.config.ts` (Starlight `docsLoader`/`docsSchema`),
exactly five MDX pages (`index` splash/hero, `getting-started`,
`guides/{architecture,contributing,governance}`), static `public/llms.txt`,
`tsconfig.json` extending `astro/tsconfigs/strict`.

## Architecture record

- `docs/adr/0001-atlas-foundation.md`: framework choice (Astro + Starlight)
  recorded as accepted **without owner approval** — corrected 2026-10-16,
  D3 withdrawn by ADR-0002; D1, D2 (principle), D4, D5-intent retained.
- `docs/adr/0002-tanstack-foundation.md`: **accepted (owner-directed)** —
  TanStack Start foundation, `apps/docs` retained, static deployment
  required, search via bounded spike.
- No TanStack and no Fumadocs references exist anywhere in history (verified
  by grep). The Fumadocs restriction is satisfied by default and becomes a
  live constraint on newly written product docs.

## Governance and instructions

- `AGENTS.md`: repo scope, prohibitions, skill pointer. No stack-specific
  content — unchanged by the migration.
- `.agents/skills/atlas/SKILL.md`: the governing skill; updated for the
  TanStack direction (see migration-plan Phase 2).
- `GOVERNANCE.md:7` and `docs/README.md:3` contained stale "framework not
  yet decided / once selected" statements contradicting the ADRs — corrected
  (framework is decided: ADR-0002).
- `ADOPTED_STANDARDS.md`: central pin `c4fd5f7`; cites a governance-repo
  "ADR-002" — always qualify that number with its repository to avoid
  confusion with Atlas ADR-0002.

## Retain vs replace

- **Retain:** Bun workspace layout, `apps/docs` name, governance/CI/release
  infrastructure, Changesets discipline, `llms.txt`+AI-surface intent, URL
  reservations, `packages/` reservation, content (rewritten, not discarded).
- **Replace (only after acceptance gates pass):** Astro/Starlight configs,
  Starlight content schema and conventions, Astro-specific tests/CI steps,
  Starlight-coupled frontmatter in the five MDX pages.
