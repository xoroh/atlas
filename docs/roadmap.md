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

## Phase D — Core stabilization (in progress: realistic-corpus validation ✅)

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
  extracted; slugs case-sensitive; links unresolved by design; empty
  corpus builds zero pages successfully (warn-vs-error is an owner
  decision — see below).
- Still unverified: fitness against real Xoroh content (needs authorized
  source documents); determinism across machines (single-machine only).
- Owner decisions required before Phase E: empty-corpus severity
  (warning vs error); nothing else new.

Consumers remain out of scope.

## Phase E — Future consumers (only when Core is ready and needed)

Website (TanStack Start is a candidate technology, not a selection), CLI,
search, SEO/site artifacts, agent workflows — evaluated per
`docs/migration-plan.md` §3 when a real need names them.

## Non-roadmap items (explicitly excluded)

Website migration or replacement, `apps/docs` restoration, new packages
without justified need, publishing/releasing, Dependabot upgrades (separate
maintenance), framework re-selection.
