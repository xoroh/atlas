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

## Phase D — Core stabilization ✅ (closed; deferred items listed below)

Validated end to end with `packages/atlas-content/fixtures/realistic/`
(3 documents: root + nested + CRLF-authored) through the public
`loadDocuments`/`buildAtlas`/`writeOutputs` APIs:

- Supported and tested: ordering, maturities, nested slugs, Unicode and
  punctuation heading anchors, repeat-anchor dedup, setext and indented
  headings, fenced-code exclusion, CRLF normalization, verbatim link
  pass-through, excludes, duplicate/invalid detection with file-scoped
  diagnostics, manifest/`llms.txt`/page accuracy, byte-identical rebuilds,
  output-directory containment.
- Defects corrected: setext headings dropped; indented ATX dropped;
  `writeOutputs` could escape `outDir` on hostile page paths (now throws).
- Known limitations (not defects): blockquote-prefixed headings not
  extracted; slugs case-sensitive; links unresolved by design; publishing
  and external installation untested (packages remain private).
- Still unverified: fitness against real consumer Markdown content (needs
  an authorized source); determinism across machines (single-machine only).
- Owner decisions settled in closeout: empty corpus succeeds with a
  deterministic warning (`BuildResult.warnings`); no further Phase D
  decisions outstanding.

## Phase D closeout (evidence record)

- Empty-corpus policy implemented per owner decision: valid empty or
  fully-excluded corpus succeeds with a deterministic, actionable warning
  (`BuildResult.warnings`); missing dirs and invalid content stay errors.
  Regression tests in `pipeline.test.ts` ("empty corpus").
- Revalidated: realistic corpus end to end (manifest, `llms.txt`, pages,
  ordering, diagnostics, byte-identical rebuilds/rewrites); full suite
  and strict typecheck green under Bun 1.4.3.
- Portability review performed on Linux only: code-unit ordering
  (locale-independent; suite green under `LC_ALL=C` and `C.UTF-8`),
  separator/`..` containment, CRLF normalization, Unicode anchor folding,
  timestamp-free and path-leak-free artifacts (probed, none found).
  No second OS or machine was available: **cross-machine determinism is
  supported by design and local evidence, not proven by comparison.**
- No actual Xoroh documents were supplied or authorized for this task;
  real-content validation remains outstanding by owner action, not by
  engine readiness. The realistic fixtures stand as the current evidence.
- No defects found in this pass beyond the implemented decision; no scope
  expansion (no search/navigation/MDX/CLI/website).

Consumers remain out of scope.

## Phase E — Future consumers (only when Core is ready and needed)

Website (TanStack Start is a candidate technology, not a selection), CLI,
search, SEO/site artifacts, agent workflows — evaluated per
`docs/migration-plan.md` §3 when a real need names them.

## Non-roadmap items (explicitly excluded)

Website migration or replacement, `apps/docs` restoration, new packages
without justified need, publishing/releasing, Dependabot upgrades (separate
maintenance), framework re-selection.
