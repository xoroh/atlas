# @xoroh/atlas-build

Pipeline orchestration and deterministic output generation for the Atlas
engine. Depends on `@xoroh/atlas-core` and `@xoroh/atlas-content`. Owns
the end-to-end lifecycle and generated artifacts — nothing about parsing.

## API

- `buildAtlas(configInput: unknown): BuildResult` — validate config →
  load documents → generate outputs. `{ ok: true, documents, outputs,
  warnings }` or `{ ok: false, diagnostics }`. Never throws for invalid
  input. `warnings` carries non-blocking diagnostics (today: the
  empty-corpus warning); it is `[]` for a normal corpus.
- `buildOutputs(config, documents): GeneratedOutputs` — pure,
  deterministic: `manifest` (`manifest.json`: version, title, routes),
  `llmsTxt` (`llms.txt` index), `pages` (per-document Markdown). No
  timestamps; fixed key order.
- `writeOutputs(outDir, outputs): WrittenOutputs` — writes `manifest.json`,
  `llms.txt`, and one Markdown file per document; returns written paths.
- `routePath(slug)`, `pagePath(slug)` — slug ↔ output path mapping
  (`""` is `/` / `index.md`).

## Empty-corpus policy (owner decision, implemented)

A valid configuration pointing at an empty content directory (or one
where every file is excluded) **succeeds** with a non-blocking warning,
not an error:

- `loadDocuments` appends
  `warning: No documents discovered in "<contentDir>". Check the content
  directory, file patterns (*.md), and exclusion rules.` — deterministic,
  no environment-specific details.
- `buildAtlas` surfaces it as `warnings` on the success result;
  inaccessible directories and invalid content remain errors and never
  produce this warning.
- Covered by `pipeline.test.ts` ("empty corpus"): empty dir, non-empty
  dir, excluded-only dir, and missing dir cases.

## Develop

```sh
bun test                 # includes lifecycle integration tests against
                         # atlas-content fixtures (test-only reuse)
bun run check
```
