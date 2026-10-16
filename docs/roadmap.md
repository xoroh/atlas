# Roadmap — Xoroh Atlas (core-first)

Ordering is by dependency and exit criteria, not calendar dates. No phase
is scheduled until its prerequisites are met; no phase is skipped.

## Phase A — Core contracts and package boundaries ✅ (this task)

Package graph, config/document/diagnostic contracts, public entry points,
dependency directions, boundary tests.

## Phase B — Working engine ✅ (this task)

Content-to-output vertical slice with unit + integration tests, success and
failure cases, deterministic outputs, no website required.

## Phase C — Developer experience ✅ (this task)

Diagnostics, fixtures, root scripts, engine-validating CI, package docs.

## Phase D — Core stabilization (next)

Package independence, determinism across machines, and fitness against real
Xoroh content. Next increment: round-trip 2–3 real documents and record
gaps. Consumers still out of scope.

## Phase E — Future consumers (only when Core is ready and needed)

Website (TanStack Start is a candidate technology, not a selection), CLI,
search, SEO/site artifacts, agent workflows — evaluated per
`docs/migration-plan.md` §3 when a real need names them.

## Non-roadmap items (explicitly excluded)

Website migration or replacement, `apps/docs` restoration, new packages
without justified need, publishing/releasing, Dependabot upgrades (separate
maintenance), framework re-selection.
