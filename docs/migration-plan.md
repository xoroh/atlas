# Transition plan — website scaffold removal and consumer evaluation

Decisions: `docs/adr/0003-atlas-core-first.md`. Target shape:
`docs/target-architecture.md`. Work breakdown: `docs/implementation-plan.md`.
Order: `docs/roadmap.md`. (This document replaces the former
website-migration plan; no website migration was ever started.)

## 1. Scaffold removal (executed in the core-first transition)

The Astro + Starlight scaffold in `apps/docs` was purely pre-product
scaffolding: five draft pages, Starlight configuration, and no engine
behavior. It imposed Astro/Starlight dependencies, an Astro-specific CI
path, and toolchain assertions on a repository whose product is the engine.

- **What was removed:** `apps/docs/` in full (app manifest, Astro/Starlight
  configs, content collections schema, the five draft MDX pages, `llms.txt`
  stub, app README, tsconfig).
- **What was preserved:** all prose survives in git history (reversible);
  governance, Changesets discipline, CI/release infrastructure, and
  monorepo conventions were retained and repointed at the engine.
- **Consistency updates applied with the removal:** root workspace scripts,
  `tests/` (rewritten for engine invariants), CI (validates engine:
  install → tests → typecheck), documentation, and the regenerated lockfile.
- **Reversibility:** removal is a single coherent commit; `git revert`
  restores the scaffold byte-identical.

## 2. Dependency-boundary verification (recurring)

Engine packages must never import Astro, Starlight, TanStack Start, React,
or any rendering framework. Verified by a checked test over manifests and
import statements, run in CI. Any future consumer (site, CLI) lives outside
the engine packages and depends inward only.

## 3. Future consumer evaluation (only when Atlas Core is ready — roadmap Phase E)

A future documentation site (possibly TanStack Start — candidate only, not
selected), CLI, search, or agent workflow is evaluated against:

- A real consumer need with a named owner of the requirement.
- The core-first constraint: the consumer depends on engine packages; the
  engine gains no consumer-specific code (adapters are separate packages
  only when justified).
- Consumer-grade acceptance gates derived from the ADR-0002 discipline:
  explicit route inventory vs generated output, no-backend serving proof
  where static output is claimed, measured client cost where JS ships,
  search-asset coverage, 404 semantics validated against the chosen host.
- Bounded spikes, decided against installed-version schemas and docs, for
  anything not yet proven (search selection, prerender behavior).

No consumer work begins before these conditions hold.
