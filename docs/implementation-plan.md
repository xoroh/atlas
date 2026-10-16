# Implementation plan — Atlas Core (phases A–E)

Follows `docs/adr/0003-atlas-core-first.md` and `docs/target-architecture.md`.
Work in `xoroh/atlas` only, on feature branches targeting `development`, for
review via PR. No push/merge without owner authorization.

## Phase A — Core contracts and package boundaries (done: this task)

Minimum package graph (`atlas-core`, `atlas-content`, `atlas-build`),
configuration model, document model, diagnostics shape, public entry
points, dependency directions. Done when: manifests/exports/tsconfigs land,
boundary tests pass, docs agree with the graph.

## Phase B — Working engine (done: this task)

First content-to-output vertical slice: config load → discovery → parse →
validate → normalized representation → deterministic outputs
(`manifest.json`, `llms.txt`, per-page Markdown), with unit tests per
package and integration tests for the full lifecycle including invalid
config, malformed frontmatter, missing metadata, and duplicate slugs.
Done when: the slice runs end-to-end from fixtures with no website present
and all tests pass under the required Bun version.

## Phase C — Developer experience (done: this task)

Diagnostics quality (file/line/reason on every failure), small fixtures,
root scripts (`test`, `check`), CI validating the engine (frozen install →
tests → typecheck), package READMEs, and this plan set. Done when: a new
contributor can install, test, and typecheck from the docs alone.

## Phase D — Core stabilization (next)

Validate package independence (each package's tests run in isolation),
dependency direction (boundary test green), output determinism across
machines, and fitness against Xoroh's actual documentation needs using real
content samples. Harden diagnostics and edge cases found there. Done when:
real content round-trips through the engine with no core changes required —
or the required changes are scoped as new increments. **Next recommended
increment:** run 2–3 real Xoroh documents through `loadDocuments` +
`buildAtlas` and record gaps.

## Phase E — Future consumers (only when Core is ready and needed)

Evaluate a website, CLI, search, or other consumers per
`docs/migration-plan.md` §3. None designed or built now.

## Definition of done (this task, phases A–C)

Vertical slice implemented and tested; boundary/determinism/failure tests
green; `bun test` + typecheck pass; website scaffold removed coherently;
CI validates the engine; docs, skill, and READMEs agree with the
implementation; nothing published, deployed, or pushed.

## Explicitly out of scope

Replacement websites; new packages/adapters without justified need; MDX
processing beyond the Markdown slice; search/themes/SEO/site hosting;
publishing/releasing; changes outside `xoroh/atlas`; speculative
abstractions; weakening any gate silently — unpassable gates are reported,
not bypassed.
