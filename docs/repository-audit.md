# Repository audit — Xoroh Atlas

- Date: 2026-10-16 (revised for the core-first transition; earlier audit
  of the website era preserved in git history).
- Scope: `xoroh/atlas` only. No other repository was accessed or modified.
- Method: read-only inspection plus the implemented transition itself
  (branch `feature/atlas-core`). Validation under Bun 1.4.3 (required
  ≥1.4.2 satisfied).

## Identity

Public MIT Bun workspace monorepo, org `xoroh`, default branch
`development`. Open maintenance: Dependabot PR #1 (`actions/checkout`
4→7, CI green) and PR #4 (TypeScript 5.9.3→7.0.2 — kept separate from
engine work; merging it is a standalone maintenance decision).

## Layout and toolchain

- Root `package.json`: `atlas-monorepo`, private MIT, `bun@1.4.2`,
  workspaces `apps/*` (reserved, empty) + `packages/*`; scripts `test` /
  `check` (strict typecheck of engine packages + root tests) plus
  Changesets helpers.
- Root devDependencies: `@changesets/cli`, `typescript` (^5.9), `@types/node`,
  `bun-types` (type-only). Runtime engine dependency: `gray-matter` (^4,
  frontmatter parsing in `atlas-content`; called with explicit options to
  bypass its input cache — see `packages/atlas-content/src/parse.ts`).
- CI (`.github/workflows/ci.yml`): frozen install → `bun test` →
  `bun run check`, Bun 1.4.2, least-privilege. Validates the engine; no
  website steps remain.
- `tests/monorepo.test.ts`: workspace manifest assertions, engine package
  manifest/entry-point assertions, framework-dependency and
  framework-import boundary scans, dependency-direction assertions, and
  the `apps/docs`-absence invariant.
- `packages/`: `atlas-core` (contracts, zero runtime deps),
  `atlas-content` (discovery/parsing/validation), `atlas-build`
  (orchestration/deterministic outputs). Each with manifest, strict
  tsconfig, README, unit tests; integration tests cover the full
  config-to-output lifecycle including failure cases and determinism.
- `apps/` holds only a reservation README. The Astro + Starlight scaffold
  (`apps/docs`: app manifest, Starlight configs, five draft MDX pages,
  `llms.txt` stub) was removed in the core-first transition: pure
  pre-product scaffolding with no engine behavior. Its prose survives in
  git history; removal is a single coherent, revertible commit.

## Architecture record

- `docs/adr/0001-atlas-foundation.md`: D3 (Astro + Starlight) corrected —
  recorded without owner approval, withdrawn.
- `docs/adr/0002-tanstack-foundation.md`: superseded before implementation
  began (no website migration was ever started); body preserved as
  history. Durable verification discipline carries forward.
- `docs/adr/0003-atlas-core-first.md`: **accepted (owner-directed)** —
  engine packages are the product; a website is a future consumer;
  TanStack Start is a candidate consumer technology only and never an
  engine dependency.
- No TanStack and no Fumadocs product references exist in the implementation
  or product docs (verified by scan; Fumadocs appears only as the standing
  restriction itself).

## Governance and instructions

- `AGENTS.md`: repo scope, prohibitions, skill pointer. No stack-specific
  content — unchanged by the transition.
- `.agents/skills/atlas/SKILL.md`: rewritten for the core-first engine
  (package contracts, validation commands, gray-matter invariant,
  no-website boundary).
- `GOVERNANCE.md`, `docs/README.md`, root/packages/apps READMEs,
  `docs/RELEASING.md`, CHANGELOG: all agree with the core-first record.
- `ADOPTED_STANDARDS.md`: central pin unchanged by this task; its
  governance-repo "ADR-002" citation is unrelated to Atlas ADR-0002 —
  always qualify the number with its repository.

## Retain vs replace (outcome)

- **Retained:** Bun workspace layout, governance/CI/release/monorepo
  infrastructure (repointed at the engine), Changesets discipline,
  `llms.txt`+manifest+per-page-Markdown intent (now engine-generated),
  file-based content principle, `apps/*` reservation.
- **Replaced/removed:** Astro/Starlight scaffold and all its configs,
  deps, CI steps, and toolchain assertions; TanStack website-migration
  program (superseded before implementation).
